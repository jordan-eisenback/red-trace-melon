/**
 * load-requirements-context.cjs
 *
 * Reads src/app/data/initial-requirements.ts, strips the TypeScript wrapper,
 * and prints a compact JSON summary of all requirements to stdout.
 *
 * Used by the agent:architect npm script to auto-populate {{stories}} context
 * without requiring the caller to pass --stories manually.
 *
 * Output format (one object per line for readability):
 *   [{"id":"RBAC-ENT-001","req":"...","type":"Enterprise","outcome":"..."},...]
 *
 * Usage:
 *   node scripts/load-requirements-context.cjs
 *   node scripts/load-requirements-context.cjs --max 30
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const SRC     = path.join(ROOT, 'src', 'app', 'data', 'initial-requirements.ts');

// Optional --max <n> cap (default: all)
const maxArg  = process.argv.indexOf('--max');
const MAX     = maxArg >= 0 ? parseInt(process.argv[maxArg + 1], 10) : Infinity;

// ── Read source ────────────────────────────────────────────────────────────
if (!fs.existsSync(SRC)) {
  process.stderr.write(`ERROR: ${SRC} not found\n`);
  process.exit(1);
}

const raw = fs.readFileSync(SRC, 'utf8');

// ── Strip TypeScript wrapper ───────────────────────────────────────────────
// The file looks like:
//   import { Requirement } from "../types/requirement";
//   export const initialRequirements: Requirement[] = [ ... ];
// We find the `= [` assignment and extract from that `[` to the last `]`,
// then strip trailing commas so JSON.parse accepts it.

const assignIdx = raw.indexOf('= [');
if (assignIdx === -1) {
  process.stderr.write('ERROR: Could not find `= [` in initial-requirements.ts\n');
  process.exit(1);
}
const start = assignIdx + 2; // points at '['
const end   = raw.lastIndexOf(']');

if (end <= start) {
  process.stderr.write('ERROR: Could not locate closing ] in initial-requirements.ts\n');
  process.exit(1);
}

let arrayText = raw.slice(start, end + 1);

// Remove trailing commas before ] or } (common in TS/JS but invalid JSON)
arrayText = arrayText.replace(/,(\s*[}\]])/g, '$1');

// ── Parse ──────────────────────────────────────────────────────────────────
let reqs;
try {
  reqs = JSON.parse(arrayText);
} catch (e) {
  process.stderr.write(`ERROR: JSON.parse failed: ${e.message}\n`);
  process.exit(1);
}

if (!Array.isArray(reqs)) {
  process.stderr.write('ERROR: Parsed value is not an array\n');
  process.exit(1);
}

// ── Trim to summary fields + apply cap ────────────────────────────────────
const summary = reqs
  .slice(0, isFinite(MAX) ? MAX : reqs.length)
  .map(r => ({
    id:      r.id,
    req:     r.req,
    type:    r.type,
    outcome: r.outcome,
    owner:   r.owner,
  }));

process.stdout.write(JSON.stringify(summary));
