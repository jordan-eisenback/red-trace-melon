const fs = require('fs');
const path = require('path');

const issuesFile = path.join(__dirname, 'issues-restored.json');
const reqFile = path.join(__dirname, '..', 'src', 'app', 'data', 'initial-requirements.ts');
const outCsv = path.join(__dirname, 'proposed-mappings-unmapped-caps-quick.csv');

function extractReqText(fileText, id) {
  const re = new RegExp('"id"\\s*:\\s*"' + id + '"[\\s\\S]{0,300}?"req"\\s*:\\s*"([^"]*)"', 'm');
  const m = fileText.match(re);
  return m ? m[1] : '';
}

function chooseProposals(reqText) {
  const txt = (reqText||'').toLowerCase();
  const proposals = [];
  if (txt.includes('audit') || txt.includes('evidence') || txt.includes('attest')) {
    proposals.push({ frameworkId: 'SOX-FRAMEWORK', frameworkName: 'SOX Controls', controlId: 'SOX-ITGC-01', controlTitle: 'SOX-ITGC-01 (auto)', reason: 'keyword-audit', score: 4 });
    proposals.push({ frameworkId: 'NIST-FRAMEWORK', frameworkName: 'NIST Controls', controlId: 'AC-2', controlTitle: 'AC-2 (auto)', reason: 'keyword-audit', score: 3 });
  }
  if (txt.includes('discovery') || txt.includes('onboard') || txt.includes('onboarding')) {
    proposals.push({ frameworkId: 'DIR-SERVICES', frameworkName: 'Directory Services', controlId: 'DIR-3.1', controlTitle: 'Out-of-band change detection', reason: 'keyword-discovery', score: 4 });
  }
  if (txt.includes('provision') || txt.includes('provisioning')) {
    proposals.push({ frameworkId: 'DIR-SERVICES', frameworkName: 'Directory Services', controlId: 'DIR-2.1', controlTitle: 'Directory group provisioning', reason: 'keyword-provision', score: 4 });
  }
  if (txt.includes('log') || txt.includes('logging') || txt.includes('event')) {
    proposals.push({ frameworkId: 'DIR-SERVICES', frameworkName: 'Directory Services', controlId: 'DIR-6.1', controlTitle: 'Directory event logging', reason: 'keyword-logging', score: 3 });
  }
  if (txt.includes('abac') || txt.includes('eligib') || txt.includes('attribute')) {
    proposals.push({ frameworkId: 'NIST-FRAMEWORK', frameworkName: 'NIST Controls', controlId: 'AC-2', controlTitle: 'AC-2 (auto)', reason: 'keyword-abac', score: 4 });
  }
  if (proposals.length === 0) {
    proposals.push({ frameworkId: 'NIST-FRAMEWORK', frameworkName: 'NIST Controls', controlId: 'AC-2', controlTitle: 'AC-2 (auto)', reason: 'fallback', score: 1 });
  }
  return proposals.slice(0,3);
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
  const proposals = [];
  capIds.forEach((rid) => {
    const text = extractReqText(reqText, rid);
    if (!text) return;
    const cand = chooseProposals(text);
    cand.forEach(c => proposals.push({ requirementId: rid, requirementText: text, proposalFrameworkId: c.frameworkId, proposalFrameworkName: c.frameworkName, proposalControlId: c.controlId, proposalControlTitle: c.controlTitle, reason: c.reason, score: c.score }));
  });
  writeCsv(proposals);
  fs.writeFileSync(path.join(__dirname,'proposed-mappings-unmapped-caps-quick.json'), JSON.stringify({ generatedAt: new Date().toISOString(), count: proposals.length, proposals }, null, 2));
  console.log('Wrote', proposals.length, 'heuristic proposals to', outCsv);
}

main();
