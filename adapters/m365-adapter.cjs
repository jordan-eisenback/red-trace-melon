'use strict';

/**
 * Microsoft 365 Agents SDK adapter
 *
 * Auth: AAD app credentials provisioned by the Microsoft 365 Agents Toolkit
 * (`atk provision`). No API keys required — uses your M365 account entitlement.
 *
 * Credentials are read from:
 *   .env/.env.local        — written by `atk provision` (MicrosoftAppId, TenantId)
 *   .env/.env.local.user   — written by `atk provision` (SECRET_AAD_APP_CLIENT_SECRET)
 *
 * To provision: open the M365 Agents Toolkit panel in VS Code → Accounts (sign in)
 *               → Lifecycle → Provision
 */

const path = require('path');
const fs   = require('fs');

// ── Load .env files written by Toolkit provision ───────────────────────────
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    // Only set if not already set — process.env takes precedence
    if (k && !(k in process.env)) process.env[k] = v;
  }
}

const ROOT = path.resolve(__dirname, '..');
loadEnvFile(path.join(ROOT, '.env', '.env.local'));
loadEnvFile(path.join(ROOT, '.env', '.env.local.user'));

const APP_ID     = process.env.MicrosoftAppId               || process.env.MICROSOFT_APP_ID               || '';
const APP_SECRET = process.env.SECRET_AAD_APP_CLIENT_SECRET || '';
const TENANT_ID  = process.env.MicrosoftAppTenantId         || process.env.MICROSOFT_APP_TENANT_ID         || '';

// ── Token acquisition via client credentials flow ─────────────────────────
async function getToken() {
  const http  = require('https');
  const url   = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const body  = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     APP_ID,
    client_secret: APP_SECRET,
    scope:         'https://api.botframework.com/.default',
  }).toString();

  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method:  'POST',
      headers: {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) resolve(json.access_token);
          else reject(new Error(`Token error: ${JSON.stringify(json)}`));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Call M365 Copilot via Bot Framework Direct Line ───────────────────────
async function callDirectLine(token, system, user) {
  // This calls the Bot Framework / M365 Agents Playground endpoint.
  // The system prompt is injected as channelData so the model sees it
  // before the user message.
  const https    = require('https');
  const endpoint = process.env.AGENT_ENDPOINT
    || 'https://directline.botframework.com/v3/directline';

  // Step 1: start conversation
  const conv = await new Promise((resolve, reject) => {
    const req = https.request(`${endpoint}/conversations`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
    }, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });

  const conversationId = conv.conversationId;
  if (!conversationId) throw new Error(`Could not start conversation: ${JSON.stringify(conv)}`);

  // Step 2: send activity
  const activity = JSON.stringify({
    type:        'message',
    text:        user,
    channelData: { systemPrompt: system },
    from:        { id: 'agent-runner', name: 'AgentRunner' },
  });

  await new Promise((resolve, reject) => {
    const req = https.request(
      `${endpoint}/conversations/${conversationId}/activities`,
      {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
          'Content-Length': Buffer.byteLength(activity),
        },
      },
      (res) => {
        let d = '';
        res.on('data', c => { d += c; });
        res.on('end', () => resolve(d));
      }
    );
    req.on('error', reject);
    req.write(activity);
    req.end();
  });

  // Step 3: poll for response (up to 60s)
  let watermark = '';
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 2000));

    const activities = await new Promise((resolve, reject) => {
      const qs  = watermark ? `?watermark=${watermark}` : '';
      const req = https.request(
        `${endpoint}/conversations/${conversationId}/activities${qs}`,
        {
          method:  'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        },
        (res) => {
          let d = '';
          res.on('data', c => { d += c; });
          res.on('end', () => {
            try { resolve(JSON.parse(d)); }
            catch (e) { reject(e); }
          });
        }
      );
      req.on('error', reject);
      req.end();
    });

    watermark = activities.watermark || watermark;

    const botMessages = (activities.activities || []).filter(
      a => a.type === 'message' && a.from?.id !== 'agent-runner'
    );

    if (botMessages.length > 0) {
      return botMessages.map(a => a.text || '').join('\n');
    }
  }

  throw new Error('Timed out waiting for model response (60s)');
}

// ── Public interface ───────────────────────────────────────────────────────
async function run(messages = {}, _opts = {}) {
  const { system = '', user = '' } = messages;

  if (!APP_ID || !APP_SECRET) {
    console.warn('\n[m365-adapter] ⚠  Credentials not found — using stub response.');
    console.warn('  To provision: open M365 Agents Toolkit → Accounts → sign in → Lifecycle → Provision\n');
    return {
      text: JSON.stringify({
        status:  'NEEDS_CONTEXT',
        summary: 'M365 app not yet provisioned. Run `atk provision` via the Toolkit extension.',
      }),
      meta: { stub: true },
    };
  }

  console.log('[m365-adapter] Acquiring token…');
  const token = await getToken();

  console.log('[m365-adapter] Sending prompt to M365 Agents runtime…');
  const text = await callDirectLine(token, system, user);

  return { text, meta: { appId: APP_ID, tenantId: TENANT_ID } };
}

module.exports = { run };
