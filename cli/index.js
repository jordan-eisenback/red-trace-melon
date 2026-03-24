const fs = require("fs");
const path = require("path");
const { runPrompt, readPromptDef } = require(path.join(__dirname, "..", "runners", "run-prompt.js"));

function printUsage() {
  console.log("Usage:");
  console.log("  node cli/index.js list");
  console.log("  node cli/index.js run <promptId> --input <file.json> [--adapter <adapterName>] [--confirm] [--write] [--commit]");
  console.log("");
  console.log("Options:");
  console.log("  --confirm   Acknowledge agent run_policy.require_confirmation and proceed");
  console.log("  --write     Request file-write permissions (may be denied by agent run_policy)");
  console.log("  --commit    Request git-commit permissions (may be denied by agent run_policy)");
}

async function main(argv) {
  const cmd = argv[2];
  if (cmd === "list") {
    const pdir = path.join(__dirname, "..", "prompts");
    const adir = path.join(__dirname, "..", "agents");
    const files = []
      .concat(fs.existsSync(pdir) ? fs.readdirSync(pdir).filter((f) => f.endsWith(".json") || f.endsWith(".yaml")) : [])
      .concat(fs.existsSync(adir) ? fs.readdirSync(adir).filter((f) => f.endsWith(".json") || f.endsWith(".yaml")) : []);
    const prompts = files.map((f) => {
      try {
        const j = readPromptDef(f.replace(/\.(json|yaml)$/, ""));
        return { id: j.id, name: j.name, description: j.description };
      } catch (e) {
        return { id: f, name: "<invalid>", description: e.message };
      }
    });
    console.table(prompts);
    return;
  }

  if (cmd === "run") {
    const promptId = argv[3];
    if (!promptId) {
      console.error("Usage: node cli/index.js run <promptId> --input <path.json> [--adapter <name>] [--confirm]");
      process.exit(1);
    }

    const inputArgIndex = argv.indexOf("--input");
    const adapterArgIndex = argv.indexOf("--adapter");
    const confirmFlag = argv.includes("--confirm");
    const writeFlag = argv.includes("--write");
    const commitFlag = argv.includes("--commit");

    const inputPath = inputArgIndex >= 0 ? argv[inputArgIndex + 1] : null;
    const adapter = adapterArgIndex >= 0 ? argv[adapterArgIndex + 1] : "http-local-adapter";

    let input = {};
    if (inputPath) {
      if (!fs.existsSync(inputPath)) {
        console.error("Input file not found:", inputPath);
        process.exit(2);
      }
      input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    }

    // Surface run_policy and require confirmation
    try {
      const def = readPromptDef(promptId);
      const rp = def.run_policy || {};
      if (Object.keys(rp).length > 0) {
        console.log("Agent run_policy:");
        console.log(`  allow_file_write: ${rp.allow_file_write === true}`);
        console.log(`  allow_git_commit: ${rp.allow_git_commit === true}`);
        console.log(`  require_confirmation: ${rp.require_confirmation === true}`);
      }
      if (rp.require_confirmation && !confirmFlag) {
        console.error("This agent requires confirmation to run (run_policy.require_confirmation).");
        console.error("Rerun with --confirm to acknowledge and proceed.");
        process.exit(4);
      }
    } catch (e) {
      console.error("Error loading agent/prompt definition:", e.message);
      process.exit(5);
    }

    const adapterOpts = {
      confirmed: !!confirmFlag,
      requestedFileWrite: !!writeFlag,
      requestedGitCommit: !!commitFlag,
    };

    try {
      const res = await runPrompt(promptId, input, adapter, adapterOpts);
      console.log("Run saved:", res.runFile);
      console.log("Parsed output:");
      console.log(JSON.stringify(res.parsed, null, 2));
    } catch (e) {
      console.error("Error:", e.message);
      process.exit(3);
    }
    return;
  }

  printUsage();
}

if (require.main === module) {
  main(process.argv);
}