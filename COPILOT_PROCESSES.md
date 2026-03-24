# Copilot processes — red-trace-melon

This document defines concrete, repeatable processes that the copilot assistant (and contributors) will follow when working in this repository. It's inspired by gstack development practices but scoped to this project and the local-only agent/runner tooling in `scripts/` and `runners/`.

## Quick commands

Use the project's existing scripts and runner where possible. Examples below assume you're in the repository root.

```bash
# Build the webapp
npm run build

# Run unit tests
npm test

# Run the local agent runner (ESM helper) — default agent: architect-v1
node scripts/run-architect.mjs <agent-id> --input <examples/...json> --adapter <adapter-name> --confirm

# Collect repo context for a code review (creates examples/code-review-input.json)
node scripts/collect-repo-context.mjs

# Run the code-reviewer agent with the stub adapter (dry-run)
node scripts/run-architect.mjs code-reviewer-v1 --input examples/code-review-input.json --adapter stub-adapter --confirm

# If you have a local LLM HTTP endpoint, set LOCAL_LLM_URL and use the http-local-adapter
LOCAL_LLM_URL=http://localhost:8080/generate node scripts/run-architect.mjs code-reviewer-v1 --input examples/code-review-input.json --adapter http-local-adapter --confirm
```

## Core processes the copilot must follow

These are concrete steps the assistant will perform automatically or on request. They are written so they can be executed manually or wired to automation later.

1) Pre-edit safety checks (before making edits or proposing patches)
  - Run `npm test`. If tests fail, gather failing test output and do not propose changes that would further break tests unless the change fixes the failures.
  - Run `npm run build`. If the build fails, do NOT propose or apply changes that make the build harder to fix.
  - Run `node scripts/collect-repo-context.mjs` to snapshot repository context before large, repo-wide changes.

2) Small change workflow (one or a few files)
  - Create a focused patch using the repository's editing workflow (apply_patch via the assistant or local edits).
  - Run unit tests locally: `npm test` and ensure no regressions.
  - Run `npm run build` to ensure app still compiles.
  - Stage and create a bisected commit: one logical change per commit. When in doubt, split rename/refactor/test changes into separate commits.
  - Push the branch and open a PR with a short summary and the precise commands run.

3) Agent-driven repository review (what the assistant will do when asked to "review the repo")
  - Run `node scripts/collect-repo-context.mjs` to prepare `examples/code-review-input.json`.
  - Run `node scripts/run-architect.mjs code-reviewer-v1 --input examples/code-review-input.json --adapter stub-adapter --confirm` to validate the run pipeline end-to-end (dry-run).
  - If a local LLM is available and configured at `LOCAL_LLM_URL`, re-run with `http-local-adapter` to get an LLM-powered review (careful: verify the adapter's safety checks before allowing external content).
  - For deterministic, immediate results without an LLM, run the static analyzer adapter (if present) which performs lightweight checks: TODO/FIXME scan, test coverage heuristics, CI config presence, package.json scripts, presence of build artifacts, and large binary files. If a static analyzer is not present, the assistant will implement one and run it.

4) Auto-apply agent outputs (when allowed)
  - Agent `run_policy` controls file writes and commits. The assistant will never write files or make commits unless:
    - The agent's `run_policy.allow_file_write` or `allow_git_commit` is true, or
    - The user explicitly invoked the run with `--confirm` and requested write/commit permissions via the CLI flags.
  - Before applying any agent output to source files, the assistant will create a timestamped backup under `scripts/backups/`.

5) Long-running evals and E2E tests
  - The assistant will poll E2E or eval jobs until completion, reporting progress periodically. It will not stop polling until the job completes or the user cancels.
  - For diff-based tests, the assistant will use the existing selection logic (git diff + touchfiles). If forced to run all tests, it will use the `:all` variants or set the `EVALS_ALL=1` environment variable.

## Commit and changelog guidance

- Always bisect commits: each commit should represent one logical change. Split mechanical refactors, tests, and implementation into separate commits.
- CHANGELOG entries are written at ship time, not during development. The assistant will not generate or modify `CHANGELOG.md` until the branch is ready to ship; when asked it will create a consumer-friendly entry describing the feature in plain language.

## Safety and privacy

- The assistant will follow agent run policies and will not exfiltrate secrets. Local adapters are preferred; `http-local-adapter` may be used only if the user has configured `LOCAL_LLM_URL` and acknowledged the network boundary.
- The assistant will not enable telemetry or external data collection by default.

## How the assistant will follow these processes

- The assistant will perform checks and run commands automatically where possible (tests, build, collect context) before editing.
- For repo-wide analysis, the assistant will prefer the static analyzer (deterministic) first, then optionally run an LLM-backed reviewer if the user requests and confirms network usage.
- Any change that writes files will be done only with explicit confirmation and after taking backups.

## Example: request a full repo review and fix loop

1. User: "Review the codebase, find high-severity issues, and open PRs for fixes."
2. Assistant does:
   - Run pre-edit checks (`npm test`, `npm run build`).
   - Run `node scripts/collect-repo-context.mjs`.
   - Run the deterministic static analyzer. Produce a findings report and display a prioritized TODO list.
   - Ask the user whether to attempt fixes for low-risk items automatically (e.g., format, small typos, missing readme sections).
   - If user agrees, apply changes as small, bisected commits; run tests/build after each commit; create PRs and include the static analyzer report in the PR body.

## Adding new processes

To add or update a process, edit this file and include:
- A short name for the process
- Steps in order (commands + safety checks)
- Expected outputs and where artifacts are stored

When the assistant updates processes, it will run them locally and provide the run artifacts, diffs, and suggested commits to the user for approval.

---

If you'd like, I can also:
- Implement a small CLI `scripts/copilot-process.js` that runs named processes from this file (e.g., `collect-context`, `static-analyze`, `review-and-fix`) and produces consistent artifacts.
- Add a formal machine-readable process manifest (JSON) under `.copilot/processes.json` so automation can call specific processes reliably.

Tell me which of those you'd like next (script, manifest, or both), or ask me to run a specific process now.
