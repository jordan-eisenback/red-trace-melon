import fs from 'fs/promises';
import path from 'path';

// Use current working directory as repo root (works on Windows and POSIX)
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'examples', 'code-review-input.json');

const SKIP = ['node_modules', '.git', 'storage', 'scripts/backups', 'dist', 'build'];
const MAX_BYTES = 20000; // limit per file

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = path.relative(ROOT, path.join(dir, e.name));
    if (SKIP.some(s => rel.startsWith(s))) continue;
    if (e.isDirectory()) {
      files.push(...await walk(path.join(dir, e.name)));
    } else if (e.isFile()) {
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}

async function collect() {
  const files = await walk(ROOT);
  files.sort();
  const snippets = [];
  for (const f of files) {
    try {
      const rel = path.relative(ROOT, f);
      const raw = await fs.readFile(f, 'utf8');
      const content = raw.slice(0, MAX_BYTES);
      snippets.push(`--- FILE: ${rel} ---\n${content}\n`);
    } catch (e) {
      // skip binary or unreadable
      continue;
    }
  }

  const goal = `REPO CONTEXT:\n${snippets.join('\n')}\n\nTask: Provide a repository review (architecture, major risks, test coverage gaps, security issues, docs gaps).`;

  const out = { goal };
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote example input to:', OUT);
}

collect().catch((err) => { console.error(err); process.exit(1); });
