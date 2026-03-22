const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const frameworksPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');

function loadTsArray(filePath, exportName) {
  const text = fs.readFileSync(filePath, 'utf8');
  // Strip import lines
  let js = text.replace(/import[\s\S]*?;\n/g, '');
  // Replace export declaration with const
  js = js.replace(new RegExp(`export\\s+const\\s+${exportName}[^=]*=`), `const ${exportName} =`);
  // Remove TypeScript type assertions like `: Type[]`
  js = js.replace(/:\s*[A-Za-z0-9_<>\[\]]+/g, '');
  // Ensure trailing export for retrieval
  js += `\n;return ${exportName};`;

  // Use Function to evaluate safely in local scope
  const fn = new Function(js);
  return fn();
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
  const requirements = loadTsArray(reqPath, 'initialRequirements');
  const frameworks = loadTsArray(frameworksPath, 'initialFrameworks');

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
