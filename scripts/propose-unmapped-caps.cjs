const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const issuesFile = path.join(__dirname, 'issues-restored.json');
const reqFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const fwFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');
const outCsv = path.join(__dirname, 'proposed-mappings-unmapped-caps.csv');
const outJson = path.join(__dirname, 'proposed-mappings-unmapped-caps.json');

function parseRequirements(text) {
  const m = text.match(/export\s+const\s+initialRequirements[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
  if (!m) return [];
  let arrText = m[1];
  // try safe JSON conversion
  arrText = arrText.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
  arrText = arrText.replace(/,\s*(?=[\}\]])/g, '');
  try { return JSON.parse(arrText); } catch (e) { return []; }
}

function parseFrameworks(text) {
  const m = text.match(/export\s+const\s+initialFrameworks[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
  if (!m) return [];
  let arr = m[1].replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
  arr = arr.replace(/,\s*(?=[\}\]])/g, '');
  try { return JSON.parse(arr); } catch (e) { return []; }
}

function tokenize(s) {
  return (s||'').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function scoreMatch(reqText, fw, ctrl) {
  const text = [fw.name, ctrl.title, ctrl.description, reqText].join(' ').toLowerCase();
  const tokens = tokenize(text);
  const reqTokens = new Set(tokenize(reqText));
  let score = 0;
  // reward token overlap
  reqTokens.forEach((t) => { if (tokens.includes(t)) score += 2; });
  // domain boosts
  const complianceFrameworks = ['NIST', 'SOX', 'ISO', 'COBIT'];
  if (complianceFrameworks.some(k => (fw.id||'').toUpperCase().includes(k) || (fw.name||'').toUpperCase().includes(k))) score += 1;
  // keyword boosts
  const kws = ['audit','approval','review','certif','attest','compliance','provision','directory','group','log','event','abac','eligib','access','entitlement','certification','attestation'];
  kws.forEach((k) => { if (reqText.toLowerCase().includes(k)) score += 2; if ((ctrl.title||'').toLowerCase().includes(k)) score += 1; });
  return score;
}

function topCandidatesForReq(req, frameworks, topN=3) {
  const candidates = [];
  frameworks.forEach((fw) => {
    (fw.controls || []).forEach((ctrl) => {
      const s = scoreMatch(req.req || req.requirement || req.description || '', fw, ctrl);
      candidates.push({ frameworkId: fw.id, frameworkName: fw.name, controlId: ctrl.controlId || ctrl.id, controlTitle: ctrl.title || '', score: s });
    });
  });
  candidates.sort((a,b) => b.score - a.score);
  return candidates.slice(0, topN);
}

function writeCsv(rows) {
  const hdr = ['requirementId','requirementText','proposalFrameworkId','proposalFrameworkName','proposalControlId','proposalControlTitle','reason','score'];
  const lines = [hdr.join(',')];
  rows.forEach(r => {
    const safe = v => '"'+String(v||'').replace(/"/g,'""')+'"';
    lines.push([safe(r.requirementId), safe(r.requirementText), safe(r.proposalFrameworkId), safe(r.proposalFrameworkName), safe(r.proposalControlId), safe(r.proposalControlTitle), safe(r.reason), r.score].join(','));
  });
  fs.writeFileSync(outCsv, lines.join('\n'));
}

function main() {
  if (!fs.existsSync(issuesFile)) { console.error('issues snapshot not found:', issuesFile); process.exit(1); }
  const issues = JSON.parse(fs.readFileSync(issuesFile,'utf8')).issues || [];
  const capIds = issues.map(i => i.requirementId).filter(id => id && id.startsWith('RBAC-CAP-'));

  const reqText = fs.existsSync(reqFile) ? fs.readFileSync(reqFile,'utf8') : '';
  const requirements = parseRequirements(reqText);
  const reqMap = new Map(requirements.map(r => [r.id, r]));

  const fwText = fs.existsSync(fwFile) ? fs.readFileSync(fwFile,'utf8') : '';
  let frameworks = parseFrameworks(fwText);
  if ((!frameworks || frameworks.length === 0) && fwText) {
    // fallback: scan for control entries and group by frameworkId
    const fwMap = new Map();
    const ctrlRegex = /"frameworkId"\s*:\s*"([^"]+)"[\s\S]{0,300}?"controlId"\s*:\s*"([^"]+)"[\s\S]{0,200}?"title"\s*:\s*"([^"]*)"/g;
    let m;
    while ((m = ctrlRegex.exec(fwText))) {
      const frameworkId = m[1];
      const controlId = m[2];
      const title = m[3];
      if (!fwMap.has(frameworkId)) fwMap.set(frameworkId, { id: frameworkId, name: frameworkId, controls: [] });
      fwMap.get(frameworkId).controls.push({ controlId, title, requirements: [] });
    }
    frameworks = Array.from(fwMap.values());
  }

  const proposals = [];
  capIds.forEach((rid) => {
    const req = reqMap.get(rid);
    if (!req) return;
    const top = topCandidatesForReq(req, frameworks, 3);
    top.forEach((c, idx) => {
      proposals.push({ requirementId: rid, requirementText: req.req || req.requirement || req.description || '', proposalFrameworkId: c.frameworkId, proposalFrameworkName: c.frameworkName, proposalControlId: c.controlId, proposalControlTitle: c.controlTitle, reason: 'keyword-similarity', score: c.score });
    });
  });

  fs.writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), count: proposals.length, proposals }, null, 2));
  writeCsv(proposals);
  console.log('Wrote', proposals.length, 'proposals to', outCsv);
}

main();
