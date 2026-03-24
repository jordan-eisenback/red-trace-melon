const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '..', 'src', 'app', 'data', 'initial-epics.ts');
const backupPath = path.resolve(__dirname, 'backups', `initial-epics-before-remove-notes-${Date.now()}.ts`);
fs.mkdirSync(path.dirname(backupPath), { recursive: true });
fs.copyFileSync(filePath, backupPath);
console.log('Backup written to', backupPath);
let src = fs.readFileSync(filePath, 'utf8');

const before = '"notes": "Imported from CSV"';
if (src.includes(before)) {
  src = src.split(before).join('"notes": ""');
  fs.writeFileSync(filePath, src, 'utf8');
  console.log('Replaced Imported from CSV notes with empty string in', filePath);
} else {
  console.log('No "Imported from CSV" notes found in', filePath);
}
