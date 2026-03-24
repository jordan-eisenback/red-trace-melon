// Simple static analyzer adapter — performs local repository checks and returns structured findings
const fs = require('fs');
const path = require('path');

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

function listFiles(dir, skip = []) {
  const out = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      const rel = path.relative(process.cwd(), p);
      if (skip.some(s => rel.startsWith(s))) continue;
      if (e.isDirectory()) out.push(...listFiles(p, skip));
      else out.push(p);
    }
  } catch (e) {}
  return out;
}

module.exports = {
  run: async function ({ system = '', user = '' } = {}, opts = {}) {
    const root = process.cwd();
    const skip = ['node_modules', '.git', 'storage', 'dist', 'build', 'scripts/backups'];

    // Basic checks
    const findings = [];

    // package.json checks
    const pkg = readJSON(path.join(root, 'package.json')) || {};
    if (!pkg.scripts || !pkg.scripts.test) {
      findings.push({ type: 'test', file: 'package.json', severity: 'high', message: 'No test script defined in package.json' });
    } else {
      findings.push({ type: 'test', file: 'package.json', severity: 'low', message: `Found test script: ${pkg.scripts.test}` });
    }

    if (!pkg.name) {
      findings.push({ type: 'docs', file: 'package.json', severity: 'medium', message: 'package.json missing name field' });
    }

    // CI presence
    const hasGithubActions = fs.existsSync(path.join(root, '.github', 'workflows'));
    const hasCIFile = hasGithubActions || fs.existsSync(path.join(root, '.gitlab-ci.yml')) || fs.existsSync(path.join(root, 'azure-pipelines.yml'));
    if (!hasCIFile) findings.push({ type: 'infra', file: null, severity: 'medium', message: 'No CI workflows detected (.github/workflows or .gitlab-ci.yml)' });
    else findings.push({ type: 'infra', file: null, severity: 'low', message: 'CI workflow appears present' });

    // Search for TODO/FIXME and large files
    const files = listFiles(root, skip);
    let todoCount = 0;
    for (const f of files) {
      try {
        const stat = fs.statSync(f);
        if (stat.size > 200 * 1024) {
          findings.push({ type: 'style', file: path.relative(root, f), severity: 'low', message: `Large file (${Math.round(stat.size/1024)} KB)` });
        }
        const ext = path.extname(f).toLowerCase();
        if (['.js', '.ts', '.tsx', '.jsx', '.md'].includes(ext)) {
          const txt = fs.readFileSync(f, 'utf8');
          const reTodos = txt.match(/\b(TODO|FIXME)[:\-]?\s*(.*)/g);
          if (reTodos && reTodos.length) {
            todoCount += reTodos.length;
            findings.push({ type: 'techdebt', file: path.relative(root, f), severity: 'low', message: `${reTodos.length} TODO/FIXME occurrences` });
          }
          // Find console.log usage in JS/TS
          if (ext === '.js' || ext === '.ts' || ext === '.tsx' || ext === '.jsx') {
            if (/console\.log\(/.test(txt)) findings.push({ type: 'style', file: path.relative(root, f), severity: 'low', message: 'console.log usage found' });
          }
        }
      } catch (e) { /* ignore */ }
    }

    if (todoCount > 0) findings.push({ type: 'techdebt', file: null, severity: 'medium', message: `Repository contains ${todoCount} TODO/FIXME markers` });

    // Tests coverage heuristic: count test files
    const testFiles = files.filter(f => /__tests__|\.test\./.test(f));
    if (testFiles.length === 0) {
      findings.push({ type: 'test', file: null, severity: 'high', message: 'No test files detected (no __tests__ or .test.* files)' });
    } else if (testFiles.length < 3) {
      findings.push({ type: 'test', file: null, severity: 'medium', message: `Low test file count: ${testFiles.length}` });
    } else {
      findings.push({ type: 'test', file: null, severity: 'low', message: `Detected ${testFiles.length} test files` });
    }

    // Linting
    const hasEslint = (pkg.devDependencies && pkg.devDependencies.eslint) || (pkg.dependencies && pkg.dependencies.eslint) || fs.existsSync(path.join(root, '.eslintrc')) || fs.existsSync(path.join(root, '.eslintrc.js'));
    if (!hasEslint) findings.push({ type: 'style', file: null, severity: 'medium', message: 'No ESLint configuration or eslint dependency detected' });
    else findings.push({ type: 'style', file: null, severity: 'low', message: 'ESLint appears configured' });

    // Report on package-lock and pnpm/yarn presence
    const lockfiles = [];
    if (fs.existsSync(path.join(root, 'package-lock.json'))) lockfiles.push('npm (package-lock.json)');
    if (fs.existsSync(path.join(root, 'yarn.lock'))) lockfiles.push('yarn (yarn.lock)');
    if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) lockfiles.push('pnpm (pnpm-lock.yaml)');
    if (lockfiles.length === 0) findings.push({ type: 'infra', file: null, severity: 'low', message: 'No lockfile found (package-lock.json/yarn.lock/pnpm-lock.yaml)' });
    else findings.push({ type: 'infra', file: null, severity: 'low', message: `Lockfiles present: ${lockfiles.join(', ')}` });

    // Assemble summary
    const summary = `Static analysis completed. ${findings.length} findings.`;

    const output = { summary, findings };
    return { text: JSON.stringify(output), meta: { analyzer: true } };
  }
};
