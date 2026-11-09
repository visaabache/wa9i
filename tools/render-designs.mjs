// Step 1 of the product mockups: draws every case design (one PNG per design and colour) with the shop's own caseSVG().
// Usage: serve this folder (python3 -m http.server 8090), then: node tools/render-designs.mjs http://127.0.0.1:8090 <out-dir>
// Step 2 is tools/make-mockups.py, which prints these drawings onto the case photo.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const [base = "http://127.0.0.1:8090", out = "dist/designs"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
// Size of the case in tools/mockup-base.jpg (1200 x 1200 photo), so the drawing lines up with it
const W = 430, H = 880;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 800, height: 1000 } });
await p.goto(base + "/#/");
await p.waitForFunction(() => self.WA9I_ART && self.WA9I_CATALOG);
const jobs = await p.evaluate(() => {
  const seen = new Set(), list = [];
  for (const pr of self.WA9I_CATALOG.PRODUCTS) {
    if (pr.brand !== "iphone" || seen.has(pr.design)) continue;
    seen.add(pr.design);
    pr.colors.forEach((c, i) => list.push({ id: pr.id, design: pr.design, color: c, i }));
  }
  return list;
});
const manifest = {};
for (const j of jobs) {
  await p.evaluate(({ id, color, W, H }) => {
    document.body.innerHTML = `<div id="art" style="position:fixed;left:0;top:0;width:${W}px;height:${H}px">${self.WA9I_ART.caseSVG(id, color)}</div>`;
    document.body.style.background = "transparent";
    const svg = document.querySelector("#art svg");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.width = W + "px"; svg.style.height = H + "px"; svg.style.filter = "none";
  }, { ...j, W, H });
  await p.waitForTimeout(60);
  const png = await p.locator("#art").screenshot({ omitBackground: true });
  writeFileSync(`${out}/${j.design}-${j.i}.png`, png);
  (manifest[j.design] = manifest[j.design] || []).push(j.color);
}
writeFileSync(`${out}/manifest.json`, JSON.stringify(manifest));
console.log(`${jobs.length} designs drawn in ${out}`);
await b.close();
