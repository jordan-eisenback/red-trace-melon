import React, { useMemo, useState, useRef, useEffect } from "react";
import { useEpics } from "../contexts/EpicContext";
import { Plus, Clock, Filter, X, BookOpen, Search, Link2, Unlink, Zap } from "lucide-react";
import { toast } from "sonner";
import type { StoryMapOutcome, StoryMapActivity, StoryMapStep } from "../types/storymap";
import type { UserStory } from "../types/epic";
import { computeAutoLinks, previewAutoLinks, type AutoLinkResult } from "../utils/autolinkStories";

// ── colour maps ────────────────────────────────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  joiner:     "bg-emerald-100 text-emerald-800 border-emerald-200",
  mover:      "bg-blue-100 text-blue-800 border-blue-200",
  leaver:     "bg-red-100 text-red-800 border-red-200",
  governance: "bg-purple-100 text-purple-800 border-purple-200",
  contractor: "bg-amber-100 text-amber-800 border-amber-200",
};
const PHASE_HEADER: Record<string, string> = {
  joiner:     "border-t-emerald-500",
  mover:      "border-t-blue-500",
  leaver:     "border-t-red-500",
  governance: "border-t-purple-500",
  contractor: "border-t-amber-500",
};
const COMPLIANCE_COLORS: Record<string, string> = {
  SOC2:     "bg-blue-50 text-blue-700 border-blue-200",
  ISO27001: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SOX:      "bg-orange-50 text-orange-700 border-orange-200",
  GDPR:     "bg-green-50 text-green-700 border-green-200",
  HIPAA:    "bg-pink-50 text-pink-700 border-pink-200",
  NIST:     "bg-slate-50 text-slate-700 border-slate-200",
};
const PERSONA_COLORS: Record<string, string> = {
  "HR":        "bg-rose-100 text-rose-700",
  "IT Admin":  "bg-cyan-100 text-cyan-700",
  "Manager":   "bg-violet-100 text-violet-700",
  "Employee":  "bg-teal-100 text-teal-700",
};

// ── helpers ────────────────────────────────────────────────────────────────────
function ComplianceBadge({ tag }: { tag: string }) {
  const cls = COMPLIANCE_COLORS[tag] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${cls}`}>
      {tag}
    </span>
  );
}

function SlaBadge({ hours }: { hours: number }) {
  const color = hours <= 4 ? "text-red-600 bg-red-50 border-red-200"
              : hours <= 24 ? "text-amber-600 bg-amber-50 border-amber-200"
              : "text-gray-500 bg-gray-50 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${color}`}>
      <Clock className="w-2.5 h-2.5" />{hours}h SLA
    </span>
  );
}

function PersonaBadge({ persona }: { persona: string }) {
  const cls = PERSONA_COLORS[persona] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {persona}
    </span>
  );
}

// ── main component ─────────────────────────────────────────────────────────────
export default function StoryMapping() {
  const { storyMap, userStories, addOutcome, linkStoryToStep, unlinkStoryFromStep } = useEpics();

  // Use context-managed storymap (supports live link/unlink mutations)
  const source: StoryMapOutcome[] = storyMap;

  // filter state
  const [filterPhase, setFilterPhase]       = useState<string>("");
  const [filterPersona, setFilterPersona]   = useState<string>("");
  const [filterTag, setFilterTag]           = useState<string>("");

  const [selected, setSelected] = useState<{ outcome: StoryMapOutcome; activity: StoryMapActivity; step: StoryMapStep } | null>(null);

  // story-picker state for the detail panel
  const [storySearch, setStorySearch] = useState("");
  const storyPickerRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // close picker when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (storyPickerRef.current && !storyPickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // keep selected step in sync with live storyMap state (so badges update immediately)
  const liveSelectedStep = useMemo(() => {
    if (!selected) return null;
    for (const o of source) {
      for (const a of o.activities) {
        const s = a.steps.find(s => s.id === selected.step.id);
        if (s) return { ...selected, step: s };
      }
    }
    return selected;
  }, [source, selected?.step.id]);

  const effectiveSelected = liveSelectedStep ?? selected;

  // stories not already linked to the current step
  const filteredStories = useMemo(() => {
    if (!effectiveSelected) return [];
    const linked = new Set(effectiveSelected.step.linkedStoryIds ?? []);
    const q = storySearch.toLowerCase();
    return userStories.filter(s =>
      !linked.has(s.id) && (s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
    );
  }, [userStories, effectiveSelected, storySearch]);

  // lookup map for story titles
  const storyById = useMemo(() => new Map<string, UserStory>(userStories.map(s => [s.id, s])), [userStories]);

  // ── auto-link ──────────────────────────────────────────────────────────────
  const [autoLinkPreview, setAutoLinkPreview] = useState<AutoLinkResult[] | null>(null);

  function openAutoLink() {
    const preview = previewAutoLinks(source, userStories, { threshold: 16, maxPerStep: 3 });
    if (preview.length === 0) {
      toast.info("No new matches found above the confidence threshold.");
      return;
    }
    setAutoLinkPreview(preview);
  }

  function applyAutoLink() {
    if (!autoLinkPreview) return;
    const links = computeAutoLinks(source, userStories, { threshold: 16, maxPerStep: 3 });
    let total = 0;
    links.forEach((storyIds, stepId) => {
      storyIds.forEach(storyId => { linkStoryToStep(stepId, storyId); total++; });
    });
    setAutoLinkPreview(null);
    toast.success(`Auto-linked ${total} stor${total === 1 ? "y" : "ies"} across ${links.size} step${links.size === 1 ? "" : "s"}.`);
  }

  // derive unique filter options from data
  const allPhases   = useMemo(() => [...new Set(source.map(o => o.phase).filter(Boolean))] as string[], [source]);
  const allPersonas = useMemo(() => [...new Set(source.flatMap(o => o.activities.map(a => a.persona)).filter(Boolean))] as string[], [source]);
  const allTags     = useMemo(() => [...new Set(source.flatMap(o => o.activities.flatMap(a => a.steps.flatMap(s => s.complianceTags || []))))] as string[], [source]);

  // apply filters
  const filtered = useMemo(() => {
    return source
      .filter(o => !filterPhase || o.phase === filterPhase)
      .map(o => ({
        ...o,
        activities: o.activities
          .filter(a => !filterPersona || a.persona === filterPersona)
          .map(a => ({
            ...a,
            steps: a.steps.filter(s =>
              !filterTag || (s.complianceTags || []).includes(filterTag)
            ),
          }))
          .filter(a => a.steps.length > 0),
      }))
      .filter(o => o.activities.length > 0);
  }, [source, filterPhase, filterPersona, filterTag]);

  const hasFilter = filterPhase || filterPersona || filterTag;

  function clearFilters() { setFilterPhase(""); setFilterPersona(""); setFilterTag(""); }

  function downloadFile(filename: string, content: string, type = "application/json") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function exportJSON() { downloadFile("storymap.json", JSON.stringify(source, null, 2)); }

  function exportCSV() {
    const rows = ["phase,outcome,activity,persona,stepId,stepTitle,slaHours,complianceTags,linkedStoryIds"];
    source.forEach(o => o.activities.forEach(a => a.steps.forEach(s =>
      rows.push([o.phase, o.title, a.title, a.persona || "", s.id, s.title, s.slaHours ?? "", (s.complianceTags || []).join("|"), (s.linkedStoryIds || []).join("|")].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    )));
    downloadFile("storymap.csv", rows.join("\n"), "text/csv");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── top bar ── */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">User Story Mapping</h1>
          <p className="text-sm text-gray-500">HR &amp; IAM identity lifecycle — {source.length} outcomes · {source.flatMap(o => o.activities).length} activities</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportJSON} className="px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50">Export JSON</button>
          <button onClick={exportCSV}  className="px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50">Export CSV</button>
          <button
            onClick={openAutoLink}
            className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded flex items-center gap-1.5 hover:bg-violet-700"
          >
            <Zap className="w-4 h-4" />Auto-link
          </button>
          <button
            onClick={() => { const id = `OUT-${Date.now()}`; addOutcome({ id, title: "New Outcome", description: "", activities: [] }); toast.success("Added outcome"); }}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center gap-1.5 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />Outcome
          </button>
        </div>
      </div>

      {/* ── filter bar ── */}
      <div className="bg-white border-b px-6 py-3 flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />

        <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)}
          className="text-sm border rounded px-2 py-1 bg-white min-w-[120px]">
          <option value="">All phases</option>
          {allPhases.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={filterPersona} onChange={e => setFilterPersona(e.target.value)}
          className="text-sm border rounded px-2 py-1 bg-white min-w-[140px]">
          <option value="">All personas</option>
          {allPersonas.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
          className="text-sm border rounded px-2 py-1 bg-white min-w-[140px]">
          <option value="">All compliance tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {hasFilter && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border rounded px-2 py-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <span className="text-xs text-gray-400 ml-auto">
          {filtered.flatMap(o => o.activities).length} activities · {filtered.flatMap(o => o.activities.flatMap(a => a.steps)).length} steps visible
        </span>
      </div>

      {/* ── canvas ── */}
      <div className="flex-1 overflow-x-auto p-6">
        {filtered.map(outcome => (
          <div key={outcome.id} className="mb-10">
            {/* outcome header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2 h-6 rounded-full ${PHASE_HEADER[outcome.phase ?? ""] ?? "bg-gray-300"}`} />
              <div>
                <span className="text-base font-semibold text-gray-900">{outcome.title}</span>
                {outcome.phase && (
                  <span className={`ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full border ${PHASE_COLORS[outcome.phase] ?? ""}`}>
                    {outcome.phase}
                  </span>
                )}
                {outcome.description && <p className="text-xs text-gray-500 mt-0.5">{outcome.description}</p>}
              </div>
            </div>

            {/* activity columns */}
            <div className="flex gap-4 items-start overflow-x-auto pb-2">
              {outcome.activities.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(act => (
                <div
                  key={act.id}
                  className={`min-w-[260px] max-w-[280px] bg-white rounded-lg shadow-sm border-t-4 p-4 shrink-0 ${PHASE_HEADER[outcome.phase ?? ""] ?? "border-t-gray-300"}`}
                >
                  {/* activity header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="text-sm font-semibold text-gray-800 leading-tight">{act.title}</div>
                    <div className="text-xs text-gray-400 shrink-0">{act.steps.length}</div>
                  </div>
                  {act.persona && <div className="mb-3"><PersonaBadge persona={act.persona} /></div>}

                  {/* steps */}
                  <div className="space-y-2">
                    {act.steps.map(step => (
                      <div
                        key={step.id}
                        onClick={() => { setSelected({ outcome, activity: act, step }); setPickerOpen(false); setStorySearch(""); }}
                        className="bg-gray-50 rounded-md border p-2.5 cursor-pointer hover:shadow-sm hover:border-gray-300 transition-shadow"
                      >
                        <p className="text-xs font-medium text-gray-800 leading-snug">{step.title}</p>

                        {/* badges row */}
                        {(step.complianceTags?.length || step.slaHours || step.linkedStoryIds?.length) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {step.slaHours != null && <SlaBadge hours={step.slaHours} />}
                            {step.complianceTags?.map(tag => <ComplianceBadge key={tag} tag={tag} />)}
                            {(step.linkedStoryIds?.length ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-violet-50 text-violet-700 border-violet-200">
                                <BookOpen className="w-2.5 h-2.5" />{step.linkedStoryIds!.length}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Filter className="w-8 h-8 mb-2" />
            <p className="text-sm">No results match the current filters.</p>
            <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">Clear filters</button>
          </div>
        )}
      </div>

      {/* ── auto-link preview modal ── */}
      {autoLinkPreview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-600" />Auto-link Preview
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {autoLinkPreview.reduce((n, r) => n + r.matches.length, 0)} suggested links across {autoLinkPreview.length} steps — review before applying.
                </p>
              </div>
              <button onClick={() => setAutoLinkPreview(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* scrollable match list */}
            <div className="overflow-y-auto flex-1 divide-y">
              {autoLinkPreview.map(result => {
                // find step label for display
                let stepLabel = result.stepId;
                for (const o of source) {
                  for (const a of o.activities) {
                    const s = a.steps.find(s => s.id === result.stepId);
                    if (s) { stepLabel = s.title; break; }
                  }
                }
                return (
                  <div key={result.stepId} className="px-6 py-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2 truncate">{stepLabel}</p>
                    <div className="space-y-1.5">
                      {result.matches.map(m => {
                        const story = storyById.get(m.storyId);
                        return (
                          <div key={m.storyId} className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-md px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-violet-900 truncate">{story?.title ?? m.storyId}</p>
                              <p className="text-[10px] text-violet-500 mt-0.5">{m.storyId} · score {m.score} · {m.reasons.join(' · ')}</p>
                            </div>
                            <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded shrink-0">{m.score}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setAutoLinkPreview(null)} className="px-4 py-2 text-sm border rounded hover:bg-white">Cancel</button>
              <button
                onClick={applyAutoLink}
                className="px-4 py-2 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />Apply {autoLinkPreview.reduce((n, r) => n + r.matches.length, 0)} links
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── detail panel ── */}
      {effectiveSelected && (
        <aside className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l z-50 flex flex-col overflow-y-auto">
          <div className="flex items-start justify-between p-5 border-b">
            <div>
              <h3 className="text-base font-semibold text-gray-900 leading-snug">{effectiveSelected.step.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{effectiveSelected.activity.title} · {effectiveSelected.outcome.title}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 ml-3 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 text-sm">
            {/* phase + persona */}
            <div className="flex flex-wrap gap-2">
              {effectiveSelected.outcome.phase && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${PHASE_COLORS[effectiveSelected.outcome.phase] ?? ""}`}>
                  {effectiveSelected.outcome.phase}
                </span>
              )}
              {effectiveSelected.activity.persona && <PersonaBadge persona={effectiveSelected.activity.persona} />}
            </div>

            {/* description */}
            {effectiveSelected.step.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-gray-700">{effectiveSelected.step.description}</p>
              </div>
            )}

            {/* SLA */}
            {effectiveSelected.step.slaHours != null && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">SLA</p>
                <SlaBadge hours={effectiveSelected.step.slaHours} />
                <span className="text-gray-600 ml-2 text-xs">Must complete within {effectiveSelected.step.slaHours}h</span>
              </div>
            )}

            {/* compliance tags */}
            {(effectiveSelected.step.complianceTags?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Compliance Controls</p>
                <div className="flex flex-wrap gap-1.5">
                  {effectiveSelected.step.complianceTags!.map(tag => <ComplianceBadge key={tag} tag={tag} />)}
                </div>
              </div>
            )}

            {/* ── linked user stories ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Linked User Stories</p>
                <button
                  onClick={() => { setPickerOpen(v => !v); setStorySearch(""); }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Link2 className="w-3.5 h-3.5" />Link story
                </button>
              </div>

              {/* currently linked stories */}
              {(effectiveSelected.step.linkedStoryIds?.length ?? 0) > 0 ? (
                <ul className="space-y-1.5 mb-3">
                  {effectiveSelected.step.linkedStoryIds!.map(id => {
                    const story = storyById.get(id);
                    return (
                      <li key={id} className="flex items-start justify-between gap-2 bg-violet-50 border border-violet-100 rounded-md px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-violet-900 truncate">{story?.title ?? id}</p>
                          <p className="text-[10px] text-violet-500 mt-0.5">{id}{story ? ` · ${story.status}` : ""}</p>
                        </div>
                        <button
                          onClick={() => {
                            unlinkStoryFromStep(effectiveSelected.step.id, id);
                            toast.success("Story unlinked");
                          }}
                          className="text-violet-400 hover:text-red-500 shrink-0 mt-0.5"
                          title="Unlink"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic mb-3">No stories linked yet.</p>
              )}

              {/* picker dropdown */}
              {pickerOpen && (
                <div ref={storyPickerRef} className="border rounded-lg shadow-lg bg-white">
                  <div className="flex items-center gap-2 px-3 py-2 border-b">
                    <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search stories…"
                      value={storySearch}
                      onChange={e => setStorySearch(e.target.value)}
                      className="text-xs flex-1 outline-none placeholder:text-gray-400"
                    />
                    {storySearch && <button onClick={() => setStorySearch("")}><X className="w-3 h-3 text-gray-400" /></button>}
                  </div>
                  <ul className="max-h-52 overflow-y-auto divide-y">
                    {filteredStories.length === 0 && (
                      <li className="px-3 py-3 text-xs text-gray-400 text-center">
                        {storySearch ? "No matching stories." : "All stories already linked."}
                      </li>
                    )}
                    {filteredStories.slice(0, 30).map(story => (
                      <li key={story.id}>
                        <button
                          className="w-full text-left px-3 py-2.5 hover:bg-violet-50 transition-colors"
                          onClick={() => {
                            linkStoryToStep(effectiveSelected.step.id, story.id);
                            toast.success(`Linked "${story.title}"`);
                            setStorySearch("");
                          }}
                        >
                          <p className="text-xs font-medium text-gray-800 truncate">{story.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{story.id} · {story.status} · {story.storyPoints ? `${story.storyPoints}pt` : "—"}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* activity context */}
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Activity context</p>
              <p className="text-gray-600">{effectiveSelected.activity.description || "—"}</p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}