const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '..');
const csvFile = path.join(repoRoot, 'src', 'imports', 'pasted_text', 'rbac-requirements.csv');
const epicsFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-epics.ts');

function readCsv(p){
  const text = fs.readFileSync(p,'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split('\t').map(h=>h.trim());
  return lines.map(l=>{
    const cols = l.split('\t');
    const obj = {};
    header.forEach((h,i)=> obj[h]= (cols[i]||'').trim());
    return obj;
  });
}

function extractArray(text, varName){
  // match with optional TS type annotation between name and =
  const re = new RegExp(`export const ${varName}(?:\\s*:[^=]*)?\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'm');
  const m = text.match(re);
  if(!m) return null;
  let arrText = m[1];
  // quote unquoted keys
  arrText = arrText.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
  try{ return JSON.parse(arrText); }catch(e){
    // try to be more lenient: remove trailing commas
    const cleaned = arrText.replace(/,\s*\]/g, ']').replace(/,\s*}/g,'}');
    try{ return JSON.parse(cleaned);}catch(e2){ return null; }
  }
}

function writeEpicsFile(originalText, epics, stories){
  // Keep the import line(s) at top and regenerate the two exports
  const importMatch = originalText.match(/^[\s\S]*?\n\n/);
  const header = importMatch ? importMatch[0] : '';
  const out = header + `export const initialEpics = ${JSON.stringify(epics,null,2)};\n\nexport const initialUserStories = ${JSON.stringify(stories,null,2)};\n`;
  fs.writeFileSync(epicsFile, out, 'utf8');
}

function titleFromRequirement(req){
  const t = req.substring(0,80);
  return `Imported: ${t}${req.length>80? '...':''}`;
}

function findEpicForRequirement(reqObj, epics){
  const stmt = (reqObj['Requirement Statement']||'').toLowerCase();
  const layer = (reqObj['Layer']||'').toLowerCase();
  const ctrl = (reqObj['Control Objective']||'').toLowerCase();
  let best = null; let bestScore = 0;
  epics.forEach(e=>{
    let score = 0;
    const hay = ((e.title||'') + ' ' + (e.description||'')).toLowerCase();
    if(hay.includes('discov') && stmt.includes('onboard')) score+=3;
    if(hay.includes('role') && stmt.includes('role')) score+=3;
    if(hay.includes('certif') && stmt.includes('certif')) score+=3;
    if(hay.includes('audit') && (stmt.includes('audit')||ctrl.includes('audit')||layer.includes('audit'))) score+=3;
    if(hay.includes('directory') && (stmt.includes('directory')||ctrl.includes('directory')||layer.includes('directory'))) score+=3;
    if(hay.includes('workday') && (stmt.includes('workday')||ctrl.includes('workday'))) score+=3;
    if(hay.includes('iga') && (ctrl.includes('iga')||stmt.includes('iga')||layer.includes('iga'))) score+=2;
    if(layer.includes('enterprise') && e.id==='EPIC-1') score+=1; // small bias
    if(score>bestScore){ best = e; bestScore = score; }
  });
  return best || epics[0];
}

function nextStoryIdForEpic(epicId, stories){
  const m = epicId.match(/EPIC-(\d+)/);
  const epicNum = m ? m[1] : '0';
  const ids = stories.filter(s=>s.epicId===epicId).map(s=>s.id);
  const nums = ids.map(id=>{ const mm = id.match(new RegExp(`US-${epicNum}\\.(\\d+)`)); return mm?Number(mm[1]):0; });
  const next = nums.length? Math.max(...nums)+1 : 1;
  return `US-${epicNum}.${next}`;
}

(function main(){
  if(!fs.existsSync(csvFile)){
    console.error('CSV not found at', csvFile); process.exit(1);
  }
  const csvRows = readCsv(csvFile);
  const text = fs.readFileSync(epicsFile,'utf8');
  const epics = extractArray(text, 'initialEpics') || [];
  const stories = extractArray(text, 'initialUserStories') || [];

  const existingReqsInStories = new Set();
  stories.forEach(s=> (s.requirements||[]).forEach(r=> existingReqsInStories.add(r)));
  const existingReqsInEpics = new Set();
  epics.forEach(e=> (e.requirements||[]).forEach(r=> existingReqsInEpics.add(r)));

  const additions = [];
  csvRows.forEach(row=>{
    const id = row['RTM ID'] || row['RTM ID'.trim()];
    if(!id) return;
    if(existingReqsInStories.has(id)) return; // already in a story
    // create new story for this requirement
    const chosenEpic = findEpicForRequirement(row, epics);
    const newId = nextStoryIdForEpic(chosenEpic.id, stories.concat(additions.map(a=>a.story)));
    const story = {
      id: newId,
      epicId: chosenEpic.id,
      title: titleFromRequirement(row['Requirement Statement']||''),
      description: row['Requirement Statement']||'',
      acceptanceCriteria: [],
      requirements: [id],
      priority: 'Medium',
      status: 'Backlog',
      storyPoints: 3,
      assignee: '',
      notes: 'Imported from CSV'
    };
    additions.push({ epic: chosenEpic, story });
    stories.push(story);
    // add requirement to epic if missing
    chosenEpic.requirements = chosenEpic.requirements || [];
    if(!chosenEpic.requirements.includes(id)){
      chosenEpic.requirements.push(id);
    }
    existingReqsInStories.add(id);
    existingReqsInEpics.add(id);
  });

  if(additions.length===0){
    console.log('No new stories to add.'); return;
  }

  // write back
  writeEpicsFile(text, epics, stories);
  console.log('Added', additions.length, 'new user stories.');
  additions.forEach(a=> console.log(a.story.id, '->', a.epic.id, a.story.requirements[0]));
})();
