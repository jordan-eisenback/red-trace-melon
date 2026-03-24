import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function backupFile(targetPath) {
  const backupsDir = path.join(process.cwd(), 'scripts', 'backups');
  ensureDir(backupsDir);
  const base = path.basename(targetPath);
  const ts = Date.now();
  const dst = path.join(backupsDir, `${ts}-${base}.bak`);
  if (fs.existsSync(targetPath)) fs.copyFileSync(targetPath, dst);
  return dst;
}

function writeStoryMapToFile(storyMap, targetPath) {
  const content = `import { StoryMap } from "../types/storymap";

export const initialStoryMap: StoryMap = ${JSON.stringify(storyMap, null, 2)};
`;
  fs.writeFileSync(targetPath, content, 'utf8');
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: node scripts/apply-storymap.mjs <path-to-run-artifact.json>');
    process.exit(1);
  }
  const runFile = argv[0];
  if (!fs.existsSync(runFile)) {
    console.error('Run file not found:', runFile);
    process.exit(2);
  }

  const raw = fs.readFileSync(runFile, 'utf8');
  const obj = JSON.parse(raw);
  const parsed = obj.parsed || (obj.result && obj.result.text ? JSON.parse(obj.result.text) : null);
  if (!parsed) {
    console.error('No parsed JSON found in run artifact.');
    process.exit(3);
  }

  const targetPath = path.join(process.cwd(), 'src', 'app', 'data', 'initial-storymap.ts');
  const backup = backupFile(targetPath);
  writeStoryMapToFile(parsed.outcomes || parsed, targetPath);
  console.log('Backed up old file to:', backup);
  console.log('Wrote new story map to:', targetPath);
}

main().catch((err) => {
  console.error('Error applying story map:', err.message);
  process.exit(4);
});
