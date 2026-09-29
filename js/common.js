/* =====================================================================
   common.js — ตัวช่วยที่ใช้ร่วมกันทุกหน้า (header, footer, สร้าง DOM)
   ===================================================================== */

/* แก้ข้อมูลนี้เป็นของนักศึกษาเอง — จะแสดงที่ footer ของทุกหน้า */
const STUDENT = { name: "ชื่อ–นามสกุล", id: "รหัสนักศึกษา", section: "ห้อง _" };

const PAGES = [
  { key: "tree",    href: "index.html",   label: "ต้นไม้อาชีพ" },
  { key: "graph",   href: "graph.html",   label: "แผนที่ทักษะ" },
  { key: "roadmap", href: "roadmap.html", label: "เส้นทางเรียนรู้" },
  { key: "report",  href: "report.html",  label: "หลักการและโค้ด" }
];

const NS_SVG = "http://www.w3.org/2000/svg";

function mk(ns, tag, attrs, kids) {
  const e = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  kids.flat(Infinity).forEach(c => {
    if (c == null || c === false) return;
    e.append(c instanceof Node ? c : document.createTextNode(String(c)));
  });
  return e;
}
const h = (tag, attrs, ...kids) => mk(null, tag, attrs, kids);      // HTML element
const s = (tag, attrs, ...kids) => mk(NS_SVG, tag, attrs, kids);    // SVG element
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* โลโก้: กิ่งไม้ที่แตกออกเป็นกราฟ */
const LOGO_SVG = `
<svg viewBox="0 0 44 44" width="38" height="38" aria-hidden="true">
  <rect width="44" height="44" rx="11" fill="#0d1b2a"/>
  <g stroke="#7fa2ff" stroke-width="2" stroke-linecap="round" fill="none">
    <path d="M22 12 L12 24"/><path d="M22 12 L32 24"/><path d="M12 24 L12 34"/><path d="M12 24 L22 34"/><path d="M32 24 L32 34"/>
  </g>
  <circle cx="22" cy="11" r="4.2" fill="#ffb000"/>
  <circle cx="12" cy="24" r="3.4" fill="#fff"/><circle cx="32" cy="24" r="3.4" fill="#fff"/>
  <circle cx="12" cy="34" r="3" fill="#2557ff"/><circle cx="22" cy="34" r="3" fill="#a530e0"/><circle cx="32" cy="34" r="3" fill="#e5334b"/>
</svg>`;

/* ใส่ header + footer เหมือนกันทุกหน้า */
function mountShell(active) {
  const nav = h("nav", { class: "nav", "aria-label": "เมนูหลัก" },
    PAGES.map((p, i) => h("a", { href: p.href, class: p.key === active ? "active" : "", "aria-current": p.key === active ? "page" : false },
      h("i", {}, i + 1), h("span", {}, p.label))));
  const header = h("header", { class: "site-header" },
    h("div", { class: "wrap bar" },
      h("a", { class: "brand", href: "index.html", html: LOGO_SVG + `<span><b>ทางสายไอที</b><small>IT Career Path Advisor</small></span>` }),
      nav));
  document.body.prepend(header);

  document.body.append(h("footer", { class: "site-footer" },
    h("div", { class: "wrap" },
      h("p", {}, "โครงงานที่ 2 · Graph Theory และ Tree · Discrete Mathematics for IT"),
      h("p", { class: "muted" }, `${STUDENT.name} · ${STUDENT.id} · ${STUDENT.section} — ข้อมูลอาชีพ ทักษะ และจำนวนสัปดาห์เป็นระบบจำลองเพื่อการสาธิตเท่านั้น`))));
}

/* ชิปชื่อ Vertex ในกราฟ (สีตามหมวด) */
function vchip(v, extra = "") {
  const info = vertexInfo(v);
  return h("span", { class: `vchip g-${info.group} ${info.kind} ${extra}`.trim() }, v);
}

/* แสดง Path เป็นแถวชิป  A → B → C  (weights = true จะใส่น้ำหนักบนลูกศร) */
function pathChips(path, { weights = false } = {}) {
  const box = h("div", { class: "pathline" });
  path.forEach((v, i) => {
    if (i > 0) {
      const w = weights ? edgeWeight(path[i - 1], v) : null;
      box.append(h("span", { class: "arr" }, w != null ? h("em", {}, `${w} wk`) : null, "→"));
    }
    box.append(vchip(v));
  });
  return box;
}

/* สถิติเล็ก ๆ (ตัวเลข + คำอธิบาย) */
function statBox(value, label) {
  return h("div", { class: "stat" }, h("b", {}, value), h("span", {}, label));
}
