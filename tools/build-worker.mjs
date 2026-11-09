// Bundles the shop, the admin and the logo files into dist/site.js, which src/worker.js serves.
// (One Worker script, no separate static-asset upload.)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
const TYPES = { html: "text/html; charset=utf-8", css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8", svg: "image/svg+xml", png: "image/png" };
const files = ["index.html", "styles.css", "app.js", "catalog.js", "admin/index.html", "admin/admin.css", "admin/admin.js"];
for (const f of readdirSync("assets/logo")) if (/^wa9i-maroc-.*\.svg$/.test(f) || /^wa9i-maroc-(icon-512)\.png$/.test(f)) files.push("assets/logo/" + f);
const out = {};
for (const f of files) {
  const ext = f.split(".").pop(), binary = ext === "png";
  out["/" + f] = { type: TYPES[ext], body: binary ? readFileSync(f).toString("base64") : readFileSync(f, "utf8"), ...(binary ? { b64: true } : {}) };
}
mkdirSync("dist", { recursive: true });
writeFileSync("dist/site.js", `export const FILES = ${JSON.stringify(out)};\n`);
console.log(`dist/site.js: ${files.length} files, ${(JSON.stringify(out).length / 1024).toFixed(0)} KiB`);
