/* =====================================================================
   graphview.js — วาดกราฟ (Adjacency List) เป็น SVG
   จัดวางเป็นชั้น (layer) ตามความยาว Path ที่ยาวที่สุดจาก Start
   ===================================================================== */
const GV = (function () {
  const NH = 34, COL_W = 214, ROW_H = 50, PAD_X = 24, PAD_Y = 26, MAXW = 164;

  /* ลำดับแนวตั้งภายในแต่ละคอลัมน์ (จัดตามสายอาชีพเพื่อให้เส้นไม่พันกันมาก) */
  const ORDER = [
    "Start",
    "HTML", "Java", "C#", "SQL", "Python", "Git", "Linux", "Networking",
    "CSS", "Kotlin", "Unity", "Statistics", "Docker", "Security Fundamentals",
    "JavaScript", "Game Developer", "Data Analyst", "BI Analyst", "Machine Learning",
    "DevOps Engineer", "AWS", "Cybersecurity Analyst", "Penetration Tester",
    "React", "Node.js", "Data Scientist", "AI Developer", "Cloud Engineer",
    "Frontend Developer", "Mobile Developer", "Backend Developer"
  ];

  const nodeW = v => Math.max(72, Math.min(MAXW, v.length * 6.8 + 24));

  function computeLayers() {                       // longest-path layering (กราฟนี้เป็น DAG)
    const layer = {};
    VERTICES.forEach(v => { layer[v] = 0; });
    let changed = true;
    while (changed) {
      changed = false;
      for (const u of VERTICES) for (const [v] of graph[u]) {
        if (layer[v] < layer[u] + 1) { layer[v] = layer[u] + 1; changed = true; }
      }
    }
    return layer;
  }

  function layout() {
    const layer = computeLayers();
    const cols = {};
    VERTICES.forEach(v => { (cols[layer[v]] = cols[layer[v]] || []).push(v); });
    const maxLayer = Math.max(...Object.keys(cols).map(Number));
    const maxRows = Math.max(...Object.values(cols).map(c => c.length));
    const height = PAD_Y * 2 + (maxRows - 1) * ROW_H + NH;
    const width = PAD_X * 2 + MAXW + maxLayer * COL_W;
    const pos = {};
    Object.entries(cols).forEach(([L, list]) => {
      list.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
      list.forEach((v, i) => {
        pos[v] = { x: PAD_X + MAXW / 2 + Number(L) * COL_W, y: height / 2 + (i - (list.length - 1) / 2) * ROW_H, w: nodeW(v) };
      });
    });
    return { pos, width, height };
  }

  function marker(id, color) {
    return s("marker", { id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" },
      s("path", { d: "M0,1 L9,5 L0,9 z", fill: color }));
  }

  /* วาดกราฟลงใน svg ที่ให้มา แล้วคืนตัวอ้างอิง node/edge เพื่อให้แต่ละหน้าใส่สถานะเอง */
  function draw(svg, { onNodeClick = null } = {}) {
    const { pos, width, height } = layout();
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.replaceChildren(s("defs", {}, marker("arr", "#a9b4c4"), marker("arr-tree", "#0f8f7d"), marker("arr-path", "#e59a00")));

    const gEdges = s("g"), gLabels = s("g"), gNodes = s("g");
    const nodes = {}, edges = {}, ords = {};

    for (const u of VERTICES) for (const [v, w] of graph[u]) {
      const a = pos[u], b = pos[v];
      const x1 = a.x + a.w / 2, x2 = b.x - b.w / 2, mx = (x1 + x2) / 2;
      const path = s("path", { class: "edge", d: `M${x1},${a.y} C${mx},${a.y} ${mx},${b.y} ${x2},${b.y}` });
      const label = s("g", { class: "wl", transform: `translate(${mx},${(a.y + b.y) / 2})` },
        s("rect", { x: -11, y: -8, width: 22, height: 16, rx: 4 }),
        s("text", {}, String(w)));
      edges[`${u}|${v}`] = { path, label, from: u, to: v, w };
      gEdges.append(path);
      gLabels.append(label);
    }

    for (const v of VERTICES) {
      const p = pos[v], info = vertexInfo(v);
      const ord = s("g", { class: "ord", transform: `translate(${-p.w / 2 + 2},${-NH / 2 + 1})` },
        s("circle", { r: 9 }), s("text", {}, ""));
      const g = s("g", { class: `node ${info.kind} g-${info.group}`, transform: `translate(${p.x},${p.y})`, tabindex: 0 },
        s("title", {}, info.kind === "career" ? `${v} — ${info.th}` : v),
        s("rect", { x: -p.w / 2, y: -NH / 2, width: p.w, height: NH, rx: 9 }),
        s("text", { class: "lbl" }, v),
        ord);
      nodes[v] = g;
      ords[v] = ord;
      if (onNodeClick) {
        g.addEventListener("click", () => onNodeClick(v));
        g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNodeClick(v); } });
      }
      g.addEventListener("mouseenter", () => highlight(v));
      g.addEventListener("mouseleave", clearHighlight);
      gNodes.append(g);
    }
    svg.append(gEdges, gLabels, gNodes);

    /* hover: เน้นเพื่อนบ้านของ Vertex ที่ชี้เมาส์ */
    function highlight(v) {
      svg.classList.add("hov");
      nodes[v].classList.add("rel");
      Object.values(edges).forEach(e => {
        if (e.from === v || e.to === v) {
          e.path.classList.add("rel");
          nodes[e.from].classList.add("rel");
          nodes[e.to].classList.add("rel");
        }
      });
    }
    function clearHighlight() {
      svg.classList.remove("hov");
      Object.values(nodes).forEach(n => n.classList.remove("rel"));
      Object.values(edges).forEach(e => e.path.classList.remove("rel"));
    }

    return {
      svg, nodes, edges, pos,
      reset() {
        Object.values(nodes).forEach(n => n.classList.remove("visited", "current", "frontier", "on-path", "known"));
        Object.values(edges).forEach(e => { e.path.classList.remove("tree", "path", "relax"); e.label.classList.remove("on"); });
        Object.values(ords).forEach(o => o.classList.remove("show"));
      },
      mark(u, v, cls) {                                    // ใส่สถานะให้ Edge u→v
        const e = edges[`${u}|${v}`];
        if (!e) return;
        e.path.classList.add(cls);
        if (cls === "path" || cls === "relax") e.label.classList.add("on");
      },
      setOrder(v, n) {                                     // แสดงลำดับการเยี่ยมบนโหนด
        ords[v].classList.add("show");
        ords[v].querySelector("text").textContent = n;
      }
    };
  }

  return { draw, ORDER };
})();
