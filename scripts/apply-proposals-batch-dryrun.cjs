const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '..');
const csvPaths = [
  path.join(repoRoot,'scripts','proposed-mappings.csv'),
  path.join(repoRoot,'scripts','proposed-mappings-unmapped-caps-quick.csv')
];

function readCsv(p){
  if(!fs.existsSync(p)) return [];
  const text = fs.readFileSync(p,'utf8').trim();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(',').map(h=>h.replace(/(^"|"$)/g,''));
  return lines.map(l=>{
    const cols = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // split by comma outside quotes
    const obj = {};
    header.forEach((h,i)=> obj[h]= (cols[i]||'').replace(/^"|"$/g,''));
    obj.score = Number(obj.score||0);
    return obj;
  });
}

function parseFrameworks(text){
  const controls = [];
  const blockRegex = /\{[\s\S]*?"controlId"[\s\S]*?\}/g;
  let blk;
  while((blk = blockRegex.exec(text))){
    const block = blk[0];
    const controlIdMatch = block.match(/"controlId"\s*:\s*"([^\"]+)"/);
    const idMatch = block.match(/"id"\s*:\s*"([^\"]+)"/);
    const reqsMatch = block.match(/"requirements"\s*:\s*\[([\s\S]*?)\]/);
    const controlId = controlIdMatch ? controlIdMatch[1] : null;
    const id = idMatch ? idMatch[1] : null;
    const reqsText = reqsMatch ? reqsMatch[1] : '';
    const reqs = (reqsText.match(/['\"]([A-Z0-9-]+)['\"]/g)||[]).map(s=>s.replace(/['\"]/g,''));
    if(controlId && id){ controls.push({ controlId, id, requirements: reqs }); }
  }
  return controls;
}

(function main(){
  const proposals = [];
  csvPaths.forEach(p=>{
    readCsv(p).forEach(r=>proposals.push(r));
  });
  // pick top candidate per requirementId
  const byReq = {};
  proposals.forEach(p=>{
    const key = p.requirementId;
    if(!byReq[key] || p.score > byReq[key].score) byReq[key] = p;
  });
  const chosen = Object.values(byReq);

  const fwText = fs.existsSync(path.join(repoRoot,'src','app','data','initial-frameworks.ts'))? fs.readFileSync(path.join(repoRoot,'src','app','data','initial-frameworks.ts'),'utf8') : '';
  const controls = parseFrameworks(fwText);
  const controlIndex = new Map(controls.map(c=>[c.controlId,c]));

  const additions = [];
  chosen.forEach(c=>{
    const control = controlIndex.get(c.proposalControlId);
    const target = control ? { controlId: control.controlId, internalId: control.id } : { controlId: c.proposalControlId, internalId: c.proposalFrameworkId };
    const already = control && control.requirements.includes(c.requirementId);
    additions.push({ requirementId: c.requirementId, proposalFrameworkId: c.proposalFrameworkId, proposalControlId: c.proposalControlId, proposalControlInternal: target.internalId, already, reason: c.reason, score: c.score });
  });

  const out = { generatedAt: (new Date()).toISOString(), chosenCount: chosen.length, additions };
  const outFile = path.join(repoRoot,'scripts','proposed-apply-batch-preview.json');
  fs.writeFileSync(outFile, JSON.stringify(out,null,2));
  console.log('Wrote', outFile);
  const toAdd = additions.filter(a=>!a.already);
  console.log('Summary: total proposals considered=', chosen.length, 'wouldAdd=', toAdd.length, 'alreadyPresent=', additions.length - toAdd.length);
  if(toAdd.length>0){
    console.log('Sample toAdd (first 10):');
    console.log(JSON.stringify(toAdd.slice(0,10),null,2));
  }
})();
