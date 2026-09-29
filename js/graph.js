/* =====================================================================
   graph.js — หน้า 2: แผนที่ทักษะ (Graph) + BFS / DFS ทีละขั้น
   ===================================================================== */
(function () {
  mountShell("graph");
  const q = new URLSearchParams(location.search);

  /* ---------- ตัวควบคุม ---------- */
  const startSel = $("#startSel"), targetSel = $("#targetSel");
  const byOrder = (a, b) => GV.ORDER.indexOf(a) - GV.ORDER.indexOf(b);
  const skills = VERTICES.filter(v => vertexInfo(v).kind !== "career").sort(byOrder);
  const careers = VERTICES.filter(v => vertexInfo(v).kind === "career").sort(byOrder);

  startSel.append(
    h("optgroup", { label: "จุดเริ่มต้น / ทักษะ" }, skills.map(v => h("option", { value: v }, v))),
    h("optgroup", { label: "อาชีพ" }, careers.map(v => h("option", { value: v }, v))));
  targetSel.append(...careers.map(v => h("option", { value: v }, v)));

  startSel.value = VERTICES.includes(q.get("start")) ? q.get("start") : "Start";
  targetSel.value = careers.includes(q.get("target")) ? q.get("target") : "Backend Developer";
  let algo = q.get("algo") === "DFS" ? "DFS" : "BFS";
  let run = null, idx = -1, timer = null;

  /* ---------- สถิติ + Adjacency List ---------- */
  $("#graphStats").append(
    statBox(VERTICES.length, "Vertex (|V|)"),
    statBox(EDGES.length, "Edge (|E|)"),
    statBox(skills.length - 1, "ทักษะ"),
    statBox(careers.length, "อาชีพ"));
  $("#vCount").textContent = VERTICES.length;
  $("#eCount").textContent = EDGES.length;

  const adjRows = {};
  const adj = $("#adj");
  adj.append(h("span", { class: "dim" }, "const graph = {\n"));
  VERTICES.forEach(u => {
    const nbrs = graph[u].map(e => `"${e[0]}"`).join(", ");
    const row = h("span", { class: "adj-row" }, `  "${u}": [${nbrs}],\n`);
    adjRows[u] = row;
    adj.append(row);
  });
  adj.append(h("span", { class: "dim" }, "};"));

  /* ---------- กราฟ ---------- */
  const view = GV.draw($("#gsvg"), { onNodeClick: v => { startSel.value = v; recompute(); } });

  /* ---------- คำนวณและแสดงผล ---------- */
  function recompute() {
    stop();
    const start = startSel.value;
    run = algo === "BFS" ? bfs(graph, start) : dfs(graph, start);
    idx = -1;
    $$("#algoSeg button").forEach(b => b.classList.toggle("on", b.dataset.a === algo));
    render();
  }

  function render() {
    const start = startSel.value, target = targetSel.value;
    const st = idx >= 0 ? run.steps[idx] : null;
    const last = idx === run.steps.length - 1;

    /* สถานะบนกราฟ */
    view.reset();
    const visited = new Set(st ? st.order : []);
    if (st) {
      st.order.forEach((v, i) => { view.nodes[v].classList.add("visited"); view.setOrder(v, i + 1); });
      st.frontier.forEach(v => { if (!visited.has(v)) view.nodes[v].classList.add("frontier"); });
      view.nodes[st.cur].classList.add("current");
      Object.entries(st.parent).forEach(([v, p]) => { if (p !== null) view.mark(p, v, "tree"); });
    } else {
      view.nodes[start].classList.add("current");
    }

    /* Queue / Stack */
    $("#dsTitle").textContent = algo === "BFS" ? "Queue (FIFO) — ออกทางซ้าย เข้าทางขวา" : "Stack (LIFO) — เข้าและออกทางขวาสุด";
    const items = st ? st.frontier : [start];
    $("#dsItems").replaceChildren(...(items.length
      ? items.map(v => vchip(v, visited.has(v) ? "done" : ""))
      : [h("span", { class: "muted" }, "ว่าง — ไม่เหลือจุดที่ต้องเยี่ยม")]));

    /* คำอธิบายขั้นปัจจุบัน */
    let note;
    if (!st) {
      note = algo === "BFS"
        ? `เริ่มต้น: ใส่ "${start}" ลงในคิว แล้วกด ▶ หรือ ▶| เพื่อเริ่มเยี่ยมทีละจุด`
        : `เริ่มต้น: push "${start}" ลงสแตก แล้วกด ▶ หรือ ▶| เพื่อเริ่มเยี่ยมทีละจุด`;
    } else {
      const found = st.found.length ? st.found.join(", ") : "ไม่มี (ถึงปลายทางหรือเพื่อนบ้านถูกเยี่ยมแล้ว)";
      note = (algo === "BFS"
        ? `ขั้น ${idx + 1}/${run.steps.length}: ออกจากหัวคิว "${st.cur}" → ใส่เพื่อนบ้านที่ยังไม่เคยพบ: ${found}`
        : `ขั้น ${idx + 1}/${run.steps.length}: pop จากบนสุดของสแตก "${st.cur}" → push เพื่อนบ้านที่ยังไม่เยี่ยม: ${found}`);
      if (last) note += ` — จบการค้นหา เยี่ยมครบ ${st.order.length} จุดที่ไปถึงได้`;
    }
    $("#note").textContent = note;

    $("#orderList").replaceChildren(...(st
      ? st.order.map((v, i) => h("span", { class: `ordchip g-${vertexInfo(v).group}` }, h("i", {}, i + 1), v))
      : [h("span", { class: "muted" }, "ยังไม่มี")]));

    /* Adjacency List: ไฮไลต์แถวปัจจุบัน */
    Object.entries(adjRows).forEach(([u, row]) => {
      row.classList.toggle("cur", !!st && st.cur === u);
      row.classList.toggle("done", visited.has(u) && !(st && st.cur === u));
    });
    if (st) adjRows[st.cur].scrollIntoView({ block: "nearest" });

    renderPath(st ? st.parent : { [start]: null }, target, start);
    renderReach(start);
  }

  function renderPath(parent, target, start) {
    const box = $("#pathBox");
    box.replaceChildren();
    if (target in parent) {
      const path = buildPath(parent, target);
      path.forEach(v => view.nodes[v].classList.add("on-path"));
      for (let i = 1; i < path.length; i++) view.mark(path[i - 1], path[i], "path");
      const weeks = pathWeight(graph, path);
      box.append(
        pathChips(path),
        h("p", {}, `จำนวน Edge = ${path.length - 1} · ถ้ารวมน้ำหนักของ Edge จะเท่ากับ ${weeks} สัปดาห์`),
        h("p", { class: "muted" }, path.length === 1
          ? "จุดเริ่มต้นกับปลายทางเป็นจุดเดียวกัน"
          : `ความหมาย: ลำดับที่ต้องเรียนจาก ${start} ไล่ตามลูกศรจนถึง ${target} ทีละขั้น`),
        h("p", { class: "muted" }, algo === "BFS"
          ? "BFS การันตีว่านี่คือ Path ที่ผ่าน Edge น้อยที่สุด (แต่ไม่ได้การันตีว่าใช้เวลาน้อยที่สุด)"
          : "DFS พบ Path นี้เป็นเส้นแรกที่เดินลึกลงไป — ไม่การันตีว่าสั้นที่สุด ลองสลับเป็น BFS เพื่อเปรียบเทียบ"));
    } else if (!run.order.includes(target)) {
      box.append(h("p", { class: "muted" }, `จาก ${start} ไม่มี Path ไปถึง ${target} เพราะกราฟนี้มีทิศทาง (ลูกศรเดินได้ทางเดียว)`));
    } else {
      box.append(h("p", { class: "muted" }, `ยังไม่พบ ${target} — กดเดินต่อเพื่อให้อัลกอริทึมสำรวจถึงจุดนั้น`));
    }
  }

  function renderReach(start) {
    const reachCareers = run.order.filter(v => vertexInfo(v).kind === "career");
    const reachSkills = run.order.filter(v => vertexInfo(v).kind === "skill");
    $("#reach").replaceChildren(
      h("p", {}, `เริ่มที่ ${start} ไปถึงอาชีพได้ ${reachCareers.length} จาก ${careers.length} อาชีพ และผ่านทักษะอื่นได้ ${reachSkills.length} ตัว`),
      h("div", { class: "chips" }, reachCareers.length ? reachCareers.map(v => vchip(v)) : h("span", { class: "muted" }, "ไม่มีอาชีพให้ไปต่อ (จุดนี้เป็นปลายทางแล้ว)")));
  }

  /* ---------- เล่น / ถอย / เดินหน้า ---------- */
  const DELAY = [1300, 900, 600, 350, 180];
  function stop() { clearInterval(timer); timer = null; $("#btnPlay").textContent = "▶ เล่น"; }
  function play() {
    if (timer) { stop(); return; }
    if (idx >= run.steps.length - 1) { idx = -1; render(); }
    $("#btnPlay").textContent = "⏸ หยุด";
    timer = setInterval(() => {
      if (idx >= run.steps.length - 1) { stop(); return; }
      idx++; render();
    }, DELAY[$("#speed").value - 1]);
  }
  function step(d) { stop(); idx = Math.max(-1, Math.min(run.steps.length - 1, idx + d)); render(); }

  $("#btnPlay").addEventListener("click", play);
  $("#btnNext").addEventListener("click", () => step(1));
  $("#btnPrev").addEventListener("click", () => step(-1));
  $("#btnReset").addEventListener("click", () => step(-999));
  $("#speed").addEventListener("input", () => { if (timer) { stop(); play(); } });
  startSel.addEventListener("change", recompute);
  targetSel.addEventListener("change", render);
  $$("#algoSeg button").forEach(b => b.addEventListener("click", () => { algo = b.dataset.a; recompute(); }));

  recompute();
})();
