/**
 * run-investigator.mjs — Wrapper for investigator-v1 agent
 *
 * Extends the generic run-agent.mjs flow with:
 *   1. Pre-flight: optionally runs `npm test -- <test>` to reproduce the
 *      failure and capture stdout/stderr as {{reproduction_output}}.
 *   2. Pre-flight: runs `npm run typecheck` and appends any type errors to
 *      the bug context so the agent sees them.
 *   3. Post-run: if the agent output includes a `regression_test`, writes it
 *      to `src/__tests__/<file>` (requires --write-test flag).
 *   4. Post-run: prints the proposed fix diff with syntax highlighting.
 *
 * Usage:
 *   node scripts/run-investigator.mjs \
 *     --bug   "Requirements list blank on load" \
 *     --test  "src/__tests__/components.test.tsx > RequirementsList renders" \
 *     --stack "<paste stack trace here>" \
 *     [--reproduce]    Run the failing test before calling the model
 *     [--typecheck]    Run tsc before calling the model
 *     [--write-test]   Write regression_test.code to src/__tests__/
 *     [--dry-run]      Print prompts, skip model call
 *     [--adapter <n>]  Adapter name (default: github-models-adapter)
 *     [--confirm]      Satisfy require_confirmation policy
 *
 * Equivalent npm script:
 *   npm run agent:investigate -- --bug "..." --reproduce --write-test
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Colours ────────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m', bold:   '\x1b[1m', dim:    '\x1b[2m',
  green:  '\x1b[32m', yellow: '\x1b[33m', red:    '\x1b[31m',
  cyan:   '\x1b[36m', blue:   '\x1b[34m',
};
const log     = (m) => console.log(m);
const info    = (m) => console.log(`${C.cyan}ℹ${C.reset}  ${m}`);
const success = (m) => console.log(`${C.green}✓${C.reset}  ${m}`);
const warn    = (m) => console.log(`${C.yellow}⚠${C.reset}  ${m}`);
const err     = (m) => console.error(`${C.red}✗${C.reset}  ${m}`);
const header  = (m) => console.log(`\n${C.bold}${m}${C.reset}`);
const dim     = (m) => console.log(`${C.dim}${m}${C.reset}`);

// ── Arg parser ─────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { args[key] = next; i++; }
      else args[key] = true;
    }
  }
  return args;
}

// ── Run a shell command, return { stdout, stderr, code } ───────────────────
function runCommand(cmd, label) {
  info(`Running: ${cmd}`);
  const result = spawnSync(cmd, { shell: true, cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  if (result.status === 0) {
    success(`${label} passed`);
  } else {
    warn(`${label} exited with code ${result.status}`);
  }
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '', code: result.status ?? 1 };
}

// ── Write regression test to src/__tests__/ ────────────────────────────────
function writeRegressionTest(regressionTest) {
  if (!regressionTest?.file || !regressionTest?.code) {
    warn('regression_test missing file or code — skipping write');
    return;
  }

  // Normalise to src/__tests__/<basename> if a full path was given
  let relFile = regressionTest.file;
  if (!relFile.startsWith('src/__tests__/')) {
    relFile = `src/__tests__/${path.basename(relFile)}`;
  }

  const absFile = path.join(ROOT, relFile);
  const dir = path.dirname(absFile);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(absFile)) {
    // Append to existing file rather than overwrite
    const existing = fs.readFileSync(absFile, 'utf8');
    const separator = `\n\n// ── Regression test added by investigator-v1 ──────────────────────────\n`;
    fs.writeFileSync(absFile, existing + separator + regressionTest.code + '\n');
    success(`Regression test appended to: ${relFile}`);
  } else {
    fs.writeFileSync(absFile, regressionTest.code + '\n');
    success(`Regression test written to: ${relFile}`);
  }

  // Verify the new test passes
  info('Verifying regression test…');
  const verify = runCommand(`npx vitest run ${relFile} --reporter=verbose`, 'Regression test verification');
  if (verify.code !== 0) {
    warn('Regression test did not pass — review the generated code before committing');
    dim(verify.stdout.slice(-2000)); // last 2 000 chars of output
  }
}

// ── Print fix diff ─────────────────────────────────────────────────────────
function printFix(fix) {
  if (!fix) return;
  header('── PROPOSED FIX ────────────────────────────────────────────────');
  log(`\n${C.bold}File:${C.reset} ${fix.file}`);
  if (fix.proposed_commit_message) {
    log(`${C.bold}Commit:${C.reset} ${fix.proposed_commit_message}`);
  }
  if (fix.diff) {
    log('');
    // Colour the diff lines
    for (const line of fix.diff.split('\n')) {
      if (line.startsWith('+++') || line.startsWith('---')) log(`${C.bold}${line}${C.reset}`);
      else if (line.startsWith('+')) log(`${C.green}${line}${C.reset}`);
      else if (line.startsWith('-')) log(`${C.red}${line}${C.reset}`);
      else if (line.startsWith('@@')) log(`${C.cyan}${line}${C.reset}`);
      else log(line);
    }
  }
}

// ── Print root cause ───────────────────────────────────────────────────────
function printRootCause(parsed) {
  if (parsed.root_cause) {
    header('── ROOT CAUSE ──────────────────────────────────────────────────');
    const rc = parsed.root_cause;
    log(`\n${C.bold}File:${C.reset}  ${rc.file}${rc.line ? `:${rc.line}` : ''}`);
    log(`${C.bold}Cause:${C.reset} ${rc.description}`);
  }

  if (parsed.hypothesis) {
    log(`\n${C.bold}Hypothesis:${C.reset} ${parsed.hypothesis}`);
  }

  if (parsed.call_stack?.length) {
    header('── CALL STACK ──────────────────────────────────────────────────');
    parsed.call_stack.forEach((frame, i) => {
      log(`  ${C.dim}${i}.${C.reset} ${frame.fn ?? '?'}  ${C.dim}${frame.file}:${frame.line ?? '?'}${C.reset}`);
    });
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    log(`
${C.bold}run-investigator.mjs${C.reset} — Bug hunter wrapper for investigator-v1

${C.bold}Usage:${C.reset}
  node scripts/run-investigator.mjs --bug "<description>" [options]

${C.bold}Options:${C.reset}
  --bug   "<text>"    Plain-English description of the broken behaviour  [required]
  --test  "<text>"    Failing test file + test name (vitest path format)
  --stack "<text>"    Full stack trace / error message
  --branch "<name>"   Current branch name (injected into prompt)
  --reproduce         Run the failing test first to capture real output
  --typecheck         Run tsc --noEmit first and include any type errors
  --write-test        Write regression_test output to src/__tests__/
  --adapter <name>    Adapter (default: github-models-adapter)
  --confirm           Satisfy require_confirmation policy
  --dry-run           Print prompts, skip model call

${C.bold}Examples:${C.reset}
  node scripts/run-investigator.mjs \\
    --bug "Requirements list is blank on load" \\
    --test "src/__tests__/components.test.tsx" \\
    --reproduce --write-test --confirm

  node scripts/run-investigator.mjs \\
    --bug "useAutoSave fires on unmount causing 500" \\
    --stack "TypeError: Cannot read properties of null" \\
    --typecheck --confirm
`);
    process.exit(0);
  }

  if (!args.bug) {
    err('--bug "<description>" is required');
    log('Run with --help for usage.');
    process.exit(1);
  }

  header('── Investigator v1 ─────────────────────────────────────────────');
  log(`\n${C.bold}Bug:${C.reset} ${args.bug}`);
  if (args.test)  log(`${C.bold}Test:${C.reset}  ${args.test}`);
  if (args.stack) log(`${C.bold}Stack:${C.reset}\n${args.stack}`);

  // ── Pre-flight: reproduce failure ────────────────────────────────────────
  let reproductionOutput = '';
  if (args.reproduce && args.test) {
    header('── Pre-flight: reproducing failure ─────────────────────────────');
    const testResult = runCommand(
      `npx vitest run "${args.test}" --reporter=verbose`,
      'Failing test'
    );
    reproductionOutput = [testResult.stdout, testResult.stderr].join('\n').trim();
    if (testResult.code === 0) {
      warn('Test passed — could not reproduce the failure. Continuing anyway.');
    } else {
      success('Failure reproduced — output captured for agent context');
    }
  }

  // ── Pre-flight: typecheck ────────────────────────────────────────────────
  let typecheckOutput = '';
  if (args.typecheck) {
    header('── Pre-flight: type checking ────────────────────────────────────');
    const tcResult = runCommand('npm run typecheck 2>&1', 'Type check');
    typecheckOutput = [tcResult.stdout, tcResult.stderr].join('\n').trim();
  }

  // ── Determine branch ─────────────────────────────────────────────────────
  let branch = args.branch ?? '';
  if (!branch) {
    try { branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf8' }).trim(); }
    catch { branch = 'unknown'; }
  }

  // ── Augment bug description with captured output ─────────────────────────
  let augmentedBug = args.bug;
  if (reproductionOutput) {
    augmentedBug += `\n\n--- Test output (captured pre-flight) ---\n${reproductionOutput.slice(0, 3000)}`;
  }
  if (typecheckOutput) {
    augmentedBug += `\n\n--- TypeScript errors (captured pre-flight) ---\n${typecheckOutput.slice(0, 2000)}`;
  }

  // ── Delegate to run-agent.mjs ────────────────────────────────────────────
  header('── Calling model via run-agent.mjs ─────────────────────────────');

  const passThrough = [
    'investigator-v1',
    '--bug',    augmentedBug,
    '--branch', branch,
    '--adapter', args.adapter ?? 'github-models-adapter',
    '--confirm',
  ];
  if (args.test  && typeof args.test  === 'string') passThrough.push('--test',  args.test);
  if (args.stack && typeof args.stack === 'string') passThrough.push('--stack', args.stack);
  if (args['dry-run'])     passThrough.push('--dry-run');
  if (args['no-validate']) passThrough.push('--no-validate');

  // Dynamically import run-agent to re-use its main() is not feasible (it
  // calls process.exit). Instead spawn it as a subprocess and capture output.
  const agentResult = spawnSync('node', ['scripts/run-agent.mjs', ...passThrough], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
    timeout: 300_000,
  });

  process.stdout.write(agentResult.stdout ?? '');
  if (agentResult.stderr) process.stderr.write(agentResult.stderr);

  if (agentResult.status !== 0) {
    err(`run-agent.mjs exited with code ${agentResult.status}`);
    process.exit(agentResult.status ?? 1);
  }

  // ── Parse agent output file for post-processing ──────────────────────────
  const outputDir = path.join(ROOT, 'storage', 'agents', 'output', 'investigator-v1');
  let latestOutput = null;
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('-invalid.json'))
      .sort()
      .reverse();
    if (files.length) {
      try {
        const envelope = JSON.parse(fs.readFileSync(path.join(outputDir, files[0]), 'utf8'));
        latestOutput = envelope.output;
      } catch { /* ignore */ }
    }
  }

  if (!latestOutput) {
    warn('Could not locate agent output file for post-processing.');
    process.exit(0);
  }

  // ── Pretty-print root cause, call stack, fix ─────────────────────────────
  printRootCause(latestOutput);
  printFix(latestOutput.fix);

  if (latestOutput.regression_test) {
    header('── REGRESSION TEST ─────────────────────────────────────────────');
    log(`\n${C.bold}File:${C.reset}      ${latestOutput.regression_test.file}`);
    log(`${C.bold}Test name:${C.reset} ${latestOutput.regression_test.test_name}`);
    log('');
    dim(latestOutput.regression_test.code);
  }

  // ── Optionally write regression test ─────────────────────────────────────
  if (args['write-test'] && latestOutput.regression_test) {
    header('── Writing regression test ──────────────────────────────────────');
    writeRegressionTest(latestOutput.regression_test);
  } else if (latestOutput.regression_test && !args['write-test']) {
    log('');
    info('Regression test generated but not written (pass --write-test to save it).');
  }

  log('');
  success('Investigator run complete.');
  log('');
}

main().catch(e => {
  console.error(`\x1b[31m✗\x1b[0m  Fatal: ${e.message}`);
  process.exit(2);
});
