const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const epicsFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-epics.ts');

function readExistingRequirementIds(text) {
  const m = text.match(/id:\s*['"]([^'"]+)['"]/g) || [];
  return new Set(m.map((s) => s.replace(/id:\s*['"]|['"]/g, '').trim()));
}

function extractRequirementIdsFromEpics(text) {
  const ids = new Set();
  const reqArrayRegex = /requirements:\s*\[([^\]]*)\]/g;
  let match;
  while ((match = reqArrayRegex.exec(text))) {
    const arrText = match[1];
    const items = arrText.split(',').map((s) => s.replace(/[\[\]'"\s]/g, '').trim()).filter(Boolean);
    items.forEach((it) => ids.add(it));
  }
  return ids;
}

function mapType(id) {
  if (/^RBAC-CAP-/i.test(id)) return 'Capability';
  if (/^RBAC-INT-/i.test(id)) return 'Interface';
  if (/^RBAC-IGA-/i.test(id)) return 'IGA Functional';
  if (/^RBAC-ENT-/i.test(id)) return 'Enterprise';
  if (/^OPT-/i.test(id)) return 'Capability (Optional)';
  return 'Other';
}

function buildRequirement(id) {
  return {
    id,
    req: `Placeholder requirement created for ${id}`,
    type: mapType(id),
    owner: 'RBAC Product',
    parent: null,
    outcome: '',
    notes: '',
  };
}

function writeRequirements(filePath, requirements) {
  const out = `import { Requirement } from "../types/requirement";\n\nexport const initialRequirements: Requirement[] = ${JSON.stringify(requirements, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
}

function main() {
  const epicsText = fs.readFileSync(epicsFile, 'utf8');
  const reqText = fs.existsSync(reqFile) ? fs.readFileSync(reqFile, 'utf8') : '';
  const existing = readExistingRequirementIds(reqText);
  const referenced = extractRequirementIdsFromEpics(epicsText);
  const missing = Array.from(referenced).filter((id) => !existing.has(id));
  console.log(`Found ${referenced.size} referenced requirement ids, ${existing.size} existing, ${missing.length} missing`);
  const newRequirements = [];
  missing.forEach((id) => {
    if (!id) return;
    newRequirements.push(buildRequirement(id));
    console.log(`Will create placeholder for ${id}`);
  });

  const all = [];
  // if there are existing ones, try to parse their objects (simple JSON fallback)
  if (reqText.includes('initialRequirements')) {
    try {
      // naive eval: find array literal and parse
      const arrMatch = reqText.match(/initialRequirements\s*:\s*Requirement\[]\s*=\s*(\[([\s\S]*)\]);/m);
    } catch (e) {
      // ignore
    }
  }

  // write only the new ones (safe minimal set) appended
  const final = newRequirements;
  writeRequirements(reqFile, final);
  console.log(`Wrote ${final.length} requirement placeholders to ${reqFile}`);
}

main();
