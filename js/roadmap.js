/* =====================================================================
   roadmap.js — หน้า 3: Weighted Graph + Dijkstra
   น้ำหนักของ Edge = จำนวนสัปดาห์ที่ใช้เรียน  → หา Path ที่ผลรวมน้ำหนักต่ำสุด
   ===================================================================== */
(function () {
  mountShell("roadmap");
  const q = new URLSearchParams(location.search);
  const byOrder = (a, b) => GV.ORDER.indexOf(a) - GV.ORDER.indexOf(b);
  const skills = VERTICES.filter(v => vertexInfo(v).kind === "skill").sort(byOrder);
  const careers = VERTICES.filter(v => vertexInfo(v).kind === "career").sort(byOrder);
  const fmt = x => (x === Infinity ? "∞" : x);

  /* ---------- สถานะ ---------- */
  const targetSel = $("#targetSel");
  targetSel.append(...careers.map(v => h("option", { value: v }, `${v} — ${vertexInfo(v).th}`)));
  targetSel.value = careers.includes(q.get("target")) ? q.get("target") : "Data Scientist";
  const known = new Set((q.get("known") || "").split(",").filter(v => skills.includes(v)));
  let run = null, sources = [], D = [], B = [], idx = 0, timer = null;

  /* ---------- สถิติ ---------- */
  const ws = EDGES.map(e => e.w);
  $("#rmStats").append(
    statBox(VERTICES.length, "Vertex"),
    statBox(EDGES.length, "Edge ถ่วงน้ำหนัก"),
    statBox(`${Math.min(...ws)}–${Math.max(...ws)}`, "น้ำหนัก (สัปดาห์)"));

  /* ---------- ชิปเลือกทักษะที่มีอยู่แล้ว ---------- */
  const chipBox = $("#knownChips");
  function drawChips() {
    chipBox.replaceChildren(
      ...skills.map(v => h("button", { class: `tchip g-${vertexInfo(v).group}${known.has(v) ? " on" : ""}`, "aria-pressed": known.has(v), onclick: () => toggleKnown(v) }, v)),
      h("button", { class: "btn sm", onclick: () => { known.clear(); compute(); } }, "ล้างทั้งหมด"));
  }
  function toggleKnown(v) { known.has(v) ? known.delete(v) : known.add(v); compute(); }

  /* ---------- กราฟ ---------- */
  const view = GV.draw($("#rsvg"), {
    onNodeClick: v => {
      const k = vertexInfo(v).kind;
      if (k === "career") { targetSel.value = v; compute(); }
      else if (k === "skill") toggleKnown(v);
    }
  });

  /* ---------- คำนวณ ---------- */
  function compute() {
    stop();
    const target = targetSel.value;
    sources = ["Start", ...known];
    run = dijkstra(graph, sources, target);                 // Weighted → ผลรวมน้ำหนักต่ำสุด
    D = buildPath(run.prev, target);
    B = bfsShortestPath(graph, sources, target);            // Unweighted → Edge น้อยที่สุด
    idx = run.steps.length - 1;                             // เริ่มต้นแสดงผลสุดท้าย
    drawChips();
    render();
  }

  function render() {
    const target = targetSel.value;
    const st = idx >= 0 ? run.steps[idx] : null;
    const final = idx === run.steps.length - 1;

    /* กราฟ */
    view.reset();
    known.forEach(v => view.nodes[v].classList.add("known"));
    if (st) {
      const closed = new Set(st.closed);
      st.closed.forEach(v => { view.nodes[v].classList.add("visited"); if (st.prev[v]) view.mark(st.prev[v], v, "tree"); });
      Object.entries(st.dist).forEach(([v, d]) => { if (d < Infinity && !closed.has(v)) view.nodes[v].classList.add("frontier"); });
      view.nodes[st.u].classList.add("current");
      st.relaxed.forEach(r => view.mark(st.u, r.v, "relax"));
    } else {
      sources.forEach(v => view.nodes[v].classList.add("frontier"));
    }
    if (final) {
      D.forEach(v => view.nodes[v].classList.add("on-path"));
      for (let i = 1; i < D.length; i++) view.mark(D[i - 1], D[i], "path");
    }

    /* ขั้นตอนของ Dijkstra */
    $("#stepTitle").textContent = st ? `Dijkstra — ขั้นที่ ${idx + 1} จาก ${run.steps.length}` : "Dijkstra — ขั้นเริ่มต้น";
    $("#stepNote").textContent = st
      ? `เลือกปิดจุด "${st.u}" เพราะมี dist = ${st.du} สัปดาห์ ซึ่งต่ำสุดในบรรดาจุดที่ยังไม่ถูกปิด${st.u === target ? " — นี่คือจุดปลายทาง จึงหยุดทำงาน" : ""}`
      : `ตั้ง dist = 0 ให้ ${sources.join(", ")} และ ∞ ให้จุดอื่นทั้งหมด แล้วกด ▶| เพื่อเดินทีละขั้น`;
    const relaxBox = $("#relaxList");
    relaxBox.replaceChildren();
    if (st) {
      if (graph[st.u].length === 0) relaxBox.append(h("p", { class: "muted" }, "จุดนี้เป็นอาชีพ ไม่มี Edge ขาออกให้ตรวจ"));
      else if (st.relaxed.length === 0) relaxBox.append(h("p", { class: "muted" }, "ไม่มีเพื่อนบ้านตัวใดที่ปรับค่าให้ต่ำลงได้ (ทุกตัวมีค่าดีกว่าหรือเท่ากันอยู่แล้ว)"));
      else relaxBox.append(h("ul", { class: "relax" }, st.relaxed.map(r =>
        h("li", {}, vchip(r.v), h("span", {}, ` ${fmt(r.from)} → ${r.to}`), h("small", {}, `  (dist[${st.u}] ${st.du} + w ${r.w})`)))));
    }

    renderTable(st, final);
    renderResult();
  }

  function renderTable(st, final) {
    const dist = st ? st.dist : Object.fromEntries(VERTICES.map(v => [v, sources.includes(v) ? 0 : Infinity]));
    const prev = st ? st.prev : {};
    const closed = new Set(st ? st.closed : []);
    const onPath = final ? new Set(D) : new Set();
    const rows = VERTICES.filter(v => dist[v] < Infinity)
      .sort((a, b) => dist[a] - dist[b] || byOrder(a, b));
    const body = $("#distTable tbody");
    body.replaceChildren(...rows.map(v => h("tr", { class: `${onPath.has(v) ? "hit " : ""}${st && st.u === v ? "cur" : ""}`.trim() },
      h("td", {}, vchip(v)),
      h("td", { class: "c" }, dist[v]),
      h("td", {}, prev[v] || "—"),
      h("td", {}, st && st.u === v ? "กำลังปิด" : closed.has(v) ? "ปิดแล้ว ✓" : "รอ"))));
    $("#tblInfo").textContent = `อีก ${VERTICES.length - rows.length} จุดยังเป็น ∞ (ไม่แสดง)`;
  }

  function renderResult() {
    const target = targetSel.value;
    const wD = run.dist[target], wB = pathWeight(graph, B);
    $("#dijkstraBox").replaceChildren(
      pathChips(D, { weights: true }),
      h("p", { class: "big" }, h("b", {}, `${wD} สัปดาห์`), `  ·  ผ่าน ${D.length - 1} Edge`),
      h("p", { class: "muted" }, `Total Weight = ผลรวม w(e) ของทุก Edge บน Path = ${D.slice(1).map((v, i) => edgeWeight(D[i], v)).join(" + ") || 0} = ${wD}`),
      h("p", { class: "muted" }, known.size
        ? `นับจากทักษะที่คุณมีอยู่แล้ว ${known.size} ตัว จึงไม่ต้องเสียเวลาเรียนซ้ำ`
        : "นับจากศูนย์ (Start) — ลองคลิกทักษะที่คุณมีแล้ว แล้วดูว่า Path เปลี่ยนไปอย่างไร"));

    const same = D.join() === B.join();
    let msg;
    if (same) msg = "ทั้งสองวิธีได้ Path เดียวกัน — กรณีนี้ Path ที่ผ่านทักษะน้อยที่สุดก็ใช้เวลาน้อยที่สุดด้วย";
    else if (wB > wD) msg = `BFS ผ่านทักษะน้อยกว่า ${D.length - B.length} จุด แต่ใช้เวลามากกว่า ${wB - wD} สัปดาห์ — เมื่อ Edge มีน้ำหนัก Path ที่ “สั้นที่สุด” เปลี่ยนไป จึงต้องใช้ Dijkstra`;
    else msg = "Path ต่างกัน แต่ใช้เวลารวมเท่ากัน";
    $("#compareBox").replaceChildren(
      pathChips(B, { weights: true }),
      h("p", { class: "big" }, h("b", {}, `${wB} สัปดาห์`), `  ·  ผ่าน ${B.length - 1} Edge`),
      h("p", { class: same ? "muted" : "diff" }, msg));

    $("#timeline").replaceChildren(...D.map((v, i) => {
      const note = i === D.length - 1 ? "ถึงอาชีพเป้าหมาย" : sources.includes(v) ? (v === "Start" ? "จุดเริ่มต้น" : "มีอยู่แล้ว") : "เรียนให้จบ";
      return h("li", {}, h("span", { class: "wk" }, `สัปดาห์ที่ ${run.dist[v]}`), vchip(v), h("small", {}, note));
    }));
  }

  /* ---------- เล่น / ถอย / เดินหน้า ---------- */
  function stop() { clearInterval(timer); timer = null; $("#btnPlay").textContent = "▶ เล่น"; }
  function play() {
    if (timer) { stop(); return; }
    if (idx >= run.steps.length - 1) { idx = -1; render(); }
    $("#btnPlay").textContent = "⏸ หยุด";
    timer = setInterval(() => {
      if (idx >= run.steps.length - 1) { stop(); return; }
      idx++; render();
    }, 700);
  }
  function step(d) { stop(); idx = Math.max(-1, Math.min(run.steps.length - 1, idx + d)); render(); }

  $("#btnPlay").addEventListener("click", play);
  $("#btnNext").addEventListener("click", () => step(1));
  $("#btnPrev").addEventListener("click", () => step(-1));
  $("#btnReset").addEventListener("click", () => step(-999));
  targetSel.addEventListener("change", compute);
  $("#showW").addEventListener("change", e => $("#gwrap").classList.toggle("show-w", e.target.checked));

  compute();
})();
