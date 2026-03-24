// CommonJS stub adapter for testing agents locally
// Returns a minimal JSON story map based on the `user` text (extracts the goal)
module.exports = {
  run: async function ({ system = "", user = "" } = {}, opts = {}) {
    let goal = "";
    const m = user.match(/Goal:\s*(.*)/i) || user.match(/Input goal:\s*(.*)/i) || user.match(/Input goal:\s*(.*)$/im);
    if (m && m[1]) goal = m[1].trim();
    if (!goal) {
      const lines = user.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      goal = lines.length ? lines[0].slice(0, 120) : "Improve system";
    }

    const outcomeId = `OUT-${Date.now()}`;
    const activityId = `ACT-${Date.now()}`;
    const stepId = `STEP-${Date.now()}`;

    const result = {
      outcomes: [
        {
          id: outcomeId,
          title: goal,
          activities: [
            {
              id: activityId,
              title: `Initial activity for ${goal}`,
              steps: [
                { id: stepId, title: `Create initial stories for ${goal}` }
              ]
            }
          ]
        }
      ]
    };

    return { text: JSON.stringify(result), meta: { stub: true } };
  }
};
