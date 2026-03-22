const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const frameworksPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');

function extractTopLevelObjectsFromArray(text, exportName) {
  const startIdx = text.indexOf(exportName);
  if (startIdx === -1) return [];
  const arrOpen = text.indexOf('[', startIdx);
  if (arrOpen === -1) return [];
  let i = arrOpen + 1;
  const len = text.length;
  const objects = [];
  while (i < len) {
    // skip whitespace
    while (i < len && /[\s,]/.test(text[i])) i++;
    if (i >= len) break;
    if (text[i] === ']') break;
    if (text[i] !== '{') {
      // skip tokens until next object or end
      i++;
      continue;
    }
    // object parsing
    let depth = 0;
    const objStart = i;
    while (i < len) {
      const ch = text[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const objText = text.slice(objStart, i + 1);
          objects.push(objText);
          i++;
          break;
        }
      }
      i++;
    }
  }
  return objects;
}

function parseRequirementObjects(text) {
  const objs = extractTopLevelObjectsFromArray(text, 'initialRequirements');
  const parsed = objs.map((obj) => {
    const idMatch = obj.match(/id:\s*['"]([^'"]+)['"]/);
    const reqMatch = obj.match(/req:\s*([`'"])([\s\S]*?)\1/);
    const typeMatch = obj.match(/type:\s*['"]([^'"]+)['"]/);
    const outcomeMatch = obj.match(/outcome:\s*([`'"])([\s\S]*?)\1/);
    return {
      id: idMatch ? idMatch[1] : undefined,
      req: reqMatch ? reqMatch[2].replace(/\n\s+/g, ' ').trim() : '',
      type: typeMatch ? typeMatch[1] : undefined,
      outcome: outcomeMatch ? outcomeMatch[2].replace(/\n\s+/g, ' ').trim() : '',
    };
  });
  return parsed.filter((p) => p.id);
}


// Mapping rules (loose matching)
const mappingRules = [
  {
    name: 'sox',
    keywords: ['audit', 'sox', 'review', 'approval', 'attest', 'certif', 'evidence', 'control'],
    controls: ['SOX-ITGC-01', 'SOX-ITGC-02', 'SOX-ITGC-04'],
  },
  {
    name: 'nist',
    keywords: ['access', 'authentication', 'authorization', 'security', 'privilege', 'identity'],
    controls: ['AC-2', 'AC-3', 'AC-5', 'AC-6', 'IA-2'],
  },
  {
    name: 'iso',
    keywords: ['policy', 'procedure', 'governance', 'manage', 'control', 'document'],
    controls: ['A.9.1.1', 'A.9.1.2', 'A.9.2.1', 'A.9.2.2'],
  },
  {
    name: 'cobit',
    keywords: ['process', 'workflow', 'lifecycle', 'request', 'provisioning', 'deprovisioning'],
    controls: ['DSS05.04', 'DSS05.05', 'APO13.01'],
  },
];

function main() {
  const reqText = fs.readFileSync(reqPath, 'utf8');
  const frameworksText = fs.readFileSync(frameworksPath, 'utf8');
  const requirements = parseRequirementObjects(reqText);
  // Parse frameworks by extracting top-level objects and evaluating each object literal
  const fwObjs = extractTopLevelObjectsFromArray(frameworksText, 'initialFrameworks');
  const frameworks = fwObjs.map((objText) => {
    try {
      return new Function('return ' + objText)();
    } catch (e) {
      console.error('Failed to parse framework object:', e);
      return null;
    }
  }).filter(Boolean);

  const mappedReqIds = new Set();
  frameworks.forEach((fw) => {
    (fw.controls || []).forEach((c) => {
      (c.requirements || []).forEach((r) => mappedReqIds.add(r));
    });
  });

  const complianceKeywords = ['audit', 'approval', 'review', 'certif', 'attest', 'compliance', 'sox', 'control'];

  const unmapped = requirements.filter((req) => {
    if (mappedReqIds.has(req.id)) return false;
    if (!(req.type === 'Capability' || req.type === 'IGA Functional')) return false;
    const text = `${req.req || ''} ${req.outcome || ''}`.toLowerCase();
    return complianceKeywords.some((k) => text.includes(k));
  });

  console.log('Unmapped compliance requirements:', unmapped.length);

  let applied = 0;

  unmapped.forEach((req) => {
    const text = `${req.req || ''} ${req.outcome || ''}`.toLowerCase();
    const candidates = [];

    frameworks.forEach((fw, fi) => {
      const fwName = (fw.name || '').toLowerCase();
      const rule = mappingRules.find((r) => fwName.includes(r.name));
      if (!rule) return;
      const matchCount = rule.keywords.filter((k) => text.includes(k)).length;
      if (matchCount <= 0) return;
      rule.controls.forEach((ctrlId) => {
        const control = (fw.controls || []).find((c) => (c.controlId || c.id) === ctrlId || c.controlId === ctrlId);
        if (control) {
          const score = Math.min(100, Math.round((matchCount / rule.keywords.length) * 100));
          candidates.push({ fi, controlId: control.id, score });
        }
      });
    });

    candidates.sort((a, b) => b.score - a.score);
    if (candidates.length > 0) {
      const top = candidates[0];
      const fw = frameworks[top.fi];
      const ctrl = fw.controls.find((c) => c.id === top.controlId);
      if (ctrl) {
        ctrl.requirements = ctrl.requirements || [];
        if (!ctrl.requirements.includes(req.id)) {
          ctrl.requirements.push(req.id);
          applied++;
          console.log(`Mapped ${req.id} -> ${fw.name} / ${ctrl.controlId || ctrl.id} (${top.score}%)`);
        }
      }
    } else {
      // fallback: try any mappingRules keyword match and attach to first matching control found
      for (const rule of mappingRules) {
        const matchCount = rule.keywords.filter((k) => text.includes(k)).length;
        if (matchCount <= 0) continue;
        let found = false;
        for (const fw of frameworks) {
          const ctrl = (fw.controls || []).find((c) => rule.controls.includes(c.controlId));
          if (ctrl) {
            ctrl.requirements = ctrl.requirements || [];
            if (!ctrl.requirements.includes(req.id)) {
              ctrl.requirements.push(req.id);
              applied++;
              console.log(`Mapped ${req.id} -> ${fw.name} / ${ctrl.controlId || ctrl.id} (fallback)`);
            }
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
  });

  console.log(`Applied ${applied} mappings`);
  writeFrameworks(frameworksPath, frameworks);
}

function writeFrameworks(filePath, frameworks) {
  const out = `import { Framework } from "../types/framework";\n\nexport const initialFrameworks: Framework[] = ${JSON.stringify(frameworks, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Wrote updated frameworks to ${filePath}`);
}

main();
