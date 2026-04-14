/**
 * run-qa.mjs — Wrapper for qa-v1 agent
 *
 * Extends the generic run-agent.mjs flow with:
 *   1. Route enumeration: parses src/app/routes.tsx and injects the full
 *      route list into {{scope}} so the agent knows every page to visit.
 *   2. Screenshot capture: launches Playwright headlessly, visits every
 *      route, captures console errors and a screenshot per route. Saves
 *      images to storage/agents/output/qa/<timestamp>/.
 *   3. Context injection: passes captured route data (paths, console errors,
 *      screenshot refs) as part of the agent's user prompt via {{focus}}.
 *   4. Post-run test writer: if the agent output includes new_tests[], writes
 *      each to e2e/<file> (with --write-tests) then runs Playwright on them.
 *
 * Usage:
 *   node scripts/run-qa.mjs [options]
 *
 * Options:
 *   --scope     full | smoke | focused  (default: full)
 *   --focus     "<page or feature>"    Limit to a specific route/feature
 *   --previous  <path>                 Previous QA report JSON for regression delta
 *   --screenshots                      Capture screenshots before calling model
 *   --write-tests                      Write new_tests[] output to e2e/
 *   --adapter   <name>                 Adapter (default: github-models-adapter)
 *   --confirm                          Satisfy require_confirmation policy
 *   --dry-run                          Print prompts, skip model call
 *
 * Equivalent npm script:
 *   npm run agent:qa -- --screenshots --write-tests --confirm
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Colours ────────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m',
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

// ── Parse routes from routes.tsx ───────────────────────────────────────────
function enumerateRoutes() {
  const routesFile = path.join(ROOT, 'src', 'app', 'routes.tsx');
  if (!fs.existsSync(routesFile)) {
    warn('routes.tsx not found — using fallback route list');
    return ['/'];
  }

  const content = fs.readFileSync(routesFile, 'utf8');
  const routes = [];

  // Extract path: "..." values
  const pathRe = /path:\s*["']([^"']+)["']/g;
  let m;
  while ((m = pathRe.exec(content)) !== null) {
    let p = m[1];
    // Skip the root wrapper and dynamic segments for now
    if (p === '/') continue;
    // Resolve dynamic segments to concrete examples using seed data
    if (p.includes(':id')) {
      p = p.replace(':id', 'RBAC-ENT-001');
    }
    routes.push('/' + p);
  }

  // Always include root
  routes.unshift('/');

  // Deduplicate
  return [...new Set(routes)];
}

// ── Capture screenshots via Playwright ────────────────────────────────────
async function captureScreenshots(routes, screenshotDir) {
  fs.mkdirSync(screenshotDir, { recursive: true });

  // Write a temporary Playwright script
  const tempScript = path.join(ROOT, 'scripts', '_qa-screenshot-runner.mjs');
  const routesJson = JSON.stringify(routes);
  const dirJson = JSON.stringify(screenshotDir);

  const scriptContent = `
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const routes = ${routesJson};
const screenshotDir = ${dirJson};
const BASE = 'http://localhost:5173';
const results = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: undefined,
});

// Suppress welcome modal via localStorage
await context.addInitScript(() => {
  localStorage.setItem('rtm-has-visited', 'true');
  localStorage.setItem('rtm-update-banner-seen', 'true');
});

for (const route of routes) {
  const consoleErrors = [];
  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', e => consoleErrors.push(e.message));

  let status = 'pass';
  let screenshotRef = null;

  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
    const safeName = route.replace(/\\//g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || '_root';
    const screenshotPath = path.join(screenshotDir, safeName + '.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    screenshotRef = screenshotPath;
    if (consoleErrors.length) status = 'warn';
  } catch (e) {
    status = 'fail';
    consoleErrors.push('Navigation error: ' + e.message);
  }

  results.push({ path: route, status, console_errors: consoleErrors, screenshot_ref: screenshotRef });
  await page.close();
}

await browser.close();
fs.writeFileSync(path.join(screenshotDir, 'route-results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
`;

  fs.writeFileSync(tempScript, scriptContent);

  info(`Capturing screenshots for ${routes.length} routes → ${path.relative(ROOT, screenshotDir)}`);
  const result = spawnSync('node', [tempScript], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 180_000,
  });

  // Clean up temp script
  try { fs.unlinkSync(tempScript); } catch { /* ignore */ }

  if (result.status !== 0) {
    warn('Screenshot runner failed — continuing without screenshots');
    warn(result.stderr?.slice(0, 500) ?? '');
    return [];
  }

  try {
    // Last line of stdout is the JSON array
    const lines = (result.stdout ?? '').trim().split('\n');
    const jsonLine = lines[lines.length - 1];
    return JSON.parse(jsonLine);
  } catch {
    warn('Could not parse screenshot runner output');
    return [];
  }
}

// ── Write new_tests to e2e/ ────────────────────────────────────────────────
function writeNewTests(newTests) {
  if (!newTests?.length) {
    info('No new tests in agent output');
    return;
  }

  const written = [];
  for (const t of newTests) {
    if (!t.file || !t.code) {
      warn(`Skipping test "${t.test_name}" — missing file or code`);
      continue;
    }

    // Normalise to e2e/<basename>
    let relFile = t.file;
    if (!relFile.startsWith('e2e/')) {
      relFile = `e2e/${path.basename(relFile)}`;
    }

    const absFile = path.join(ROOT, relFile);
    const dir = path.dirname(absFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(absFile)) {
      // Append
      const existing = fs.readFileSync(absFile, 'utf8');
      const separator = `\n\n// ── Generated by qa-v1 ──────────────────────────────────────────\n`;
      fs.writeFileSync(absFile, existing + separator + t.code + '\n');
      success(`Appended test "${t.test_name}" to ${relFile}`);
    } else {
      fs.writeFileSync(absFile, t.code + '\n');
      success(`Wrote test "${t.test_name}" to ${relFile}`);
    }
    written.push(relFile);
  }

  if (!written.length) return;

  // Run the newly written tests
  header('── Verifying new Playwright tests ──────────────────────────────');
  for (const f of written) {
    info(`Running: npx playwright test ${f}`);
    const result = spawnSync('npx', ['playwright', 'test', f, '--reporter=list'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'inherit',
      timeout: 120_000,
      shell: true,
    });
    if (result.status !== 0) {
      warn(`${f} had failures — review before committing`);
    } else {
      success(`${f} passed`);
    }
  }
}

// ── Print QA report summary ────────────────────────────────────────────────
function printReport(parsed) {
  if (parsed.summary) {
    header('── QA SUMMARY ──────────────────────────────────────────────────');
    log(`\n${parsed.summary}`);
  }

  if (parsed.routes_tested?.length) {
    header('── ROUTES ──────────────────────────────────────────────────────');
    const pass = parsed.routes_tested.filter(r => r.status === 'pass').length;
    const warn_ = parsed.routes_tested.filter(r => r.status === 'warn').length;
    const fail = parsed.routes_tested.filter(r => r.status === 'fail').length;
    log(`\n  ${C.green}${pass} pass${C.reset}  ${C.yellow}${warn_} warn${C.reset}  ${C.red}${fail} fail${C.reset}`);
    for (const r of parsed.routes_tested) {
      const icon = r.status === 'pass' ? `${C.green}✓${C.reset}` :
                   r.status === 'warn' ? `${C.yellow}⚠${C.reset}` : `${C.red}✗${C.reset}`;
      log(`  ${icon}  ${r.path}${r.console_errors?.length ? `  ${C.dim}(${r.console_errors.length} console err)${C.reset}` : ''}`);
    }
  }

  if (parsed.bugs?.length) {
    header('── BUGS ────────────────────────────────────────────────────────');
    log('');
    for (const bug of parsed.bugs) {
      const sevColor = bug.severity === 'critical' || bug.severity === 'high' ? C.red : C.yellow;
      log(`  ${sevColor}[${bug.severity.toUpperCase()}]${C.reset} ${bug.id}: ${bug.title}`);
      log(`  ${C.dim}Route: ${bug.route}${C.reset}`);
      if (bug.proposed_fix) log(`  ${C.dim}Fix: ${bug.proposed_fix}${C.reset}`);
      log('');
    }
  }

  if (parsed.new_tests?.length) {
    header('── NEW TESTS ───────────────────────────────────────────────────');
    log('');
    for (const t of parsed.new_tests) {
      log(`  ${C.cyan}${t.file}${C.reset}  "${t.test_name}"  covers: ${t.covers_route}`);
    }
  }

  if (parsed.regression_delta) {
    header('── REGRESSION DELTA ────────────────────────────────────────────');
    const d = parsed.regression_delta;
    if (d.new_bugs?.length)      err(`New bugs: ${d.new_bugs.join(', ')}`);
    if (d.resolved_bugs?.length) success(`Resolved: ${d.resolved_bugs.join(', ')}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    log(`
${C.bold}run-qa.mjs${C.reset} — QA agent wrapper for qa-v1

${C.bold}Usage:${C.reset}
  node scripts/run-qa.mjs [options]

${C.bold}Options:${C.reset}
  --scope       full | smoke | focused  (default: full)
  --focus       "<route or feature>"    Limit analysis to one area
  --previous    <path>                  Previous QA report JSON for regression delta
  --screenshots                         Capture screenshots before calling model
  --write-tests                         Write new_tests[] to e2e/ and run them
  --adapter     <name>                  Adapter (default: github-models-adapter)
  --confirm                             Satisfy require_confirmation policy
  --dry-run                             Print prompts, skip model call

${C.bold}Examples:${C.reset}
  # Full QA run with screenshots and test generation
  node scripts/run-qa.mjs --screenshots --write-tests --confirm

  # Smoke pass only (no interactions)
  node scripts/run-qa.mjs --scope smoke --screenshots --confirm

  # Focused on a specific route
  node scripts/run-qa.mjs --scope focused --focus "/requirements" --confirm

  # Regression comparison
  node scripts/run-qa.mjs --previous storage/agents/output/qa-v1/last-report.json --confirm
`);
    process.exit(0);
  }

  header('── QA Agent v1 ─────────────────────────────────────────────────');

  const scope    = typeof args.scope    === 'string' ? args.scope    : 'full';
  const focus    = typeof args.focus    === 'string' ? args.focus    : '';
  const previous = typeof args.previous === 'string' ? args.previous : '';

  // ── Enumerate routes ─────────────────────────────────────────────────────
  header('── Enumerating routes ──────────────────────────────────────────');
  const allRoutes = enumerateRoutes();
  const targetRoutes = focus
    ? allRoutes.filter(r => r.includes(focus))
    : allRoutes;
  info(`Found ${allRoutes.length} routes, targeting ${targetRoutes.length}`);
  dim(targetRoutes.join('\n  '));

  // ── Screenshot capture ───────────────────────────────────────────────────
  let routeData = [];
  const ts = Date.now();
  const screenshotDir = path.join(ROOT, 'storage', 'agents', 'output', 'qa', String(ts));

  if (args.screenshots) {
    header('── Capturing screenshots ────────────────────────────────────────');
    routeData = await captureScreenshots(targetRoutes, screenshotDir);
    if (routeData.length) {
      const errors = routeData.filter(r => r.console_errors.length);
      success(`Screenshots saved to ${path.relative(ROOT, screenshotDir)}`);
      if (errors.length) warn(`${errors.length} route(s) had console errors`);
    }
  }

  // ── Build context for the agent ──────────────────────────────────────────
  let contextBlock = `Routes in this app (from src/app/routes.tsx):\n${allRoutes.join('\n')}`;

  if (routeData.length) {
    contextBlock += '\n\nPre-flight screenshot results:\n';
    for (const r of routeData) {
      contextBlock += `  ${r.status.toUpperCase()}  ${r.path}`;
      if (r.console_errors.length) {
        contextBlock += `\n    Console errors:\n${r.console_errors.map(e => `      - ${e}`).join('\n')}`;
      }
      if (r.screenshot_ref) {
        contextBlock += `\n    Screenshot: ${path.relative(ROOT, r.screenshot_ref)}`;
      }
      contextBlock += '\n';
    }
  }

  if (previous) {
    try {
      const prev = JSON.parse(fs.readFileSync(path.resolve(ROOT, previous), 'utf8'));
      contextBlock += `\n\nPrevious QA report (${previous}):\n${JSON.stringify(prev, null, 2).slice(0, 4000)}`;
    } catch {
      warn(`Could not load previous report: ${previous}`);
    }
  }

  // ── Build passthrough args for run-agent.mjs ─────────────────────────────
  const passThrough = [
    'qa-v1',
    '--scope',  scope,
    '--focus',  contextBlock,
    '--adapter', args.adapter ?? 'github-models-adapter',
    '--confirm',
  ];
  if (previous)            passThrough.push('--previous_report_path', previous);
  if (args['dry-run'])     passThrough.push('--dry-run');
  if (args['no-validate']) passThrough.push('--no-validate');

  // ── Call run-agent.mjs ───────────────────────────────────────────────────
  header('── Calling model via run-agent.mjs ─────────────────────────────');

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

  // ── Parse latest output file ─────────────────────────────────────────────
  const outputDir = path.join(ROOT, 'storage', 'agents', 'output', 'qa-v1');
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

  // ── Print report ─────────────────────────────────────────────────────────
  printReport(latestOutput);

  // ── Write new tests ───────────────────────────────────────────────────────
  if (args['write-tests'] && latestOutput.new_tests?.length) {
    header('── Writing new Playwright tests ─────────────────────────────────');
    writeNewTests(latestOutput.new_tests);
  } else if (latestOutput.new_tests?.length && !args['write-tests']) {
    log('');
    info(`${latestOutput.new_tests.length} new test(s) generated — pass --write-tests to save them`);
  }

  // ── Save report summary alongside screenshots ─────────────────────────────
  if (args.screenshots && fs.existsSync(screenshotDir)) {
    const reportPath = path.join(screenshotDir, 'qa-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(latestOutput, null, 2));
    success(`QA report saved: ${path.relative(ROOT, reportPath)}`);
  }

  log('');
  success('QA run complete.');
  log('');
}

main().catch(e => {
  console.error(`\x1b[31m✗\x1b[0m  Fatal: ${e.message}`);
  process.exit(2);
});
