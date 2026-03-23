const { execSync } = require('child_process');
const path = require('path');

// Patterns that should NOT be committed
const blocked = [
  /^dist\//,
  /^scripts\/.+\.json$/,
  /^scripts\/.+\.csv$/,
  /^scripts\/.+\.txt$/,
  /^scripts\/backups\//,
];

function getStagedFiles() {
  const out = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

const staged = getStagedFiles();
const violations = staged.filter((f) => blocked.some((re) => re.test(f)));
if (violations.length) {
  console.error('\nCommit blocked: the following generated artifacts are staged:');
  violations.forEach((v) => console.error('  -', v));
  console.error('\nPlease remove these files from the commit (git restore --staged <file>) or update .gitignore.');
  process.exit(1);
}
process.exit(0);
