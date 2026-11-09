/* Wa9i seller admin: dashboard, orders, products, settings. French / Arabic. Talks to /api/admin/*. */
(() => {
  "use strict";
  const T = {
    fr: {
      title: "Espace vendeur", login: "Se connecter", password: "Mot de passe", wrongPw: "Mot de passe incorrect.", locked: "Trop d’essais. Réessayez dans 15 minutes.",
      nav: { dashboard: "Tableau de bord", orders: "Commandes", products: "Produits", settings: "Réglages" }, navShort: { dashboard: "Accueil", orders: "Commandes", products: "Produits", settings: "Réglages" },
      viewStore: "Voir la boutique", logout: "Déconnexion", switchTo: "العربية",
      hello: "Bonjour 👋", helloSub: "Voici l’activité de votre boutique.", today: "Aujourd’hui", week: "7 derniers jours", month: "30 derniers jours", basket: "Panier moyen",
      orders_n: (n) => `${n} commande${n > 1 ? "s" : ""}`, vsPrev: "vs semaine d’avant", sales14: "Ventes des 14 derniers jours", byStatus: "Commandes par statut", top: "Produits les plus vendus", cities: "Villes", recent: "Dernières commandes", seeAll: "Tout voir",
      confirmRate: "Taux de confirmation", deliveryRate: "Taux de livraison", pendingAlert: (n) => `${n} commande${n > 1 ? "s" : ""} à confirmer`, pendingGo: "Confirmer maintenant",
      weakPw: "Votre mot de passe est court. Changez-le dans Réglages.",
      noOrders: "Aucune commande pour l’instant.", noOrdersHint: "Les commandes de la boutique arrivent ici. Pour tester, ajoutez des commandes de démo dans Réglages.",
      st: { new: "Nouvelle", confirmed: "Confirmée", shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée", returned: "Retournée" }, all: "Toutes",
      search: "Rechercher : nom, téléphone, ville, référence…", exportCsv: "Exporter CSV", ref: "Réf.", date: "Date", customer: "Client", city: "Ville", items: "Articles", total: "Total", status: "Statut",
      order: "Commande", phone: "Téléphone", address: "Adresse", note: "Note du client", lang: "Langue", products: "Produits", subtotal: "Sous-total", shipping: "Livraison", free: "Offerte", coupon: "Code",
      changeStatus: "Changer le statut", restockNote: "Annulée ou retournée : les articles reviennent en stock.", internal: "Note interne", saveNote: "Enregistrer la note", history: "Historique",
      waConfirm: "Confirmer sur WhatsApp", call: "Appeler", copy: "Copier l’adresse", copied: "Copié", deleteOrder: "Supprimer", confirmDelete: "Supprimer cette commande ?", saved: "Enregistré",
      pSearch: "Rechercher un produit ou un modèle…", allBrands: "Toutes les marques", accessories: "Accessoires", product: "Produit", price: "Prix", oldPrice: "Ancien prix", stock: "Stock", visible: "Visible",
      unlimited: "illimité", changes: (n) => `${n} modification${n > 1 ? "s" : ""} non enregistrée${n > 1 ? "s" : ""}`, save: "Enregistrer", discard: "Annuler", showing: (a, b) => `${a} sur ${b} produits`, hiddenOnly: "Masqués", lowOnly: "Stock bas",
      shop: "Boutique", shopName: "Nom de la boutique", whatsapp: "Numéro WhatsApp", whatsappHint: "Format international, chiffres seulement : 2126XXXXXXXX", shipFee: "Frais de livraison (DH)", freeFrom: "Livraison offerte dès (articles)",
      couponCode: "Code promo (livraison offerte dès 2 articles)", couponHint: "Laissez vide pour désactiver", announce: "Barre d’annonce (bas de page)", announceFr: "Texte en français", announceAr: "Texte en arabe",
      security: "Sécurité", curPw: "Mot de passe actuel", newPw: "Nouveau mot de passe (10 caractères minimum)", changePw: "Changer le mot de passe", pwChanged: "Mot de passe changé", pwShort: "10 caractères minimum",
      demo: "Données de démonstration", demoTxt: "Ajoutez des commandes fictives pour voir le tableau de bord rempli, puis supprimez-les quand vous voulez. Elles sont marquées « démo ».", demoAdd: "Ajouter 26 commandes de démo", demoDel: "Supprimer les commandes de démo", demoAdded: (n) => `${n} commandes de démo ajoutées`, demoDeleted: (n) => `${n} commandes de démo supprimées`,
      err: "Erreur, réessayez.", errWa: "Numéro WhatsApp invalide", loading: "Chargement…", demoTag: "démo",
      waMsg: (o) => `Bonjour ${o.name}, c’est Wa9i 👋\nNous avons bien reçu votre commande ${o.ref} :\n${o.items.map((l) => `• ${l.qty} × ${l.title} (${l.colorName || l.color})`).join("\n")}\nTotal à payer à la livraison : ${o.total} DH.\nLivraison à : ${o.address}, ${o.city}.\nPouvez-vous confirmer en répondant « OK » ? Merci !`,
    },
    ar: {
      title: "فضاء البائع", login: "دخول", password: "كلمة السر", wrongPw: "كلمة السر غير صحيحة.", locked: "محاولات كثيرة. عاود من بعد 15 دقيقة.",
      nav: { dashboard: "لوحة التحكم", orders: "الطلبات", products: "المنتجات", settings: "الإعدادات" }, navShort: { dashboard: "الرئيسية", orders: "الطلبات", products: "المنتجات", settings: "الإعدادات" },
      viewStore: "عرض المتجر", logout: "خروج", switchTo: "Français",
      hello: "مرحبا 👋", helloSub: "هادا هو نشاط المتجر ديالك.", today: "اليوم", week: "آخر 7 أيام", month: "آخر 30 يوم", basket: "متوسط السلة",
      orders_n: (n) => `${n} طلب`, vsPrev: "مقارنة بالأسبوع اللي فات", sales14: "المبيعات ديال آخر 14 يوم", byStatus: "الطلبات حسب الحالة", top: "المنتجات الأكثر مبيعاً", cities: "المدن", recent: "آخر الطلبات", seeAll: "عرض الكل",
      confirmRate: "نسبة التأكيد", deliveryRate: "نسبة التوصيل", pendingAlert: (n) => `${n} طلب خاصهم التأكيد`, pendingGo: "أكد دابا",
      weakPw: "كلمة السر قصيرة. بدلها فالإعدادات.",
      noOrders: "ما كاين حتى طلب دابا.", noOrdersHint: "الطلبات ديال المتجر كيوصلو هنا. باش تجرب، زيد طلبات تجريبية فالإعدادات.",
      st: { new: "جديد", confirmed: "مؤكد", shipped: "تصيفط", delivered: "توصل", cancelled: "ملغى", returned: "رجع" }, all: "الكل",
      search: "قلب: الاسم، الهاتف، المدينة، المرجع…", exportCsv: "تصدير CSV", ref: "المرجع", date: "التاريخ", customer: "الزبون", city: "المدينة", items: "المنتجات", total: "المجموع", status: "الحالة",
      order: "الطلب", phone: "الهاتف", address: "العنوان", note: "ملاحظة الزبون", lang: "اللغة", products: "المنتجات", subtotal: "المجموع الفرعي", shipping: "التوصيل", free: "مجاني", coupon: "الكود",
      changeStatus: "بدل الحالة", restockNote: "ملغى ولا رجع: المنتجات كيرجعو للستوك.", internal: "ملاحظة داخلية", saveNote: "سجل الملاحظة", history: "السجل",
      waConfirm: "أكد على واتساب", call: "عيط", copy: "نسخ العنوان", copied: "تنسخ", deleteOrder: "حذف", confirmDelete: "تحذف هاد الطلب؟", saved: "تسجل",
      pSearch: "قلب على منتج ولا موديل…", allBrands: "جميع الماركات", accessories: "إكسسوارات", product: "المنتج", price: "الثمن", oldPrice: "الثمن القديم", stock: "الستوك", visible: "ظاهر",
      unlimited: "بلا حدود", changes: (n) => `${n} تعديل ما تسجلش`, save: "سجل", discard: "إلغاء", showing: (a, b) => `${a} من ${b} منتج`, hiddenOnly: "مخفيين", lowOnly: "ستوك قليل",
      shop: "المتجر", shopName: "سمية المتجر", whatsapp: "رقم واتساب", whatsappHint: "بالصيغة الدولية، أرقام فقط: 2126XXXXXXXX", shipFee: "ثمن التوصيل (درهم)", freeFrom: "التوصيل مجاني ابتداءً من (منتجات)",
      couponCode: "كود التخفيض (توصيل مجاني ابتداءً من منتجين)", couponHint: "خليه خاوي باش توقفو", announce: "شريط الإعلان (تحت الصفحة)", announceFr: "النص بالفرنسية", announceAr: "النص بالعربية",
      security: "الأمان", curPw: "كلمة السر الحالية", newPw: "كلمة السر الجديدة (10 حروف على الأقل)", changePw: "بدل كلمة السر", pwChanged: "تبدلات كلمة السر", pwShort: "10 حروف على الأقل",
      demo: "بيانات تجريبية", demoTxt: "زيد طلبات وهمية باش تشوف لوحة التحكم عامرة، ومن بعد حيدهم وقتما بغيتي. كيبانو بعلامة « تجريبي ».", demoAdd: "زيد 26 طلب تجريبي", demoDel: "حذف الطلبات التجريبية", demoAdded: (n) => `تزادو ${n} طلب تجريبي`, demoDeleted: (n) => `تحذفو ${n} طلب تجريبي`,
      err: "وقع خطأ، عاود.", errWa: "رقم واتساب غير صالح", loading: "كيتحمل…", demoTag: "تجريبي",
      waMsg: (o) => `السلام ${o.name}، معاك Wa9i 👋\nتوصلنا بالطلب ديالك ${o.ref}:\n${o.items.map((l) => `• ${l.qty} × ${l.title} (${l.colorName || l.color})`).join("\n")}\nالمجموع اللي غادي تخلص عند الاستلام: ${o.total} درهم.\nالتوصيل ل: ${o.address}، ${o.city}.\nواش تقدر تأكد بـ « OK »؟ شكراً!`,
    },
  };
  let lang = (() => { try { return localStorage.getItem("wa9i:adminLang") === "ar" ? "ar" : "fr"; } catch { return "fr"; } })();
  let L = T[lang];
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const dh = (n) => `${Number(n || 0).toLocaleString("fr-MA")} ${lang === "ar" ? "درهم" : "DH"}`;
  const fmtDate = (t, withTime = true) => new Date(t).toLocaleString(lang === "ar" ? "ar-MA" : "fr-MA", { day: "2-digit", month: "short", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}), timeZone: "Africa/Casablanca" });
  const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled", "returned"];
  const pill = (s) => `<span class="pill s-${s}">${L.st[s] || s}</span>`;
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
    orders: '<path d="M6 7h12l-1 13H7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
    products: '<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="10.5" cy="6" r="1.2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>', cart: '<path d="M6 7h12l-1 13H7z"/>', trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>', basket: '<path d="M5 9h14l-1.5 10h-11zM9 9l3-5 3 5"/>',
    wa: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>', phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>', copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>', alert: '<path d="M12 3 2 20h20zM12 10v4M12 17v.5"/>',
  };
  const icon = (n, s = 20) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  let toastT;
  function toast(msg, err) { const el = $("#toast"); el.textContent = msg; el.className = "toast" + (err ? " err" : ""); el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2600); }

  async function api(path, opts = {}) {
    const res = await fetch("/api/admin/" + path, { credentials: "same-origin", ...opts, headers: { ...(opts.body ? { "Content-Type": "application/json" } : {}), ...(opts.headers || {}) } });
    if (res.status === 401 && path !== "login" && path !== "password") { showLogin(); throw new Error("auth"); }
    const data = res.headers.get("Content-Type")?.includes("json") ? await res.json() : null;
    if (!res.ok) { const e = new Error(data?.error || "err"); e.code = data?.error; throw e; }
    return data;
  }
  const state = { page: "dashboard", pending: 0, me: null };
  const app = $("#app");
  function setLang(l) {
    lang = l; L = T[lang]; try { localStorage.setItem("wa9i:adminLang", lang); } catch { /* ignore */ }
    document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = `Wa9i · ${L.title}`;
  }

  /* ---------- Login ---------- */
  function showLogin() {
    document.body.className = "is-login";
    app.innerHTML = `<form class="login" id="loginForm">
      <div class="login-brand"><img src="/assets/logo/wa9i-maroc-mark.svg" alt=""><div><b>Wa9i</b><small>${L.title}</small></div></div>
      <label>${L.password}<input type="password" name="password" autocomplete="current-password" required autofocus></label>
      <p class="error" id="loginErr"></p>
      <button class="btn green" type="submit">${L.login}</button>
      <button class="btn ghost small" type="button" id="loginLang">${L.switchTo}</button>
    </form>`;
    $("#loginLang").onclick = () => { setLang(lang === "ar" ? "fr" : "ar"); showLogin(); };
    $("#loginForm").onsubmit = async (e) => {
      e.preventDefault(); const btn = e.target.querySelector("[type=submit]"); btn.disabled = true; $("#loginErr").textContent = "";
      try { await api("login", { method: "POST", body: JSON.stringify({ password: e.target.password.value }) }); start(); }
      catch (err) { $("#loginErr").textContent = err.code === "locked" ? L.locked : L.wrongPw; btn.disabled = false; }
    };
  }

  /* ---------- Shell ---------- */
  const PAGES = ["dashboard", "orders", "products", "settings"];
  function shell() {
    document.body.className = "";
    const nav = PAGES.map((k) => `<a href="#${k}" class="nav-item${state.page === k ? " on" : ""}">${icon(k)}<span class="long">${L.nav[k]}</span><span class="short">${L.navShort[k]}</span>${k === "orders" && state.pending ? `<b class="nav-badge">${state.pending}</b>` : ""}</a>`).join("");
    const brand = `<a class="side-brand" href="#dashboard"><img src="/assets/logo/wa9i-maroc-mark.svg" alt=""><span><b>Wa9i</b><small>${L.title}</small></span></a>`;
    app.innerHTML = `<div class="shell">
      <aside class="side">${brand}<nav class="side-nav">${nav}</nav>
        <div class="side-foot">
          <button class="nav-item" data-lang>${icon("globe")}<span>${L.switchTo}</span></button>
          <a href="/" target="_blank" rel="noopener" class="nav-item">${icon("external")}<span>${L.viewStore}</span></a>
          <button class="nav-item" data-logout>${icon("logout")}<span>${L.logout}</span></button>
        </div></aside>
      <main class="main" id="main" tabindex="-1">
        <div class="topbar">${brand}<div class="actions"><button class="icon-btn" data-lang aria-label="${L.switchTo}">${icon("globe")}</button><a class="icon-btn" href="/" target="_blank" rel="noopener" aria-label="${L.viewStore}">${icon("external")}</a><button class="icon-btn" data-logout aria-label="${L.logout}">${icon("logout")}</button></div></div>
        <div id="page"></div>
      </main>
      <nav class="tabbar">${nav}</nav></div>`;
    $$("[data-lang]").forEach((b) => (b.onclick = () => { setLang(lang === "ar" ? "fr" : "ar"); route(); }));
    $$("[data-logout]").forEach((b) => (b.onclick = async () => { try { await api("logout", { method: "POST" }); } catch { /* ignore */ } showLogin(); }));
  }
  const loading = () => { $("#page").innerHTML = `<div class="loading">${L.loading}</div>`; };
  function route() {
    const h = location.hash.slice(1).split("/")[0];
    state.page = PAGES.includes(h) ? h : "dashboard";
    shell(); loading();
    ({ dashboard, orders, products, settings })[state.page]().catch((e) => { if (e.message !== "auth") $("#page").innerHTML = `<div class="card empty">${L.err}</div>`; });
  }
  async function refreshPending() {
    try { const d = await api("orders?status=new"); state.pending = d.counts.new; $$(".nav-item[href='#orders']").forEach((a) => { let b = a.querySelector(".nav-badge"); if (!state.pending) { b?.remove(); return; } if (!b) { b = document.createElement("b"); b.className = "nav-badge"; a.append(b); } b.textContent = state.pending; }); } catch { /* ignore */ }
  }

  /* ---------- Dashboard ---------- */
  function chart(series) {
    const W = 640, H = 220, Lm = 44, B = 26, T0 = 10;
    const max = Math.max(100, ...series.map((d) => d.revenue)); const step = Math.pow(10, Math.floor(Math.log10(max))); const top = Math.ceil(max / step) * step;
    const bw = (W - Lm) / series.length;
    let grid = ""; for (let i = 0; i <= 4; i++) { const y = T0 + ((H - B - T0) * i) / 4; grid += `<line x1="${Lm}" x2="${W}" y1="${y}" y2="${y}" class="grid-l"/><text x="${Lm - 6}" y="${y + 4}" text-anchor="end">${Math.round(top - (top * i) / 4).toLocaleString("fr-MA")}</text>`; }
    const bars = series.map((d, i) => { const h = ((H - B - T0) * d.revenue) / top; const x = Lm + i * bw + bw * 0.18; const dd = new Date(d.day + 3600e3);
      return `<rect class="bar" x="${x.toFixed(1)}" y="${(H - B - h).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${Math.max(h, d.revenue ? 2 : 0).toFixed(1)}" rx="4" data-i="${i}"/>${i % 2 === 0 || series.length < 10 ? `<text x="${(x + bw * 0.32).toFixed(1)}" y="${H - 8}" text-anchor="middle">${dd.getUTCDate()}/${dd.getUTCMonth() + 1}</text>` : ""}`; }).join("");
    return `<div class="chart" dir="ltr"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L.sales14}">${grid}<line x1="${Lm}" x2="${W}" y1="${H - B}" y2="${H - B}" class="base"/>${bars}</svg><div class="tip" hidden></div></div>`;
  }
  function bindChart(series) {
    const c = $(".chart"); if (!c) return; const tip = $(".tip", c);
    $$(".bar", c).forEach((b) => {
      const show = () => { const d = series[+b.dataset.i]; const r = b.getBoundingClientRect(), cr = c.getBoundingClientRect(); tip.innerHTML = `<b>${fmtDate(d.day + 3600e3, false)}</b> · ${dh(d.revenue)} · ${L.orders_n(d.orders)}`; tip.style.left = r.left - cr.left + r.width / 2 + "px"; tip.style.top = r.top - cr.top + "px"; tip.hidden = false; $$(".bar", c).forEach((x) => x.classList.toggle("on", x === b)); };
      b.addEventListener("mouseenter", show); b.addEventListener("click", show);
    });
    c.addEventListener("mouseleave", () => { tip.hidden = true; $$(".bar", c).forEach((x) => x.classList.remove("on")); });
  }
  const orderRow = (o) => `<a class="row" href="#orders/${encodeURIComponent(o.key)}"><span><b>${esc(o.name)}</b> <span class="muted small">· ${esc(o.city)}</span>${o.demo ? ` <span class="muted small">(${L.demoTag})</span>` : ""}<br><span class="muted small mono">${esc(o.ref)}</span> <span class="muted small">· ${fmtDate(o.created)}</span></span><span style="text-align:end"><b>${dh(o.total)}</b><br>${pill(o.status)}</span></a>`;
  async function dashboard() {
    const [s, me] = await Promise.all([api("stats"), state.me ? state.me : api("me")]);
    state.me = me; state.pending = s.counts.new; shell();
    const wk = s.week.revenue, pw = s.prevWeek.revenue; const delta = pw ? Math.round(((wk - pw) / pw) * 100) : null;
    const kpi = (ic, lbl, val, sub) => `<div class="card kpi"><span class="lbl">${icon(ic, 18)}${lbl}</span><span class="val">${val}</span><span class="sub">${sub}</span></div>`;
    const maxC = Math.max(1, ...Object.values(s.counts));
    $("#page").innerHTML = `
      <div class="page-head"><div><h1>${L.hello}</h1><p>${L.helloSub}</p></div><a class="btn ghost small" href="#orders">${L.nav.orders}</a></div>
      ${me.weakPassword ? `<div class="alert red">${icon("alert")}<span class="grow">${L.weakPw}</span><a class="btn small ghost" href="#settings">${L.nav.settings}</a></div>` : ""}
      ${s.counts.new ? `<div class="alert">${icon("orders")}<span class="grow">${L.pendingAlert(s.counts.new)}</span><a class="btn small" href="#orders" data-go-new>${L.pendingGo}</a></div>` : ""}
      <div class="grid kpis">
        ${kpi("cash", L.today, dh(s.today.revenue), L.orders_n(s.today.orders))}
        ${kpi("trend", L.week, dh(s.week.revenue), `${L.orders_n(s.week.orders)}${delta !== null ? ` · <span class="${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : ""}${delta}%</span> ${L.vsPrev}` : ""}`)}
        ${kpi("cart", L.month, dh(s.month.revenue), L.orders_n(s.month.orders))}
        ${kpi("basket", L.basket, dh(s.avgBasket), `${L.confirmRate} : ${s.confirmRate ?? "—"}${s.confirmRate !== null ? "%" : ""}`)}
      </div>
      <div class="grid two" style="margin-top:16px">
        <div class="card"><h2>${L.sales14}</h2>${chart(s.series)}</div>
        <div class="card"><h2>${L.byStatus}</h2><div class="funnel">${STATUSES.map((k) => `<div class="funnel-row s-${k}"><span>${L.st[k]}</span><span class="funnel-bar"><i style="width:${(s.counts[k] / maxC) * 100}%"></i></span><b style="text-align:end">${s.counts[k]}</b></div>`).join("")}</div>
          <p class="muted small" style="margin:14px 0 0">${L.deliveryRate} : <b>${s.deliveryRate ?? "—"}${s.deliveryRate !== null ? "%" : ""}</b></p></div>
      </div>
      <div class="grid two" style="margin-top:16px">
        <div class="card"><h2 style="justify-content:space-between">${L.recent}<a class="small" href="#orders">${L.seeAll}</a></h2>${s.recent.length ? `<div class="list">${s.recent.map(orderRow).join("")}</div>` : `<div class="empty"><b>${L.noOrders}</b><p class="small">${L.noOrdersHint}</p></div>`}</div>
        <div><div class="card"><h2>${L.top}</h2>${s.top.length ? s.top.map((p, i) => `<div class="top-item"><span class="rank">${i + 1}</span><span>${esc(lang === "ar" ? p.titleAr : p.title)}</span><b class="nowrap">× ${p.qty}</b></div>`).join("") : `<p class="muted">—</p>`}</div>
          <div class="card"><h2>${L.cities}</h2>${s.cities.length ? s.cities.map(([c, n]) => `<div class="top-item" style="grid-template-columns:1fr auto"><span>${esc(c)}</span><b>${n}</b></div>`).join("") : `<p class="muted">—</p>`}</div></div>
      </div>`;
    bindChart(s.series);
    $("[data-go-new]")?.addEventListener("click", () => { ordersFilter.status = "new"; });
  }

  /* ---------- Orders ---------- */
  const ordersFilter = { status: "", q: "" };
  async function orders() {
    const parts = location.hash.slice(1).split("/");
    const q = new URLSearchParams(); if (ordersFilter.status) q.set("status", ordersFilter.status); if (ordersFilter.q) q.set("q", ordersFilter.q);
    const d = await api("orders?" + q);
    state.pending = d.counts.new; shell();
    const all = Object.values(d.counts).reduce((a, b) => a + b, 0);
    $("#page").innerHTML = `
      <div class="page-head"><div><h1>${L.nav.orders}</h1><p>${L.orders_n(all)}</p></div><a class="btn ghost small" href="/api/admin/orders.csv" download>${icon("download", 18)}${L.exportCsv}</a></div>
      <div class="chips"><button class="chip${!ordersFilter.status ? " on" : ""}" data-st="">${L.all} <b>${all}</b></button>${STATUSES.map((s) => `<button class="chip${ordersFilter.status === s ? " on" : ""}" data-st="${s}">${L.st[s]} <b>${d.counts[s]}</b></button>`).join("")}</div>
      <div class="toolbar"><input type="search" id="oq" placeholder="${L.search}" value="${esc(ordersFilter.q)}" aria-label="${L.search}"></div>
      ${d.orders.length ? `<div class="table-wrap"><table><thead><tr><th>${L.ref}</th><th>${L.date}</th><th>${L.customer}</th><th class="hide-m">${L.city}</th><th class="num hide-m">${L.items}</th><th class="num">${L.total}</th><th>${L.status}</th></tr></thead><tbody>
        ${d.orders.map((o) => `<tr class="click" data-key="${esc(o.key)}"><td class="mono nowrap">${esc(o.ref)}${o.demo ? ` <span class="muted small">${L.demoTag}</span>` : ""}</td><td class="nowrap">${fmtDate(o.created)}</td><td><b>${esc(o.name)}</b><br><span class="muted small" dir="ltr">${esc(o.phone)}</span></td><td class="hide-m">${esc(o.city)}</td><td class="num hide-m">${o.n}</td><td class="num nowrap"><b>${dh(o.total)}</b></td><td>${pill(o.status)}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="card empty"><b>${L.noOrders}</b><p class="small">${L.noOrdersHint}</p></div>`}`;
    $$("[data-st]").forEach((b) => (b.onclick = () => { ordersFilter.status = b.dataset.st; orders(); }));
    let tm; $("#oq").oninput = (e) => { clearTimeout(tm); tm = setTimeout(() => { ordersFilter.q = e.target.value; orders().then(() => { const i = $("#oq"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }); }, 350); };
    $$("tr[data-key]").forEach((tr) => (tr.onclick = () => { location.hash = "orders/" + encodeURIComponent(tr.dataset.key); }));
    if (parts[1]) openOrder(decodeURIComponent(parts.slice(1).join("/")));
  }
  async function openOrder(key) {
    closeDrawer();
    const scrim = document.createElement("div"); scrim.className = "scrim";
    const dr = document.createElement("aside"); dr.className = "drawer"; dr.setAttribute("role", "dialog"); dr.setAttribute("aria-modal", "true"); dr.innerHTML = `<div class="loading">${L.loading}</div>`;
    document.body.append(scrim, dr); scrim.onclick = closeDrawer;
    let o; try { o = (await api("orders/" + encodeURIComponent(key))).order; } catch { dr.innerHTML = `<div class="card empty">${L.err}</div>`; return; }
    const intl = o.phone.replace(/^0/, "212");
    const paint = () => {
      dr.innerHTML = `
        <div class="drawer-head"><div><span class="muted small">${L.order}</span><h2 class="mono">${esc(o.ref)}</h2></div><button class="icon-btn" data-x aria-label="×">${icon("close")}</button></div>
        <div>${pill(o.status)} <span class="muted small">· ${fmtDate(o.created)}</span>${o.demo ? ` <span class="muted small">· ${L.demoTag}</span>` : ""}</div>
        <div class="actions"><a class="btn wa small" target="_blank" rel="noopener" href="https://wa.me/${intl}?text=${encodeURIComponent(T[o.lang === "ar" ? "ar" : "fr"].waMsg(o))}">${icon("wa", 18)}${L.waConfirm}</a><a class="btn ghost small" href="tel:${esc(o.phone)}">${icon("phone", 18)}${L.call}</a><button class="btn ghost small" data-copy>${icon("copy", 18)}${L.copy}</button></div>
        <div class="card"><dl class="kv"><dt>${L.customer}</dt><dd><b>${esc(o.name)}</b></dd><dt>${L.phone}</dt><dd dir="ltr" style="text-align:start">${esc(o.phone)}</dd><dt>${L.city}</dt><dd>${esc(o.city)}</dd><dt>${L.address}</dt><dd>${esc(o.address)}</dd><dt>${L.lang}</dt><dd>${o.lang === "ar" ? "العربية" : "Français"}</dd>${o.note ? `<dt>${L.note}</dt><dd>${esc(o.note)}</dd>` : ""}</dl></div>
        <div class="card"><h2>${L.products}</h2><div class="items">${o.items.map((l) => `<div class="it"><span>${l.qty} × ${esc(l.title)}<br><span class="muted small"><i class="swatch" style="background:${esc(l.color)}"></i> ${esc(l.colorName || l.color)}</span></span><b class="nowrap">${dh(l.price * l.qty)}</b></div>`).join("")}</div>
          <div class="totals"><div><span>${L.subtotal}</span><span>${dh(o.subtotal)}</span></div><div><span>${L.shipping}</span><span>${o.shipping ? dh(o.shipping) : L.free}</span></div>${o.coupon ? `<div><span>${L.coupon}</span><span class="mono">${esc(o.coupon)}</span></div>` : ""}<div class="t"><span>${L.total}</span><span>${dh(o.total)}</span></div></div></div>
        <div class="card"><h2>${L.changeStatus}</h2><div class="status-grid">${STATUSES.map((s) => `<button class="s-${s}${o.status === s ? " on" : ""}" data-set="${s}">${L.st[s]}</button>`).join("")}</div><p class="muted small" style="margin:10px 0 0">${L.restockNote}</p></div>
        <div class="card"><label>${L.internal}<textarea id="anote">${esc(o.adminNote || "")}</textarea></label><div style="margin-top:10px"><button class="btn small" data-note>${L.saveNote}</button></div></div>
        <div class="card"><h2>${L.history}</h2><ul class="timeline">${(o.history || []).map((h) => `<li>${fmtDate(h.t)} · ${L.st[h.s] || h.s}</li>`).join("")}</ul></div>
        <div><button class="btn danger small" data-del>${L.deleteOrder}</button></div>`;
      $("[data-x]", dr).onclick = closeDrawer;
      $("[data-copy]", dr).onclick = async () => { try { await navigator.clipboard.writeText(`${o.name}\n${o.phone}\n${o.address}\n${o.city}`); toast(L.copied); } catch { toast(L.err, 1); } };
      $$("[data-set]", dr).forEach((b) => (b.onclick = async () => { try { o = (await api("orders/" + encodeURIComponent(key), { method: "PATCH", body: JSON.stringify({ status: b.dataset.set }) })).order; paint(); toast(L.saved); refreshList(); } catch { toast(L.err, 1); } }));
      $("[data-note]", dr).onclick = async () => { try { o = (await api("orders/" + encodeURIComponent(key), { method: "PATCH", body: JSON.stringify({ adminNote: $("#anote").value }) })).order; toast(L.saved); } catch { toast(L.err, 1); } };
      $("[data-del]", dr).onclick = async () => { if (!confirm(L.confirmDelete)) return; try { await api("orders/" + encodeURIComponent(key), { method: "DELETE" }); closeDrawer(); refreshList(); } catch { toast(L.err, 1); } };
      $("[data-x]", dr).focus();
    };
    paint();
  }
  function refreshList() { if (state.page === "orders") { const h = "#orders"; if (location.hash !== h) history.replaceState(null, "", h); orders(); } }
  function closeDrawer() {
    $$(".drawer, .scrim").forEach((e) => e.remove());
    if (location.hash.startsWith("#orders/")) history.replaceState(null, "", "#orders");
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  /* ---------- Products ---------- */
  const pf = { q: "", brand: "", only: "" };
  let pdata = null; const dirty = {};
  async function products() {
    if (!pdata) pdata = await api("products");
    const name = (p) => (p.name && (p.name[lang] || p.name.fr)) || p.id;
    const draw = () => {
      const q = pf.q.toLowerCase().trim();
      let list = pdata.products.filter((p) => (!pf.brand || p.brand === pf.brand) && (!q || `${name(p)} ${p.name?.fr} ${p.model || ""}`.toLowerCase().includes(q)));
      if (pf.only === "hidden") list = list.filter((p) => cur(p).hidden);
      if (pf.only === "low") list = list.filter((p) => { const s = cur(p).stock; return s !== null && s !== "" && Number(s) <= 5; });
      const shown = list.slice(0, 150);
      $("#ptable").innerHTML = shown.length ? `<table><thead><tr><th>${L.product}</th><th class="num">${L.price}</th><th class="num hide-m">${L.oldPrice}</th><th class="num">${L.stock}</th><th>${L.visible}</th></tr></thead><tbody>
        ${shown.map((p) => { const c = cur(p); return `<tr data-id="${p.id}" class="${dirty[p.id] ? "dirty" : ""}${c.hidden ? " hidden-p" : ""}"><td><b>${esc(name(p))}</b><br><span class="muted small">${esc(p.model || L.accessories)}</span> ${p.colors.map((x) => `<i class="swatch" style="background:${esc(x)}"></i>`).join(" ")}</td>
          <td class="num"><input class="mini" type="number" min="1" inputmode="numeric" data-f="price" value="${c.price}" aria-label="${L.price}"></td>
          <td class="num hide-m"><input class="mini" type="number" min="0" inputmode="numeric" data-f="old" value="${c.old}" aria-label="${L.oldPrice}"></td>
          <td class="num"><input class="mini" type="number" min="0" inputmode="numeric" data-f="stock" value="${c.stock ?? ""}" placeholder="${L.unlimited}" aria-label="${L.stock}"></td>
          <td><label class="switch"><input type="checkbox" data-f="hidden" ${c.hidden ? "" : "checked"}><span></span></label></td></tr>`; }).join("")}</tbody></table>` : `<div class="empty">—</div>`;
      $("#pcount").textContent = L.showing(Math.min(shown.length, list.length), pdata.products.length);
      $$("#ptable tr[data-id]").forEach((tr) => {
        const id = tr.dataset.id;
        $$("input", tr).forEach((inp) => inp.addEventListener(inp.type === "checkbox" ? "change" : "input", () => {
          const f = inp.dataset.f; dirty[id] = dirty[id] || {};
          dirty[id][f] = f === "hidden" ? !inp.checked : f === "stock" ? (inp.value === "" ? null : Number(inp.value)) : Number(inp.value);
          tr.classList.add("dirty"); if (f === "hidden") tr.classList.toggle("hidden-p", !inp.checked); savebar();
        }));
      });
    };
    const cur = (p) => ({ price: p.price, old: p.old, stock: p.stock, hidden: p.hidden, ...(dirty[p.id] || {}) });
    const savebar = () => {
      const n = Object.keys(dirty).length; const bar = $("#savebar"); bar.hidden = !n;
      $("#savebar span").textContent = L.changes(n);
    };
    $("#page").innerHTML = `
      <div class="page-head"><div><h1>${L.nav.products}</h1><p id="pcount"></p></div></div>
      <div class="toolbar"><input type="search" id="pq" placeholder="${L.pSearch}" value="${esc(pf.q)}" aria-label="${L.pSearch}">
        <select id="pb" aria-label="${L.allBrands}"><option value="">${L.allBrands}</option>${pdata.brands.map((b) => `<option value="${b.id}"${pf.brand === b.id ? " selected" : ""}>${esc(b.name)}</option>`).join("")}<option value="accessoires"${pf.brand === "accessoires" ? " selected" : ""}>${L.accessories}</option></select></div>
      <div class="chips"><button class="chip${!pf.only ? " on" : ""}" data-only="">${L.all}</button><button class="chip${pf.only === "hidden" ? " on" : ""}" data-only="hidden">${L.hiddenOnly}</button><button class="chip${pf.only === "low" ? " on" : ""}" data-only="low">${L.lowOnly}</button></div>
      <div class="table-wrap" id="ptable"></div>
      <div class="savebar" id="savebar" hidden><span></span><div class="actions"><button class="btn ghost small" id="pdiscard" style="background:transparent;color:#fff;border-color:rgb(255 255 255 / .3)">${L.discard}</button><button class="btn small" id="psave">${L.save}</button></div></div>`;
    draw(); savebar();
    let tm; $("#pq").oninput = (e) => { clearTimeout(tm); tm = setTimeout(() => { pf.q = e.target.value; draw(); }, 200); };
    $("#pb").onchange = (e) => { pf.brand = e.target.value; draw(); };
    $$("[data-only]").forEach((b) => (b.onclick = () => { pf.only = b.dataset.only; $$("[data-only]").forEach((x) => x.classList.toggle("on", x === b)); draw(); }));
    $("#pdiscard").onclick = () => { for (const k in dirty) delete dirty[k]; draw(); savebar(); };
    $("#psave").onclick = async (e) => {
      e.target.disabled = true;
      try { await api("products", { method: "PATCH", body: JSON.stringify({ changes: dirty }) }); for (const k in dirty) delete dirty[k]; pdata = await api("products"); draw(); savebar(); toast(L.saved); }
      catch { toast(L.err, 1); } finally { e.target.disabled = false; }
    };
  }

  /* ---------- Settings ---------- */
  async function settings() {
    const { settings: s } = await api("settings");
    $("#page").innerHTML = `
      <div class="page-head"><div><h1>${L.nav.settings}</h1></div></div>
      <form class="card form" id="sform"><h2>${L.shop}</h2>
        <div class="form-2"><label>${L.shopName}<input name="shopName" value="${esc(s.shopName)}" maxlength="40"></label>
        <label>${L.whatsapp}<input name="whatsapp" value="${esc(s.whatsapp)}" inputmode="numeric" dir="ltr" placeholder="2126XXXXXXXX"><span class="hint">${L.whatsappHint}</span></label>
        <label>${L.shipFee}<input name="shipping" type="number" min="0" value="${s.shipping}"></label>
        <label>${L.freeFrom}<input name="freeShippingFrom" type="number" min="1" value="${s.freeShippingFrom}"></label></div>
        <label>${L.couponCode}<input name="couponCode" value="${esc(s.couponCode)}" maxlength="20" style="text-transform:uppercase" dir="ltr"><span class="hint">${L.couponHint}</span></label>
        <h2 style="margin-top:6px">${L.announce}</h2>
        <div class="form-2"><label>${L.announceFr}<input name="annFr" value="${esc(s.announcement?.fr)}" maxlength="140"></label><label>${L.announceAr}<input name="annAr" value="${esc(s.announcement?.ar)}" maxlength="140" dir="rtl"></label></div>
        <div><button class="btn green" type="submit">${L.save}</button></div></form>
      <form class="card form" id="pwform"><h2>${L.security}</h2>
        <div class="form-2"><label>${L.curPw}<input type="password" name="current" autocomplete="current-password" required></label><label>${L.newPw}<input type="password" name="next" autocomplete="new-password" minlength="10" required></label></div>
        <div><button class="btn" type="submit">${L.changePw}</button></div></form>
      <div class="card form"><h2>${L.demo}</h2><p class="muted" style="margin:0">${L.demoTxt}</p><div class="actions"><button class="btn ghost" id="demoAdd">${L.demoAdd}</button><button class="btn danger" id="demoDel">${L.demoDel}</button></div></div>`;
    $("#sform").onsubmit = async (e) => {
      e.preventDefault(); const f = e.target; const btn = f.querySelector("[type=submit]"); btn.disabled = true;
      try { await api("settings", { method: "PUT", body: JSON.stringify({ shopName: f.shopName.value, whatsapp: f.whatsapp.value, shipping: Number(f.shipping.value), freeShippingFrom: Number(f.freeShippingFrom.value), couponCode: f.couponCode.value, announcement: { fr: f.annFr.value, ar: f.annAr.value } }) }); toast(L.saved); }
      catch (err) { toast(err.code === "whatsapp" ? L.errWa : L.err, 1); } finally { btn.disabled = false; }
    };
    $("#pwform").onsubmit = async (e) => {
      e.preventDefault(); const f = e.target; if (f.next.value.length < 10) { toast(L.pwShort, 1); return; }
      try { await api("password", { method: "POST", body: JSON.stringify({ current: f.current.value, next: f.next.value }) }); f.reset(); state.me = null; toast(L.pwChanged); }
      catch (err) { toast(err.code === "password" ? L.wrongPw : err.code === "short" ? L.pwShort : L.err, 1); }
    };
    $("#demoAdd").onclick = async (e) => { e.target.disabled = true; try { const r = await api("demo", { method: "POST", body: "{}" }); toast(L.demoAdded(r.created)); } catch { toast(L.err, 1); } finally { e.target.disabled = false; } };
    $("#demoDel").onclick = async (e) => { e.target.disabled = true; try { const r = await api("demo", { method: "DELETE" }); toast(L.demoDeleted(r.deleted)); } catch { toast(L.err, 1); } finally { e.target.disabled = false; } };
  }

  /* ---------- Start ---------- */
  async function start() {
    try { state.me = await api("me"); } catch { return; }
    window.onhashchange = () => { if (location.hash.startsWith("#orders/") && state.page === "orders" && $("#page")) { openOrder(decodeURIComponent(location.hash.slice(8))); return; } route(); };
    route();
    setInterval(refreshPending, 60000);
  }
  setLang(lang);
  (async () => { try { await api("me"); start(); } catch { /* showLogin already called on 401 */ if (!$(".login")) showLogin(); } })();
})();
