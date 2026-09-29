/* =====================================================================
   tree.js — หน้า 1: ต้นไม้อาชีพ (Rooted Tree)
   pickerPath = Path จาก Root ลงมาถึงโหนดที่กำลังเลือก
   ความยาวของ pickerPath - 1 = Level ของโหนดนั้น (Root อยู่ Level 0)
   ===================================================================== */
(function () {
  mountShell("tree");

  /* ---------- สถิติของ Tree ---------- */
  const all = Object.values(TREE_INDEX);
  const leaves = all.filter(t => !t.node.children);
  const height = Math.max(...all.map(t => t.level));
  $("#treeStats").append(
    statBox(all.length, "โหนดทั้งหมด"),
    statBox(height + 1, "ระดับ (Level 0–" + height + ")"),
    statBox(all.length - leaves.length, "Parent"),
    statBox(leaves.length, "Leaf (อาชีพ)")
  );

  /* ---------- จัดวาง Tree แนวนอน ---------- */
  const NODE_MAX = 172, COLW = 206, ROWH = 40, PADX = 22, PADY = 48, NH = 32;
  const svg = $("#tsvg");
  const nodeW = n => Math.max(84, Math.min(NODE_MAX, n.name.length * 6.9 + 26));

  const pos = {};
  let leafRow = 0;
  (function place(n, level) {
    if (!n.children) { pos[n.name] = { level, row: leafRow++ }; return; }
    n.children.forEach(c => place(c, level + 1));
    const rows = n.children.map(c => pos[c.name].row);
    pos[n.name] = { level, row: (Math.min(...rows) + Math.max(...rows)) / 2 };
  })(TREE, 0);

  const W = PADX * 2 + NODE_MAX + height * COLW;
  const HT = PADY + (leafRow - 1) * ROWH + NH + 22;
  svg.setAttribute("viewBox", `0 0 ${W} ${HT}`);
  const xy = n => ({ x: PADX + NODE_MAX / 2 + pos[n.name].level * COLW, y: PADY + pos[n.name].row * ROWH + NH / 2, w: nodeW(n) });

  const gHead = s("g"), gEdges = s("g"), gNodes = s("g");
  const nodeEls = {}, edgeEls = {}, ordEls = {};

  for (let L = 0; L <= height; L++) {
    const role = L === 0 ? "Root" : L === height ? "Leaf" : "Parent + Child";
    gHead.append(
      s("text", { class: "lvl", x: PADX + NODE_MAX / 2 + L * COLW, y: 16 }, `Level ${L}`),
      s("text", { class: "lvl-sub", x: PADX + NODE_MAX / 2 + L * COLW, y: 32 }, role));
  }

  all.forEach(({ node }) => {
    const a = xy(node);
    (node.children || []).forEach(c => {
      const b = xy(c), x1 = a.x + a.w / 2, x2 = b.x - b.w / 2, mx = (x1 + x2) / 2;
      const p = s("path", { class: "edge", d: `M${x1},${a.y} C${mx},${a.y} ${mx},${b.y} ${x2},${b.y}` });
      edgeEls[`${node.name}|${c.name}`] = p;
      gEdges.append(p);
    });
  });

  all.forEach(({ node }) => {
    const p = xy(node);
    const kind = !TREE_INDEX[node.name].parent ? "start" : node.children ? "internal" : "career";
    const ord = s("g", { class: "ord", transform: `translate(${-p.w / 2 + 2},${-NH / 2 + 1})` }, s("circle", { r: 9 }), s("text", {}, ""));
    const g = s("g", { class: `node ${kind} g-${node.group}`, transform: `translate(${p.x},${p.y})`, tabindex: 0 },
      s("title", {}, `${node.name} — ${node.th}`),
      s("rect", { x: -p.w / 2, y: -NH / 2, width: p.w, height: NH, rx: 9 }),
      s("text", { class: "lbl" }, node.name), ord);
    g.addEventListener("click", () => go(node.name));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(node.name); } });
    nodeEls[node.name] = g; ordEls[node.name] = ord;
    gNodes.append(g);
  });
  svg.replaceChildren(gHead, gEdges, gNodes);

  /* ---------- สถานะการเลือก ---------- */
  let pickerPath = [TREE];                       // Path จาก Root → โหนดปัจจุบัน
  const current = () => pickerPath[pickerPath.length - 1];

  function go(name) { stopTraversal(); pickerPath = TREE_INDEX[name].path.slice(); render(); }
  function pick(child) { pickerPath = [...pickerPath, child]; render(); }        // ลงลึกหนึ่งชั้น = ต่อ Path
  function back() { if (pickerPath.length > 1) { pickerPath = pickerPath.slice(0, -1); render(); } }   // ย้อนกลับ = ตัด Path

  function treeChips(path) {
    const box = h("div", { class: "pathline" });
    path.forEach((n, i) => {
      if (i > 0) box.append(h("span", { class: "arr" }, "→"));
      box.append(h("span", { class: `vchip g-${n.group} ${!n.children ? "career" : i === 0 ? "start" : ""}` }, h("small", {}, `L${i}`), n.name));
    });
    return box;
  }

  function render() {
    const n = current(), t = TREE_INDEX[n.name], isLeaf = !n.children;

    /* breadcrumb */
    const crumbs = $("#crumbs");
    crumbs.replaceChildren();
    pickerPath.forEach((p, i) => {
      if (i > 0) crumbs.append(h("span", { class: "sep" }, "›"));
      crumbs.append(h("button", { class: `crumb g-${p.group}`, onclick: () => go(p.name), title: p.th }, h("small", {}, `L${i}`), p.name));
    });
    $("#btnBack").disabled = pickerPath.length === 1;

    /* คำถาม / ตัวเลือก / ผลลัพธ์ */
    const box = $("#decision");
    box.replaceChildren();
    if (!isLeaf) {
      box.append(h("p", { class: "q" }, n.q));
      n.children.forEach((c, i) => box.append(
        h("button", { class: `choice g-${c.group}`, onclick: () => pick(c) },
          h("span", { class: "dot" }, String.fromCharCode(65 + i)),
          h("span", { class: "txt" }, h("b", {}, c.name), h("small", {}, `${c.th} — ${c.hint}`)),
          h("span", { class: "go" }, c.children ? `${c.children.length} ตัวเลือก ›` : "Leaf ✓"))));
    } else {
      const q = encodeURIComponent(n.name);
      box.append(h("div", { class: `result g-${n.group}` },
        h("small", {}, "ผลลัพธ์ — ถึง Leaf ของต้นไม้แล้ว"),
        h("h3", {}, n.name),
        h("p", {}, `${n.th} · ${n.hint}`),
        h("div", { class: "lbl" }, "Path จาก Root ไปยัง Leaf"),
        treeChips(pickerPath),
        h("p", { class: "note" }, `Path นี้ผ่าน ${pickerPath.length - 1} Edge และ Leaf อยู่ที่ Level ${pickerPath.length - 1} — การตอบคำถามทีละข้อคือการเดินลงจาก Root ตาม Edge ของต้นไม้ ทีละ 1 ชั้น`),
        h("div", { class: "actions" },
          h("a", { class: "btn primary", href: `roadmap.html?target=${q}` }, "ดูเส้นทางเรียนรู้ที่เร็วที่สุด →"),
          h("a", { class: "btn", href: `graph.html?target=${q}` }, "ดูทักษะที่ต้องมีบนแผนที่"),
          h("button", { class: "btn", onclick: () => go("IT Career") }, "เริ่มใหม่"))));
    }

    /* บทบาทของโหนดปัจจุบัน: Root / Parent / Child / Leaf */
    const roles = [];
    if (!t.parent) roles.push(["Root", "role-root"]);
    if (n.children) roles.push(["Parent", "role-parent"]);
    if (t.parent) roles.push(["Child", "role-child"]);
    if (isLeaf) roles.push(["Leaf", "role-leaf"]);
    $("#roles").replaceChildren(
      h("div", { class: "role-head" }, h("b", {}, n.name), h("span", { class: "chips" }, roles.map(([r, c]) => h("span", { class: `role ${c}` }, r)))),
      h("dl", { class: "kv" },
        h("dt", {}, "Level"), h("dd", {}, String(t.level)),
        h("dt", {}, "Parent"), h("dd", {}, t.parent ? t.parent.name : "— (Root ไม่มี Parent)"),
        h("dt", {}, "Children"), h("dd", {}, n.children ? n.children.map(c => c.name).join(", ") : "— (Leaf ไม่มี Child)")));

    updateDiagram();
  }

  function updateDiagram() {
    const names = new Set(pickerPath.map(p => p.name));
    const cur = current().name;
    Object.entries(nodeEls).forEach(([name, g]) => {
      g.classList.toggle("on-path", names.has(name));
      g.classList.toggle("current", name === cur);
    });
    Object.entries(edgeEls).forEach(([key, p]) => {
      const [a, b] = key.split("|");
      p.classList.toggle("on", names.has(a) && names.has(b));
    });
  }

  $("#btnBack").addEventListener("click", back);
  $("#btnReset").addEventListener("click", () => go("IT Career"));

  /* ---------- Tree Traversal (Bonus) ---------- */
  const TRAV = {
    pre:   { fn: () => preorder(TREE),   name: "Preorder",  desc: "เยี่ยมโหนดก่อน แล้วค่อยลงไปหาลูกทีละคน — ได้ลำดับเหมือนสารบัญ เหมาะกับการพิมพ์โครงสร้างหมวดหมู่" },
    post:  { fn: () => postorder(TREE),  name: "Postorder", desc: "เยี่ยมลูกทุกคนก่อน แล้วค่อยเยี่ยมโหนดแม่ — เหมาะกับการรวมผลจากล่างขึ้นบน เช่น นับจำนวนอาชีพในแต่ละหมวด" },
    level: { fn: () => levelOrder(TREE), name: "BFS (Level-order)", desc: "เยี่ยมทีละระดับ Level 0 → 1 → 2 → 3 โดยใช้ Queue — เห็นภาพรวมของหมวดใหญ่ก่อนลงรายละเอียด" }
  };
  let travTimer = null;

  function stopTraversal() {
    clearInterval(travTimer); travTimer = null;
    Object.values(nodeEls).forEach(g => g.classList.remove("visited"));
    Object.values(ordEls).forEach(o => o.classList.remove("show"));
    $("#travOut").replaceChildren();
    $$("#travSeg button").forEach(b => b.classList.remove("on"));
  }

  function runTraversal(kind) {
    stopTraversal();
    const T = TRAV[kind], order = T.fn();
    $(`#travSeg [data-k="${kind}"]`).classList.add("on");
    $("#travDesc").textContent = T.desc;
    const out = $("#travOut");
    let i = 0;
    travTimer = setInterval(() => {
      if (i >= order.length) { clearInterval(travTimer); travTimer = null; return; }
      const name = order[i];
      nodeEls[name].classList.add("visited");
      ordEls[name].classList.add("show");
      ordEls[name].querySelector("text").textContent = i + 1;
      out.append(h("span", { class: `ordchip g-${TREE_INDEX[name].node.group}` }, h("i", {}, i + 1), name));
      i++;
    }, 380);
  }

  $$("#travSeg button").forEach(b => b.addEventListener("click", () => runTraversal(b.dataset.k)));
  $("#travClear").addEventListener("click", () => { stopTraversal(); $("#travDesc").textContent = "เลือกวิธีเดินผ่านต้นไม้ แล้วดูลำดับการเยี่ยมบนแผนภาพด้านบน"; });

  /* ---------- ตารางโหนดทั้งหมด ---------- */
  const tbody = $("#nodeTable tbody");
  all.forEach(({ node, parent, level }) => {
    const roles = [];
    if (!parent) roles.push(["Root", "role-root"]);
    if (node.children) roles.push(["Parent", "role-parent"]);
    if (parent) roles.push(["Child", "role-child"]);
    if (!node.children) roles.push(["Leaf", "role-leaf"]);
    tbody.append(h("tr", {},
      h("td", {}, h("b", {}, node.name), h("br"), h("small", {}, node.th)),
      h("td", { class: "c" }, level),
      h("td", {}, parent ? parent.name : "—"),
      h("td", {}, node.children ? node.children.map(c => c.name).join(", ") : "—"),
      h("td", { class: "c" }, leafCount(node)),
      h("td", {}, roles.map(([r, c]) => h("span", { class: `role ${c}` }, r)))));
  });

  render();
})();
