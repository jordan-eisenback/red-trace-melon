import fs from 'fs';
import path from 'path';

// This script loads the project's TypeScript data files using runtime TypeScript transpile via ts-node (run with npx ts-node)
// It applies the same heuristic mapping rules as the BulkMappingTool and writes back an updated
// `src/app/data/initial-frameworks.ts` file containing the updated mappings.

// Mapping rules (keywords -> candidate control IDs)
const mappingRules: Array<{ name: string; keywords: string[]; controls: string[] }> = [
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

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const reqPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
  const frameworksPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');

  // Dynamically import TS modules using ts-node runtime when running via npx ts-node
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const reqModule = await import(reqPath);
  const frameworksModule = await import(frameworksPath);

  const requirements = reqModule.initialRequirements as any[];
  const frameworks = frameworksModule.initialFrameworks as any[];

  const mappedReqIds = new Set<string>();
  frameworks.forEach((framework) => {
    framework.controls.forEach((control) => {
      (control.requirements || []).forEach((r: string) => mappedReqIds.add(r));
    });
  });

  // Compliance keywords
  const complianceKeywords = ['audit', 'approval', 'review', 'certif', 'attest', 'compliance', 'sox', 'control'];

  const unmappedRequirements = requirements.filter((req) => {
    if (mappedReqIds.has(req.id)) return false;
    if (!(req.type === 'Capability' || req.type === 'IGA Functional')) return false;
    const text = `${req.req || ''} ${req.outcome || ''}`.toLowerCase();
    return complianceKeywords.some((k) => text.includes(k));
  });

  console.log(`Found ${unmappedRequirements.length} unmapped compliance requirements`);

  let applied = 0;

  unmappedRequirements.forEach((req) => {
    const reqText = `${req.req || ''} ${req.outcome || ''}`.toLowerCase();

    // For each framework, compute match count against mappingRules
    const candidates: Array<{ frameworkIndex: number; controlId: string; score: number }> = [];

    frameworks.forEach((fw, fi) => {
      const fwName = (fw.name || '').toLowerCase();
      // find best matching mapping rule by name inclusion
      const rule = mappingRules.find((r) => fwName.includes(r.name));
      if (!rule) return;
      const matchCount = rule.keywords.filter((k) => reqText.includes(k)).length;
      if (matchCount <= 0) return;

      rule.controls.forEach((ctrl) => {
        // find control by controlId or id
        const control = fw.controls.find((c: any) => (c.controlId || c.id || '').toString() === ctrl || (c.id || '').toString() === ctrl);
        if (control) {
          const score = Math.min(100, Math.round((matchCount / rule.keywords.length) * 100));
          candidates.push({ frameworkIndex: fi, controlId: control.id, score });
        }
      });
    });

    // Sort and pick top candidate
    candidates.sort((a, b) => b.score - a.score);
    if (candidates.length > 0) {
      const top = candidates[0];
      const fw = frameworks[top.frameworkIndex];
      const ctrl = fw.controls.find((c: any) => c.id === top.controlId);
      if (ctrl) {
        ctrl.requirements = ctrl.requirements || [];
        if (!ctrl.requirements.includes(req.id)) {
          ctrl.requirements.push(req.id);
          applied++;
          console.log(`Mapped ${req.id} -> ${fw.name} / ${ctrl.controlId} (${top.score}%)`);
        }
      }
    } else {
      // Try broader keyword match across mappingRules if no framework name matched
      mappingRules.forEach((rule) => {
        const matchCount = rule.keywords.filter((k) => reqText.includes(k)).length;
        if (matchCount <= 0) return;
        // find framework that contains any of the rule.controls
        for (const fw of frameworks) {
          const ctrl = fw.controls.find((c: any) => rule.controls.includes(c.controlId));
          if (ctrl) {
            ctrl.requirements = ctrl.requirements || [];
            if (!ctrl.requirements.includes(req.id)) {
              ctrl.requirements.push(req.id);
              applied++;
              console.log(`Mapped ${req.id} -> ${fw.name} / ${ctrl.controlId} (fallback)`);
              return;
            }
          }
        }
      });
    }
  });

  console.log(`Applied ${applied} heuristic mappings`);

  // Write updated frameworks back to file (overwrite)
  const out = `import { Framework } from "../types/framework";\n\nexport const initialFrameworks: Framework[] = ${JSON.stringify(frameworks, null, 2)};\n`;
  fs.writeFileSync(frameworksPath, out, 'utf-8');
  console.log(`Wrote updated frameworks to ${frameworksPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
