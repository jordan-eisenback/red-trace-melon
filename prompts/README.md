# Prompts & Agents

- Prompts live in `prompts/` (simple prompt defs).
- Agents live in `agents/` (gstack-compatible files: role, capabilities, run_policy).
- Each definition should conform to:
  - `prompts/schema.json` for prompts
  - `agents/agent-schema.json` for agents

Usage
- Validate all prompt/agent files:
  - npm install ajv js-yaml
  - node scripts/validate-prompts.js
- List and run via CLI:
  - node cli/index.js list
  - node cli/index.js run <id> --input <examples/...json> --confirm

Safety
- Agents may include `run_policy` to control file writes/git commits/confirmation.
- Runner enforces `run_policy` and will refuse runs that violate it unless you pass flags at runtime.