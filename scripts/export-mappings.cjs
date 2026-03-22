const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const reqPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-requirements.ts');
const fwPath = path.join(repoRoot, 'src', 'app', 'data', 'initial-frameworks.ts');
const outPath = path.join(repoRoot, 'scripts', 'mappings.csv');

function extractArray(text, marker) {
  const start = text.indexOf(marker);
  if (start === -1) return [];
  const open = text.indexOf('[', start);
  const close = text.lastIndexOf(']');
  if (open === -1 || close === -1 || close <= open) return [];
  const arrText = text.slice(open, close + 1);
  try {
    return new Function('return ' + arrText)();
  } catch (e) {
    console.error('Failed to eval array for', marker, e && e.message);
    return [];
  }
}

const reqText = fs.readFileSync(reqPath, 'utf8');
const fwText = fs.readFileSync(fwPath, 'utf8');
const reqs = extractArray(reqText, 'initialRequirements');
const fws = extractArray(fwText, 'initialFrameworks');

// build mapping: requirementId -> list of {fwId, fwName, controlId, controlTitle}
const mappings = {};
fws.forEach((fw) => {
  (fw.controls || []).forEach((c) => {
    (c.requirements || []).forEach((rid) => {
      mappings[rid] = mappings[rid] || [];
      mappings[rid].push({ frameworkId: fw.id || '', frameworkName: fw.name || '', controlId: c.controlId || c.id || '', controlTitle: c.title || '' });
    });
  });
});

// produce CSV rows
const rows = [];
rows.push(['requirementId','requirementText','requirementType','frameworkId','frameworkName','controlId','controlTitle'].join(','));
reqs.forEach((r) => {
  const txt = (r.req || '').replace(/\r?\n/g, ' ').replace(/"/g, '""');
  const short = txt.length > 200 ? txt.slice(0,200) + '...' : txt;
  const type = r.type || '';
  const maps = mappings[r.id];
  if (!maps || maps.length === 0) {
    rows.push([r.id, `"${short}"`, type, '', '', '', ''].join(','));
  } else {
    maps.forEach((m) => {
      rows.push([r.id, `"${short}"`, type, m.frameworkId, `"${(m.frameworkName||'').replace(/"/g,'""')}"`, m.controlId, `"${(m.controlTitle||'').replace(/"/g,'""')}"`].join(','));
    });
  }
});

fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
console.log('Wrote', outPath, 'rows:', rows.length - 1);
