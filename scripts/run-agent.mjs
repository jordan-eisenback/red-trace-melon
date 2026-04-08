/**
 * run-agent.mjs — Universal agent runner for red-trace-melon
 *
 * Usage:
 *   node scripts/run-agent.mjs <agent-id> [options]
 *
 * Options:
 *   --goal        "<text>"        Template variable: {{goal}}
 *   --stories     "<text>"        Template variable: {{stories}}
 *   --bug         "<text>"        Template variable: {{bug_description}}
 *   --test        "<text>"        Template variable: {{failing_test}}
 *   --stack       "<text>"        Template variable: {{stack_trace}}
 *   --scope       full|smoke|...  Template variable: {{scope}}
 *   --focus       "<text>"        Template variable: {{focus}}
 *   --from        <ref>           Template variable: {{from_ref}}
 *   --to          <ref>           Template variable: {{to_ref}}
 *   --version     <semver>        Template variable: {{version}}
 *   --target-url  <url>           Template variable: {{target_url}}
 *   --adapter     <name>          Adapter to use (default: github-models-adapter)
 *   --confirm                     Satisfy require_confirmation
 *   --dry-run                     Print rendered prompt, skip model call
 *   --no-validate                 Skip AJV output_schema validation
 *
 * Adapters live in adapters/. Defaults to github-models-adapter.cjs which
 * uses your existing `gh` CLI auth token — no separate API key needed.
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Dynamic imports (avoid bundler issues) ─────────────────────────────────
const { default: yaml } = await import('js-yaml');
const { default: Ajv } = await import('ajv');

// ── CLI arg parser ─────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else if (i === 0) {
      args['agent'] = a;
    }
  }
  return args;
}

// ── Agent loader ───────────────────────────────────────────────────────────
function loadAgent(agentIdOrPath) {
  // direct file path
  if (agentIdOrPath.includes('/') || agentIdOrPath.endsWith('.yaml')) {
    const p = path.resolve(ROOT, agentIdOrPath);
    if (!fs.existsSync(p)) throw new Error(`Agent file not found: ${p}`);
    return yaml.load(fs.readFileSync(p, 'utf8'));
  }

  // search agents/ by filename then by id field
  const dir = path.join(ROOT, 'agents');
  const candidates = [
    path.join(dir, `${agentIdOrPath}.yaml`),
    path.join(dir, `${agentIdOrPath}.yml`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return yaml.load(fs.readFileSync(c, 'utf8'));
  }

  // fallback: match by id field
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))) {
      const parsed = yaml.load(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (parsed?.id === agentIdOrPath) return parsed;
    }
  }

  throw new Error(`Agent not found: "${agentIdOrPath}". Check agents/ directory.`);
}

// ── Template interpolation ─────────────────────────────────────────────────
function interpolate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    if (val === undefined || val === null) return '';
    return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
  });
}

// ── Build template variables from CLI args + agent defaults ───────────────
function buildVars(agent, args) {
  // Start from agent-declared variable defaults
  const vars = {};
  for (const [key, def] of Object.entries(agent.variables ?? {})) {
    vars[key] = def.default ?? '';
  }

  // Map CLI args → template variable names
  const mapping = {
    goal:         'goal',
    stories:      'stories',
    bug:          'bug_description',
    test:         'failing_test',
    stack:        'stack_trace',
    scope:        'scope',
    focus:        'focus',
    from:         'from_ref',
    to:           'to_ref',
    version:      'version',
    'target-url': 'target_url',
    branch:       'branch',
    focus_area:   'focus',
    wcag_level:   'wcag_level',
  };

  for (const [cliKey, varKey] of Object.entries(mapping)) {
    if (args[cliKey] !== undefined) vars[varKey] = args[cliKey];
  }

  return vars;
}

// ── Storage helpers ────────────────────────────────────────────────────────
function ensureOutputDir(agentId) {
  const dir = path.join(ROOT, 'storage', 'agents', 'output', agentId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function ensureMemoryDir() {
  const dir = path.join(ROOT, 'storage', 'agents', 'memory');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function loadMemory(agent) {
  if (!agent.memory?.enabled) return null;
  const store = agent.memory.store
    ? path.join(ROOT, agent.memory.store)
    : path.join(ensureMemoryDir(), `${agent.id}.json`);
  if (fs.existsSync(store)) {
    try { return JSON.parse(fs.readFileSync(store, 'utf8')); } catch { return null; }
  }
  return null;
}

function saveMemory(agent, data) {
  if (!agent.memory?.enabled) return;
  const store = agent.memory.store
    ? path.join(ROOT, agent.memory.store)
    : path.join(ensureMemoryDir(), `${agent.id}.json`);
  fs.mkdirSync(path.dirname(store), { recursive: true });
  fs.writeFileSync(store, JSON.stringify(data, null, 2));
}

// ── AJV output validation ──────────────────────────────────────────────────
function validateOutput(agent, parsed) {
  const schema = agent.output_schema;
  if (!schema) return { valid: true, errors: [] };

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(parsed);
  return { valid, errors: validate.errors ?? [] };
}

// ── Adapter loader ─────────────────────────────────────────────────────────
function loadAdapter(adapterName) {
  const dir = path.join(ROOT, 'adapters');
  const exts = ['.cjs', '.js', '.mjs'];
  for (const ext of exts) {
    const p = path.join(dir, `${adapterName}${ext}`);
    if (fs.existsSync(p)) {
      const require = createRequire(import.meta.url);
      return require(p);
    }
  }
  throw new Error(`Adapter not found: "${adapterName}" in adapters/. Available: ${
    fs.readdirSync(dir).join(', ')
  }`);
}

// ── Pretty print helpers ───────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  blue:   '\x1b[34m',
};

function log(msg)       { console.log(msg); }
function info(msg)      { console.log(`${C.cyan}ℹ${C.reset}  ${msg}`); }
function success(msg)   { console.log(`${C.green}✓${C.reset}  ${msg}`); }
function warn(msg)      { console.log(`${C.yellow}⚠${C.reset}  ${msg}`); }
function error(msg)     { console.error(`${C.red}✗${C.reset}  ${msg}`); }
function header(msg)    { console.log(`\n${C.bold}${msg}${C.reset}`); }
function dim(msg)       { console.log(`${C.dim}${msg}${C.reset}`); }

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length === 0 || rawArgs[0] === '--help' || rawArgs[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  const args = parseArgs(rawArgs);
  const agentId = args['agent'];
  if (!agentId) { error('No agent specified. Usage: node scripts/run-agent.mjs <agent-id>'); process.exit(1); }

  // ── Load agent ──────────────────────────────────────────────────────────
  let agent;
  try {
    agent = loadAgent(agentId);
  } catch (e) {
    error(e.message);
    process.exit(1);
  }

  header(`Agent: ${agent.name ?? agent.id}  (${agent.id})`);
  if (agent.description) dim(agent.description.trim().split('\n')[0]);

  // ── Check run_policy ────────────────────────────────────────────────────
  const policy = agent.run_policy ?? {};
  if (policy.require_confirmation && !args['confirm'] && !args['dry-run']) {
    warn('This agent requires --confirm to proceed.');
    log('');
    log(`  ${C.dim}Rerun with:  node scripts/run-agent.mjs ${agentId} ${rawArgs.slice(1).join(' ')} --confirm${C.reset}`);
    log('');
    process.exit(4);
  }

  // ── Build prompt ────────────────────────────────────────────────────────
  const vars = buildVars(agent, args);
  const memory = loadMemory(agent);
  if (memory) {
    info(`Memory loaded (${Object.keys(memory).length} keys)`);
    vars['_memory'] = JSON.stringify(memory);
  }

  const system = agent.prompt?.system ?? '';
  const userTemplate = agent.prompt?.user ?? '';
  const user = interpolate(userTemplate, vars);

  // ── Dry run ─────────────────────────────────────────────────────────────
  if (args['dry-run']) {
    header('── SYSTEM PROMPT ──────────────────────────────────────────────');
    log(system);
    header('── USER PROMPT ────────────────────────────────────────────────');
    log(user);
    header('── TEMPLATE VARIABLES ─────────────────────────────────────────');
    log(JSON.stringify(vars, null, 2));
    log('');
    info('Dry run complete. No model call made.');
    process.exit(0);
  }

  // ── Check safety ────────────────────────────────────────────────────────
  const safety = agent.safety ?? {};
  if (safety.allow_external === false) {
    const combined = `${system}\n${user}`;
    if (/\bhttps?:\/\/[^\s]+/i.test(combined)) {
      error('Prompt contains an external URL but agent safety.allow_external is false.');
      process.exit(5);
    }
  }

  // ── Load adapter ────────────────────────────────────────────────────────
  const adapterName = args['adapter'] ?? 'github-models-adapter';
  let adapter;
  try {
    adapter = loadAdapter(adapterName);
  } catch (e) {
    error(e.message);
    process.exit(1);
  }
  info(`Adapter: ${adapterName}`);

  // ── Call model ──────────────────────────────────────────────────────────
  info('Calling model…');
  let result;
  try {
    result = await adapter.run({ system, user }, {
      confirmed: !!args['confirm'],
      allow_external: safety.allow_external !== false,
      temperature: agent.temperature ?? 0.1,
    });
  } catch (e) {
    error(`Adapter error: ${e.message}`);
    process.exit(2);
  }

  // ── Parse JSON output ───────────────────────────────────────────────────
  let parsed;
  try {
    // Strip markdown code fences if model wrapped output
    const text = (result.text ?? '').replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
    parsed = JSON.parse(text);
  } catch {
    error('Model output is not valid JSON.');
    dim('Raw output:');
    dim(result.text ?? '(empty)');

    const outDir = ensureOutputDir(agent.id);
    const errFile = path.join(outDir, `${Date.now()}-invalid.json`);
    fs.writeFileSync(errFile, JSON.stringify({ agentId: agent.id, vars, raw: result.text }, null, 2));
    error(`Raw output saved to: ${errFile}`);
    process.exit(3);
  }

  // ── Validate against output_schema ──────────────────────────────────────
  if (!args['no-validate'] && agent.output_schema) {
    const { valid, errors } = validateOutput(agent, parsed);
    if (!valid) {
      warn('Output failed schema validation:');
      for (const e of errors) {
        warn(`  ${e.instancePath || '/'} — ${e.message}`);
      }
    } else {
      success('Output matches output_schema');
    }
  }

  // ── Save output ─────────────────────────────────────────────────────────
  const outDir = ensureOutputDir(agent.id);
  const ts = Date.now();
  const outFile = path.join(outDir, `${ts}-${agent.id}.json`);
  const envelope = {
    agentId: agent.id,
    agentName: agent.name,
    timestamp: new Date(ts).toISOString(),
    adapter: adapterName,
    vars,
    output: parsed,
    meta: result.meta ?? {},
  };
  fs.writeFileSync(outFile, JSON.stringify(envelope, null, 2));
  success(`Output saved: ${path.relative(ROOT, outFile)}`);

  // ── Update memory ────────────────────────────────────────────────────────
  if (agent.memory?.enabled) {
    const memUpdate = {
      last_run: new Date(ts).toISOString(),
      last_output_file: path.relative(ROOT, outFile),
      ...(parsed.design_score ? { last_design_score: parsed.design_score.grade } : {}),
      ...(parsed.ai_slop_score ? { last_ai_slop_score: parsed.ai_slop_score.grade } : {}),
      ...(parsed.status ? { last_status: parsed.status } : {}),
    };
    saveMemory(agent, memUpdate);
    info('Memory updated');
  }

  // ── Print summary ────────────────────────────────────────────────────────
  header('── OUTPUT ──────────────────────────────────────────────────────');

  if (parsed.summary) {
    log(`\n${C.bold}Summary:${C.reset} ${parsed.summary}`);
  }

  // Per-agent summary sections
  if (parsed.design_score) {
    log(`\n${C.bold}Design Score:${C.reset}     ${gradeColor(parsed.design_score.grade)}`);
  }
  if (parsed.ai_slop_score) {
    log(`${C.bold}AI Slop Score:${C.reset}    ${gradeColor(parsed.ai_slop_score.grade)}`);
    if (parsed.ai_slop_score.patterns_found?.length) {
      warn(`AI Slop patterns detected: ${parsed.ai_slop_score.patterns_found.join(', ')}`);
    }
  }
  if (parsed.findings?.length) {
    log(`\n${C.bold}Findings:${C.reset} ${parsed.findings.length} total`);
    const high   = parsed.findings.filter(f => f.severity === 'high'   || f.impact === 'high').length;
    const med    = parsed.findings.filter(f => f.severity === 'medium' || f.impact === 'medium').length;
    if (high) error(`  ${high} high`);
    if (med)  warn(`  ${med} medium`);
  }
  if (parsed.bugs?.length) {
    const crit = parsed.bugs.filter(b => b.severity === 'critical').length;
    const high = parsed.bugs.filter(b => b.severity === 'high').length;
    log(`\n${C.bold}Bugs found:${C.reset} ${parsed.bugs.length}`);
    if (crit) error(`  ${crit} critical`);
    if (high) error(`  ${high} high`);
  }
  if (parsed.fix_plan?.length) {
    success(`Fix plan: ${parsed.fix_plan.length} proposed changes`);
  }
  if (parsed.upgrade_plan?.length) {
    const p1 = parsed.upgrade_plan.filter(u => u.priority === 'P1-security').length;
    if (p1) error(`  ${p1} security upgrades (P1)`);
    success(`Upgrade plan: ${parsed.upgrade_plan.length} packages`);
  }
  if (parsed.status) {
    const sc = parsed.status === 'DONE' ? C.green : parsed.status === 'BLOCKED' ? C.red : C.yellow;
    log(`\n${C.bold}Status:${C.reset} ${sc}${parsed.status}${C.reset}`);
  }

  log('');
  log(`${C.dim}Full output: ${path.relative(ROOT, outFile)}${C.reset}`);
  log('');
}

function gradeColor(grade) {
  const map = { A: C.green, B: C.green, C: C.yellow, D: C.yellow, F: C.red };
  return `${map[grade] ?? ''}${grade}${C.reset}`;
}

function printHelp() {
  log(`
${C.bold}run-agent.mjs${C.reset} — Universal agent runner

${C.bold}Usage:${C.reset}
  node scripts/run-agent.mjs <agent-id> [options]

${C.bold}Agent IDs:${C.reset}
  architect-v1              Plan outcomes and activities from a goal
  code-reviewer-v1          Code quality and security review
  design-reviewer-v1        Visual QA, AI-slop detection, fix plan
  investigator-v1           Bug hunting and root-cause analysis
  qa-v1                     Functional QA and Playwright test writing
  performance-profiler-v1   Core Web Vitals and bundle audit
  accessibility-auditor-v1  WCAG 2.2 AA audit
  dependency-auditor-v1     Vulnerability, outdated, and licence audit
  changelog-writer-v1       Git history → Keep a Changelog entry
  docs-auditor-v1           README and JSDoc coverage audit

${C.bold}Options:${C.reset}
  --goal "<text>"       {{goal}} template variable
  --stories "<text>"    {{stories}} template variable
  --bug "<text>"        {{bug_description}} (investigator)
  --test "<text>"       {{failing_test}} (investigator)
  --stack "<text>"      {{stack_trace}} (investigator)
  --scope <value>       {{scope}}: full | smoke | focused
  --focus "<text>"      {{focus}}: specific page/feature (qa)
  --from <ref>          {{from_ref}}: git ref (changelog-writer)
  --to <ref>            {{to_ref}}: git ref (changelog-writer)
  --version <semver>    {{version}}: release version (changelog-writer)
  --target-url <url>    {{target_url}}: app URL (design-reviewer, qa)
  --adapter <name>      Adapter name in adapters/ (default: m365-adapter)
  --confirm             Satisfy require_confirmation policy
  --dry-run             Print rendered prompt, skip model call
  --no-validate         Skip AJV output_schema validation

${C.bold}Environment:${C.reset}
  AGENT_ENDPOINT        Local model URL (default: http://localhost:11434/api/generate)

${C.bold}Examples:${C.reset}
  node scripts/run-agent.mjs architect-v1 --goal "RBAC permission system" --confirm
  node scripts/run-agent.mjs design-reviewer-v1 --target-url http://localhost:5173 --confirm
  node scripts/run-agent.mjs investigator-v1 --bug "Requirements list is blank on load" --confirm
  node scripts/run-agent.mjs dependency-auditor-v1 --confirm
  node scripts/run-agent.mjs changelog-writer-v1 --from v0.5.0 --version 0.6.0 --confirm
  node scripts/run-agent.mjs architect-v1 --dry-run --goal "test"
`);
}

main().catch(err => {
  console.error(`\x1b[31m✗\x1b[0m  Fatal: ${err.message}`);
  process.exit(2);
});
