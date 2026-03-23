const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const fwFile = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');

function parseRequirements(text) {
  const m = text.match(/export\s+const\s+initialRequirements[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
  if (!m) return [];
  const arrText = m[1];
  try {
    return JSON.parse(arrText);
  } catch (e) {
    // fallback: attempt to convert single-quoted to double
    const dbl = arrText.replace(/([A-Za-z0-9_]+)\s*:/g, '"$1":');
    try { return JSON.parse(dbl); } catch (e2) { return []; }
  }
}

function parseFrameworkMappedReqs(text) {
  // find all quoted requirement ids inside requirements: ["RBAC-...", ...]
  const reqs = new Set();
  const reqArrayRegex = /requirements\s*:\s*\[([^\]]*)\]/g;
  let match;
  while ((match = reqArrayRegex.exec(text))) {
    const inner = match[1];
    const ids = inner.match(/['\"]([A-Z0-9-]+)['\"]/g) || [];
    ids.forEach((s) => {
      const id = s.replace(/['\"]/g, '');
      if (id) reqs.add(id);
    });
  }
  return reqs;
}

function computeIssues(requirements, frameworks) {
  const issues = [];
  const reqMap = new Map(requirements.map((r) => [r.id, r]));

  const mappedReqIds = new Set();
  frameworks.forEach((f) => {
    (f.controls || []).forEach((c) => {
      (c.requirements || []).forEach((rid) => mappedReqIds.add(rid));
    });
  });

  requirements.forEach((req) => {
    // missing owner
    if (!req.owner || req.owner.trim() === '' || req.owner === 'Unassigned') {
      issues.push({ id: `missing-owner-${req.id}`, requirementId: req.id, severity: 'error', category: 'Missing Data', message: `${req.id}: Missing owner assignment` });
    }
    // missing outcome
    if (!req.outcome || req.outcome.trim() === '' || req.outcome === 'TBD') {
      issues.push({ id: `missing-outcome-${req.id}`, requirementId: req.id, severity: 'warning', category: 'Missing Data', message: `${req.id}: Missing expected outcome` });
    }
    // vague content
    const vagueWords = ['TBD', 'TODO', 'placeholder', 'to be determined', 'update this'];
    const lc = (req.req || '').toLowerCase();
    if (vagueWords.some((w) => lc.includes(w.toLowerCase())) || (req.outcome || '').toLowerCase().includes('tbd')) {
      issues.push({ id: `vague-content-${req.id}`, requirementId: req.id, severity: 'warning', category: 'Quality Issues', message: `${req.id}: Contains placeholder or vague content` });
    }
    // orphaned parent
    if (req.parent && !reqMap.has(req.parent)) {
      issues.push({ id: `orphaned-parent-${req.id}`, requirementId: req.id, severity: 'error', category: 'Broken Relationships', message: `${req.id}: References non-existent parent "${req.parent}"` });
    }
    // short description
    if ((req.req || '').length < 20) {
      issues.push({ id: `vague-desc-${req.id}`, requirementId: req.id, severity: 'warning', category: 'Quality Issues', message: `${req.id}: Description is too brief (${(req.req||'').length} chars)` });
    }
    // long description
    if ((req.req || '').length > 300) {
      issues.push({ id: `long-desc-${req.id}`, requirementId: req.id, severity: 'info', category: 'Quality Issues', message: `${req.id}: Description is very long (${(req.req||'').length} chars)` });
    }
    // missing framework mapping for capability/IGA functional
    if ((req.type === 'Capability' || req.type === 'IGA Functional') && !mappedReqIds.has(req.id)) {
      const complianceKeywords = ['audit', 'approval', 'review', 'certif', 'attest', 'compliance', 'sox', 'control'];
      const has = (req.req || '').toLowerCase();
      if (complianceKeywords.some((k) => has.includes(k))) {
        issues.push({ id: `no-mapping-${req.id}`, requirementId: req.id, severity: 'warning', category: 'Traceability', message: `${req.id}: Compliance-related requirement not mapped to framework controls` });
      }
    }
    // empty category
    if (req.type === 'Capability Category') {
      const hasChildren = requirements.some((r) => r.parent === req.id);
      if (!hasChildren) {
        issues.push({ id: `empty-category-${req.id}`, requirementId: req.id, severity: 'warning', category: 'Structural Issues', message: `${req.id}: Category has no child requirements` });
      }
    }
    // weak outcome
    if (req.outcome) {
      const weakStarts = ['the ', 'will ', 'should ', 'may ', 'can '];
      if (weakStarts.some((s) => req.outcome.toLowerCase().startsWith(s))) {
        issues.push({ id: `weak-outcome-${req.id}`, requirementId: req.id, severity: 'info', category: 'Quality Issues', message: `${req.id}: Outcome statement could be more direct` });
      }
    }
    // placeholder owners
    const placeholderOwners = ['tbd', 'unassigned', 'unknown', 'todo', 'n/a'];
    if ((req.owner || '').toLowerCase && placeholderOwners.some((ph) => (req.owner||'').toLowerCase().includes(ph))) {
      issues.push({ id: `placeholder-owner-${req.id}`, requirementId: req.id, severity: 'warning', category: 'Missing Data', message: `${req.id}: Owner appears to be a placeholder` });
    }
  });

  return issues;
}

function main() {
  const reqText = fs.existsSync(reqFile) ? fs.readFileSync(reqFile, 'utf8') : '';
  const fwText = fs.existsSync(fwFile) ? fs.readFileSync(fwFile, 'utf8') : '';
  const requirements = parseRequirements(reqText);
  const mappedReqs = parseFrameworkMappedReqs(fwText);

  // Build minimal frameworks array for computeIssues
  const frameworks = [];
  if (fwText) {
    // simple parser: find framework blocks by 'export const initialFrameworks' and attempt to eval by replacing TS with JSON-ish
    try {
      // extract array literal
      const m = fwText.match(/export\s+const\s+initialFrameworks[\s\S]*?=\s*(\[[\s\S]*?\]);/m);
      if (m) {
        // quick heuristic convert to JSON: quote keys
        const arr = m[1].replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
        const parsed = JSON.parse(arr);
        frameworks.push(...parsed);
      }
    } catch (e) {
      // fallback: build frameworks from parsed mappedReqs
      frameworks.push({ id: 'DIR-SERVICES', controls: [{ requirements: Array.from(mappedReqs) }] });
    }
  }

  const issues = computeIssues(requirements, frameworks);
  console.log(JSON.stringify({ requirements: requirements.length, frameworks: frameworks.length, issuesCount: issues.length, issues }, null, 2));
}

main();
