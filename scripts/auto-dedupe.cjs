const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');

function parseRequirementObjects(text) {
  // reuse lightweight parser from autofix script
  const objs = [];
  const arrMatch = text.match(/export\s+const\s+initialRequirements[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
  if (!arrMatch) return [];
  let arrText = arrMatch[1];
  try {
    const parsed = JSON.parse(arrText);
    return parsed.map((o) => ({ ...o }));
  } catch (e) {
    // fallback: extract object literals
    let i = arrText.indexOf('[') + 1;
    if (i === 0) i = 0;
    const len = arrText.length;
    while (i < len) {
      const oStart = arrText.indexOf('{', i);
      if (oStart === -1) break;
      let depth = 0;
      let j = oStart;
      for (; j < len; j++) {
        if (arrText[j] === '{') depth++;
        else if (arrText[j] === '}') {
          depth--;
          if (depth === 0) break;
        }
      }
      const objText = arrText.slice(oStart, j + 1);
      // simple key:value parser for required fields
      const idM = objText.match(/id:\s*['"]([^'\"]+)['"]/);
      const reqM = objText.match(/req:\s*([`'"])([\s\S]*?)\1/);
      const typeM = objText.match(/type:\s*['"]([^'\"]+)['"]/);
      const outcomeM = objText.match(/outcome:\s*([`'"])([\s\S]*?)\1/);
      const ownerM = objText.match(/owner:\s*['"]([^'\"]*)['"]/);
      const notesM = objText.match(/notes:\s*([`'"])([\s\S]*?)\1/);
      const parentM = objText.match(/parent:\s*([^,\n}]+)/);
      objs.push({
        id: idM ? idM[1] : undefined,
        req: reqM ? reqM[2].replace(/\n\s+/g, ' ').trim() : '',
        type: typeM ? typeM[1] : '',
        outcome: outcomeM ? outcomeM[2].replace(/\n\s+/g, ' ').trim() : '',
        owner: ownerM ? ownerM[1] : '',
        notes: notesM ? notesM[2] : '',
        parent: parentM ? parentM[1].trim().replace(/['"]/g, '') : null,
      });
      i = j + 1;
    }
  }
  return objs;
}

function tokenize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  return uni === 0 ? 0 : inter / uni;
}

function clusterSimilar(requirements, threshold = 0.7) {
  const n = requirements.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x) { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
  function union(a, b) { const ra = find(a); const rb = find(b); if (ra !== rb) parent[rb] = ra; }

  const tokens = requirements.map((r) => tokenize(r.req || ''));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const score = jaccard(tokens[i], tokens[j]);
      if (score >= threshold) union(i, j);
    }
  }
  const groups = new Map();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(i);
  }
  return Array.from(groups.values()).filter((g) => g.length > 1);
}

function writeRequirements(filePath, requirements) {
  const out = `import { Requirement } from "../types/requirement";\n\nexport const initialRequirements: Requirement[] = ${JSON.stringify(requirements, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
}

function main() {
  const text = fs.readFileSync(reqPath, 'utf8');
  const reqs = parseRequirementObjects(text);
  if (!reqs.length) { console.error('No requirements parsed'); process.exit(1); }

  const clusters = clusterSimilar(reqs, 0.7);
  if (clusters.length === 0) { console.log('No duplicates found'); return; }

  const report = [];
  clusters.forEach((group) => {
    const canonicalIdx = group.slice().sort((a,b) => reqs[a].id.localeCompare(reqs[b].id))[0];
    const canonical = reqs[canonicalIdx];
    const others = group.filter((i) => i !== canonicalIdx);
    others.forEach((i) => {
      const r = reqs[i];
      const notePrefix = `Duplicate of ${canonical.id}.`;
      r.notes = (r.notes || '').trim();
      if (!r.notes.startsWith(notePrefix)) r.notes = `${notePrefix} ${r.notes}`.trim();
      r.status = 'duplicate';
      report.push({ id: r.id, duplicateOf: canonical.id });
    });
  });

  // write back
  writeRequirements(reqPath, reqs);
  console.log(`Marked ${report.length} duplicates across ${clusters.length} groups`);
  console.log(JSON.stringify(report, null, 2));
}

main();
