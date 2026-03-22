const fs = require('fs');
const p = 'scripts/mappings.csv';
if (!fs.existsSync(p)) { console.error('mappings.csv not found'); process.exit(1); }
const lines = fs.readFileSync(p, 'utf8').trim().split('\n');
const header = lines.shift();
const unmapped = [];
for (const l of lines) {
  const parts = [];
  let cur = '';
  let inq = false;
  for (let i = 0; i < l.length; i++) {
    const ch = l[i];
    if (ch === '"') { inq = !inq; cur += ch; continue; }
    if (ch === ',' && !inq) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur);
  const frameworkId = parts[3] && parts[3].trim();
  if (!frameworkId) {
    const id = parts[0];
    const text = (parts[1] || '').replace(/^"|"$/g, '');
    unmapped.push({ id, text });
  }
}
console.log('unmapped_count:', unmapped.length);
unmapped.forEach((u) => console.log(u.id + ' - ' + (u.text.length>200? u.text.slice(0,200)+'...': u.text)));
