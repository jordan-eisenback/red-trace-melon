const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const backup = path.join(repoRoot, 'scripts', 'initial-requirements.pre-normalize.ts');

if (!fs.existsSync(reqFile)) {
  console.error('Requirements file not found:', reqFile);
  process.exit(1);
}

const text = fs.readFileSync(reqFile, 'utf8');
const m = text.match(/export\s+const\s+initialRequirements[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
if (!m) {
  console.error('Could not parse requirements array from', reqFile);
  process.exit(1);
}

const arrText = m[1];
let reqs;
try {
  reqs = JSON.parse(arrText);
} catch (e) {
  // attempt to quote keys and parse
  const dbl = arrText.replace(/([A-Za-z0-9_]+)\s*:/g, '"$1":');
  try { reqs = JSON.parse(dbl); } catch (e2) { console.error('Failed to parse requirements array'); process.exit(1); }
}

// Backup
fs.writeFileSync(backup, text, 'utf8');
console.log('Backed up original to', backup);

// Normalize
const normalized = reqs.map(r => {
  // copy shallow
  const nr = Object.assign({}, r);
  if (nr.parent && typeof nr.parent === 'string' && nr.parent.trim().toLowerCase() === 'none') nr.parent = null;
  if (nr.parent && nr.parent.trim && nr.parent.trim() === '') nr.parent = null;
  // remove _raw
  if (nr._raw) delete nr._raw;
  // trim strings for main fields
  ['id','req','type','outcome','owner'].forEach(k => { if (nr[k] && typeof nr[k] === 'string') nr[k] = nr[k].trim(); });
  return nr;
});

const header = 'import { Requirement } from "../types/requirement";\n\nexport const initialRequirements: Requirement[] = ';
fs.writeFileSync(reqFile, header + JSON.stringify(normalized, null, 2) + ';\n', 'utf8');
console.log('Wrote normalized requirements to', reqFile, 'count:', normalized.length);
