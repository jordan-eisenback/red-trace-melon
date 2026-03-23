const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const csvFile = path.join(__dirname, 'proposed-mappings.csv');
const fwFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');
const outJson = path.join(__dirname, 'proposed-apply-preview.json');

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  const rows = lines.map((l) => {
    // quick CSV parser for quoted fields
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
  return rows;
}

function selectTopPerRequirement(rows) {
  const map = new Map();
  rows.forEach((r) => {
    const id = r.requirementId;
    if (!map.has(id) || (r.score || 0) > (map.get(id).score || 0)) map.set(id, r);
  });
  return Array.from(map.values());
}

function previewApplyFromParsed(proposals, frameworks) {
  const preview = { updates: [], notFound: [] };
  const fwMap = new Map(frameworks.map((f) => [f.id, f]));
  proposals.forEach((p) => {
    const fwId = p.proposalFrameworkId;
    const ctrlId = p.proposalControlId;
    const rid = p.requirementId;
    const fw = fwMap.get(fwId);
    if (!fw) {
      preview.notFound.push({ proposal: p, reason: 'framework-not-found' });
      return;
    }
    const ctrl = (fw.controls || []).find((c) => c.controlId === ctrlId || c.id === ctrlId);
    if (!ctrl) {
      preview.notFound.push({ proposal: p, reason: 'control-not-found' });
      return;
    }
    const existing = Array.isArray(ctrl.requirements) ? ctrl.requirements.slice() : [];
    const already = existing.includes(rid);
    const toAdd = already ? [] : [rid];
    preview.updates.push({ frameworkId: fwId, controlId: ctrlId, controlTitle: p.proposalControlTitle, added: toAdd, alreadyPresent: already, controlRequirementsCount: existing.length });
  });
  return preview;
}

function previewApply(proposals, frameworksText) {
  // fallback: if parsing failed, report control-not-found for each proposal
  const preview = { updates: [], notFound: [] };
  proposals.forEach((p) => preview.notFound.push({ proposal: p, reason: 'control-not-found' }));
  return preview;
}

function main() {
  if (!fs.existsSync(csvFile)) { console.error('proposals CSV not found:', csvFile); process.exit(1); }
  if (!fs.existsSync(fwFile)) { console.error('frameworks file not found:', fwFile); process.exit(1); }
  const csv = fs.readFileSync(csvFile, 'utf8');
  const rows = parseCsv(csv);
  const tops = selectTopPerRequirement(rows);
  const fwText = fs.readFileSync(fwFile, 'utf8');
  // attempt to parse frameworks array literal into JS object
  let frameworksObj = null;
  try {
    const m = fwText.match(/export\s+const\s+initialFrameworks[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
    if (m) {
      let arr = m[1].replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
      // remove trailing commas before closing braces/brackets to form valid JSON
      arr = arr.replace(/,\s*(?=[}\]])/g, '');
      frameworksObj = JSON.parse(arr);
    }
  } catch (e) {
    frameworksObj = null;
  }
  const preview = frameworksObj ? previewApplyFromParsed(tops, frameworksObj) : previewApply(tops, fwText);
  fs.writeFileSync(outJson, JSON.stringify({ selected: tops, preview }, null, 2));
  console.log('Wrote dry-run preview to', outJson);
}

main();
