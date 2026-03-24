import { spawnSync } from 'child_process';
import path from 'path';

const ROOT = process.cwd();
const runner = path.join(ROOT, 'scripts', 'run-architect.mjs');
const agent = 'code-reviewer-v1';
const input = path.join(ROOT, 'examples', 'code-review-input.json');

console.log('Running static review process (adapter: static-analyzer)...');
const res = spawnSync('node', [runner, agent, '--input', input, '--adapter', 'static-analyzer', '--confirm'], { stdio: 'inherit' });
if (res.error) {
  console.error('Failed to run static review:', res.error);
  process.exit(1);
}
process.exit(res.status);
