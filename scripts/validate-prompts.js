/**
 * Usage:
 *   node scripts/validate-prompts.js
 *
 * Requires: npm install ajv js-yaml
 * Exits with non-zero code when invalid prompts/agents are found.
 */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
let Ajv;
try { Ajv = require("ajv"); } catch (e) { Ajv = null; }

function loadSchema(p) {
  if (!fs.existsSync(p)) throw new Error(`Schema not found: ${p}`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadDefs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".json") || f.endsWith(".yaml")).map(f => {
    const fp = path.join(dir, f);
    const raw = fs.readFileSync(fp, "utf8");
    return { id: f, file: fp, json: f.endsWith(".json") ? JSON.parse(raw) : yaml.load(raw) };
  });
}

function validateAll(schemaPath, defs) {
  if (!Ajv) {
    console.error("AJV not installed. Install with: npm install ajv");
    process.exit(2);
  }
  const ajv = new Ajv({ allErrors: true, strict: false });
  const schema = loadSchema(schemaPath);
  const validate = ajv.compile(schema);
  let ok = true;
  for (const d of defs) {
    const valid = validate(d.json);
    if (!valid) {
      ok = false;
      console.error("INVALID:", d.file);
      console.error(validate.errors);
    } else {
      console.log("OK:", d.file);
    }
  }
  if (!ok) process.exit(3);
}

(async function main() {
  const promptSchema = path.join(__dirname, "..", "prompts", "schema.json");
  const agentSchema = path.join(__dirname, "..", "agents", "agent-schema.json");
  const promptDefs = loadDefs(path.join(__dirname, "..", "prompts"));
  const agentDefs = loadDefs(path.join(__dirname, "..", "agents"));

  console.log(`Validating ${promptDefs.length} prompts against ${promptSchema}`);
  console.log(`Validating ${agentDefs.length} agents against ${agentSchema}`);

  if (fs.existsSync(promptSchema)) validateAll(promptSchema, promptDefs);
  if (fs.existsSync(agentSchema)) validateAll(agentSchema, agentDefs);

  console.log("Validation complete");
})();