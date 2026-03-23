const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');

function extractTopLevelObjectsFromArray(text, exportName) {
  const startIdx = text.indexOf(exportName);
  if (startIdx === -1) return [];
  const arrOpen = text.indexOf('[', startIdx);
  if (arrOpen === -1) return [];
  let i = arrOpen + 1;
  const len = text.length;
  const objects = [];
  while (i < len) {
    while (i < len && /[\s,]/.test(text[i])) i++;
    if (i >= len) break;
    if (text[i] === ']') break;
    if (text[i] !== '{') { i++; continue; }
    let depth = 0; const objStart = i;
    while (i < len) {
      const ch = text[i];
      if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) { const objText = text.slice(objStart, i+1); objects.push(objText); i++; break; } }
      i++;
    }
  }
  return objects;
}

function parseRequirementObjects(text) {
  const objs = extractTopLevelObjectsFromArray(text, 'initialRequirements');
  // If no objects found (file uses JSON-style quoted keys), try JSON parse fallback
  if (objs.length === 0) {
    const m = text.match(/export\s+const\s+initialRequirements[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
    if (m) {
      try {
        const arr = JSON.parse(m[1]);
        return arr.map((o) => ({
          id: o.id,
          req: (o.req || '').replace(/\n\s+/g, ' ').trim(),
          type: o.type,
          outcome: o.outcome || '',
          owner: o.owner || '',
          parent: o.parent || null,
          _raw: null,
        })).filter((p) => p.id);
      } catch (e) {
        // fall through to original parsing
      }
    }
  }
  const parsed = objs.map((obj) => {
    const idMatch = obj.match(/id:\s*['"]([^'"]+)['"]/);
    const reqMatch = obj.match(/req:\s*([`'"])([\s\S]*?)\1/);
    const typeMatch = obj.match(/type:\s*['"]([^'"]+)['"]/);
    const outcomeMatch = obj.match(/outcome:\s*([`'"])([\s\S]*?)\1/);
    const ownerMatch = obj.match(/owner:\s*['"]([^'"]*)['"]/);
    const parentMatch = obj.match(/parent:\s*([^,\n}]+)/);
    return {
      id: idMatch ? idMatch[1] : undefined,
      req: reqMatch ? reqMatch[2].replace(/\n\s+/g, ' ').trim() : '',
      type: typeMatch ? typeMatch[1] : undefined,
      outcome: outcomeMatch ? outcomeMatch[2].replace(/\n\s+/g, ' ').trim() : '',
      owner: ownerMatch ? ownerMatch[1] : '',
      parent: parentMatch ? parentMatch[1].trim().replace(/['"]/g, '') : null,
      // Keep raw object text for serialization fallback
      _raw: obj,
    };
  });
  return parsed.filter((p) => p.id);
}

function writeRequirements(filePath, requirements) {
  const out = `import { Requirement } from "../types/requirement";\n\nexport const initialRequirements: Requirement[] = ${JSON.stringify(requirements, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Wrote ${requirements.length} requirements to ${filePath}`);
}

function autoFix(requirements) {
  const reqIds = new Set(requirements.map((r) => r.id));
  let fixes = 0;

  requirements.forEach((r) => {
    // 1. Missing owner or placeholder
    if (!r.owner || r.owner.trim() === '' || /^(unassigned|tbd|todo|unknown|n\/a)$/i.test(r.owner)) {
      r.owner = 'RBAC Product'; fixes++;
      console.log(`Assigned default owner for ${r.id}`);
    }

    // 2. Missing outcome
    if (!r.outcome || r.outcome.trim() === '' || /^tbd$/i.test(r.outcome)) {
      r.outcome = `Deliver ${String(r.req || '').substring(0, 60).toLowerCase()}...`;
      fixes++; console.log(`Generated outcome for ${r.id}`);
    }

    // 3. Orphaned parent
    if (r.parent && !reqIds.has(r.parent)) {
      r.parent = null; fixes++; console.log(`Removed orphan parent for ${r.id}`);
    }

    // 4. Weak outcome phrasing
    if (r.outcome) {
      const weakStarts = ['the ', 'will ', 'should ', 'may ', 'can '];
      let improved = r.outcome;
      let changed = false;
      weakStarts.forEach((w) => {
        const re = new RegExp('^' + w, 'i');
        if (re.test(improved)) {
          improved = improved.replace(re, ''); changed = true;
        }
      });
      if (changed) {
        improved = improved.charAt(0).toUpperCase() + improved.slice(1);
        r.outcome = improved; fixes++; console.log(`Improved outcome phrasing for ${r.id}`);
      }
    }

    // 6. Missing implementation notes
    if (!r.notes || String(r.notes).trim() === '' || /^n\/a$/i.test(String(r.notes))) {
      // Create a concise implementation note from the requirement and outcome
      const summary = String(r.req || '').replace(/\s+/g, ' ').trim().substring(0, 120);
      const outcome = r.outcome ? ` Outcome: ${String(r.outcome).trim()}.` : '';
      r.notes = `Implementation notes: ${summary}.${outcome} Provide concrete mapping, config, or references.`;
      fixes++; console.log(`Added implementation notes for ${r.id}`);
    }

    // 5. Category -> Capability conversion
    if (r.type === 'Capability Category') {
      const hasChildren = requirements.some((c) => c.parent === r.id);
      if (!hasChildren) {
        r.type = 'Capability'; fixes++; console.log(`Converted ${r.id} to Capability`);
      }
    }
  });

  return fixes;
}

function main() {
  const text = fs.readFileSync(reqPath, 'utf8');
  const requirements = parseRequirementObjects(text);
  console.log(`Parsed ${requirements.length} requirements`);
  const fixes = autoFix(requirements);
  console.log(`Applied ${fixes} auto-fixes`);
  writeRequirements(reqPath, requirements);
}

main();
