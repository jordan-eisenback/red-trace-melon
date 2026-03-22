const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const frameworksPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');

function parseRequirementObjects(text) {
  // Extract the array text for initialRequirements and evaluate it as JS (safer than strict JSON for TS files)
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
    console.warn('JS eval failed for requirements array - falling back to empty list', e && e.message);
    return [];
  }
}

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

function parseFrameworkObjects(text) {
  // frameworks file is also written as a JSON-like array by other scripts; attempt JSON.parse
  const marker = 'initialFrameworks';
  const startIdx = text.indexOf(marker);
  if (startIdx === -1) return [];
  const arrOpen = text.indexOf('[', startIdx);
  const arrClose = text.lastIndexOf(']');
  if (arrOpen === -1 || arrClose === -1 || arrClose <= arrOpen) return [];
  const arrText = text.slice(arrOpen, arrClose + 1);
  try {
    return JSON.parse(arrText);
  } catch (e) {
    // fallback to evaluating objects if JSON fails
    const objs = extractTopLevelObjectsFromArray(text, 'initialFrameworks');
    const frameworks = objs.map((objText) => {
      try {
        return new Function('return ' + objText)();
      } catch (err) {
        console.error('Failed to parse framework object:', err);
        return null;
      }
    }).filter(Boolean);
    return frameworks;
  }
}

function writeFrameworks(filePath, frameworks) {
  const out = `import { Framework } from "../types/framework";\n\nexport const initialFrameworks: Framework[] = ${JSON.stringify(frameworks, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Wrote updated frameworks to ${filePath}`);
}

function main() {
  const reqText = fs.readFileSync(reqPath, 'utf8');
  const frameworksText = fs.readFileSync(frameworksPath, 'utf8');
  const requirements = parseRequirementObjects(reqText);
  const frameworks = parseFrameworkObjects(frameworksText);

  const mappedReqIds = new Set();
  frameworks.forEach((fw) => {
    (fw.controls || []).forEach((c) => {
      (c.requirements || []).forEach((r) => mappedReqIds.add(r));
    });
  });

  const unmapped = requirements.filter((r) => !mappedReqIds.has(r.id));
  console.log(`Total requirements: ${requirements.length}, already mapped: ${mappedReqIds.size}, unmapped: ${unmapped.length}`);

  // Directory-specific keywords and target control heuristics
  const directoryKeywords = ['directory', 'group', 'groups', 'membership', 'memberships', 'provision', 'provisioning', 'ldap', 'ad ', 'entra', 'account', 'accounts', 'directory event', 'out-of-band', 'out of band'];

  let applied = 0;

  unmapped.forEach((req) => {
    const text = `${req.req || ''} ${req.outcome || ''}`.toLowerCase();
    const hasDir = directoryKeywords.some((k) => text.includes(k));
    if (!hasDir) return;

    // find Directory Services framework
    const fw = frameworks.find((f) => (f.id || '').toLowerCase().includes('dir') || (f.name || '').toLowerCase().includes('directory'));
    if (!fw) return;

    // score candidate controls by keyword matches against control title/description
    const candidates = (fw.controls || []).map((c) => {
      const combined = `${c.title || ''} ${c.description || ''}`.toLowerCase();
      const score = directoryKeywords.reduce((acc, k) => acc + (combined.includes(k) ? 1 : 0), 0);
      // boost matches where control id or notes reference the legacy DIR tokens matching words in req id
      const idBoost = ((c.controlId || c.id || '').toLowerCase().includes('dir') ? 1 : 0);
      return { control: c, score: score + idBoost };
    }).filter((x) => x.score > 0);

    // fallback: use simple heuristics based on verbs
    if (candidates.length === 0) {
      // provision -> DIR-CTRL-PRV-2.1
      if (/provision|provisioning|activate|assign/.test(text)) {
        const c = fw.controls.find((c) => (c.id || '').includes('PRV') || (c.controlId || '').includes('2.1'));
        if (c) candidates.push({ control: c, score: 1 });
      }
      // drift/out-of-band -> DIR-CTRL-DRIFT-3.1
      if (/out-of-band|drift|out of band|detect/.test(text)) {
        const c = fw.controls.find((c) => (c.id || '').includes('DRIFT') || (c.controlId || '').includes('3.1'));
        if (c) candidates.push({ control: c, score: 1 });
      }
      // logging -> DIR-CTRL-LOG-6.1
      if (/log|logging|audit|event/.test(text)) {
        const c = fw.controls.find((c) => (c.id || '').includes('LOG') || (c.controlId || '').includes('6.1'));
        if (c) candidates.push({ control: c, score: 1 });
      }
      // integration -> DIR-CTRL-INT-1
      if (/integrat|ingest|sync|synchroniz/.test(text)) {
        const c = fw.controls.find((c) => (c.id || '').includes('INT') || (c.controlId || '').includes('INT-1') || (c.controlId || '').includes('INT'));
        if (c) candidates.push({ control: c, score: 1 });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    if (candidates.length > 0) {
      const top = candidates[0].control;
      top.requirements = top.requirements || [];
      if (!top.requirements.includes(req.id)) {
        top.requirements.push(req.id);
        applied++;
        console.log(`Mapped ${req.id} -> ${fw.name} / ${top.controlId || top.id} (heuristic)`);
      }
    }
  });

  console.log(`Applied ${applied} directory mappings`);
  if (applied > 0) writeFrameworks(frameworksPath, frameworks);

  // --- Additional domain mapping: SOX / NIST / ISO / COBIT ---
  const mappingRules = [
    {
      name: 'sox',
      keywords: ['audit', 'sox', 'review', 'approval', 'attest', 'certif', 'evidence', 'control'],
      controls: ['SOX-ITGC-01', 'SOX-ITGC-02', 'SOX-ITGC-04']
    },
    {
      name: 'nist',
      keywords: ['access', 'authentication', 'authorization', 'security', 'privilege', 'identity'],
      controls: ['AC-2', 'AC-3', 'AC-5', 'AC-6', 'IA-2']
    },
    {
      name: 'iso',
      keywords: ['policy', 'procedure', 'governance', 'manage', 'control', 'document'],
      controls: ['A.9.1.1', 'A.9.1.2', 'A.9.2.1', 'A.9.2.2']
    },
    {
      name: 'cobit',
      keywords: ['process', 'workflow', 'lifecycle', 'request', 'provisioning', 'deprovisioning'],
      controls: ['DSS05.04', 'DSS05.05', 'APO13.01']
    }
  ];

  // Ensure frameworks exist for these domains (create minimal frameworks if absent)
  mappingRules.forEach((rule) => {
    const exists = frameworks.find((f) => (f.name || '').toLowerCase().includes(rule.name));
    if (!exists) {
      const fwId = rule.name.toUpperCase() + '-FRAMEWORK';
      const newFw = {
        id: fwId,
        name: rule.name.toUpperCase() + ' Controls',
        version: '1.0',
        description: `${rule.name.toUpperCase()} control mappings generated by heuristic mapper`,
        category: 'Compliance',
        isActive: true,
        effectiveDate: new Date().toISOString().slice(0,10),
        notes: 'Auto-generated minimal framework for heuristic mapping',
        controls: rule.controls.map((ctrl, idx) => ({
          id: `${fwId}-C-${idx+1}`,
          frameworkId: fwId,
          controlId: ctrl,
          title: `${ctrl} (auto)`,
          description: `Auto-generated control stub for ${ctrl}`,
          requirements: []
        }))
      };
      frameworks.push(newFw);
    }
  });

  // Second pass: map unmapped requirements to domain frameworks using mappingRules
  let domainApplied = 0;
  unmapped.forEach((req) => {
    const text = `${req.req || ''} ${req.outcome || ''}`.toLowerCase();
    const candidates = [];
    mappingRules.forEach((rule) => {
      const matchCount = rule.keywords.filter((k) => text.includes(k)).length;
      if (matchCount <= 0) return;
      // find frameworks whose name includes the rule name
      frameworks.forEach((fw, fi) => {
        if (!((fw.name || '').toLowerCase().includes(rule.name))) return;
        // find controls in the framework that match the rule.controls
        rule.controls.forEach((ctrlId) => {
          const control = (fw.controls || []).find((c) => (c.controlId || c.id) === ctrlId || (c.controlId || '').toLowerCase() === ctrlId.toLowerCase());
          if (control) {
            const score = Math.min(100, Math.round((matchCount / rule.keywords.length) * 100));
            candidates.push({ fi, controlId: control.id, score, rule: rule.name });
          }
        });
      });
    });

    candidates.sort((a,b)=>b.score-a.score);
    if (candidates.length>0) {
      const top = candidates[0];
      const fw = frameworks[top.fi];
      const ctrl = fw.controls.find((c)=>c.id===top.controlId);
      if (ctrl) {
        ctrl.requirements = ctrl.requirements || [];
        if (!ctrl.requirements.includes(req.id)) {
          ctrl.requirements.push(req.id);
          domainApplied++;
          console.log(`Mapped ${req.id} -> ${fw.name} / ${ctrl.controlId || ctrl.id} (domain:${top.rule} ${top.score}%)`);
        }
      }
    }
  });

  console.log(`Applied ${domainApplied} domain mappings`);
  if (domainApplied>0) writeFrameworks(frameworksPath, frameworks);
}

main();
