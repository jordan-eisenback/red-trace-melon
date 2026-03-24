import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { createRequire } from 'module';

function loadAgent(agentId) {
  const candidates = [
    path.join(process.cwd(), 'agents', `${agentId}.yaml`),
    path.join(process.cwd(), 'agents', `${agentId}.yml`),
    path.join(process.cwd(), 'agents', `${agentId}.json`)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      return p.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw);
    }
  }

  // fallback: search agents folder for a file whose `id` matches agentId
  const dir = path.join(process.cwd(), 'agents');
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.json'));
    for (const f of files) {
      const fp = path.join(dir, f);
      const raw = fs.readFileSync(fp, 'utf8');
      const parsed = f.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw);
      if (parsed && parsed.id === agentId) return parsed;
    }
    // if agentId not found, try loading architect.yaml as default
    const arch = path.join(dir, 'architect.yaml');
    if (fs.existsSync(arch)) return yaml.load(fs.readFileSync(arch, 'utf8'));
  }

  throw new Error(`Agent not found: ${agentId} (checked agents/)`);
}

function loadInput(inputPath) {
  if (!fs.existsSync(inputPath)) throw new Error(`Input not found: ${inputPath}`);
  return JSON.parse(fs.readFileSync(inputPath, 'utf8'));
}

function interpolate(template, vars = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = vars[k];
    if (v === undefined || v === null) return '';
    return typeof v === 'string' ? v : JSON.stringify(v);
  });
}

function ensureStorage() {
  const outDir = path.join(process.cwd(), 'storage', 'runs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

async function main() {
  const argv = process.argv.slice(2);
  const firstArg = argv[0] || '';
  const agentId = firstArg && !firstArg.startsWith('--') ? firstArg : 'architect-v1';
  const inputArgIndex = argv.indexOf('--input');
  const adapterArgIndex = argv.indexOf('--adapter');
  const confirm = argv.includes('--confirm');

  const inputPath = inputArgIndex >= 0 ? argv[inputArgIndex + 1] : 'examples/architect-input.json';
  const adapterName = adapterArgIndex >= 0 ? argv[adapterArgIndex + 1] : 'stub-adapter';

  const agent = loadAgent(agentId);
  const input = loadInput(inputPath);

  // enforce run_policy
  const rp = agent.run_policy || {};
  const requireConf = rp.require_confirmation === true;
  if (requireConf && !confirm) {
    console.error('Agent requires confirmation. Rerun with --confirm to proceed.');
    process.exit(4);
  }

  const system = (agent.prompt && agent.prompt.system) || '';
  const userTemplate = (agent.prompt && agent.prompt.user) || '';
  const user = interpolate(userTemplate, { goal: input.goal || '', stories: input.stories || [] });

  // load adapter via createRequire so CommonJS adapters work
  // Try .js then .cjs adapter files (project may be ESM)
  const adapterCandidates = [
    path.join(process.cwd(), 'adapters', `${adapterName}.cjs`),
    path.join(process.cwd(), 'adapters', `${adapterName}.js`),
    path.join(process.cwd(), 'adapters', `${adapterName}.mjs`)
  ];
  let adapterPathFound = null;
  for (const p of adapterCandidates) if (fs.existsSync(p)) { adapterPathFound = p; break; }
  if (!adapterPathFound) throw new Error(`Adapter missing (tried .js/.cjs/.mjs): ${adapterName}`);
  const require = createRequire(import.meta.url);
  const adapter = require(adapterPathFound);

  const result = await adapter.run({ system, user }, { confirmed: confirm });

  // parse JSON
  let parsed;
  try {
    parsed = JSON.parse(result.text);
  } catch (e) {
    const outPath = ensureStorage();
    const errFile = path.join(outPath, `${Date.now()}-${agentId}-invalid.json`);
    fs.writeFileSync(errFile, JSON.stringify({ agentId, input, output: result }, null, 2));
    console.error('Agent output not valid JSON. Saved to', errFile);
    process.exit(3);
  }

  const outPath = ensureStorage();
  const runFile = path.join(outPath, `${Date.now()}-${agentId}.json`);
  fs.writeFileSync(runFile, JSON.stringify({ agentId, input, adapter: adapterName, result, parsed }, null, 2));
  console.log('Run saved:', runFile);
  console.log('Parsed output:\n', JSON.stringify(parsed, null, 2));
}

main().catch((err) => {
  console.error('Error running agent:', err.message);
  process.exit(2);
});
