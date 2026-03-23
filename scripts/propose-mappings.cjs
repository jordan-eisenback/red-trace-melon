const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const frameworksPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');

function parseRequirementObjects(text) {
  const marker = 'initialRequirements';
  const startIdx = text.indexOf(marker);
  if (startIdx === -1) return [];
  const arrOpen = text.indexOf('[', startIdx);
  const arrClose = text.lastIndexOf(']');
  if (arrOpen === -1 || arrClose === -1 || arrClose <= arrOpen) return [];
  const arrText = text.slice(arrOpen, arrClose + 1);
  try {
    const parsed = new Function('return ' + arrText)();
    return parsed.map((p) => ({ id: p.id, req: p.req || '', type: p.type, outcome: p.outcome || '' }));
  } catch (e) {
    return [];
  }
}

function parseFrameworkObjects(text) {
  const marker = 'initialFrameworks';
  const startIdx = text.indexOf(marker);
  if (startIdx === -1) return [];
  const arrOpen = text.indexOf('[', startIdx);
  const arrClose = text.lastIndexOf(']');
  if (arrOpen === -1 || arrClose === -1 || arrClose <= arrOpen) return [];
  const arrText = text.slice(arrOpen, arrClose + 1);
  try { return JSON.parse(arrText); } catch (e) {
    // fallback: attempt eval of array
    try { return new Function('return ' + arrText)(); } catch (e2) { return []; }
  }
}

function tokenize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function jaccard(a, b) {
  const A = new Set(a); const B = new Set(b);
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size; return uni === 0 ? 0 : inter / uni;
}

function propose() {
  const reqText = fs.readFileSync(reqPath, 'utf8');
  const fwText = fs.readFileSync(frameworksPath, 'utf8');
  const requirements = parseRequirementObjects(reqText);
  const frameworks = parseFrameworkObjects(fwText);

  const mappedReqIds = new Set();
  frameworks.forEach((fw) => { (fw.controls||[]).forEach(c => (c.requirements||[]).forEach(r => mappedReqIds.add(r))); });

  const unmapped = requirements.filter(r => !mappedReqIds.has(r.id));

  const mappingRules = [
    { name: 'sox', keywords: ['audit','sox','review','approval','attest','certif','evidence','control'] },
    { name: 'nist', keywords: ['access','authentication','authorization','security','privilege','identity'] },
    { name: 'iso', keywords: ['policy','procedure','governance','manage','control','document'] },
    { name: 'cobit', keywords: ['process','workflow','lifecycle','request','provisioning','deprovisioning'] }
  ];

  const directoryKeywords = ['directory','group','membership','provision','provisioning','ldap','ad','entra','account','out-of-band','drift','log','audit','event','integration','sync'];

  const proposals = [];

  unmapped.forEach((req) => {
    const text = `${req.req} ${req.outcome}`.toLowerCase();
    const tokens = tokenize(text);
    // 1) Directory heuristic
    const dirMatch = directoryKeywords.filter(k => text.includes(k)).length;
    if (dirMatch > 0) {
      const fw = frameworks.find(f => (f.id||'').toLowerCase().includes('dir') || (f.name||'').toLowerCase().includes('directory'));
      if (fw) {
        // score controls by token overlap
        const candidates = (fw.controls||[]).map(c => {
          const combined = `${c.title||''} ${c.description||''} ${(c.controlId||c.id)||''}`.toLowerCase();
          const score = tokens.reduce((s,t) => s + (combined.includes(t) ? 1 : 0), 0);
          return { fw, control: c, score };
        }).filter(x => x.score>0).sort((a,b)=>b.score-a.score);
        if (candidates.length>0) {
          proposals.push({ requirementId: req.id, req: req.req, proposalFrameworkId: fw.id, proposalFrameworkName: fw.name, proposalControlId: candidates[0].control.controlId||candidates[0].control.id, proposalControlTitle: candidates[0].control.title||'', reason: 'directory-keywords', score: candidates[0].score });
          return;
        }
      }
    }

    // 2) Domain heuristics
    let best = null;
    mappingRules.forEach((rule)=>{
      const matchCount = rule.keywords.filter(k=> text.includes(k)).length;
      if (matchCount<=0) return;
      frameworks.forEach((fw)=>{
        if (!((fw.name||'').toLowerCase().includes(rule.name))) return;
        (fw.controls||[]).forEach((c)=>{
          const combined = `${c.title||''} ${c.description||''} ${(c.controlId||c.id)||''}`.toLowerCase();
          const score = matchCount + tokens.reduce((s,t)=>s + (combined.includes(t)?1:0), 0);
          if (!best || score>best.score) best = { requirementId: req.id, req: req.req, proposalFrameworkId: fw.id, proposalFrameworkName: fw.name, proposalControlId: c.controlId||c.id, proposalControlTitle: c.title||'', reason: `domain-${rule.name}`, score };
        });
      });
    });
    if (best) proposals.push(best);

    // 3) Fallback: control title matching across all frameworks
    if (!best) {
      frameworks.forEach((fw)=>{ (fw.controls||[]).forEach((c)=>{
        const combined = `${c.title||''} ${c.description||''} ${(c.controlId||c.id)||''}`.toLowerCase();
        const score = tokens.reduce((s,t)=>s + (combined.includes(t)?1:0), 0);
        if (score>0) {
          proposals.push({ requirementId: req.id, req: req.req, proposalFrameworkId: fw.id, proposalFrameworkName: fw.name, proposalControlId: c.controlId||c.id, proposalControlTitle: c.title||'', reason: 'keyword-match', score });
        }
      }); });
    }
  });

  // write proposals CSV
  const csvLines = ['requirementId,requirementText,proposalFrameworkId,proposalFrameworkName,proposalControlId,proposalControlTitle,reason,score'];
  proposals.forEach(p=>{
    const safe = (v)=>`"${String(v||'').replace(/"/g,'""')}"`;
    csvLines.push([safe(p.requirementId), safe(p.req), safe(p.proposalFrameworkId), safe(p.proposalFrameworkName), safe(p.proposalControlId), safe(p.proposalControlTitle), safe(p.reason), p.score||0].join(','));
  });
  const outPath = path.join(repoRoot, 'scripts', 'proposed-mappings.csv');
  fs.writeFileSync(outPath, csvLines.join('\n'), 'utf8');
  console.log(`Wrote ${proposals.length} proposals to ${outPath}`);
}

propose();
