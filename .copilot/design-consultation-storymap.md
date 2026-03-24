# /design-consultation-storymap — Story Mapping UI design consultation

This document defines a manual, provoked design consultation process tailored to the Story Mapping UI in this repository. It's a focused variant of a general design consultation: product-context discovery, research (optional), a complete visual & interaction proposal, a self-contained preview page, and a generated `DESIGN.md` specific to the story map interface (outcomes → activities → steps).

Invoke only when the user requests `/design-consultation` or explicitly asks for a design system for the Story Mapping UI.

## Quick pre-commands

```bash
# collect product context (same script used by code-review)
node scripts/collect-repo-context.mjs

# run a static code review targeted at UI files
node scripts/run-architect.mjs code-reviewer-v1 --input examples/code-review-input.json --adapter stub-adapter --confirm

# run a storymap-focused static analyzer (if present)
node scripts/processes/run-static-review.mjs --focus storymap
```

## Purpose & scope

Goal: deliver a complete, coherent, and implementable design system for the Story Mapping UI that supports:
- Horizontal, end-to-end story maps (outcomes laid out left→right, activities and steps aligned beneath)
- Auto-generation from epics/stories (clear mapping of data → visual entities)
- Accessibility, keyboard-first interactions, and compact responsive behavior

Scope: the proposal includes visual tokens (color, type, spacing), component specs (cards, swimlanes, connectors), interaction patterns (drag/drop, keyboard, zoom), a preview HTML page, and `DESIGN.md` written into the repository when the user approves.

## Phase 0 — Pre-checks

1. Look for existing design docs or data models:

```bash
ls DESIGN.md design-system.md src/app/data/initial-storymap.ts src/app/components/StoryMapping* 2>/dev/null || true
```

2. Run project sanity checks:
- `npm test` — abort if tests are failing in ways unrelated to docs; record failures.
- `npm run build` — abort if the app does not build.

3. Snapshot repository context:
- `node scripts/collect-repo-context.mjs` → `examples/code-review-input.json`

If a `DESIGN.md` exists, ask the user: Update it, merge ideas, or start fresh? Use AskUserQuestion to confirm.

## Phase 1 — Product context & constraints

Ask one compact question (AskUserQuestion) that the user can answer quickly. Pre-fill from README/office-hours if available.

AskUserQuestion Q1 (pre-fill where possible):
1) Who are the primary users of the Story Map UI? (PMs, designers, devs, stakeholders)
2) What is the canonical workflow? (discover → plan → commit → track; or lightweight ideation?)
3) Must-haves: export formats (CSV, JSON), integrations (Jira, GitHub), concurrency model (multi-user live edits), persistence strategy.
4) Preferences: dense data (lots of steps visible) vs focused (one active outcome visible).

If the user answers with missing items, the assistant will call back with short clarification questions (maximum 3 follow-ups) before proceeding.

## Phase 2 — Optional research

If the user requests competitive or pattern research, do a short search and capture examples (Miro Story Mapping, StoriesOnBoard, Jira Align, Card-based roadmaps). Produce a 1-paragraph synthesis: common layout patterns, affordances, and notable interaction choices. If a headless browser is available, take 2–3 screenshots.

If the user says "no research," skip and proceed to Phase 3 using best-practice defaults.

## Phase 3 — Complete proposal (deliverable)

Produce a single coherent proposal that includes the following sections. Present them in an AskUserQuestion with a recommended option and 3 alternatives.

1) Visual system (tokens):
- Color palette: primary, surface, neutral scale, accent, danger, success. Provide hex values and usage rules (e.g., primary used for action CTAs and active swimlane borders).
- Typography: Display/heading, UI labels, body, monospace/data font. Provide font names, stacks, and fallback strategy.
- Spacing: base unit (4px or 8px), densities (compact/comfortable), component padding rules.

2) Layout & composition:
- Story map canvas: horizontal flow left→right, with outcomes as primary columns. Each outcome column contains ordered activities. Each activity expands vertically into steps.
- Swimlane rules: Activities aligned under outcomes; steps as draggable cards; allow multi-row activities when content overflows.
- Canvas sizing & zoom: pinch/ctrl+scroll to zoom; double-click to center; fit-to-width toggle.

3) Components & variants:
- Outcome column: header (title, progress, owner), metadata row (confidence, priority badges), actions menu.
- Activity card: title, KPI tag, linked story IDs, quick-add step button.
- Step card: title, linked requirements, estimate, status pill (todo/in-progress/done), drag-handle, context menu.
- Connectors: visual link styles for dependencies: solid (blocking), dashed (recommended), arrow heads for direction.

4) Interaction patterns:
- Selection model: single-click selects, shift+click multi-select, arrow-keys to move focus across steps.
- Keyboard-first editing: Enter to edit title, Ctrl+Enter to confirm, Esc to cancel.
- Drag and drop: support Reorder (within activity), Move (activity→activity), Promote/Demote (step ↔ activity).
- Bulk actions: multi-select then action menu (assign, tag, move).

5) Auto-generation heuristics (mapping stories/epics → outcomes/activities/steps):
- Rule set: group epics into outcomes by semantic similarity (shared label/feature area), activities are derived from epic's child stories, steps are story acceptance steps or checkpoints.
- Fallback: if mapping ambiguity detected, prompt user with 3 suggested mappings and the confidence score.

6) Accessibility & internationalization:
- Colors meet WCAG AA for normal text; provide contrast pairs in the palette.
- Keyboard navigation & focus order guaranteed; ARIA roles for canvas, column, and card elements.

7) Motion & affordances:
- Micro-interactions (150ms ease-out) for drag feedback, 100–120ms for hover elevation.
- Motion should not be required for comprehension; provide a reduced-motion mode.

8) Developer artifacts & outputs:
- HTML/CSS preview (single file) demonstrating tokens and 2 mock layouts (dashboard and compact planner).
- `DESIGN.md` with the design system scoped to the Story Mapping UI.
- Component spec snippets (props and data shape) for `OutcomeColumn`, `ActivityCard`, `StepCard`.

## Phase 4 — Preview page requirements

The preview must be a single self-contained HTML file demonstrating:
- Tokens applied to a small, realistic story map with 2 outcomes, 3 activities each, and 2–4 steps per activity.
- Light/dark toggle using CSS custom properties.
- Interactive demo for drag (simulated), keyboard navigation, and a visible auto-generate mapping preview button.
- Export sample: a button that downloads the shown map as JSON.

If `open` is available in the environment, open the preview automatically; otherwise print the path.

## Phase 5 — Write `DESIGN.md` and commit (on approval)

If the user selects "Ship it" the assistant will:
1. Create a timestamped backup of existing `DESIGN.md` (if present) to `scripts/backups/`.
2. Write `DESIGN.md` at repo root with the Story Mapping section (tokens, components, spacing, accessibility notes, and auto-generation rules).
3. Run `npm test` and `npm run build` and surface results.
4. Stage and create a bisected commit with message `docs: add DESIGN.md (story mapping)` and push or create a PR if the user requests.

The assistant will only write/commit with explicit confirmation and will obey agent `run_policy`.

## Phase 6 — Drill-downs

Available drill-downs (AskUserQuestion):
- Fonts: show 3 font stacks for headings and body.
- Color palettes: provide 3 candidate palettes with hex values and WCAG contrast checks.
- Density: demonstrate compact vs comfortable spacing with screenshots.
- Motion: show micro-interaction timings and reduced-motion alternatives.

Each drill-down returns a revised preview and updated `DESIGN.md` snippet for that section.

## Acceptance criteria

- Preview page renders correctly in a modern browser and demonstrates tokens and interactions.
- DESIGN.md contains tokens, component specs, auto-generation mapping rules, accessibility notes, and examples.
- Auto-generation heuristics are documented with confidence thresholds and prompt templates for ambiguous mappings.

## Examples of AskUserQuestion prompts the assistant will use

Q: "I can generate a complete design for the Story Mapping UI. Do you want me to: A) Research competitors then propose, B) Skip research and propose from best-practice defaults, C) Only produce tokens (colors, type) now?"

Q (after proposal): "Ship this DESIGN.md and preview page to the repo? A) Ship it (write DESIGN.md + preview), B) Keep as draft (no write), C) Tweak colors, D) Tweak layout"

## Safety & constraints

- The assistant will not use external APIs unless the user explicitly allows the `http-local-adapter` and `LOCAL_LLM_URL` is set.
- All file writes require confirmation; backups are created automatically.

## Implementation notes for the assistant

- When producing `DESIGN.md`, the assistant will include example component props and the canonical data shapes used by the app (map outcome.id -> activities[].steps[]). If those types are missing in the repo, the assistant will propose a minimal TypeScript type and save it under `src/app/types/storymap.ts` on approval.
- The assistant will run `npm test` and `npm run build` after any commit that modifies source files and will surface failures immediately.

---

If you'd like, I can now:
- A) Generate the initial proposal (no research) and show it inline.
- B) Run optional research (WebSearch + screenshots) then produce the proposal.
- C) Generate the preview HTML file now (no commit) so you can review visually.

Tell me which option to take and I'll execute it.
