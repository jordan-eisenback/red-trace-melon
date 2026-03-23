const fs = require('fs');
const path = require('path');

const csvFile = path.join(__dirname, 'proposed-mappings-unmapped-caps-quick.csv');
const fwFile = path.join(__dirname, '..', 'src', 'app', 'data', 'initial-frameworks.ts');
const outFile = path.join(__dirname, 'proposed-apply-quick-preview.json');

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  return lines.map((l) => {
    // simple CSV parse for quoted values
    const parts = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    return {
      requirementId: parts[0],
      requirementText: parts[1],
      proposalFrameworkId: parts[2],
      proposalFrameworkName: parts[3],
      proposalControlId: parts[4],
      proposalControlTitle: parts[5],
      reason: parts[6],
      score: Number(parts[7] || 0)
    };
  });
}

function selectTop(rows) {
  const map = new Map();
  rows.forEach((r) => {
    const id = r.requirementId;
    const cur = map.get(id);
    if (!cur || r.score > cur.score) map.set(id, r);
  });
  return Array.from(map.values());
}

function checkFrameworks(topProposals, fwText) {
  const result = { updates: [], already: [], missingControls: [] };
  topProposals.forEach((p) => {
    const ctrlRegex = new RegExp('\\{[\\s\\S]*?"frameworkId"\\s*:\\s*"' + p.proposalFrameworkId + '"[\\s\\S]*?"controlId"\\s*:\\s*"' + p.proposalControlId + '"[\\s\\S]*?requirements\\s*:\\s*\\[([\\s\\S]*?)\\]','m');
    const m = fwText.match(ctrlRegex);
    if (!m) {
      result.missingControls.push({ proposal: p });
      return;
    }
    const inner = m[1];
    const existing = (inner.match(/['\"]([A-Z0-9-]+)['\"]/g) || []).map(s => s.replace(/['\"]/g, ''));
    if (existing.includes(p.requirementId)) {
      result.already.push({ proposal: p });
    } else {
      // record update
      result.updates.push({ proposal: p, add: [p.requirementId] });
    }
  });
  return result;
}

function main() {
  if (!fs.existsSync(csvFile)) { console.error('CSV not found', csvFile); process.exit(1); }
  if (!fs.existsSync(fwFile)) { console.error('Frameworks file not found', fwFile); process.exit(1); }
  const csv = fs.readFileSync(csvFile, 'utf8');
  const rows = parseCsv(csv);
  const top = selectTop(rows);
  const fwText = fs.readFileSync(fwFile, 'utf8');
  const preview = checkFrameworks(top, fwText);
  fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), selectedCount: top.length, top, preview }, null, 2));
  console.log('Wrote preview to', outFile);
}

main();
