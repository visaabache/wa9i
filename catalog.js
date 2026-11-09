/* Wa9i catalogue: brands, models, designs, accessories and cities.
   Shared by the shop (app.js) and the server (src/worker.js), so prices are always computed from the same list. */
(function (root) {
  "use strict";
  const BRANDS = [
    { id: "iphone", name: "iPhone", cam: "tri", models: ["iPhone 18 Pro Max", "iPhone 18 Pro", "iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17", "iPhone 16", "iPhone 15"] },
    { id: "samsung", name: "Samsung", cam: "vert", models: ["Galaxy S26 Ultra", "Galaxy S26", "Galaxy A57", "Galaxy A37", "Galaxy A17"] },
    { id: "xiaomi", name: "Xiaomi", cam: "square", models: ["Xiaomi 15T Pro", "Redmi Note 15 Pro", "Redmi 15C"] },
    { id: "huawei", name: "Huawei", cam: "round", models: ["Pura 80 Pro", "Nova 14"] },
    { id: "oppo", name: "Oppo", cam: "round", models: ["Reno 14", "A5 Pro"] },
    { id: "honor", name: "Honor", cam: "round", models: ["Honor 400", "Magic 7 Lite", "X9c"] },
    { id: "google", name: "Google", cam: "bar", models: ["Pixel 10 Pro", "Pixel 10", "Pixel 9a"] },
    { id: "infinix", name: "Infinix", cam: "square", models: ["Note 50 Pro", "Hot 60"] },
  ];
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const DESIGNS = [
    { key: "zellige", coll: "zellige", name: { fr: "Zellige Fès", ar: "زليج فاس" }, pattern: "zellige", colors: ["#0e7a5f", "#1d4ed8", "#9a3412"], price: 189, old: 249, badge: { fr: "Best-seller", ar: "الأكثر مبيعاً" } },
    { key: "najma", coll: "zellige", name: { fr: "Étoile Atlas", ar: "نجمة الأطلس" }, pattern: "star", colors: ["#b91c1c", "#0c1f1a"], price: 169, old: 219 },
    { key: "amazigh", coll: "zellige", name: { fr: "Tissage amazigh", ar: "طرز أمازيغي" }, pattern: "amazigh", colors: ["#f2b33d", "#f6efe2", "#0c1f1a"], price: 179, old: 229, badge: { fr: "Nouveau", ar: "جديد" }, isNew: true },
    { key: "clear", coll: "clear", name: { fr: "Clear MagSafe", ar: "شفافة MagSafe" }, pattern: "clear", colors: ["#cfe3ee", "#e9d5ff", "#0c1f1a"], price: 199, old: 259, badge: { fr: "MagSafe", ar: "MagSafe" } },
    { key: "frost", coll: "clear", name: { fr: "Givrée mate MagSafe", ar: "مطفية MagSafe" }, pattern: "frost", colors: ["#94a3b8", "#86efac", "#fda4af"], price: 189, old: 239, isNew: true },
    { key: "leather", coll: "cuir", name: { fr: "Cuir pleine fleur", ar: "جلد طبيعي" }, pattern: "leather", colors: ["#7c4a21", "#1f1f1f", "#2f4a3a"], price: 279, old: 349, badge: { fr: "Cuir", ar: "جلد" } },
    { key: "wallet", coll: "cuir", name: { fr: "Étui portefeuille", ar: "حافظة محفظة" }, pattern: "wallet", colors: ["#3b2412", "#1f1f1f", "#7f1d1d"], price: 249, old: 299 },
    { key: "armor", coll: "armor", name: { fr: "Armure antichoc + anneau", ar: "مضادة للصدمات + حلقة" }, pattern: "armor", colors: ["#1f2937", "#9a3412", "#1e3a8a"], price: 229, old: 289, badge: { fr: "Antichoc", ar: "مضادة للصدمات" } },
    { key: "carbon", coll: "armor", name: { fr: "Fibre carbone fine", ar: "ألياف الكربون" }, pattern: "carbon", colors: ["#111827", "#374151"], price: 159, old: 199 },
    { key: "marble", coll: "zellige", name: { fr: "Marbre & or", ar: "رخام وذهبي" }, pattern: "marble", colors: ["#f5f0e6", "#1f1f1f"], price: 169, old: 209 },
  ];

  const COLLS = {
    zellige: { name: { fr: "Zellige & Maroc", ar: "زليج ومغرب" } },
    clear: { name: { fr: "Transparent MagSafe", ar: "شفاف MagSafe" } },
    cuir: { name: { fr: "Cuir", ar: "جلد" } },
    armor: { name: { fr: "Antichoc", ar: "مضاد للصدمات" } },
  };

  const ACCESSORIES = [
    { key: "charger", name: { fr: "Chargeur rapide 30 W USB-C", ar: "شاحن سريع 30 واط USB-C" }, icon: "charger", colors: ["#f5f5f4", "#111827"], price: 149, old: 199 },
    { key: "cable", name: { fr: "Câble tressé USB-C 2 m", ar: "كابل مضفور USB-C 2 متر" }, icon: "cable", colors: ["#0e7a5f", "#111827"], price: 79, old: 99 },
    { key: "glass", name: { fr: "Verre trempé 9H (x2)", ar: "زجاج مقوى 9H (x2)" }, icon: "glass", colors: ["#cfe3ee"], price: 69, old: 99, badge: { fr: "Pack x2", ar: "x2" } },
    { key: "magsafe", name: { fr: "Chargeur MagSafe 15 W", ar: "شاحن MagSafe 15 واط" }, icon: "puck", colors: ["#f5f5f4"], price: 179, old: 229 },
    { key: "strap", name: { fr: "Cordon tour de cou", ar: "حبل للعنق" }, icon: "strap", colors: ["#f2b33d", "#0e7a5f", "#111827"], price: 59, old: 79, isNew: true },
    { key: "stand", name: { fr: "Support voiture magnétique", ar: "حامل مغناطيسي للسيارة" }, icon: "stand", colors: ["#111827"], price: 129, old: 169 },
  ];

  // Deterministic pseudo-random so the demo looks the same on every visit
  const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

  const PRODUCTS = [];
  BRANDS.forEach((b, bi) => b.models.forEach((m, mi) => {
    const ms = slug(m);
    DESIGNS.forEach((d, di) => {
      // Not every design for every model (older models get fewer)
      if ((hash(ms + d.key) % 10) < Math.min(2 + mi, 4) && di > 2) return;
      const h = hash(ms + d.key);
      PRODUCTS.push({
        id: `${d.key}-${ms}`, brand: b.id, model: m, modelSlug: ms, cam: b.cam, design: d.key, coll: d.coll,
        name: d.name, pattern: d.pattern, colors: d.colors, price: d.price + (mi === 0 && bi < 2 ? 20 : 0), old: d.old + (mi === 0 && bi < 2 ? 20 : 0),
        badge: d.badge, isNew: !!d.isNew || mi === 0, pop: (h % 1000) + (d.badge ? 400 : 0) + (b.id === "iphone" ? 300 : 0) + (mi < 2 ? 200 : 0),
        rating: 4.5 + ((h >> 3) % 5) / 10, reviews: 12 + (h % 180), order: bi * 1000 + mi * 50 + di,
      });
    });
  }));
  ACCESSORIES.forEach((a, i) => PRODUCTS.push({
    id: `acc-${a.key}`, brand: "accessoires", model: null, modelSlug: null, accessory: a.icon, name: a.name, colors: a.colors,
    price: a.price, old: a.old, badge: a.badge, isNew: !!a.isNew, pop: 500 - i * 40, rating: 4.6, reviews: 40 + i * 17, order: 90000 + i,
  }));

  const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan", "Salé", "Témara", "Mohammedia", "El Jadida", "Béni Mellal", "Nador", "Safi", "Khouribga", "Settat", "Laâyoune", "Dakhla", "Essaouira", "Ouarzazate", "Errachidia", "Taza", "Larache", "Khémisset", "Berrechid", "Guelmim", "Autre ville"];

  const COLOR_NAMES = {
    "#0e7a5f": { fr: "Vert émeraude", ar: "أخضر زمردي" }, "#1d4ed8": { fr: "Bleu Majorelle", ar: "أزرق ماجوريل" }, "#9a3412": { fr: "Terracotta", ar: "طيني" },
    "#b91c1c": { fr: "Rouge", ar: "أحمر" }, "#0c1f1a": { fr: "Noir vert", ar: "أسود مخضر" }, "#f2b33d": { fr: "Safran", ar: "زعفراني" }, "#f6efe2": { fr: "Crème", ar: "كريمي" },
    "#cfe3ee": { fr: "Transparent", ar: "شفاف" }, "#e9d5ff": { fr: "Lilas transparent", ar: "بنفسجي شفاف" }, "#94a3b8": { fr: "Gris givré", ar: "رمادي مطفي" },
    "#86efac": { fr: "Vert menthe", ar: "أخضر نعناعي" }, "#fda4af": { fr: "Rose", ar: "وردي" }, "#7c4a21": { fr: "Cognac", ar: "كونياك" }, "#1f1f1f": { fr: "Noir", ar: "أسود" },
    "#2f4a3a": { fr: "Vert forêt", ar: "أخضر غابوي" }, "#3b2412": { fr: "Chocolat", ar: "شوكولا" }, "#7f1d1d": { fr: "Bordeaux", ar: "بوردو" }, "#1f2937": { fr: "Gris anthracite", ar: "رمادي فحمي" },
    "#1e3a8a": { fr: "Bleu nuit", ar: "أزرق ليلي" }, "#111827": { fr: "Noir", ar: "أسود" }, "#374151": { fr: "Gris carbone", ar: "رمادي كربوني" }, "#f5f0e6": { fr: "Marbre blanc", ar: "رخام أبيض" },
    "#f5f5f4": { fr: "Blanc", ar: "أبيض" },
  };
  const colorName = (hex, lang) => (COLOR_NAMES[hex] && (COLOR_NAMES[hex][lang] || COLOR_NAMES[hex].fr)) || hex;
  root.WA9I_CATALOG = { BRANDS, DESIGNS, COLLS, ACCESSORIES, PRODUCTS, CITIES, slug, COLOR_NAMES, colorName };
})(typeof self !== "undefined" ? self : globalThis);
