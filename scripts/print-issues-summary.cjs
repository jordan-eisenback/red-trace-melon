const fs = require('fs');
const p = 'scripts/issues-restored.json';
if (!fs.existsSync(p)) { console.error('No snapshot found at', p); process.exit(1); }
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
const issues = Array.isArray(j.issues) ? j.issues : (j.issuesList || j.issues || []);
console.log(JSON.stringify({ requirements: j.requirements || null, frameworks: j.frameworks || null, issuesCount: issues.length || j.issuesCount || 0 }, null, 2));
console.log('--- Top 12 issues ---');
console.log(JSON.stringify(issues.slice(0, 12), null, 2));
