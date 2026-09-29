/* =====================================================================
   report.js — หน้า 4: สรุปหลักการ
   ตัวเลข ตาราง และโค้ดทั้งหมดดึงจากข้อมูล/ฟังก์ชันจริงของเว็บ
   ===================================================================== */
(function () {
  mountShell("report");

  const all = Object.values(TREE_INDEX);
  const leaves = all.filter(t => !t.node.children).map(t => t.node);
  const parents = all.filter(t => t.node.children).map(t => t.node);
  const height = Math.max(...all.map(t => t.level));

  $("#rStats").append(
    statBox(VERTICES.length, "Vertex (|V|)"),
    statBox(EDGES.length, "Edge (|E|)"),
    statBox(all.length, "โหนดของ Tree"),
    statBox(height + 1, "ระดับของ Tree"));
  $$(".v-count").forEach(e => { e.textContent = VERTICES.length; });
  $$(".e-count").forEach(e => { e.textContent = EDGES.length; });

  /* ---------- Path ตัวอย่าง: Start → Data Scientist ด้วย Dijkstra ---------- */
  const target = "Data Scientist";
  const r = dijkstra(graph, ["Start"], target);
  const path = buildPath(r.prev, target);
  $("#rPath").append(
    pathChips(path, { weights: true }),
    h("p", { class: "muted" }, `Path ยาว ${path.length - 1} Edge · Total Weight = ${path.slice(1).map((v, i) => edgeWeight(path[i], v)).join(" + ")} = ${r.dist[target]} สัปดาห์`));

  /* ---------- Adjacency List (พร้อมน้ำหนัก) ---------- */
  $("#rAdj").textContent = "const graph = {\n" + VERTICES.map(u =>
    `  "${u}": [${graph[u].map(([v, w]) => `["${v}", ${w}]`).join(", ")}],`).join("\n") + "\n};";

  /* ---------- Tree แบบข้อความ ---------- */
  function ascii(node, prefix, isLast, isRoot) {
    const tag = isRoot ? "   ← Root" : !node.children ? "   ← Leaf" : "";
    const lines = [(isRoot ? "" : prefix + (isLast ? "└── " : "├── ")) + node.name + tag];
    const kids = node.children || [];
    kids.forEach((c, i) => lines.push(...ascii(c, isRoot ? "" : prefix + (isLast ? "    " : "│   "), i === kids.length - 1, false)));
    return lines;
  }
  $("#rTree").textContent = ascii(TREE, "", true, true).join("\n");

  $("#rRoles").append(
    h("dt", {}, "Root"), h("dd", {}, TREE.name + " (Level 0)"),
    h("dt", {}, "Parent"), h("dd", {}, `${parents.length} โหนด: ${parents.map(n => n.name).join(", ")}`),
    h("dt", {}, "Child"), h("dd", {}, `ทุกโหนดที่ไม่ใช่ Root (${all.length - 1} โหนด) เช่น Development เป็น Child ของ IT Career และเป็น Parent ของ Web`),
    h("dt", {}, "Leaf"), h("dd", {}, `${leaves.length} โหนด (Level ${height} ทั้งหมด): ${leaves.map(n => n.name).join(", ")}`));

  /* Path Root → Leaf ตัวอย่าง */
  const tp = TREE_INDEX[target].path;
  const line = h("div", { class: "pathline" });
  tp.forEach((n, i) => {
    if (i > 0) line.append(h("span", { class: "arr" }, "→"));
    line.append(h("span", { class: `vchip g-${n.group} ${!n.children ? "career" : i === 0 ? "start" : ""}` }, h("small", {}, `L${i}`), n.name));
  });
  $("#rTreePath").append(h("h3", {}, "Path จาก Root ไปยัง Leaf (ตัวอย่าง)"), line,
    h("p", { class: "muted" }, `Path ยาว ${tp.length - 1} Edge — Leaf “${target}” เป็นโหนดเดียวกับ Vertex อาชีพในกราฟทักษะ`));

  /* ---------- แสดงซอร์สโค้ดของฟังก์ชันจริง ---------- */
  const FUNCS = { preorder, postorder, levelOrder, bfs, dfs, dijkstra, buildPath, pathWeight };
  $$("[data-fn]").forEach(el => { el.textContent = FUNCS[el.dataset.fn].toString(); });
})();
