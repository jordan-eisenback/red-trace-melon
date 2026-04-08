# Agents

This directory contains YAML specs for the AI agents that power the RTM CLI toolchain.

---

## Table of contents

- [How agents work](#how-agents-work)
- [Model setup](#model-setup)
  - [GitHub Models (default — recommended)](#github-models-default--recommended)
  - [Local model via Ollama](#local-model-via-ollama)
- [Environment variables](#environment-variables)
- [Running agents](#running-agents)
- [Agent reference](#agent-reference)
  - [architect-v1](#architect-v1)
  - [code-reviewer-v1](#code-reviewer-v1)
  - [Other agents](#other-agents)
- [Output format](#output-format)
  - [architect-v1 example output](#architect-v1-example-output)
  - [code-reviewer-v1 example output](#code-reviewer-v1-example-output)

---

## How agents work

Each `.yaml` file in this directory defines an agent: its role, prompt templates, tool access, model settings, and a JSON output schema. The runner (`scripts/run-agent.mjs`) loads the spec, fills template variables from CLI flags, calls the configured model adapter, validates the response against the output schema (AJV), and writes the result to `storage/agents/output/`.

```
agents/<id>.yaml
       │
scripts/run-agent.mjs   ← CLI entry point
       │
adapters/<adapter>.cjs  ← model adapter (GitHub Models, Ollama, etc.)
       │
storage/agents/output/  ← JSON output files
```

---

## Model setup

### GitHub Models (default — recommended)

Uses the [GitHub Models](https://docs.github.com/en/github-models) OpenAI-compatible inference endpoint. **No separate API key is needed** — the adapter reads your existing `gh` CLI auth token automatically.

1. Install the [GitHub CLI](https://cli.github.com/) if you haven't already.
2. Authenticate:
   ```bash
   gh auth login
   ```
3. That's it. The `github-models-adapter` reads the token from `gh auth token`.

To override with an explicit token, set `GITHUB_TOKEN` or `GITHUB_MODELS_TOKEN` in `env/.env.local`.

---

### Local model via Ollama

Use the `http-local-adapter` to run agents against a model running on your machine.

1. Install [Ollama](https://ollama.com/download).
2. Pull a model:
   ```bash
   ollama pull llama3
   ```
3. Start the server (runs on `http://localhost:11434` by default):
   ```bash
   ollama serve
   ```
4. Set the endpoint env var in `env/.env.local`:
   ```
   LOCAL_LLM_URL=http://localhost:11434/api/generate
   ```
5. Pass `--adapter http-local-adapter` when running the agent:
   ```bash
   npm run agent -- architect-v1 --adapter http-local-adapter --goal "plan auth module"
   ```

---

## Environment variables

All variables are read from `env/.env.local` (gitignored). Copy `env/.env.example` as a starting point.

| Variable | Description | Default |
|---|---|---|
| `GITHUB_TOKEN` | GitHub Models auth token (auto-read from `gh` CLI if unset) | — |
| `GITHUB_MODELS_TOKEN` | Alias for `GITHUB_TOKEN` | — |
| `LOCAL_LLM_URL` | Endpoint for the http-local-adapter (Ollama etc.) | `http://localhost:8080/generate` |
| `VITE_LOG_LEVEL` | App log level (`debug\|info\|warn\|error`) | `info` |

---

## Running agents

All agents are invoked via `npm run agent:*` scripts or the generic `npm run agent` runner.

| Command | Agent | Description |
|---|---|---|
| `npm run agent:architect` | `architect-v1` | Turns a goal into outcomes, epics, and activities. Auto-loads requirements as context. |
| `npm run agent:review` | `code-reviewer-v1` | Reviews the repo and posts findings. Auto-loads repo snapshot as context. |
| `npm run agent:code-reviewer` | `code-reviewer-v1` | Same agent, raw (no auto-context injection). |
| `npm run agent:design-reviewer` | `design-reviewer-v1` | Reviews UI/UX design decisions. |
| `npm run agent:investigator` | `investigator-v1` | Investigates a bug given a description and stack trace. |
| `npm run agent:qa` | `qa-v1` | Generates a QA test plan for a given scope. |
| `npm run agent:performance-profiler` | `performance-profiler-v1` | Profiles performance characteristics. |
| `npm run agent:accessibility` | `accessibility-auditor-v1` | Audits accessibility against WCAG. |
| `npm run agent:dependency-auditor` | `dependency-auditor-v1` | Audits `package.json` dependencies for risks. |
| `npm run agent:changelog-writer` | `changelog-writer-v1` | Generates a changelog from git history. |
| `npm run agent:docs-auditor` | `docs-auditor-v1` | Audits documentation coverage. |

### Common flags (passed after `--`)

```bash
npm run agent:architect -- --goal "plan RBAC module" --max 50
npm run agent:review -- --goal "focus on security" --no-git
npm run agent -- <agent-id> --dry-run          # print rendered prompt, skip model call
npm run agent -- <agent-id> --no-validate      # skip AJV schema validation
```

### Template variables

| Flag | Template var | Used by |
|---|---|---|
| `--goal "<text>"` | `{{goal}}` | most agents |
| `--stories "<json>"` | `{{stories}}` | `architect-v1` |
| `--bug "<text>"` | `{{bug_description}}` | `investigator-v1` |
| `--test "<text>"` | `{{failing_test}}` | `investigator-v1` |
| `--stack "<text>"` | `{{stack_trace}}` | `investigator-v1` |
| `--scope full\|smoke` | `{{scope}}` | `qa-v1` |
| `--focus "<text>"` | `{{focus}}` | `qa-v1` |
| `--from <ref>` | `{{from_ref}}` | `changelog-writer-v1` |
| `--to <ref>` | `{{to_ref}}` | `changelog-writer-v1` |
| `--version <semver>` | `{{version}}` | `changelog-writer-v1` |

---

## Agent reference

### architect-v1

**File:** `agents/architect.yaml`  
**Role:** High-level planner  
**Adapter:** `github-models-adapter` (default)  
**Memory:** `storage/agents/memory/architect.json` (persistent across runs)  
**Confirmation required:** Yes (`--confirm` flag or interactive prompt)

Takes a goal and a list of requirement stories, and produces a structured plan of outcomes, epics, and ordered activities.

The `npm run agent:architect` wrapper automatically loads all requirements from `src/app/data/initial-requirements.ts` as the `{{stories}}` context — you don't need to pass them manually.

```bash
# Default: auto-loads all requirements
npm run agent:architect -- --goal "plan the RBAC permission system"

# Cap requirements loaded (useful for speed / cost)
npm run agent:architect -- --goal "plan RBAC" --max 20

# Provide your own stories (skips auto-load)
npm run agent:architect -- --goal "plan RBAC" --stories '[{"id":"R-001","req":"..."}]'
```

---

### code-reviewer-v1

**File:** `agents/code-reviewer.yaml`  
**Role:** Repository-wide code reviewer  
**Adapter:** `github-models-adapter` (default)  
**Memory:** disabled  
**Confirmation required:** Yes

Inspects code, tests, and scripts and produces a JSON report of findings categorised by type (architecture, test, security, style, docs, infra) and severity (low, medium, high).

The `npm run agent:review` wrapper automatically injects a repo snapshot (package metadata, file tree, git log, test inventory) into the `{{goal}}` context.

```bash
# Default: full repo snapshot injected automatically
npm run agent:review -- --goal "focus on security"

# Skip git log collection (faster, useful offline)
npm run agent:review -- --goal "security review" --no-git

# Raw run without context injection
npm run agent:code-reviewer -- --goal "review src/app/utils/"
```

---

### Other agents

All other agents follow the same pattern:

```bash
npm run agent -- <agent-id> --adapter github-models-adapter --confirm --goal "<your goal>"
```

See each `.yaml` file for the full prompt templates and output schema.

---

## Output format

Output files are written to `storage/agents/output/` as timestamped JSON files:

```
storage/agents/output/<agent-id>-<timestamp>.json
```

### architect-v1 example output

```json
{
  "outcomes": [
    {
      "id": "O-1",
      "title": "Users can be assigned fine-grained RBAC roles",
      "activities": [
        {
          "id": "A-1.1",
          "title": "Define role taxonomy",
          "steps": [
            { "id": "S-1.1.1", "title": "Enumerate existing permission levels" },
            { "id": "S-1.1.2", "title": "Map permissions to resource types" }
          ]
        },
        {
          "id": "A-1.2",
          "title": "Implement role assignment UI",
          "steps": [
            { "id": "S-1.2.1", "title": "Add RoleSelector component" },
            { "id": "S-1.2.2", "title": "Wire to RequirementsContext" }
          ]
        }
      ]
    }
  ]
}
```

### code-reviewer-v1 example output

```json
{
  "summary": "Overall the codebase is well-structured. Key risks are in localStorage access patterns and missing input bounds on import validators.",
  "findings": [
    {
      "type": "security",
      "file": "src/app/utils/importValidator.ts",
      "severity": "medium",
      "message": "AJV schema for imported JSON has no maxLength bounds on string fields; a malicious file could inject arbitrarily long strings."
    },
    {
      "type": "test",
      "file": "src/__tests__/components.test.tsx",
      "severity": "low",
      "message": "Single test file covers all components; consider splitting into per-component files to improve isolation and CI feedback speed."
    },
    {
      "type": "docs",
      "file": null,
      "severity": "low",
      "message": "No ARCHITECTURE.md found; contributors lack an overview of the data-flow and context hierarchy."
    }
  ]
}
```
