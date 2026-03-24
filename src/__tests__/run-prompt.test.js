const path = require("path");
const fs = require("fs");
const { runPrompt } = require(path.join(__dirname, "..", "..", "runners", "run-prompt.js"));

// Create a stub adapter in adapters/tmp-stub-adapter.js for tests
const stubAdapterPath = path.join(__dirname, "..", "..", "adapters", "tmp-stub-adapter.js");
beforeAll(() => {
  if (!fs.existsSync(path.dirname(stubAdapterPath))) fs.mkdirSync(path.dirname(stubAdapterPath), { recursive: true });
  fs.writeFileSync(stubAdapterPath, `module.exports = { run: async () => ({ text: JSON.stringify({ outcomes: [] }) }) };`);
});

afterAll(() => {
  if (fs.existsSync(stubAdapterPath)) fs.unlinkSync(stubAdapterPath);
});

test("runPrompt parses valid JSON output", async () => {
  const input = { goal: "Test goal", stories: [] };
  const res = await runPrompt("mapper-v1", input, "tmp-stub-adapter", { confirmed: true });
  expect(res.parsed).toBeDefined();
  expect(res.parsed.outcomes).toBeDefined();
});

test("runPrompt fails schema validation when invalid", async () => {
  // create a temporary agent that expects a required prop that will be missing
  const agentPath = path.join(__dirname, "..", "..", "agents", "tmp-agent.yaml");
  const yaml = `
id: tmp-agent
name: tmp
prompt:
  system: "sys"
  user: "u"
output_format: json
output_schema:
  type: object
  required: ["mustExist"]
`;
  fs.writeFileSync(agentPath, yaml);
  // stub adapter returns an empty object (invalid)
  const stubAdapter = path.join(__dirname, "..", "..", "adapters", "tmp-stub2-adapter.js");
  fs.writeFileSync(stubAdapter, `module.exports = { run: async () => ({ text: JSON.stringify({}) }) };`);
  let threw = false;
  try {
    await runPrompt("tmp-agent", {}, "tmp-stub2-adapter", { confirmed: true });
  } catch (e) {
    threw = true;
  } finally {
    fs.unlinkSync(agentPath);
    fs.unlinkSync(stubAdapter);
  }
  expect(threw).toBe(true);
});