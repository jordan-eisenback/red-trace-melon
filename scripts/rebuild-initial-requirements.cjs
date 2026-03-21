const fs = require('fs');
const path = require('path');

const inPath = path.join(__dirname, '..', 'src', 'imports', 'pasted_text', 'rbac-requirements.csv');
const outPath = path.join(__dirname, '..', 'src', 'app', 'data', 'initial-requirements.ts');

if (!fs.existsSync(inPath)) {
  console.error('CSV not found:', inPath);
  process.exit(1);
}

const raw = fs.readFileSync(inPath, 'utf8');
let rows = raw.split(/\r?\n/).filter(Boolean);

// Detect and remove header row if it looks like the CSV header (first cell contains 'RTM ID' or 'Requirement Statement')
const firstCols = (rows[0] || '').split('\t');
if (firstCols[0] && /RTM\s*ID/i.test(firstCols[0]) || firstCols[1] && /Requirement\s*Statement/i.test(firstCols[1])) {
  rows.shift();
}

const reqs = rows.map(r => {
  const cols = r.split('\t');
  return {
    id: (cols[0] || '').trim(),
    req: (cols[1] || '').trim(),
    type: (cols[2] || '').trim(),
    outcome: ((cols[5] || cols[6] || '')).trim(),
    owner: (cols[3] || '').trim(),
    parent: (cols[4] && cols[4].trim()) ? cols[4].trim() : null,
    _raw: r
  };
});

const header = "import { Requirement } from \"../types/requirement\";\n\nexport const initialRequirements: Requirement[] = ";
fs.writeFileSync(outPath, header + JSON.stringify(reqs, null, 2) + ";\n");
console.log('Wrote', outPath, 'with', reqs.length, 'requirements');
