import React, { useMemo, useState } from "react";
import { useEpics } from "../contexts/EpicContext";
import { Plus, Clock, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { initialStoryMap } from "../data/initial-storymap";
import type { StoryMapOutcome, StoryMapActivity, StoryMapStep } from "../types/storymap";

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
  const { addOutcome } = useEpics();

  // Use the curated lifecycle data as the canonical source
  const source: StoryMapOutcome[] = initialStoryMap;

  // filter state
  const [filterPhase, setFilterPhase]       = useState<string>("");
  const [filterPersona, setFilterPersona]   = useState<string>("");
  const [filterTag, setFilterTag]           = useState<string>("");

  const [selected, setSelected] = useState<{ outcome: StoryMapOutcome; activity: StoryMapActivity; step: StoryMapStep } | null>(null);

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
    const rows = ["phase,outcome,activity,persona,stepId,stepTitle,slaHours,complianceTags"];
    source.forEach(o => o.activities.forEach(a => a.steps.forEach(s =>
      rows.push([o.phase, o.title, a.title, a.persona || "", s.id, s.title, s.slaHours ?? "", (s.complianceTags || []).join("|")].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
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
                        onClick={() => setSelected({ outcome, activity: act, step })}
                        className="bg-gray-50 rounded-md border p-2.5 cursor-pointer hover:shadow-sm hover:border-gray-300 transition-shadow"
                      >
                        <p className="text-xs font-medium text-gray-800 leading-snug">{step.title}</p>

                        {/* badges row */}
                        {(step.complianceTags?.length || step.slaHours) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {step.slaHours != null && <SlaBadge hours={step.slaHours} />}
                            {step.complianceTags?.map(tag => <ComplianceBadge key={tag} tag={tag} />)}
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

      {/* ── detail panel ── */}
      {selected && (
        <aside className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l z-50 flex flex-col overflow-y-auto">
          <div className="flex items-start justify-between p-5 border-b">
            <div>
              <h3 className="text-base font-semibold text-gray-900 leading-snug">{selected.step.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{selected.activity.title} · {selected.outcome.title}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 ml-3 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 text-sm">
            {/* phase + persona */}
            <div className="flex flex-wrap gap-2">
              {selected.outcome.phase && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${PHASE_COLORS[selected.outcome.phase] ?? ""}`}>
                  {selected.outcome.phase}
                </span>
              )}
              {selected.activity.persona && <PersonaBadge persona={selected.activity.persona} />}
            </div>

            {/* description */}
            {selected.step.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-gray-700">{selected.step.description}</p>
              </div>
            )}

            {/* SLA */}
            {selected.step.slaHours != null && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">SLA</p>
                <SlaBadge hours={selected.step.slaHours} />
                <span className="text-gray-600 ml-2 text-xs">Must complete within {selected.step.slaHours}h</span>
              </div>
            )}

            {/* compliance tags */}
            {(selected.step.complianceTags?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Compliance Controls</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.step.complianceTags!.map(tag => <ComplianceBadge key={tag} tag={tag} />)}
                </div>
              </div>
            )}

            {/* linked stories */}
            {(selected.step.linkedStoryIds?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Linked Stories</p>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {selected.step.linkedStoryIds!.map(id => <li key={id}>{id}</li>)}
                </ul>
              </div>
            )}

            {/* activity context */}
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Activity context</p>
              <p className="text-gray-600">{selected.activity.description || "—"}</p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}