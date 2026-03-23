const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'src', 'app', 'data', 'initial-epics.ts');
let src = fs.readFileSync(filePath, 'utf8');

// Replace Title prefix "Imported: " inside the file
const before = '"title": "Imported: ';
const after = '"title": "';
if (src.includes(before)) {
  src = src.split(before).join(after);
  fs.writeFileSync(filePath, src, 'utf8');
  console.log('Removed Imported: prefix from titles in', filePath);
} else {
  console.log('No Imported: prefixes found in', filePath);
}
