const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '..');
const reqFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const fwFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');

function parseRequirements(text) {
  const m = text.match(/export\s+const\s+initialRequirements[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
  if (!m) return [];
  const arrText = m[1];
  try {
    return JSON.parse(arrText);
  } catch (e) {
    const dbl = arrText.replace(/([A-Za-z0-9_]+)\s*:/g, '"$1":');
    try { return JSON.parse(dbl); } catch (e2) { return []; }
  }
}

function parseFrameworkMappedReqs(text) {
  const reqs = new Set();
  const reqArrayRegex = /[\"']?requirements[\"']?\s*:\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = reqArrayRegex.exec(text))) {
    const inner = match[1];
    const ids = inner.match(/['\"]([A-Z0-9-]+)['\"]/g) || [];
    ids.forEach((s) => {
      const id = s.replace(/['\"]/g, '');
      if (id) reqs.add(id);
    });
  }
  return reqs;
}

(function main(){
  const reqText = fs.existsSync(reqFile) ? fs.readFileSync(reqFile,'utf8') : '';
  const fwText = fs.existsSync(fwFile) ? fs.readFileSync(fwFile,'utf8') : '';
  const requirements = parseRequirements(reqText);
  const mappedReqs = parseFrameworkMappedReqs(fwText);

  const capabilities = requirements.filter(r => r.type === 'Capability' || r.type === 'IGA Functional');

  const records = capabilities.map(r => {
    const mapped = mappedReqs.has(r.id);
    return {
      id: r.id,
      type: r.type,
      mapped,
      owner: r.owner || '',
      outcome: r.outcome || '',
      parent: r.parent || '',
      req: (r.req || '').replace(/\s+/g,' ').trim().slice(0,400),
    };
  });

  const outJson = path.join(repoRoot,'scripts','capability-diagnostic.json');
  const outCsv = path.join(repoRoot,'scripts','capability-diagnostic.csv');
  fs.writeFileSync(outJson, JSON.stringify({ generatedAt: (new Date()).toISOString(), totalCapabilities: capabilities.length, mappedCount: records.filter(r=>r.mapped).length, records }, null, 2));

  const header = ['id','type','mapped','owner','parent','outcome','reqSnippet'];
  const csvLines = [header.join(',')].concat(records.map(r => {
    // simple CSV escaping
    const esc = (v='') => '"' + String(v).replace(/"/g,'""') + '"';
    return [r.id, r.type, r.mapped ? 'true' : 'false', r.owner, r.parent, r.outcome, r.req].map(esc).join(',');
  }));
  fs.writeFileSync(outCsv, csvLines.join('\n'));

  console.log('Wrote diagnostic:', outJson);
  console.log('Wrote diagnostic CSV:', outCsv);
  console.log('Summary: totalCapabilities=', capabilities.length, 'mapped=', records.filter(r=>r.mapped).length, 'unmapped=', records.filter(r=>!r.mapped).length);
})();
