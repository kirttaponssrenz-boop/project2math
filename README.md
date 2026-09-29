# ทางสายไอที — IT Career Path Advisor
โครงงานที่ 2 (เดี่ยว 25 คะแนน) · Discrete Mathematics for IT · Graph Theory และ Tree

เว็บ 4 หน้า ใช้ HTML + CSS + JavaScript ล้วน (ไม่มี build step, ไม่ใช้ไลบรารี)

| ไฟล์ | หลักการ |
|---|---|
| `index.html` | Rooted Tree (4 ระดับ) · Root/Parent/Child/Leaf · Path จาก Root · Traversal (Bonus) |
| `graph.html` | Directed Graph · Adjacency List · BFS · DFS · Path |
| `roadmap.html` | Weighted Graph · Dijkstra · Shortest Path · เทียบกับ BFS |
| `report.html` | สรุปหลักการ โค้ด ประโยชน์ Prompt AI และเทียบเกณฑ์ |

- `js/data.js` — `TREE` และ `graph` (Adjacency List)
- `js/algorithms.js` — `bfs`, `dfs`, `dijkstra`, `buildPath`, `pathWeight`, `preorder`, `postorder`, `levelOrder`
- `js/graphview.js` — วาดกราฟเป็น SVG

## ก่อนส่ง
1. แก้ชื่อ–รหัสนักศึกษา–ห้อง ที่บรรทัดบนสุดของ `js/common.js` (ตัวแปร `STUDENT`)
2. แก้ Prompt AI ใน `report.html` (ส่วน "Prompt ที่ใช้กับ AI") ให้ตรงกับที่ใช้จริง
3. เปิดดูด้วยการดับเบิลคลิก `index.html` ได้เลย

## เผยแพร่บน GitHub Pages
1. สร้าง repository ใหม่ แล้วอัปโหลดทุกไฟล์ (ให้ `index.html` อยู่ที่ราก)
2. Settings → Pages → Branch: `main` / folder: `/ (root)` → Save
3. รอ 1–2 นาที จะได้ `https://ชื่อผู้ใช้.github.io/ชื่อ-repo/`
