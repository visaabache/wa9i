# Wa9i · واقي — demo phone-case shop

An online shop for a fictional Moroccan phone-case brand, with a seller admin, made by [AbacheDev](https://abachedev.com). Plain JavaScript, no framework: one Cloudflare Worker with KV storage.

## Features
- **Catalogue by brand → model**: iPhone, Samsung, Xiaomi, Huawei, Oppo, Honor, Google, Infinix and accessories, with a mega menu, a mobile drawer, a filter sidebar, model chips, sorting, search and "show more".
- **Collections**: Zellige & Maroc, Cuir, Transparent MagSafe, Antichoc, plus a homepage carousel.
- **Product page**: colour swatches, model switcher, quantity, and a built-in **cash-on-delivery order form** (name, phone, city, address) with Moroccan phone validation.
- **Cart drawer, cart page and checkout**: free delivery from 2 items, promo code `WA9I2`, and a progress bar towards free delivery.
- **French / Arabic** with full right-to-left layout, and a dismissible promo bar.
- Mobile-first and accessible (keyboard, focus states, reduced motion).

## How orders work
Orders are saved on the server (Cloudflare Workers KV) and appear in the admin at **/admin/**. The server works out prices, delivery and the promo code itself from `catalog.js`, so a price changed in the browser is ignored. Protections: Moroccan phone numbers only (05, 06, 07), at most 3 orders per phone and 6 per visitor per hour, a hidden field that catches bots, and writes accepted only from the shop's own pages. After ordering, the customer can also send the order on WhatsApp.

## Your own products
In the admin, **Produits → Ajouter un produit**: photos (up to 8, taken with the phone camera or picked from files; they're shrunk in the browser to 1400 px and stored in KV, served from `/media/<id>`), name in French and Arabic, brand and model (or accessory), collection, price, old price, stock, a label such as "Nouveau", colours with their names, and a description. Each product can be edited or deleted (its photos are deleted with it), and price, stock and visibility can also be changed straight from the list.

The 219 generated demo products can be removed with **Supprimer tous les produits générés** (and brought back with **Restaurer**). They are removed on the live shop: it shows only the products added from the admin.

## Admin (`/admin/`)
In French or Arabic, on computer and phone (bottom tab bar on mobile):
- **Dashboard:** sales today, 7 days (vs the week before) and 30 days, average basket, confirmation and delivery rates, a 14-day sales chart, orders by status, best-selling products, top cities, latest orders, and an alert for orders to confirm.
- **Orders:** filters by status with counts, search (name, phone, city, reference), CSV export for delivery companies. Each order has a one-tap WhatsApp confirmation message in the customer's language, a call button, copy address, status (new → confirmed → shipped → delivered / cancelled / returned), an internal note and a history. Cancelled or returned orders put their items back in stock.
- **Products:** add your own products with photos, edit or delete them, change price, old price and stock (empty = unlimited) and show or hide any product. The shop updates straight away and shows "only 3 left" or "out of stock".
- **Settings:** shop name, WhatsApp number, delivery fee, free delivery threshold, promo code, the announcement bar (FR/AR), change the password, and add or delete demo orders.
- **Login:** password, signed HttpOnly session cookie (7 days). After 5 wrong passwords in 15 minutes (or 20 a day) that visitor is locked out. Changing the password logs out every device.

The first password is the `ADMIN_PASSWORD` secret (`npx wrangler secret put ADMIN_PASSWORD`). Once you change it from Settings, the new one is stored hashed (PBKDF2) in KV and replaces the secret.

## Photos
The banners, collection tiles, the "Inspiré du Maroc" section and the contact banner use 12 photos from Unsplash (free for commercial use, picked without visible brand logos). They're in `assets/photos/` as WebP, listed in `CREDITS.md` and on the shop's `#/credits` page.

## Product mockups
iPhone products show a real photo: a phone in a case (an Unsplash photo, `tools/mockup-base.jpg`) with each Wa9i design printed onto the case. The photo's light, shadows, camera and edges are kept. That's 27 images, one per design and colour, in `assets/mockups/`. The product page shows the photo first and the design drawing as the second view; other brands keep the drawings. To remake them after changing a design:
```bash
python3 -m http.server 8090 &
node tools/render-designs.mjs http://127.0.0.1:8090 dist/designs
python3 tools/make-mockups.py dist/designs assets/mockups
```

## Customise
- **Products, brands, models, base prices, colour names:** `catalog.js` (shared by the shop and the server). Prices and stock can also be changed in the admin.
- **Text (FR / AR):** the `T` object in `app.js` (shop) and `admin/admin.js` (admin).
- **Colours:** the CSS variables at the top of `styles.css`.
- **Pictures:** the case pictures are SVG drawings generated by `caseSVG()` in `app.js`. For a real shop, replace them with product photos.

## Run locally
```bash
echo "ADMIN_PASSWORD=change-me-locally" > .dev.vars
node tools/build-worker.mjs
npx wrangler dev
```
Then open http://localhost:8787 (shop) and http://localhost:8787/admin/.

## Deploy (Cloudflare Workers)
```bash
node tools/build-worker.mjs
CLOUDFLARE_ACCOUNT_ID=<account id> npx wrangler deploy
```
Live at https://wa9i.visa-abache.workers.dev. `tools/build-worker.mjs` bundles the shop, admin and logo files into `dist/site.js`, and `src/worker.js` serves them with the API. The KV namespace is set in `wrangler.jsonc`.

---
Demo site: fictional brand, no real orders.

## Logo (`assets/logo/`)
The mark is a phone case shaped like a Moroccan horseshoe arch. An 8-point star frames the camera lens, small Amazigh diamonds sit below it, and stitching runs round the edge. Colours: emerald `#0e7a5f`, saffron gold `#f2b33d`, ink `#0c1f1a`. The text is converted to outlines, so the logos look the same on every device without the fonts (Outfit and Tajawal, both under the SIL Open Font License).

| File | Use |
| --- | --- |
| `wa9i-logo.svg` / `.png` | Main logo: mark, name and tagline, on light backgrounds |
| `wa9i-logo-dark.svg` / `.png` | Main logo on a dark background |
| `wa9i-logo-stacked.svg` / `.png` | Centred version: posters, packaging, stickers |
| `wa9i-mark.svg` / `.png` | The mark on its own: favicon, watermark on product photos |
| `wa9i-mark-gold.svg` | Gold version of the mark |
| `wa9i-icon.svg`, `wa9i-icon-512.png`, `wa9i-icon-1024.png` | App icon |
| `wa9i-profile-1080.png` | Instagram, Facebook, TikTok and WhatsApp profile picture (fits the circle crop) |

### Africa mosaic version (`wa9i-afrique-*`)
A second logo: a black phone case with the map of Africa filled with a mosaic of Moroccan patterns (zellige stars, Amazigh diamonds, rug stripes, dots) in emerald, saffron, terracotta, majorelle blue and cream. A gold star marks Morocco. Files: `wa9i-afrique-mark`, `-logo`, `-logo-dark`, `-logo-stacked` and `-icon` (SVG + PNG), `wa9i-afrique-icon-1024.png` and `wa9i-afrique-profile-1080.png`.

### Maroc version (`wa9i-maroc-*`)
A third logo in Morocco's colours: a red case with a tone-on-tone zellige pattern, a vertical green stripe with gold edges, and a round Wa9i badge carrying the green star from the flag. It's an original badge, not the football federation's crest, which is a protected emblem. Files: `wa9i-maroc-mark`, `-logo`, `-logo-dark`, `-logo-stacked` and `-icon` (SVG + PNG), `wa9i-maroc-icon-1024.png` and `wa9i-maroc-profile-1080.png`.
