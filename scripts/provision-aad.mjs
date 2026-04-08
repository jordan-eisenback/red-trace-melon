#!/usr/bin/env node
/**
 * provision-aad.mjs
 * 
 * Creates an AAD app registration and writes credentials to env/.env.local
 * and env/.env.local.user — exac  const filterQuery = new URLSearchParams({
    '$filter': `displayName eq '${APP_NAME}'`,
    '$select': 'id,appId',
  }).toString();
  const existing = await graphGet(token, `/v1.0/applications?${filterQuery}`);ly what `atk provision` would do, but
 * without needing the Toolkit UI or Azure CLI.
 *
 * Usage:
 *   node scripts/provision-aad.mjs
 *
 * Requires: an M365/Azure account with permission to create app registrations.
 * Uses device-code flow — no browser redirect needed.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Helpers ────────────────────────────────────────────────────────────────
function post(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request({ hostname, path, method: 'POST', headers: { 'Content-Length': Buffer.byteLength(data), ...headers } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve(d); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(hostname, urlPath, headers) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://${hostname}${urlPath}`);
    const req = https.request({ hostname: url.hostname, path: url.pathname + url.search, method: 'GET', headers }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve(d); } });
    });
    req.on('error', reject);
    req.end();
  });
}

function graphPost(token, path, body) {
  return post('graph.microsoft.com', path, {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }, body);
}

function graphGet(token, path) {
  return get('graph.microsoft.com', path, { 'Authorization': `Bearer ${token}` });
}

function writeEnvFile(filePath, vars) {
  const existing = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : '';

  const lines = existing.split('\n');
  const updated = { ...vars };

  // Update existing keys, preserve others
  const result = lines.map(line => {
    const eq = line.indexOf('=');
    if (eq < 0) return line;
    const key = line.slice(0, eq).trim();
    if (key in updated) {
      const val = updated[key];
      delete updated[key];
      return `${key}=${val}`;
    }
    return line;
  });

  // Append any new keys that weren't already in the file
  for (const [k, v] of Object.entries(updated)) {
    result.push(`${k}=${v}`);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, result.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n');
  console.log(`  ✓ Written: ${path.relative(ROOT, filePath)}`);
}

// ── Device code flow ───────────────────────────────────────────────────────
const CLIENT_ID = '04b07795-8ddb-461a-bbee-02f9e1bf7b46'; // Azure CLI public client (no secret needed)
const TENANT    = 'organizations'; // any org tenant
const SCOPE     = 'https://graph.microsoft.com/.default offline_access';

async function getTokenViaDeviceCode() {
  const deviceRes = await post(
    'login.microsoftonline.com',
    `/${TENANT}/oauth2/v2.0/devicecode`,
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    `client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPE)}`
  );

  if (!deviceRes.user_code) {
    console.error('Failed to get device code:', deviceRes);
    process.exit(1);
  }

  console.log('\n══════════════════════════════════════════════');
  console.log('  Sign in to authorize AAD app creation:');
  console.log(`  1. Open: ${deviceRes.verification_uri}`);
  console.log(`  2. Enter code: ${deviceRes.user_code}`);
  console.log('══════════════════════════════════════════════\n');

  // Poll until token arrives
  const interval = (deviceRes.interval || 5) * 1000;
  const deadline = Date.now() + (deviceRes.expires_in || 900) * 1000;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, interval));
    const tokenRes = await post(
      'login.microsoftonline.com',
      `/${TENANT}/oauth2/v2.0/token`,
      { 'Content-Type': 'application/x-www-form-urlencoded' },
      `client_id=${CLIENT_ID}&grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=${deviceRes.device_code}`
    );

    if (tokenRes.access_token) {
      console.log('  ✓ Signed in\n');
      return tokenRes;
    }
    if (tokenRes.error === 'authorization_pending') continue;
    console.error('Token error:', tokenRes);
    process.exit(1);
  }

  console.error('Timed out waiting for sign-in');
  process.exit(1);
}

// ── Main ───────────────────────────────────────────────────────────────────
const APP_NAME = 'red-trace-melon-agent-runner';
const ENV_LOCAL      = path.join(ROOT, 'env', '.env.local');
const ENV_LOCAL_USER = path.join(ROOT, 'env', '.env.local.user');

console.log('🔧 red-trace-melon AAD provisioner');
console.log(`   App name: ${APP_NAME}`);
console.log(`   Env file: env/.env.local\n`);

const tokenRes = await getTokenViaDeviceCode();
const token = tokenRes.access_token;

// Get tenant ID from the token claims
const [, payload] = token.split('.');
const claims = JSON.parse(Buffer.from(payload + '==', 'base64').toString());
const tenantId = claims.tid;
console.log(`  Tenant: ${tenantId}`);

// Check if app already exists
console.log('\n📋 Checking for existing app registration…');
const existing = await graphGet(token, `/v1.0/applications?$filter=displayName eq '${APP_NAME}'&$select=id,appId`);
let appId, objectId;

if (existing.value && existing.value.length > 0) {
  appId    = existing.value[0].appId;
  objectId = existing.value[0].id;
  console.log(`  ✓ Found existing app: ${appId}`);
} else {
  // Create the app
  console.log('  Creating new app registration…');
  const created = await graphPost(token, '/v1.0/applications', {
    displayName: APP_NAME,
    signInAudience: 'AzureADMyOrg',
  });

  if (!created.appId) {
    console.error('Failed to create app:', JSON.stringify(created, null, 2));
    process.exit(1);
  }

  appId    = created.appId;
  objectId = created.id;
  console.log(`  ✓ Created app: ${appId}`);
}

// Add a client secret
console.log('\n🔑 Adding client secret…');
const secretRes = await graphPost(token, `/v1.0/applications/${objectId}/addPassword`, {
  passwordCredential: {
    displayName: 'red-trace-melon-runner-secret',
    endDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
  },
});

if (!secretRes.secretText) {
  console.error('Failed to add secret:', JSON.stringify(secretRes, null, 2));
  process.exit(1);
}
const clientSecret = secretRes.secretText;
console.log('  ✓ Secret created (valid 1 year)');

// Write env files
console.log('\n📝 Writing env files…');
writeEnvFile(ENV_LOCAL, {
  TEAMSFX_ENV:               'local',
  MICROSOFT_APP_ID:          appId,
  MICROSOFT_APP_OBJECT_ID:   objectId,
  MICROSOFT_APP_TENANT_ID:   tenantId,
  AAD_APP_OAUTH_AUTHORITY:   `https://login.microsoftonline.com/${tenantId}`,
  AAD_APP_OAUTH_AUTHORITY_HOST: 'https://login.microsoftonline.com',
  MicrosoftAppId:            appId,
  MicrosoftAppTenantId:      tenantId,
});
writeEnvFile(ENV_LOCAL_USER, {
  SECRET_AAD_APP_CLIENT_SECRET: clientSecret,
});

console.log('\n✅ Provision complete!');
console.log(`   App ID:    ${appId}`);
console.log(`   Tenant ID: ${tenantId}`);
console.log(`   Secret:    written to env/.env.local.user (gitignored)`);
console.log('\n   Test with: npm run agent:design-reviewer -- --dry-run --goal "smoke"');
