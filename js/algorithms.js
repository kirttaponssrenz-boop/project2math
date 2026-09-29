/* =====================================================================
   algorithms.js — อัลกอริทึมที่เขียนเอง (ไม่เรียกไลบรารีสำเร็จรูป)
   กราฟอยู่ในรูป Adjacency List:  graph[u] = [ [v, w], ... ]
   ===================================================================== */

/* ---------- BFS : ค้นหาแบบกว้าง ใช้ Queue (FIFO) ---------- */
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const parent = { [start]: null };
  const order = [];
  const steps = [];
  while (queue.length > 0) {
    const u = queue.shift();                 // ออกจากหัวคิว
    order.push(u);
    const found = [];
    for (const [v] of graph[u]) {            // ตรวจเพื่อนบ้านทุกตัวของ u
      if (!visited.has(v)) {
        visited.add(v);                      // ทำเครื่องหมายตอนใส่คิว
        parent[v] = u;                       // จำว่าเจอ v มาจาก u
        queue.push(v);
        found.push(v);
      }
    }
    steps.push({ cur: u, found, frontier: [...queue], order: [...order], parent: { ...parent } });
  }
  return { order, parent, steps };
}

/* ---------- DFS : ค้นหาแบบลึก ใช้ Stack (LIFO) ---------- */
function dfs(graph, start) {
  const visited = new Set();
  const stack = [[start, null]];             // เก็บคู่ [จุด, จุดที่ส่งมา]
  const parent = {};
  const order = [];
  const steps = [];
  while (stack.length > 0) {
    const [u, from] = stack.pop();           // ดึงจากบนสุดของสแตก
    if (visited.has(u)) continue;
    visited.add(u);
    parent[u] = from;
    order.push(u);
    const nbrs = graph[u].map(e => e[0]);
    for (let i = nbrs.length - 1; i >= 0; i--) {      // push ย้อนหลัง เพื่อให้ไปตัวแรกก่อน
      if (!visited.has(nbrs[i])) stack.push([nbrs[i], u]);
    }
    steps.push({
      cur: u,
      found: nbrs.filter(v => !visited.has(v)),
      frontier: stack.map(x => x[0]),
      order: [...order],
      parent: { ...parent }
    });
  }
  return { order, parent, steps };
}

/* ---------- Dijkstra : เส้นทางที่ผลรวม Weight ต่ำสุด ----------
   sources = เซตของจุดเริ่มต้น (dist = 0)  เช่น ["Start", "JavaScript"]
   target  = ถ้าระบุ จะหยุดเมื่อปิดจุดปลายทางแล้ว                       */
function dijkstra(graph, sources, target = null) {
  const dist = {}, prev = {};
  Object.keys(graph).forEach(v => { dist[v] = Infinity; prev[v] = null; });   // Step 1: ทุกจุด = ∞
  sources.forEach(s => { dist[s] = 0; });                                      // Step 2: จุดเริ่มต้น = 0
  const queue = new Set(Object.keys(graph));   // จุดที่ยังไม่ถูกปิด
  const closed = [];
  const steps = [];
  while (queue.size > 0) {
    let u = null;
    queue.forEach(v => { if (u === null || dist[v] < dist[u]) u = v; });       // Step 3: เลือกจุดที่ค่าต่ำสุด
    if (dist[u] === Infinity) break;                                           // ที่เหลือไปไม่ถึง
    queue.delete(u);
    closed.push(u);
    const relaxed = [];
    for (const [v, w] of graph[u]) {                                           // Step 4: ตรวจเพื่อนบ้านทุกตัว
      if (dist[u] + w < dist[v]) {                                             // Step 5: Relax ถ้าเจอทางที่ดีกว่า
        relaxed.push({ v, from: dist[v], to: dist[u] + w, w });
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
    steps.push({ u, du: dist[u], relaxed, dist: { ...dist }, prev: { ...prev }, closed: [...closed] });
    if (u === target) break;                                                   // Step 6: ทำซ้ำจนครบ / ถึงปลายทาง
  }
  return { dist, prev, steps };
}

/* ---------- สร้าง Path จากตาราง prev/parent : v0 → v1 → … → vk ---------- */
function buildPath(prev, target) {
  const path = [];
  for (let c = target; c !== null && c !== undefined; c = prev[c]) path.unshift(c);
  return path;
}

/* ---------- BFS หา Path ที่ผ่าน Edge น้อยที่สุด (ไม่สนน้ำหนัก) ---------- */
function bfsShortestPath(graph, sources, target) {
  const parent = {};
  const queue = [...sources];
  sources.forEach(s => { parent[s] = null; });
  while (queue.length > 0) {
    const u = queue.shift();
    if (u === target) break;
    for (const [v] of graph[u]) {
      if (!(v in parent)) { parent[v] = u; queue.push(v); }
    }
  }
  return (target in parent) ? buildPath(parent, target) : null;
}

/* ---------- Total Weight ของ Path = ผลรวม w(e) ทุก Edge บน Path ---------- */
function pathWeight(graph, path) {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += graph[path[i - 1]].find(e => e[0] === path[i])[1];
  }
  return total;
}

/* =====================================================================
   Tree Traversal (Bonus) — Tree แบบเวียนเกิด: node.children = [subtree, ...]
   ===================================================================== */
function preorder(node, out = []) {           // เยี่ยมโหนดก่อน แล้วค่อยลงไปหาลูก
  out.push(node.name);
  (node.children || []).forEach(c => preorder(c, out));
  return out;
}

function postorder(node, out = []) {          // เยี่ยมลูกทุกคนก่อน แล้วค่อยเยี่ยมโหนด
  (node.children || []).forEach(c => postorder(c, out));
  out.push(node.name);
  return out;
}

function levelOrder(root) {                   // BFS บน Tree : ทีละระดับ ใช้ Queue
  const out = [], queue = [root];
  while (queue.length > 0) {
    const n = queue.shift();
    out.push(n.name);
    queue.push(...(n.children || []));
  }
  return out;
}

function leafCount(node) {                    // นับ Leaf ใต้โหนด (เวียนเกิด)
  if (!node.children) return 1;
  return node.children.reduce((sum, c) => sum + leafCount(c), 0);
}
