/* Wa9i server: one Cloudflare Worker.
   - Serves the shop and the admin (files bundled into dist/site.js by tools/build-worker.mjs).
   - Public API:  GET /api/config, POST /api/orders
   - Admin API:   /api/admin/* (password login, signed session cookie)
   Storage: Workers KV (binding DATA). Keys:
     settings                 shop settings (JSON)
     products                 admin overrides per product id: price, old price, stock, hidden
     auth                     admin password hash, once changed from the admin (else the ADMIN_PASSWORD secret)
     order:<inverted time>:<ref>   one order (value = full order, metadata = summary for lists and stats)
     rl:… / login:…           rate-limit counters (expire on their own) */
import "../catalog.js";
import { FILES } from "../dist/site.js";

const CAT = globalThis.WA9I_CATALOG;
const BY_ID = Object.fromEntries(CAT.PRODUCTS.map((p) => [p.id, p]));
const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled", "returned"];
const RESTOCK = new Set(["cancelled", "returned"]);
const DEFAULT_SETTINGS = {
  shopName: "Wa9i", whatsapp: "", shipping: 25, freeShippingFrom: 2, couponCode: "WA9I2",
  announcement: { fr: "", ar: "" },
};
const SESSION_DAYS = 7;
const enc = new TextEncoder();

/* ---------- small helpers ---------- */
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });
const bad = (error, status = 400) => json({ error }, status);
const clampInt = (v, min, max) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null; };
const str = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
const normPhone = (v) => { let d = String(v || "").replace(/\D/g, ""); if (d.startsWith("00212")) d = d.slice(5); else if (d.startsWith("212")) d = d.slice(3); if (d.length === 9) d = "0" + d; return d; };
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
async function sha256(s) { return hex(await crypto.subtle.digest("SHA-256", enc.encode(s))); }
async function hmac(keyStr, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(keyStr), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
function safeEqual(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256));
}
const ipHash = async (req, env) => (await sha256((req.headers.get("CF-Connecting-IP") || "local") + "|" + (env.ADMIN_PASSWORD || "wa9i"))).slice(0, 24);
async function bump(env, key, ttl) { const n = (parseInt(await env.DATA.get(key), 10) || 0) + 1; await env.DATA.put(key, String(n), { expirationTtl: ttl }); return n; }
const count = async (env, key) => parseInt(await env.DATA.get(key), 10) || 0;

async function getSettings(env) { return { ...DEFAULT_SETTINGS, ...((await env.DATA.get("settings", "json")) || {}) }; }
async function getOverrides(env) { return (await env.DATA.get("products", "json")) || {}; }
function product(id, ov) {
  const p = BY_ID[id]; if (!p) return null;
  const o = ov[id] || {};
  return { ...p, price: Number.isFinite(o.price) ? o.price : p.price, old: Number.isFinite(o.old) ? o.old : p.old, hidden: !!o.hidden, stock: Number.isFinite(o.stock) ? o.stock : null };
}
const titleOf = (p, lang) => { const n = (p.name && (p.name[lang] || p.name.fr)) || p.id; return p.model ? `${n} — ${p.model}` : n; };
const orderKey = (now, ref) => `order:${String(9999999999999 - now).padStart(13, "0")}:${ref}`;
function summary(o) {
  return { ref: o.ref, status: o.status, total: o.total, created: o.created, name: o.name.slice(0, 40), city: o.city, phone: o.phone, lang: o.lang,
    n: o.items.reduce((a, l) => a + l.qty, 0), it: o.items.slice(0, 6).map((l) => [l.id, l.qty, l.price]), demo: o.demo ? 1 : 0 };
}
async function listOrders(env, limit = 1000) {
  const out = []; let cursor;
  do {
    const r = await env.DATA.list({ prefix: "order:", cursor, limit: 1000 });
    for (const k of r.keys) if (k.metadata) out.push({ key: k.name, ...k.metadata });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor && out.length < limit);
  return out;
}

/* ---------- pricing (shared by the shop and demo orders) ---------- */
function priceOrder(items, settings, ov, couponIn, lang) {
  const lines = [];
  for (const it of Array.isArray(items) ? items.slice(0, 20) : []) {
    const p = product(String(it.id || ""), ov);
    const qty = clampInt(it.qty, 1, 20);
    if (!p || p.hidden || !qty) return { error: "item" };
    const color = p.colors.includes(it.color) ? it.color : p.colors[0];
    const same = lines.find((l) => l.id === p.id && l.color === color);
    if (same) same.qty = Math.min(20, same.qty + qty);
    else lines.push({ id: p.id, title: titleOf(p, lang), model: p.model || "", color, colorName: CAT.colorName(color, lang), qty, price: p.price });
  }
  if (!lines.length) return { error: "empty" };
  const n = lines.reduce((a, l) => a + l.qty, 0);
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const code = str(couponIn, 20).toUpperCase();
  const couponOk = !!settings.couponCode && code === String(settings.couponCode).toUpperCase() && n >= 2;
  const shipping = n >= settings.freeShippingFrom || couponOk ? 0 : settings.shipping;
  return { lines, subtotal, shipping, total: subtotal + shipping, coupon: couponOk ? code : "" };
}
async function changeStock(env, items, sign) {
  const ov = await getOverrides(env); let changed = false;
  for (const l of items) {
    const o = ov[l.id];
    if (o && Number.isFinite(o.stock)) { o.stock = Math.max(0, o.stock + sign * l.qty); changed = true; }
  }
  if (changed) await env.DATA.put("products", JSON.stringify(ov));
}

/* ---------- public API ---------- */
async function apiConfig(env) {
  const s = await getSettings(env);
  return json({ settings: { shopName: s.shopName, whatsapp: s.whatsapp, shipping: s.shipping, freeShippingFrom: s.freeShippingFrom, couponCode: s.couponCode, announcement: s.announcement }, products: await getOverrides(env) },
    200, { "Cache-Control": "no-cache" });
}
async function apiOrder(req, env) {
  let b; try { b = await req.json(); } catch { return bad("json"); }
  if (b.website) return json({ order: { ref: "W9-OK", items: [], total: 0, shipping: 0, name: "", phone: "", city: "", address: "" } }); // bot trap
  const lang = b.lang === "ar" ? "ar" : "fr";
  const name = str(b.name, 80), city = str(b.city, 40), address = str(b.address, 200), note = str(b.note, 300), phone = normPhone(b.phone);
  if (name.length < 3 || !CAT.CITIES.includes(city) || address.length < 5) return bad("fields");
  if (!/^0[5-7]\d{8}$/.test(phone)) return bad("phone");
  const ih = await ipHash(req, env);
  if ((await count(env, "rl:p:" + phone)) >= 3 || (await count(env, "rl:i:" + ih)) >= 6) return bad("rate", 429);
  const [settings, ov] = await Promise.all([getSettings(env), getOverrides(env)]);
  const priced = priceOrder(b.items, settings, ov, b.coupon, lang);
  if (priced.error) return bad(priced.error);
  for (const l of priced.lines) { const p = product(l.id, ov); if (p.stock !== null && p.stock < l.qty) return bad("stock", 409); }
  const now = Date.now();
  const ref = "W9-" + now.toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  const order = { ref, status: "new", created: now, lang, name, phone, city, address, note, items: priced.lines, subtotal: priced.subtotal, shipping: priced.shipping, total: priced.total, coupon: priced.coupon, adminNote: "", history: [{ s: "new", t: now }] };
  const key = orderKey(now, ref);
  await env.DATA.put(key, JSON.stringify(order), { metadata: summary(order) });
  await changeStock(env, order.items, -1);
  await Promise.all([bump(env, "rl:p:" + phone, 3600), bump(env, "rl:i:" + ih, 3600)]);
  return json({ order: { ref, items: order.items, shipping: order.shipping, total: order.total, name, phone, city, address, note } }, 201);
}

/* ---------- admin auth ---------- */
async function sessionSecret(env) {
  const a = await env.DATA.get("auth", "json");
  return (a ? a.hash : env.ADMIN_PASSWORD || "") + "|wa9i-session";
}
async function makeSession(env) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  return `${exp}.${await hmac(await sessionSecret(env), "s." + exp)}`;
}
async function isAdmin(req, env) {
  const m = (req.headers.get("Cookie") || "").match(/(?:^|;\s*)w9s=([^;]+)/);
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(await sessionSecret(env), "s." + exp));
}
async function checkPassword(env, pw) {
  const a = await env.DATA.get("auth", "json");
  if (a) return safeEqual(await pbkdf2(pw, a.salt), a.hash);
  return !!env.ADMIN_PASSWORD && safeEqual(await sha256(pw), await sha256(env.ADMIN_PASSWORD));
}
const cookie = (v, maxAge) => `w9s=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

/* ---------- admin API ---------- */
async function admin(req, env, path) {
  const method = req.method;
  if (path === "login" && method === "POST") {
    const ih = await ipHash(req, env);
    if ((await count(env, "login:" + ih)) >= 5 || (await count(env, "loginday:" + ih)) >= 20) return bad("locked", 429);
    let b; try { b = await req.json(); } catch { return bad("json"); }
    if (!(await checkPassword(env, String(b.password || "")))) {
      await Promise.all([bump(env, "login:" + ih, 900), bump(env, "loginday:" + ih, 86400)]);
      return bad("password", 401);
    }
    return json({ ok: true }, 200, { "Set-Cookie": cookie(await makeSession(env), SESSION_DAYS * 86400) });
  }
  if (path === "logout" && method === "POST") return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
  if (!(await isAdmin(req, env))) return bad("auth", 401);

  if (path === "me") {
    const a = await env.DATA.get("auth", "json");
    return json({ ok: true, weakPassword: !a && (env.ADMIN_PASSWORD || "").length < 12 });
  }
  if (path === "stats") return json(await stats(env));
  if (path === "orders" && method === "GET") {
    const u = new URL(req.url); const st = u.searchParams.get("status"); const q = (u.searchParams.get("q") || "").toLowerCase().trim();
    let list = await listOrders(env);
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])); list.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    if (st && STATUSES.includes(st)) list = list.filter((o) => o.status === st);
    if (q) list = list.filter((o) => `${o.ref} ${o.name} ${o.phone} ${o.city}`.toLowerCase().includes(q));
    return json({ orders: list.slice(0, 300), counts, total: list.length });
  }
  if (path === "orders.csv") {
    const list = await listOrders(env);
    const full = await Promise.all(list.slice(0, 500).map((o) => env.DATA.get(o.key, "json")));
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Référence", "Date", "Statut", "Nom", "Téléphone", "Ville", "Adresse", "Articles", "Total (DH)", "Note client"].map(esc).join(";")];
    for (const o of full.filter(Boolean)) rows.push([o.ref, new Date(o.created).toISOString().slice(0, 16).replace("T", " "), o.status, o.name, o.phone, o.city, o.address,
      o.items.map((l) => `${l.qty}x ${l.title} (${l.colorName || l.color})`).join(" | "), o.total, o.note].map(esc).join(";"));
    return new Response("﻿" + rows.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="wa9i-commandes-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
  }
  const om = path.match(/^orders\/(order:[0-9]{13}:[A-Z0-9-]{4,20})$/);
  if (om) {
    const key = om[1];
    const o = await env.DATA.get(key, "json"); if (!o) return bad("notfound", 404);
    if (method === "GET") return json({ order: { key, ...o } });
    if (method === "PATCH") {
      let b; try { b = await req.json(); } catch { return bad("json"); }
      if (b.status !== undefined) {
        if (!STATUSES.includes(b.status)) return bad("status");
        if (b.status !== o.status) {
          const was = RESTOCK.has(o.status), will = RESTOCK.has(b.status);
          if (!was && will) await changeStock(env, o.items, +1);
          if (was && !will) await changeStock(env, o.items, -1);
          o.status = b.status; o.history = [...(o.history || []), { s: b.status, t: Date.now() }].slice(-20);
        }
      }
      if (b.adminNote !== undefined) o.adminNote = str(b.adminNote, 1000);
      await env.DATA.put(key, JSON.stringify(o), { metadata: summary(o) });
      return json({ order: { key, ...o } });
    }
    if (method === "DELETE") { await env.DATA.delete(key); return json({ ok: true }); }
  }
  if (path === "products" && method === "GET") {
    const ov = await getOverrides(env);
    return json({ brands: CAT.BRANDS.map((b) => ({ id: b.id, name: b.name })), products: CAT.PRODUCTS.map((p) => { const q = product(p.id, ov); return { id: q.id, brand: q.brand, model: q.model, name: q.name, colors: q.colors, price: q.price, old: q.old, basePrice: p.price, baseOld: p.old, stock: q.stock, hidden: q.hidden, coll: q.coll || null }; }) });
  }
  if (path === "products" && method === "PATCH") {
    let b; try { b = await req.json(); } catch { return bad("json"); }
    const ov = await getOverrides(env);
    for (const [id, c] of Object.entries(b.changes || {}).slice(0, 500)) {
      const p = BY_ID[id]; if (!p || !c) continue;
      const o = { ...(ov[id] || {}) };
      if ("price" in c) { const v = clampInt(c.price, 1, 100000); if (v === null || v === p.price) delete o.price; else o.price = v; }
      if ("old" in c) { const v = clampInt(c.old, 0, 100000); if (v === null || v === p.old) delete o.old; else o.old = v; }
      if ("stock" in c) { const v = c.stock === null || c.stock === "" ? null : clampInt(c.stock, 0, 100000); if (v === null) delete o.stock; else o.stock = v; }
      if ("hidden" in c) { if (c.hidden) o.hidden = true; else delete o.hidden; }
      if (Object.keys(o).length) ov[id] = o; else delete ov[id];
    }
    await env.DATA.put("products", JSON.stringify(ov));
    return json({ ok: true, count: Object.keys(ov).length });
  }
  if (path === "settings" && method === "GET") return json({ settings: await getSettings(env) });
  if (path === "settings" && method === "PUT") {
    let b; try { b = await req.json(); } catch { return bad("json"); }
    const cur = await getSettings(env);
    const wa = String(b.whatsapp ?? cur.whatsapp).replace(/\D/g, "");
    if (wa && !/^\d{8,15}$/.test(wa)) return bad("whatsapp");
    const next = {
      shopName: str(b.shopName ?? cur.shopName, 40) || "Wa9i", whatsapp: wa,
      shipping: clampInt(b.shipping ?? cur.shipping, 0, 500) ?? cur.shipping,
      freeShippingFrom: clampInt(b.freeShippingFrom ?? cur.freeShippingFrom, 1, 50) ?? cur.freeShippingFrom,
      couponCode: str(b.couponCode ?? cur.couponCode, 20).toUpperCase().replace(/[^A-Z0-9]/g, ""),
      announcement: { fr: str(b.announcement?.fr ?? cur.announcement.fr, 140), ar: str(b.announcement?.ar ?? cur.announcement.ar, 140) },
    };
    await env.DATA.put("settings", JSON.stringify(next));
    return json({ settings: next });
  }
  if (path === "password" && method === "POST") {
    let b; try { b = await req.json(); } catch { return bad("json"); }
    if (!(await checkPassword(env, String(b.current || "")))) return bad("password", 401);
    const nx = String(b.next || "");
    if (nx.length < 10) return bad("short");
    const salt = b64url(crypto.getRandomValues(new Uint8Array(16)));
    await env.DATA.put("auth", JSON.stringify({ salt, hash: await pbkdf2(nx, salt) }));
    return json({ ok: true }, 200, { "Set-Cookie": cookie(await makeSession(env), SESSION_DAYS * 86400) });
  }
  if (path === "demo" && method === "POST") return json(await seedDemo(env));
  if (path === "demo" && method === "DELETE") {
    const list = (await listOrders(env)).filter((o) => o.demo);
    for (const o of list) await env.DATA.delete(o.key);
    return json({ deleted: list.length });
  }
  return bad("notfound", 404);
}

async function stats(env) {
  const list = await listOrders(env);
  const now = Date.now(), day = 864e5;
  const startOf = (t) => { const d = new Date(t + 3600e3); d.setUTCHours(0, 0, 0, 0); return d.getTime() - 3600e3; }; // Morocco time (UTC+1)
  const today = startOf(now);
  const live = list.filter((o) => !RESTOCK.has(o.status));
  const sum = (arr) => arr.reduce((a, o) => a + o.total, 0);
  const since = (t) => live.filter((o) => o.created >= t);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])); list.forEach((o) => { counts[o.status]++; });
  const series = [];
  for (let i = 13; i >= 0; i--) { const a = today - i * day, b = a + day; const d = live.filter((o) => o.created >= a && o.created < b); series.push({ day: a, orders: d.length, revenue: sum(d) }); }
  const prod = {}, cities = {};
  for (const o of live) {
    cities[o.city] = (cities[o.city] || 0) + 1;
    for (const [id, qty, price] of o.it || []) { prod[id] = prod[id] || { id, qty: 0, revenue: 0 }; prod[id].qty += qty; prod[id].revenue += qty * price; }
  }
  const top = Object.values(prod).sort((a, b) => b.qty - a.qty).slice(0, 5).map((x) => ({ ...x, title: BY_ID[x.id] ? titleOf(BY_ID[x.id], "fr") : x.id, titleAr: BY_ID[x.id] ? titleOf(BY_ID[x.id], "ar") : x.id }));
  const done = list.filter((o) => o.status !== "new");
  const delivered = list.filter((o) => o.status === "delivered").length, returned = list.filter((o) => o.status === "returned").length;
  return {
    today: { orders: since(today).length, revenue: sum(since(today)) },
    week: { orders: since(today - 6 * day).length, revenue: sum(since(today - 6 * day)) },
    month: { orders: since(today - 29 * day).length, revenue: sum(since(today - 29 * day)) },
    prevWeek: { revenue: sum(live.filter((o) => o.created >= today - 13 * day && o.created < today - 6 * day)) },
    avgBasket: live.length ? Math.round(sum(live) / live.length) : 0,
    confirmRate: done.length ? Math.round((done.filter((o) => o.status !== "cancelled").length / done.length) * 100) : null,
    deliveryRate: delivered + returned ? Math.round((delivered / (delivered + returned)) * 100) : null,
    counts, series, top, cities: Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 6),
    recent: list.slice(0, 8), total: list.length,
  };
}

async function seedDemo(env) {
  const names = ["Yassine B.", "Salma E.", "Hamza R.", "Imane K.", "Othmane T.", "Khadija M.", "Ayoub L.", "Nora A.", "Mehdi S.", "Fatima Z. H.", "Anas O.", "Meryem C.", "Reda F.", "Hiba N.", "Soufiane D.", "Ghita J."];
  const cities = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Kénitra", "Oujda", "Tétouan", "Salé", "El Jadida"];
  const [settings, ov] = await Promise.all([getSettings(env), getOverrides(env)]);
  const pool = CAT.PRODUCTS.filter((p) => !p.hidden).sort((a, b) => b.pop - a.pop).slice(0, 40);
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const now = Date.now(); let made = 0;
  for (let i = 0; i < 26; i++) {
    const created = now - Math.floor(rnd() * 13.5 * 864e5) - 600e3;
    const items = [{ id: pick(pool).id, qty: rnd() < 0.8 ? 1 : 2 }]; if (rnd() < 0.35) items.push({ id: pick(pool).id, qty: 1 });
    const lang = rnd() < 0.45 ? "ar" : "fr";
    const priced = priceOrder(items, settings, ov, "", lang); if (priced.error) continue;
    const age = (now - created) / 864e5;
    const status = age < 1 ? pick(["new", "new", "confirmed"]) : age < 3 ? pick(["confirmed", "shipped", "shipped", "cancelled"]) : pick(["delivered", "delivered", "delivered", "returned", "cancelled", "shipped"]);
    const ref = "W9-D" + created.toString(36).slice(-4).toUpperCase();
    const phone = "06" + String(10000000 + Math.floor(rnd() * 89999999));
    const o = { ref, status, created, lang, name: pick(names), phone, city: pick(cities), address: `${1 + Math.floor(rnd() * 120)}, rue de démonstration`, note: "", items: priced.lines, subtotal: priced.subtotal, shipping: priced.shipping, total: priced.total, coupon: "", adminNote: "Commande de démonstration", history: [{ s: "new", t: created }], demo: true };
    if (status !== "new") o.history.push({ s: status, t: created + 3600e3 });
    await env.DATA.put(orderKey(created, ref), JSON.stringify(o), { metadata: summary(o) }); made++;
  }
  return { created: made };
}

/* ---------- static files ---------- */
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", "Strict-Transport-Security": "max-age=31536000", "Permissions-Policy": "camera=(), microphone=(), geolocation=()", "Content-Security-Policy": CSP };
function serveFile(req, url) {
  let p = url.pathname;
  if (p === "/admin") return Response.redirect(url.origin + "/admin/", 301);
  if (p === "/" || p === "/index.html") p = "/index.html";
  if (p.endsWith("/")) p += "index.html";
  const f = FILES[p];
  if (!f) return null;
  const body = f.b64 ? Uint8Array.from(atob(f.body), (c) => c.charCodeAt(0)) : f.body;
  const isHtml = f.type.startsWith("text/html");
  const versioned = url.searchParams.has("v");
  const headers = { "Content-Type": f.type, "Cache-Control": isHtml ? "no-cache" : versioned ? "public, max-age=31536000, immutable" : "no-cache", ...SEC };
  if (p.startsWith("/admin/")) headers["X-Robots-Tag"] = "noindex, nofollow";
  return new Response(req.method === "HEAD" ? null : body, { headers });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith("/api/")) {
        if (req.method !== "GET" && req.method !== "HEAD") {
          const origin = req.headers.get("Origin");
          if (origin && origin !== url.origin) return bad("origin", 403);
          if (!(req.headers.get("Content-Type") || "").includes("application/json") && req.method !== "DELETE" && !url.pathname.endsWith("/logout")) return bad("type", 415);
        }
        if (!env.DATA) return bad("storage", 503);
        if (url.pathname === "/api/config" && req.method === "GET") return await apiConfig(env);
        if (url.pathname === "/api/orders" && req.method === "POST") return await apiOrder(req, env);
        if (url.pathname.startsWith("/api/admin/")) { let p; try { p = decodeURIComponent(url.pathname.slice(11)); } catch { return bad("notfound", 404); } return await admin(req, env, p); }
        return bad("notfound", 404);
      }
      if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
      return serveFile(req, url) || Response.redirect(url.origin + "/", 302);
    } catch (e) {
      console.error(e);
      return bad("server", 500);
    }
  },
};
