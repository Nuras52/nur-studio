/* ===== НАСТРОЙКИ: меняйте только здесь, поменяется на всех страницах ===== */
const CONFIG = {
  name: "NUR Studio",                 // название студии
  city: "Алматы · весь Казахстан",
  whatsapp: "77472373165"             // номер WhatsApp: только цифры, с 7 в начале
};
/* ========================================================================= */

document.documentElement.classList.add("js");
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

$$("[data-t]").forEach(el => { const v = CONFIG[el.dataset.t]; if (v) el.textContent = v; });

function waLink(text) {
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
}
function openWa(text) { window.open(waLink(text), "_blank", "noopener"); }

/* кнопки WhatsApp: data-wa="сайт" подставляет, что человек хочет заказать */
$$("[data-wa]").forEach(a => {
  a.href = waLink("Здравствуйте! Хочу заказать: " + (a.dataset.wa || "сайт или приложение") + ".");
  a.target = "_blank"; a.rel = "noopener";
});

/* подсветка текущей страницы в меню */
const here = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
$$("nav a").forEach(a => {
  const h = (a.getAttribute("href") || "").replace(/\.html$/, "").replace(/^\.\/$/, "index");
  if (h === here) { a.classList.add("on"); a.setAttribute("aria-current", "page"); }
});

/* плавное появление блоков */
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(x => {
  if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); }
}), { threshold: .1 }) : null;
$$(".rv").forEach((el, i) => {
  if (!io) return el.classList.add("in");
  el.style.transitionDelay = (i % 3) * 70 + "ms"; io.observe(el);
});

/* ===== форма заявки (страница «Контакты») ===== */
const form = $("#form");
if (form) {
  const pre = new URLSearchParams(location.search).get("what");
  if (pre) { const r = $(`input[name=what][value="${pre}"]`, form); if (r) r.checked = true; }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const extra = d.getAll("extra");
    let t = "Здравствуйте! Хочу заказать: " + d.get("what") + ".";
    const add = (label, v) => { v = (v || "").trim(); if (v) t += "\n" + label + ": " + v; };
    add("Меня зовут", d.get("name"));
    add("Мой бизнес", d.get("biz"));
    if (extra.length) t += "\nЧто нужно: " + extra.join(", ");
    add("Комментарий", d.get("note"));
    openWa(t);
  });
}

/* ===== живое демо приложения (страница «Приложения») ===== */
const app = $("#app");
if (app) {
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z"/><path d="M17 10h1.500a2.500 2.500 0 0 1 0 5H17M9 3v2M13 3v2"/></svg>';
  const MENU = [
    ["Капучино", "Кофе"], ["Латте", "Кофе"], ["Американо", "Кофе"],
    ["Чай с лимоном", "Чай"], ["Круассан", "Выпечка"], ["Чизкейк", "Десерт"]
  ];
  const st = { tab: "menu", cart: {}, bonus: 3, order: 0, step: 0, timers: [] };
  const body = $(".app-body", app), badge = $(".badge", app);
  const count = () => Object.values(st.cart).reduce((a, b) => a + b, 0);

  const views = {
    menu: () => `<div><h4>Добрый день</h4><div class="sub">Выберите, что приготовить</div></div>` +
      MENU.map(([n, c], i) => `<div class="app-item"><u>${ICON}</u><span>${n}<small>${c}</small></span>` +
        (st.cart[i] ? `<button class="rnd lt" data-act="dec" data-i="${i}" aria-label="Убрать ${n}">−</button><b class="qty">${st.cart[i]}</b>` : "") +
        `<button class="rnd" data-act="inc" data-i="${i}" aria-label="Добавить ${n}">+</button></div>`).join(""),
    cart: () => {
      if (st.order) return `<div class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg></div>
        <h4 style="text-align:center">Заказ № ${st.order}</h4>
        <div class="status">${["Заказ принят", "Готовится", "Готов, можно забирать"].map((s, i) => `<div class="${i <= st.step ? "on" : ""}">${s}</div>`).join("")}</div>
        <div class="sub">Статус меняет сотрудник в своей панели. Здесь он меняется сам, для примера.</div>
        <button class="app-btn" data-act="again">Новый заказ</button>`;
      const ids = Object.keys(st.cart);
      if (!ids.length) return `<h4>Корзина</h4><div class="empty">Пока пусто.<br>Добавьте что-нибудь из меню.</div><button class="app-btn" data-act="tab" data-tab="menu">В меню</button>`;
      return `<h4>Корзина</h4>` + ids.map(i => `<div class="app-item"><span>${MENU[i][0]}</span>
        <button class="rnd lt" data-act="dec" data-i="${i}" aria-label="Меньше">−</button><b class="qty">${st.cart[i]}</b>
        <button class="rnd" data-act="inc" data-i="${i}" aria-label="Больше">+</button></div>`).join("") +
        `<button class="app-btn" data-act="order">Оформить заказ</button>`;
    },
    bonus: () => `<h4>Бонусы</h4><div class="app-card"><small>Карта гостя</small>
      <div class="dots">${Array.from({ length: 8 }, (_, i) => `<i class="${i < st.bonus ? "on" : ""}"></i>`).join("")}</div>
      <small>${st.bonus >= 8 ? "Карта заполнена: следующий напиток в подарок" : "Заказов: " + st.bonus + " из 8"}</small></div>
      <div class="sub">За каждый заказ гость получает отметку. Правила бонусов вы задаёте сами.</div>
      <button class="app-btn" data-act="tab" data-tab="menu">В меню</button>`
  };
  function render() {
    body.innerHTML = views[st.tab]();
    badge.textContent = count() || "";
    $$(".app-tabs button", app).forEach(b => b.classList.toggle("on", b.dataset.tab === st.tab));
  }
  app.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const a = b.dataset.act, i = b.dataset.i;
    if (a === "tab") st.tab = b.dataset.tab;
    if (a === "inc") st.cart[i] = (st.cart[i] || 0) + 1;
    if (a === "dec") { st.cart[i]--; if (st.cart[i] <= 0) delete st.cart[i]; }
    if (a === "order") {
      st.order++; st.step = 0; st.cart = {}; st.bonus = Math.min(8, st.bonus + 1);
      st.timers.forEach(clearTimeout);
      st.timers = [1, 2].map(n => setTimeout(() => { st.step = n; if (st.tab === "cart") render(); }, n * 2500));
    }
    if (a === "again") { st.order = 0; st.tab = "menu"; }
    render();
  });
  render();
}

/* ===== демо сайта с записью (страница «Сайты») ===== */
const sd = $("#sdemo");
if (sd) {
  const out = $("#sdemo-out"), go = $("#sdemo-go");
  const text = () => {
    const d = new FormData(sd);
    return "Здравствуйте! Хочу записаться.\nУслуга: " + d.get("svc") + "\nУдобное время: " + d.get("time");
  };
  const upd = () => { out.textContent = text(); };
  sd.addEventListener("change", upd); upd();
  sd.addEventListener("submit", e => { e.preventDefault(); out.parentElement.scrollIntoView({ block: "nearest", behavior: "smooth" }); });
}
