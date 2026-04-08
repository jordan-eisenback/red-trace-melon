/**
 * load-repo-context.cjs
 *
 * Collects a lightweight snapshot of the repository for use as context in
 * agent prompts (primarily code-reviewer-v1 but reusable by other agents).
 *
 * Output (to stdout):
 *   A compact text block describing:
 *     - top-level folder structure
 *     - src/ file tree (paths only)
 *     - key package.json metadata (name, version, deps count, scripts)
 *     - test counts from vitest config if discoverable
 *     - recent git log (last 10 commits, one-line)
 *
 * Usage:
 *   node scripts/load-repo-context.cjs
 *   node scripts/load-repo-context.cjs --no-git    (skip git log)
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');

const ROOT     = path.resolve(__dirname, '..');
const NO_GIT   = process.argv.includes('--no-git');

// ── Helpers ────────────────────────────────────────────────────────────────

function safeExec(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function walkSrc(dir, maxDepth = 4, depth = 0) {
  if (depth > maxDepth) return [];
  const IGNORE = new Set(['node_modules', 'dist', '.git', 'coverage', 'backups', 'storage', 'processes']);
  const lines = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return lines; }
  for (const e of entries) {
    if (IGNORE.has(e.name)) continue;
    const rel = path.relative(ROOT, path.join(dir, e.name));
    const indent = '  '.repeat(depth);
    if (e.isDirectory()) {
      lines.push(`${indent}${e.name}/`);
      lines.push(...walkSrc(path.join(dir, e.name), maxDepth, depth + 1));
    } else {
      lines.push(`${indent}${e.name}`);
    }
  }
  return lines;
}

// ── Collect context ────────────────────────────────────────────────────────

const sections = [];

// 1. Package metadata
const pkgPath = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const depCount  = Object.keys(pkg.dependencies  ?? {}).length;
  const devCount  = Object.keys(pkg.devDependencies ?? {}).length;
  const scriptNames = Object.keys(pkg.scripts ?? {}).join(', ');
  sections.push([
    '=== PACKAGE ===',
    `name: ${pkg.name}`,
    `version: ${pkg.version}`,
    `type: ${pkg.type ?? 'commonjs'}`,
    `dependencies: ${depCount} prod, ${devCount} dev`,
    `scripts: ${scriptNames}`,
  ].join('\n'));
}

// 2. Top-level file tree (shallow)
const topLevel = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => !['node_modules', '.git', 'dist', 'coverage'].includes(e.name))
  .map(e => `${e.isDirectory() ? e.name + '/' : e.name}`)
  .join('\n');
sections.push(`=== TOP-LEVEL ===\n${topLevel}`);

// 3. src/ tree
const srcDir = path.join(ROOT, 'src');
if (fs.existsSync(srcDir)) {
  const tree = walkSrc(srcDir).join('\n');
  sections.push(`=== SRC TREE ===\n${tree}`);
}

// 4. e2e/ tree (shallow)
const e2eDir = path.join(ROOT, 'e2e');
if (fs.existsSync(e2eDir)) {
  const files = fs.readdirSync(e2eDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
  sections.push(`=== E2E SPECS ===\n${files.join('\n')}`);
}

// 5. agents/ list
const agentsDir = path.join(ROOT, 'agents');
if (fs.existsSync(agentsDir)) {
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  sections.push(`=== AGENTS ===\n${agentFiles.join('\n')}`);
}

// 6. Recent git log
if (!NO_GIT) {
  const log = safeExec('git log --oneline -10');
  if (log) sections.push(`=== GIT LOG (last 10) ===\n${log}`);
}

// 7. Test file count
const testDir = path.join(ROOT, 'src', '__tests__');
if (fs.existsSync(testDir)) {
  const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
  sections.push(`=== TESTS ===\n${testFiles.length} unit test files in src/__tests__/\n${testFiles.join('\n')}`);
}

// ── Output ─────────────────────────────────────────────────────────────────
process.stdout.write(sections.join('\n\n'));
