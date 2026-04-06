const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'src', 'app', 'data', 'initial-epics.ts');
const backupPath = path.resolve(__dirname, `backups/initial-epics-before-expand-${Date.now()}.ts`);
fs.mkdirSync(path.dirname(backupPath), { recursive: true });
fs.copyFileSync(filePath, backupPath);
console.log('Backup written to', backupPath);
let src = fs.readFileSync(filePath, 'utf8');

// Match each user story object by finding title and description within the same object.
const objRe = /\{([\s\S]*?)\n\s*\},/g;
let changed = 0;
let out = src.replace(objRe, (match, inner) => {
  // we only operate on entries that look like user stories (have "id": "US-")
  if (!/"id"\s*:\s*"US-/.test(inner)) return match;
  const titleMatch = inner.match(/"title"\s*:\s*"([\s\S]*?)"\s*,/);
  const descMatch = inner.match(/"description"\s*:\s*"([\s\S]*?)"\s*,/);
  if (!titleMatch || !descMatch) return match;
  const rawTitle = titleMatch[1];
  const rawDesc = descMatch[1];
  // If title ends with ellipsis or is much shorter than description, replace it.
  const shouldReplace = /\.\.\.$/.test(rawTitle) || (rawDesc && rawDesc.length > rawTitle.length + 10);
  if (shouldReplace && rawDesc && rawDesc.length > 0) {
    // create a safe replacement title: trim description to 240 chars, keep whole words
    let newTitle = rawDesc.trim();
    if (newTitle.length > 240) {
      newTitle = newTitle.slice(0, 240);
      const lastSpace = newTitle.lastIndexOf(' ');
      if (lastSpace > 50) newTitle = newTitle.slice(0, lastSpace);
    }
    newTitle = newTitle.replace(/"/g, '\\"');
    // Use replaceAll to ensure all occurrences of the matched title string are replaced
    const newInner = inner.replaceAll(titleMatch[0], `"title": "${newTitle}",`);
    changed++;
    return `{${newInner}\n  },`;
  }
  return match;
});

if (changed > 0) {
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Replaced ${changed} truncated story titles in ${filePath}`);
} else {
  console.log('No titles needed expanding');
}
