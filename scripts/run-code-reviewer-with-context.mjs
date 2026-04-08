/**
 * run-code-reviewer-with-context.mjs
 *
 * Wrapper that auto-collects a repository snapshot and injects it as the
 * {{goal}} context variable for the code-reviewer-v1 agent.
 *
 * Satisfies issue #63 AC: "npm run agent:review -- --goal 'full repo review'"
 * works end-to-end with repo context auto-populated.
 *
 * Usage:
 *   npm run agent:review                                   (default goal)
 *   npm run agent:review -- --goal "focus on security"
 *   npm run agent:review -- --goal "..." --no-git          (skip git log)
 *   npm run agent:review -- --dry-run                      (print prompt only)
 */

import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// ── Parse args ─────────────────────────────────────────────────────────────
const rawArgs = process.argv.slice(2);

// Extract --no-git (forwarded to loader, not to run-agent)
const noGit    = rawArgs.includes('--no-git');
const filtered = rawArgs.filter(a => a !== '--no-git');

// Find user-supplied --goal if any
const goalIdx      = filtered.indexOf('--goal');
const userGoal     = goalIdx >= 0 ? filtered[goalIdx + 1] : null;
const hasGoal      = goalIdx >= 0;

// ── Load repo context ──────────────────────────────────────────────────────
const loaderPath = path.join(__dirname, 'load-repo-context.cjs');
const loaderArgs = [loaderPath, ...(noGit ? ['--no-git'] : [])];

let repoContext;
try {
  repoContext = execFileSync(process.execPath, loaderArgs, {
    cwd: ROOT, encoding: 'utf8',
  }).trim();
} catch (e) {
  process.stderr.write(`ERROR loading repo context: ${e.message}\n`);
  process.exit(1);
}

// ── Build goal string (repo context + optional user goal) ──────────────────
const baseGoal   = userGoal ?? 'full repo review — identify architecture, security, test, and style issues';
const goalWithCtx = `${baseGoal}\n\n${repoContext}`;

// ── Build args for run-agent.mjs ───────────────────────────────────────────
// Remove --goal + its value from filtered args; we'll re-inject combined goal.
const passthroughArgs = [...filtered];
if (hasGoal) passthroughArgs.splice(goalIdx, 2);

const agentArgs = [
  path.join(__dirname, 'run-agent.mjs'),
  'code-reviewer-v1',
  '--adapter', 'github-models-adapter',
  '--confirm',
  '--goal', goalWithCtx,
  ...passthroughArgs,
];

// ── Invoke ─────────────────────────────────────────────────────────────────
try {
  execFileSync(process.execPath, agentArgs, {
    cwd: ROOT, stdio: 'inherit', encoding: 'utf8',
  });
} catch (e) {
  process.exit(e.status ?? 1);
}
