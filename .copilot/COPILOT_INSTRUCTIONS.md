# Copilot Instructions — red-trace-melon

Purpose
- Provide machine-readable guidance for making safe, local-only edits to this workspace.
- Allow implementing features, fixes, and docs by creating/modifying files under c:\projects\red-trace-melon.

Follow COPILOT_PROCESSES.md for detailed processes and best practices. This document summarizes key points.

Authorization (explicit)
- You are authorized to create, edit, and delete files within this workspace (c:\projects\red-trace-melon) to implement user-approved changes.
- Authorization rules:
  - Always create a JSON/text backup of any data file you modify under scripts/backups/ before overwriting.
  - Do not introduce telemetry, analytics, or any outbound network calls.
  - Do not add or commit large model binaries or external datasets. Add such patterns to .gitignore if needed.
  - Never commit secrets, tokens, or private keys. If a secret is required, document how the user should inject it locally (env var).

Coding & commit conventions
- Follow existing project conventions (TypeScript + React + Tailwind).
- Run `npm run build` and `npm test` locally before proposing a commit.
- Suggested commit message format:
  - feat(scope): short description
  - fix(scope): short description
  - chore(scope): short description
- When proposing multi-file changes include a single code block per file with this header comment style:
  - // filepath: c:\path\to\file
  - then the file contents.

Safety & persistence
- Before modifying source data files (src/app/data/*.ts), create a backup:
  - scripts/backups/<timestamp>-<filename>.json
- Use the dev-only save endpoint (POST /api/save-epics) when available to persist UI-driven changes; otherwise produce a script that writes safely and backups first.
- All generated outputs (scripts/*.json, dist/, scripts/backups/) must be .gitignored unless explicitly approved.

Interaction & approvals
- For any change that rewrites or deletes user data or affects Git history (auto-commit, push), present a brief plan and wait for explicit approval.
- For routine UI/UX code, tests, or docs changes, you may create files and provide the git commands to commit/push. You cannot execute git in the user's environment—provide the exact commands for the user to run.

How to present edits
- Use the project's code-block convention when suggesting files. Example:
````markdown
// filepath: c:\projects\red-trace-melon\src\example.ts
// ...existing code...
export function hello() {
    return "hello";
}
````