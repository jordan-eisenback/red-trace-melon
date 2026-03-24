const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function readPromptDef(promptId) {
  const pathsToCheck = [
    path.join(__dirname, "..", "agents", `${promptId}.json`),
    path.join(__dirname, "..", "agents", `${promptId}.yaml`),
    path.join(__dirname, "..", "prompts", `${promptId}.json`),
    path.join(__dirname, "..", "prompts", `${promptId}.yaml`)
  ];
  for (const p of pathsToCheck) {
    if (!fs.existsSync(p)) continue;
    const raw = fs.readFileSync(p, "utf8");
    if (p.endsWith(".json")) return JSON.parse(raw);
    return yaml.load(raw);
  }
  throw new Error(`Prompt/agent not found: ${promptId} (checked agents/ and prompts/)`);
}

function interpolate(template, vars = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = vars[k];
    if (v === undefined || v === null) return "";
    return typeof v === "string" ? v : JSON.stringify(v);
  });
}

function defaultRunPolicy() {
  return { allow_file_write: false, allow_git_commit: false, require_confirmation: true };
}

function enforceRunPolicy(promptDef = {}, adapterOpts = {}) {
  const policy = Object.assign(defaultRunPolicy(), promptDef.run_policy || {});
  // require confirmation
  if (policy.require_confirmation && !adapterOpts.confirmed) {
    throw new Error("Agent run_policy requires confirmation. Rerun with adapter option { confirmed: true } to proceed.");
  }
  // block requested file writes
  if (adapterOpts.requestedFileWrite && !policy.allow_file_write) {
    throw new Error("Agent run_policy forbids file writes. Set run_policy.allow_file_write:true in the agent or do not request file writes.");
  }
  // block requested git commit
  if (adapterOpts.requestedGitCommit && !policy.allow_git_commit) {
    throw new Error("Agent run_policy forbids git commits. Set run_policy.allow_git_commit:true in the agent or avoid requesting commits.");
  }
}

async function runPrompt(promptId, input = {}, adapterName = "http-local-adapter", adapterOpts = {}) {
  const promptDef = readPromptDef(promptId);

  // Enforce agent run_policy before calling model
  enforceRunPolicy(promptDef, adapterOpts);

  const system = (promptDef.prompt && promptDef.prompt.system) || "";
  const userTemplate = (promptDef.prompt && promptDef.prompt.user) || "";
  const user = interpolate(userTemplate, { goal: input.goal || "", stories: input.stories || [] });

  const adapterPath = path.join(__dirname, "..", "adapters", `${adapterName}.js`);
  if (!fs.existsSync(adapterPath)) throw new Error(`Adapter missing: ${adapterPath}`);
  const adapter = require(adapterPath);

  const runResult = await adapter.run({ system, user }, adapterOpts);

  let parsed = runResult.text;
  if ((promptDef.output_format || promptDef.outputFormat) === "json") {
    try {
      parsed = JSON.parse(runResult.text);
    } catch (e) {
      const outPath = ensureStorage();
      const errFile = path.join(outPath, `${Date.now()}-${promptId}-invalid.json`);
      fs.writeFileSync(errFile, JSON.stringify({ promptId, input, output: runResult }, null, 2));
      throw new Error(`Prompt output was not valid JSON. Saved to ${errFile}`);
    }
  }

  const outPath = ensureStorage();
  const runFile = path.join(outPath, `${Date.now()}-${promptId}.json`);
  fs.writeFileSync(runFile, JSON.stringify({ promptId, input, adapter: adapterName, result: runResult, parsed }, null, 2));
  return { runFile, parsed, raw: runResult };
}

function ensureStorage() {
  const outDir = path.join(__dirname, "..", "storage", "runs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

module.exports = { runPrompt, readPromptDef };