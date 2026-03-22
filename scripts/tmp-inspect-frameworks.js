const fs = require('fs');
const text = fs.readFileSync('src/app/data/initial-frameworks.ts','utf8');
const start = text.indexOf('initialFrameworks');
const arrOpen = text.indexOf('[', start);
const arrClose = text.lastIndexOf(']');
const arrText = text.slice(arrOpen, arrClose+1);
let f;
try{
  f = new Function('return '+arrText)();
}catch(e){
  console.error('eval failed', e && e.message);
  process.exit(1);
}
const mapped = new Set();
f.forEach(fw=> (fw.controls||[]).forEach(c=> (c.requirements||[]).forEach(r=>mapped.add(r))));
console.log(JSON.stringify({frameworks: f.length, mappedRequirementsCount: mapped.size, sample: Array.from(mapped).slice(0,80)}, null, 2));
