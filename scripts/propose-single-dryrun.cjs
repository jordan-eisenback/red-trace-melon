const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '..');
const diagFile = path.join(repoRoot,'scripts','capability-diagnostic.json');
const fwFile = path.join(repoRoot,'src','app','data','initial-frameworks.ts');

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }

function parseFrameworks(text){
  // simple extract of control identifiers and titles
  const controls = [];
  const controlRegex = /\{[^}]*?"controlId"\s*:\s*"([^"]+)"[^}]*?"id"\s*:\s*"([^"]+)"[^}]*?"requirements"\s*:\s*\[([\s\S]*?)\]/g;
  let m;
  while((m = controlRegex.exec(text))){
    const controlId = m[1];
    const id = m[2];
    const reqsText = m[3];
    const reqs = (reqsText.match(/['\"]([A-Z0-9-]+)['\"]/g)||[]).map(s=>s.replace(/['\"]/g,''));
    controls.push({ controlId, id, requirements: reqs });
  }
  return controls;
}
function parseFrameworks(text){
  // robustly extract control blocks and their controlId, id, and requirements array
  const controls = [];
  const blockRegex = /\{[\s\S]*?"controlId"[\s\S]*?\}/g;
  let blk;
  while((blk = blockRegex.exec(text))){
    const block = blk[0];
    const controlIdMatch = block.match(/"controlId"\s*:\s*"([^"]+)"/);
    const idMatch = block.match(/"id"\s*:\s*"([^"]+)"/);
    const reqsMatch = block.match(/"requirements"\s*:\s*\[([\s\S]*?)\]/);
    const controlId = controlIdMatch ? controlIdMatch[1] : null;
    const id = idMatch ? idMatch[1] : null;
    const reqsText = reqsMatch ? reqsMatch[1] : '';
    const reqs = (reqsText.match(/['\"]([A-Z0-9-]+)['\"]/g)||[]).map(s=>s.replace(/['\"]/g,''));
    if(controlId && id){
      controls.push({ controlId, id, requirements: reqs });
    }
  }
  return controls;
}

(function main(){
  const diag = readJson(diagFile);
  const fwText = fs.readFileSync(fwFile,'utf8');
  const controls = parseFrameworks(fwText);

  const unmapped = diag.records.filter(r => !r.mapped);
  const proposals = [];
  unmapped.forEach(r => {
    const text = (r.req || '').toLowerCase();
    const candidates = [];
    // heuristic: if 'role' is present, favor NIST AC-2 and ISO A.9.1.1
    if (text.includes('role') || text.includes('roles')){
      const prefer = ['AC-2','A.9.1.1','DIR-INT-1'];
      prefer.forEach((cid, idx) => {
        const found = controls.find(c=>c.controlId === cid || c.id.includes(cid));
        if(found) candidates.push({ controlId: found.controlId, controlInternalId: found.id, score: 10 - idx, reason: 'keyword: role' });
      });
    }
    // fallback: pick top 3 controls that already have many requirements (bigger controls)
    if(candidates.length === 0){
      const sorted = controls.slice().sort((a,b)=>b.requirements.length - a.requirements.length).slice(0,3);
      sorted.forEach((s,idx)=> candidates.push({ controlId: s.controlId, controlInternalId: s.id, score: 5-idx, reason: 'size-based fallback' }));
    }
    proposals.push({ requirementId: r.id, requirementText: r.req, candidates });
  });

  const out = { generatedAt: (new Date()).toISOString(), proposals };
  const outFile = path.join(repoRoot,'scripts','proposed-single-dryrun.json');
  fs.writeFileSync(outFile, JSON.stringify(out,null,2));
  console.log('Wrote', outFile);
  console.log('Preview:');
  console.log(JSON.stringify(out, null, 2));
})();
