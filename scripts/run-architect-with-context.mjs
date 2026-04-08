/**
 * run-architect-with-context.mjs
 *
 * Wrapper that auto-loads requirements from initial-requirements.ts as the
 * {{stories}} context variable before invoking the architect-v1 agent runner.
 *
 * Satisfies issue #62 AC: "Loads stories from src/app/data/initial-requirements.ts
 * as context" without requiring the caller to pass --stories manually.
 *
 * Usage:
 *   npm run agent:architect -- --goal "Improve access governance"
 *   npm run agent:architect -- --goal "..." --max 30   (cap stories sent to model)
 *   npm run agent:architect -- --goal "..." --dry-run  (print prompt, skip call)
 */

import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Parse args ─────────────────────────────────────────────────────────────
const rawArgs = process.argv.slice(2);

// Extract --max <n> (our own flag, not forwarded to run-agent.mjs)
let maxStories = 50;
const maxIdx = rawArgs.indexOf('--max');
if (maxIdx >= 0) {
  maxStories = parseInt(rawArgs[maxIdx + 1], 10) || 50;
  rawArgs.splice(maxIdx, 2); // remove --max and its value
}

// ── Load requirements context ──────────────────────────────────────────────
const loaderPath = path.join(__dirname, 'load-requirements-context.cjs');
let storiesJson;
try {
  storiesJson = execFileSync(
    process.execPath, // node
    [loaderPath, '--max', String(maxStories)],
    { cwd: ROOT, encoding: 'utf8' }
  ).trim();
} catch (e) {
  process.stderr.write(`ERROR loading requirements context: ${e.message}\n`);
  process.exit(1);
}

// ── Forward to run-agent.mjs with --stories injected ──────────────────────
// Only inject --stories if caller hasn't already passed one
const hasStories = rawArgs.includes('--stories');
const agentArgs = [
  path.join(__dirname, 'run-agent.mjs'),
  'architect-v1',
  '--adapter', 'github-models-adapter',
  '--confirm',
  ...(hasStories ? [] : ['--stories', storiesJson]),
  ...rawArgs,
];

try {
  execFileSync(process.execPath, agentArgs, {
    cwd: ROOT,
    stdio: 'inherit',
    encoding: 'utf8',
  });
} catch (e) {
  // execFileSync throws on non-zero exit; the child already printed its output
  process.exit(e.status ?? 1);
}
