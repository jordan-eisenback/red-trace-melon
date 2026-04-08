'use strict';

/**
 * GitHub Models adapter
 *
 * Uses the OpenAI-compatible GitHub Models inference endpoint.
 * Auth: your existing `gh` CLI token — no separate API key needed.
 *
 * Endpoint: https://models.inference.ai.azure.com
 * Docs:     https://docs.github.com/en/github-models
 *
 * Token is read from (in priority order):
 *   1. GITHUB_TOKEN env var
 *   2. `gh auth token` CLI output
 *   3. GITHUB_MODELS_TOKEN env var (alias)
 */

'use strict';

const https = require('https');
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

// ── Load env files ─────────────────────────────────────────────────────────
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (k && !(k in process.env)) process.env[k] = v;
  }
}

const ROOT = path.resolve(__dirname, '..');
loadEnvFile(path.join(ROOT, 'env', '.env.local'));
loadEnvFile(path.join(ROOT, 'env', '.env.local.user'));

// ── Resolve GitHub token ───────────────────────────────────────────────────
function resolveToken() {
  if (process.env.GITHUB_TOKEN)        return process.env.GITHUB_TOKEN;
  if (process.env.GITHUB_MODELS_TOKEN) return process.env.GITHUB_MODELS_TOKEN;
  try {
    return execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

// ── Call GitHub Models (OpenAI-compatible) ─────────────────────────────────
async function callGitHubModels(token, system, user, model) {
  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system',  content: system },
      { role: 'user',    content: user   },
    ],
    temperature: 0.2,
    max_tokens:  4096,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'models.inference.ai.azure.com',
      path:     '/chat/completions',
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          if (json.error) {
            reject(new Error(`GitHub Models error: ${JSON.stringify(json.error)}`));
          } else {
            resolve(json.choices?.[0]?.message?.content ?? '');
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Public interface ───────────────────────────────────────────────────────
async function run(messages = {}, opts = {}) {
  const { system = '', user = '' } = messages;
  const model = opts.model
    || process.env.GITHUB_MODELS_MODEL
    || 'gpt-4o';

  const token = resolveToken();
  if (!token) {
    throw new Error(
      'No GitHub token found. Run `gh auth login` or set GITHUB_TOKEN env var.'
    );
  }

  console.log(`[github-models-adapter] model=${model}`);
  const text = await callGitHubModels(token, system, user, model);
  return { text, meta: { model, adapter: 'github-models' } };
}

module.exports = { run };
