/* =====================================================================
   data.js  —  ข้อมูลของเว็บ "ทางสายไอที" (IT Career Path Advisor)

   1) TREE  : Rooted Tree ของหมวดอาชีพ  (Root → หมวด → สาขา → อาชีพ)
   2) graph : Weighted Directed Graph ของทักษะและอาชีพ (Adjacency List)

   หมายเหตุ: ข้อมูลอาชีพ ทักษะ และจำนวนสัปดาห์เป็น "ระบบจำลอง" เพื่อสาธิตเท่านั้น
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) TREE — โครงสร้างแบบลำดับชั้น
      Root      = "IT Career"                       (Level 0)
      Parent    = โหนดที่มี children                (Level 0–2)
      Child     = โหนดที่มี parent                  (Level 1–3)
      Leaf      = โหนดที่ไม่มี children = อาชีพ     (Level 3, ทั้งหมด 12 ใบ)
   --------------------------------------------------------------------- */
const TREE = {
  name: "IT Career", th: "อาชีพด้านไอที",
  q: "คุณอยากทำงานสายไหนในโลกไอที?",
  children: [
    { name: "Development", th: "พัฒนาซอฟต์แวร์", group: "dev",
      hint: "สร้างเว็บ แอป และเกม",
      q: "คุณอยากสร้างอะไร?",
      children: [
        { name: "Web", th: "เว็บไซต์", hint: "สิ่งที่คนใช้ผ่านเบราว์เซอร์",
          q: "คุณชอบงานหน้าบ้านหรือหลังบ้าน?",
          children: [
            { name: "Frontend Developer", th: "นักพัฒนาส่วนหน้าเว็บ", hint: "สร้างหน้าเว็บที่ผู้ใช้มองเห็นและกดใช้งานได้" },
            { name: "Backend Developer",  th: "นักพัฒนาส่วนหลังบ้าน", hint: "สร้าง API ฐานข้อมูล และตรรกะเบื้องหลังระบบ" }
          ] },
        { name: "App & Game", th: "แอปและเกม", hint: "ซอฟต์แวร์บนมือถือและเครื่องเล่นเกม",
          q: "คุณอยากทำแอปมือถือหรือเกม?",
          children: [
            { name: "Mobile Developer", th: "นักพัฒนาแอปมือถือ", hint: "สร้างแอปบน Android และ iOS" },
            { name: "Game Developer",   th: "นักพัฒนาเกม", hint: "สร้างเกมและระบบโต้ตอบด้วย Game Engine" }
          ] }
      ] },
    { name: "Data & AI", th: "ข้อมูลและ AI", group: "data",
      hint: "ทำงานกับข้อมูลและโมเดลเรียนรู้ของเครื่อง",
      q: "คุณอยากใช้ข้อมูลเพื่ออะไร?",
      children: [
        { name: "Analytics", th: "วิเคราะห์ข้อมูล", hint: "ตอบคำถามของธุรกิจด้วยตัวเลข",
          q: "คุณชอบขุดหาคำตอบ หรือเล่าเรื่องด้วยกราฟ?",
          children: [
            { name: "Data Analyst", th: "นักวิเคราะห์ข้อมูล", hint: "ดึง สรุป และอธิบายข้อมูลเพื่อช่วยตัดสินใจ" },
            { name: "BI Analyst",   th: "นักวิเคราะห์ธุรกิจอัจฉริยะ", hint: "สร้าง Dashboard และรายงานให้ผู้บริหาร" }
          ] },
        { name: "AI", th: "ปัญญาประดิษฐ์", hint: "สร้างระบบที่เรียนรู้จากข้อมูล",
          q: "คุณชอบวิจัยโมเดล หรือทำให้โมเดลใช้งานได้จริง?",
          children: [
            { name: "Data Scientist", th: "นักวิทยาการข้อมูล", hint: "สร้างโมเดลพยากรณ์จากข้อมูลจำนวนมาก" },
            { name: "AI Developer",   th: "นักพัฒนา AI", hint: "นำโมเดลไปใส่ในผลิตภัณฑ์ให้ใช้งานได้จริง" }
          ] }
      ] },
    { name: "Security & Infra", th: "ความปลอดภัยและโครงสร้างพื้นฐาน", group: "sec",
      hint: "ปกป้องและดูแลระบบให้ทำงานต่อเนื่อง",
      q: "คุณอยากป้องกันระบบ หรือดูแลระบบให้ทำงานได้?",
      children: [
        { name: "Security", th: "ความปลอดภัยไซเบอร์", hint: "รับมือภัยคุกคามและช่องโหว่",
          q: "คุณอยากเป็นฝ่ายป้องกัน หรือฝ่ายทดสอบโจมตี?",
          children: [
            { name: "Cybersecurity Analyst", th: "นักวิเคราะห์ความมั่นคงปลอดภัย", hint: "เฝ้าระวังและรับมือภัยคุกคามทางไซเบอร์" },
            { name: "Penetration Tester",    th: "ผู้ทดสอบเจาะระบบ", hint: "จำลองการโจมตีเพื่อหาช่องโหว่ก่อนผู้ไม่หวังดี" }
          ] },
        { name: "Infrastructure", th: "โครงสร้างพื้นฐาน", hint: "เซิร์ฟเวอร์ ระบบ deploy และคลาวด์",
          q: "คุณชอบทำระบบอัตโนมัติ หรือออกแบบระบบบนคลาวด์?",
          children: [
            { name: "DevOps Engineer", th: "วิศวกร DevOps", hint: "ทำให้การ build และ deploy เป็นอัตโนมัติ" },
            { name: "Cloud Engineer",  th: "วิศวกรคลาวด์", hint: "ออกแบบและดูแลระบบบนคลาวด์" }
          ] }
      ] }
  ]
};

/* ดัชนีของ Tree: ชื่อโหนด → { node, parent, level, path (Root → โหนดนั้น) } */
const TREE_INDEX = (function () {
  const map = {};
  (function walk(n, parent, level, path) {
    const p = [...path, n];
    n.group = n.group || (parent ? parent.group : "root");   // สีของหมวด สืบทอดจากบรรพบุรุษ
    map[n.name] = { node: n, parent, level, path: p };
    (n.children || []).forEach(c => walk(c, n, level + 1, p));
  })(TREE, null, 0, []);
  return map;
})();

/* ---------------------------------------------------------------------
   2) GRAPH — Weighted Directed Graph ในรูป Adjacency List
      Vertex = ทักษะ (Skill) หรืออาชีพ (Career)  และจุดเริ่มต้น "Start"
      Edge   = u → v  แปลว่า "เรียน u แล้วไปเรียน/ไปสู่ v ได้"
      Weight = จำนวนสัปดาห์ (จำลอง) ที่ต้องใช้ในการไปจาก u สู่ v
      รูปแบบ  vertex: [ [เพื่อนบ้าน, น้ำหนัก], ... ]
   --------------------------------------------------------------------- */
const graph = {
  "Start":                 [["HTML", 1], ["Python", 3], ["SQL", 2], ["Java", 4], ["C#", 4], ["Linux", 2], ["Networking", 3], ["Git", 1]],

  // สายพัฒนาเว็บ / แอป / เกม
  "HTML":                  [["CSS", 2]],
  "CSS":                   [["JavaScript", 4]],
  "JavaScript":            [["React", 4], ["Node.js", 3], ["Frontend Developer", 12]],
  "React":                 [["Frontend Developer", 4], ["Mobile Developer", 6]],
  "Node.js":               [["Backend Developer", 4]],
  "Java":                  [["Backend Developer", 6], ["Kotlin", 3]],
  "Kotlin":                [["Mobile Developer", 5]],
  "C#":                    [["Unity", 4]],
  "Unity":                 [["Game Developer", 5]],

  // สายข้อมูลและ AI
  "SQL":                   [["Backend Developer", 5], ["Data Analyst", 4], ["BI Analyst", 4]],
  "Python":                [["Statistics", 3], ["Machine Learning", 9]],
  "Statistics":            [["Machine Learning", 5], ["Data Analyst", 3], ["BI Analyst", 4]],
  "Machine Learning":      [["AI Developer", 5], ["Data Scientist", 4]],

  // สายความปลอดภัยและโครงสร้างพื้นฐาน
  "Linux":                 [["Docker", 3], ["AWS", 4], ["Security Fundamentals", 3]],
  "Networking":            [["Security Fundamentals", 4], ["Penetration Tester", 9]],
  "Git":                   [["DevOps Engineer", 10]],
  "Docker":                [["DevOps Engineer", 5], ["AWS", 3]],
  "AWS":                   [["Cloud Engineer", 5]],
  "Security Fundamentals": [["Cybersecurity Analyst", 6], ["Penetration Tester", 8]],

  // อาชีพ (ปลายทาง) — ไม่มี Edge ขาออก
  "Frontend Developer":    [],
  "Backend Developer":     [],
  "Mobile Developer":      [],
  "Game Developer":        [],
  "Data Analyst":          [],
  "BI Analyst":            [],
  "Data Scientist":        [],
  "AI Developer":          [],
  "Cybersecurity Analyst": [],
  "Penetration Tester":    [],
  "DevOps Engineer":       [],
  "Cloud Engineer":        []
};

/* สีของทักษะแต่ละตัว (ใช้ใส่สีในแผนภาพเท่านั้น) */
const SKILL_GROUP = {
  "HTML": "dev", "CSS": "dev", "JavaScript": "dev", "React": "dev", "Node.js": "dev",
  "Java": "dev", "Kotlin": "dev", "C#": "dev", "Unity": "dev",
  "Python": "data", "SQL": "data", "Statistics": "data", "Machine Learning": "data",
  "Linux": "sec", "Networking": "sec", "Git": "sec", "Docker": "sec", "AWS": "sec",
  "Security Fundamentals": "sec"
};

/* ---- ค่าที่คำนวณจาก graph ---- */
const VERTICES = Object.keys(graph);                                   // V
const EDGES = VERTICES.flatMap(u => graph[u].map(([v, w]) => ({ from: u, to: v, w })));   // E

function edgeWeight(a, b) {
  const e = graph[a].find(x => x[0] === b);
  return e ? e[1] : null;
}

/* ชนิดของ Vertex: start / skill / career  (career = Leaf ของ Tree) */
function vertexInfo(v) {
  if (v === "Start") return { kind: "start", group: "start", th: "จุดเริ่มต้น (ยังไม่มีทักษะ)" };
  const t = TREE_INDEX[v];
  if (t && !t.node.children) return { kind: "career", group: t.node.group, th: t.node.th, hint: t.node.hint };
  return { kind: "skill", group: SKILL_GROUP[v] || "dev", th: "ทักษะ" };
}
