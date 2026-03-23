const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, 'generated');
fs.mkdirSync(outDir, { recursive: true });

function run(script) {
  if (!fs.existsSync(path.resolve(__dirname, script))) return;
  console.log('Running', script);
  const res = spawnSync('node', [path.resolve(__dirname, script)], { stdio: 'inherit' });
  if (res.status !== 0) console.warn(script, 'exited with', res.status);
}

// List of scripts that generate artifacts we care about. They will produce files in scripts/ which
// are then copied into scripts/generated/ for preservation.
const producers = [
  'generate-capability-diagnostic.cjs',
  'propose-unmapped-caps.cjs',
  'propose-mappings.cjs',
  // add others as needed
];

producers.forEach(run);

// Move JSON/CSV/TXT outputs into generated folder
const files = fs.readdirSync(__dirname).filter((f) => /\.(json|csv|txt)$/.test(f));
files.forEach((f) => {
  const src = path.resolve(__dirname, f);
  const dst = path.resolve(outDir, f);
  fs.copyFileSync(src, dst);
  console.log('Copied', f, 'to generated/');
});

console.log('Artifacts regenerated into scripts/generated/');
