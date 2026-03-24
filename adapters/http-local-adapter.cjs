const fetch = require('node-fetch');
const URL = process.env.LOCAL_LLM_URL || 'http://localhost:8080/generate';

module.exports = {
  run: async function ({ system = '', user = '' } = {}, opts = {}) {
    // Basic safety: block outbound URLs in prompts unless explicitly allowed
    const combined = `${system}\n${user}`;
    const urlRegex = /\bhttps?:\/\/[^\s]+/i;
    if (urlRegex.test(combined) && !opts.allow_external) {
      throw new Error('Prompt contains external URL; adapter is configured to block external content.');
    }

    const body = { system, user, options: opts.options || {} };
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Local LLM returned ${res.status}: ${txt}`);
    }
    const json = await res.json();
    // Expect local LLM to return { text: '...', meta: {} }
    return { text: json.text || (json.output || ''), meta: json.meta || {} };
  }
};
