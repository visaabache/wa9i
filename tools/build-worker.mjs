// Bundles index.html, styles.css and app.js into one Worker script (dist/worker.js),
// so the site deploys as a single Worker without a separate static-asset upload.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
};
const site = Object.fromEntries(Object.entries(files).map(([p, [f, type]]) => [p, { type, body: readFileSync(f, "utf8") }]));
mkdirSync("dist", { recursive: true });
writeFileSync("dist/worker.js", `const SITE = ${JSON.stringify(site)};
const HEADERS = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Robots-Tag": "noindex" };
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    const f = SITE[url.pathname] || (url.pathname === "/index.html" ? SITE["/"] : null);
    if (!f) return Response.redirect(url.origin + "/", 302);
    const cache = url.pathname === "/" || url.pathname === "/index.html" ? "public, max-age=300" : "public, max-age=3600";
    return new Response(request.method === "HEAD" ? null : f.body, { headers: { "Content-Type": f.type, "Cache-Control": cache, ...HEADERS } });
  },
};
`);
console.log("dist/worker.js written");
