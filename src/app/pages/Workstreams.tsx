import { useState, useMemo } from "react";
import {
  GitBranch, Plus, Edit, Trash2, X, ChevronDown, ChevronRight,
  ArrowRight, ArrowLeft, Layers, Network, Check, AlertCircle,
  Clock, CheckCircle2, Circle, Pencil,
} from "lucide-react";
import { Workstream, WorkstreamLayer } from "../types/workstream";
import { initialWorkstreams } from "../data/initial-workstreams";

// ─── Constants ────────────────────────────────────────────────────────────────

const LAYERS: { id: WorkstreamLayer; label: string; color: string; bg: string; border: string }[] = [
  { id: 'foundational', label: 'Foundational', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'identity',     label: 'Identity & Workforce', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  { id: 'application',  label: 'Application & Access', color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200'  },
  { id: 'tooling',      label: 'Tooling & Execution',  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
  { id: 'delivery',     label: 'Delivery & Steady-State', color: 'text-rose-700', bg: 'bg-rose-50',  border: 'border-rose-200'   },
];

const STATUS_CONFIG = {
  'not-started': { label: 'Not Started', icon: Circle,       color: 'text-gray-500',  bg: 'bg-gray-100'  },
  'in-progress':  { label: 'In Progress', icon: Clock,        color: 'text-blue-600',  bg: 'bg-blue-100'  },
  'complete':     { label: 'Complete',    icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  'blocked':      { label: 'Blocked',     icon: AlertCircle,  color: 'text-red-600',   bg: 'bg-red-100'   },
};

const LAYER_ORDER: WorkstreamLayer[] = ['foundational', 'identity', 'application', 'tooling', 'delivery'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function layerFor(ws: Workstream) {
  return LAYERS.find(l => l.id === ws.layer) ?? LAYERS[0];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Workstream Modal ─────────────────────────────────────────────────────────

interface WorkstreamModalProps {
  workstream: Workstream | null;
  allWorkstreams: Workstream[];
  onSave: (ws: Workstream) => void;
  onClose: () => void;
}

function WorkstreamModal({ workstream, allWorkstreams, onSave, onClose }: WorkstreamModalProps) {
  const isEditing = workstream !== null;
  const [titleError, setTitleError] = useState(false);
  const [form, setForm] = useState<Workstream>(() => {
    if (workstream) return workstream;
    const existingNums = allWorkstreams
      .map(w => parseInt(w.id.replace('WS-', ''), 10))
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    return {
      id: `WS-${String(nextNum).padStart(2, '0')}`,
      order: allWorkstreams.length + 1,
      title: '',
      description: '',
      layer: 'foundational',
      dependsOn: [],
      activities: [],
      status: 'not-started',
      owner: '',
      notes: '',
    };
  });
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [editingActIdx, setEditingActIdx] = useState<number | null>(null);
  const [editingActVal, setEditingActVal] = useState('');

  const toggleDep = (id: string) =>
    setForm(p => ({
      ...p,
      dependsOn: p.dependsOn.includes(id)
        ? p.dependsOn.filter(d => d !== id)
        : [...p.dependsOn, id],
    }));

  const addActivity = () => {
    if (!newActivityTitle.trim()) return;
    setForm(p => ({
      ...p,
      activities: [...p.activities, { id: `${p.id}-A${p.activities.length + 1}-${uid()}`, title: newActivityTitle.trim(), order: p.activities.length + 1 }],
    }));
    setNewActivityTitle('');
  };

  const removeActivity = (idx: number) =>
    setForm(p => ({ ...p, activities: p.activities.filter((_, i) => i !== idx) }));

  const saveActivity = () => {
    if (editingActIdx === null) return;
    setForm(p => {
      const acts = [...p.activities];
      acts[editingActIdx] = { ...acts[editingActIdx], title: editingActVal.trim() || acts[editingActIdx].title };
      return { ...p, activities: acts };
    });
    setEditingActIdx(null);
  };

  const eligibleDeps = allWorkstreams.filter(w => w.id !== form.id);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Workstream' : 'Add Workstream'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <input disabled={isEditing} value={form.id} onChange={e => setForm(p => ({ ...p, id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Layer</label>
              <select value={form.layer} onChange={e => setForm(p => ({ ...p, layer: e.target.value as WorkstreamLayer }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {LAYERS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input required value={form.title} onChange={e => { setForm(p => ({ ...p, title: e.target.value })); if (e.target.value.trim()) setTitleError(false); }}
              placeholder="Workstream name"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${titleError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {titleError && <p className="text-xs text-red-500 mt-1">Title is required.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status ?? 'not-started'} onChange={e => setForm(p => ({ ...p, status: e.target.value as Workstream['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input value={form.owner ?? ''} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))}
                placeholder="Team or person" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activities ({form.activities.length})</label>
            <div className="space-y-1.5 mb-2">
              {form.activities.map((act, idx) => (
                <div key={act.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  {editingActIdx === idx ? (
                    <>
                      <input autoFocus value={editingActVal} onChange={e => setEditingActVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveActivity(); } if (e.key === 'Escape') setEditingActIdx(null); }}
                        className="flex-1 px-2 py-0.5 border border-blue-400 rounded text-sm focus:outline-none" />
                      <button type="button" onClick={saveActivity} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-800">{act.title}</span>
                      <button type="button" onClick={() => { setEditingActIdx(idx); setEditingActVal(act.title); }} className="text-gray-400 hover:text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                  <button type="button" onClick={() => removeActivity(idx)} className="text-gray-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newActivityTitle} onChange={e => setNewActivityTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addActivity(); } }}
                placeholder="New activity…" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={addActivity} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1 text-gray-700">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Dependencies */}
          {eligibleDeps.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Depends On</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {eligibleDeps.map(w => (
                  <label key={w.id} className="flex items-start gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={form.dependsOn.includes(w.id)} onChange={() => toggleDep(w.id)} className="mt-0.5 rounded" />
                    <span className="text-sm text-gray-700 leading-tight"><span className="font-mono text-xs text-gray-400">{w.id}</span> {w.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={form.notes ?? ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">Cancel</button>
            <button type="button" onClick={() => { if (form.title.trim()) { onSave(form); onClose(); } else { setTitleError(true); } }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              {isEditing ? 'Save Changes' : 'Add Workstream'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dependency Graph (SVG) ───────────────────────────────────────────────────

const NODE_W = 180;
const NODE_H = 52;
const H_GAP = 48;
const V_GAP = 28;

function buildGraphLayout(workstreams: Workstream[]) {
  // Topological column assignment
  const colMap: Record<string, number> = {};
  const rowMap: Record<string, number> = {};

  const assign = (id: string, col: number) => {
    if ((colMap[id] ?? -1) < col) {
      colMap[id] = col;
      const ws = workstreams.find(w => w.id === id);
      if (ws) {
        // find who depends on me
        workstreams
          .filter(w => w.dependsOn.includes(id))
          .forEach(w => assign(w.id, col + 1));
      }
    }
  };

  // Start with roots (no deps)
  workstreams.filter(w => w.dependsOn.length === 0).forEach(w => assign(w.id, 0));
  // Ensure everything is placed
  workstreams.forEach(w => { if (colMap[w.id] === undefined) assign(w.id, 0); });

  // Assign rows within each column
  const colBuckets: Record<number, string[]> = {};
  Object.entries(colMap).forEach(([id, col]) => {
    if (!colBuckets[col]) colBuckets[col] = [];
    colBuckets[col].push(id);
  });
  Object.values(colBuckets).forEach(ids => {
    ids.sort((a, b) => {
      const oa = workstreams.find(w => w.id === a)?.order ?? 0;
      const ob = workstreams.find(w => w.id === b)?.order ?? 0;
      return oa - ob;
    });
    ids.forEach((id, row) => { rowMap[id] = row; });
  });

  const maxCol = Math.max(...Object.values(colMap), 0);
  const maxRowPerCol = Object.values(colBuckets).reduce((m, ids) => Math.max(m, ids.length), 0);

  const svgW = (maxCol + 1) * (NODE_W + H_GAP) + H_GAP;
  const svgH = maxRowPerCol * (NODE_H + V_GAP) + V_GAP;

  const nodes = workstreams.map(ws => ({
    ws,
    x: H_GAP + colMap[ws.id] * (NODE_W + H_GAP),
    y: V_GAP + rowMap[ws.id] * (NODE_H + V_GAP),
  }));

  return { nodes, svgW, svgH };
}

interface DepGraphProps {
  workstreams: Workstream[];
  onSelect: (ws: Workstream) => void;
  selectedId: string | null;
}

function DependencyGraph({ workstreams, onSelect, selectedId }: DepGraphProps) {
  const { nodes, svgW, svgH } = useMemo(() => buildGraphLayout(workstreams), [workstreams]);

  if (workstreams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
        <Network className="w-8 h-8 mb-2" />
        <p className="text-sm">No workstreams to display.</p>
      </div>
    );
  }

  const nodeById = Object.fromEntries(nodes.map(n => [n.ws.id, n]));

  // Build edges: for every dependsOn link draw from source node right-edge to dest node left-edge
  const edges = workstreams.flatMap(ws =>
    ws.dependsOn.map(depId => {
      const src = nodeById[depId];
      const dst = nodeById[ws.id];
      if (!src || !dst) return null;
      const x1 = src.x + NODE_W;
      const y1 = src.y + NODE_H / 2;
      const x2 = dst.x;
      const y2 = dst.y + NODE_H / 2;
      const mx = (x1 + x2) / 2;
      return { key: `${depId}->${ws.id}`, x1, y1, x2, y2, mx, depId, toId: ws.id };
    }).filter(Boolean)
  ) as { key: string; x1: number; y1: number; x2: number; y2: number; mx: number; depId: string; toId: string }[];

  return (
    <div className="overflow-auto bg-gray-50 rounded-xl border border-gray-200">
      <svg width={svgW} height={svgH} className="block">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" className="fill-gray-400" />
          </marker>
          <marker id="arrow-hi" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" className="fill-blue-500" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(e => {
          const isRelated = selectedId && (e.depId === selectedId || e.toId === selectedId);
          return (
            <path
              key={e.key}
              d={`M${e.x1},${e.y1} C${e.mx},${e.y1} ${e.mx},${e.y2} ${e.x2},${e.y2}`}
              fill="none"
              strokeWidth={isRelated ? 2 : 1.5}
              stroke={isRelated ? '#3b82f6' : '#d1d5db'}
              markerEnd={isRelated ? 'url(#arrow-hi)' : 'url(#arrow)'}
              opacity={selectedId && !isRelated ? 0.3 : 1}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(({ ws, x, y }) => {
          const layer = layerFor(ws);
          const status = STATUS_CONFIG[ws.status ?? 'not-started'];
          const isSelected = ws.id === selectedId;
          const isRelated = selectedId
            ? ws.id === selectedId ||
              // ws is a direct predecessor of selectedId (selectedId depends on ws)
              workstreams.find(w => w.id === selectedId)?.dependsOn.includes(ws.id) ||
              // ws is a direct successor of selectedId (ws depends on selectedId)
              workstreams.find(w => w.id === ws.id)?.dependsOn.includes(selectedId)
            : true;

          return (
            <g key={ws.id} onClick={() => onSelect(ws)} className="cursor-pointer" opacity={selectedId && !isRelated ? 0.3 : 1}>
              <rect
                x={x} y={y} width={NODE_W} height={NODE_H} rx={8}
                fill="white"
                stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={isSelected ? 2 : 1}
                filter={isSelected ? 'drop-shadow(0 2px 6px rgba(59,130,246,0.3))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.07))'}
              />
              {/* Layer colour strip */}
              <rect x={x} y={y} width={4} height={NODE_H} rx={8} fill={
                ws.layer === 'foundational' ? '#9333ea' :
                ws.layer === 'identity'     ? '#3b82f6' :
                ws.layer === 'application'  ? '#22c55e' :
                ws.layer === 'tooling'      ? '#f59e0b' : '#f43f5e'
              } />
              <text x={x + 12} y={y + 17} fontSize={9} fontFamily="monospace" fill="#6b7280">{ws.id}</text>
              <foreignObject x={x + 10} y={y + 20} width={NODE_W - 18} height={28}>
                <div style={{ fontSize: 11, color: '#111827', lineHeight: '1.3', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {ws.title}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Swimlane view ────────────────────────────────────────────────────────────

interface SwimlaneViewProps {
  workstreams: Workstream[];
  onEdit: (ws: Workstream) => void;
  onDelete: (id: string) => void;
  onSelect: (ws: Workstream) => void;
  selectedId: string | null;
}

function SwimlaneView({ workstreams, onEdit, onDelete, onSelect, selectedId }: SwimlaneViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <div className="space-y-4">
      {LAYER_ORDER.map(layerId => {
        const layer = LAYERS.find(l => l.id === layerId)!;
        const wss = workstreams.filter(w => w.layer === layerId).sort((a, b) => a.order - b.order);
        if (wss.length === 0) return null;
        return (
          <div key={layerId} className={`rounded-xl border ${layer.border} overflow-hidden`}>
            <div className={`px-4 py-2.5 ${layer.bg} border-b ${layer.border} flex items-center justify-between`}>
              <div>
                <span className={`text-sm font-semibold ${layer.color}`}>{layer.label}</span>
                <span className="ml-2 text-xs text-gray-500">{wss.length} workstream{wss.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                {(['in-progress', 'complete', 'blocked'] as const).map(s => {
                  const n = wss.filter(w => (w.status ?? 'not-started') === s).length;
                  if (!n) return null;
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <span key={s} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{n}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {wss.map(ws => {
                const status = STATUS_CONFIG[ws.status ?? 'not-started'];
                const StatusIcon = status.icon;
                const isExpanded = expandedIds.has(ws.id);
                const isSelected = ws.id === selectedId;
                return (
                  <div key={ws.id} className={`bg-white transition-colors ${isSelected ? 'ring-1 ring-inset ring-blue-400' : ''}`}>
                    <div
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
                    >
                      <button
                        className="mt-0.5 text-gray-400 shrink-0 hover:text-gray-600"
                        onClick={() => toggle(ws.id)}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onSelect(ws)}
                        title="Click to open detail panel"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-gray-400">{ws.id}</span>
                          <span className="font-semibold text-sm text-gray-900">{ws.title}</span>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />{status.label}
                          </span>
                          {ws.owner && <span className="text-xs text-gray-500">· {ws.owner}</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ws.description}</p>
                        {ws.dependsOn.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className="text-xs text-gray-400">Depends on:</span>
                            {ws.dependsOn.map(depId => {
                              const dep = workstreams.find(w => w.id === depId);
                              return (
                                <span
                                  key={depId}
                                  className="font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded cursor-default"
                                  title={dep?.title ?? depId}
                                >
                                  {depId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button onClick={() => onEdit(ws)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(ws.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-12 pb-3 space-y-1">
                        {ws.activities.map((act, idx) => (
                          <div key={act.id} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-gray-400 text-xs mt-0.5 w-4 shrink-0">{idx + 1}.</span>
                            <span>{act.title}</span>
                          </div>
                        ))}
                        {ws.notes && <p className="text-xs text-gray-400 italic mt-2">{ws.notes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  ws: Workstream;
  allWorkstreams: Workstream[];
  onEdit: () => void;
  onClose: () => void;
}

function DetailPanel({ ws, allWorkstreams, onEdit, onClose }: DetailPanelProps) {
  const layer = layerFor(ws);
  const status = STATUS_CONFIG[ws.status ?? 'not-started'];
  const StatusIcon = status.icon;

  const dependsOnWS = allWorkstreams.filter(w => ws.dependsOn.includes(w.id));
  const enablesWS   = allWorkstreams.filter(w => w.dependsOn.includes(ws.id));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">{ws.id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${layer.bg} ${layer.color}`}>{layer.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{ws.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3 h-3" />{status.label}
            </span>
            {ws.owner && <span className="text-xs text-gray-500">{ws.owner}</span>}
          </div>
        </div>

        {ws.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{ws.description}</p>
        )}

        {ws.activities.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Activities</div>
            <ol className="space-y-1.5">
              {ws.activities.map((act, idx) => (
                <li key={act.id} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400 text-xs mt-0.5 w-4 shrink-0">{idx + 1}.</span>
                  <span className="text-gray-700">{act.title}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {dependsOnWS.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Depends On</div>
            <div className="space-y-1">
              {dependsOnWS.map(dep => (
                <div key={dep.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <ArrowLeft className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-mono text-xs text-gray-400">{dep.id}</span>
                  <span className="text-gray-700 line-clamp-1">{dep.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {enablesWS.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Enables</div>
            <div className="space-y-1">
              {enablesWS.map(en => (
                <div key={en.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <ArrowRight className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="font-mono text-xs text-gray-400">{en.id}</span>
                  <span className="text-gray-700 line-clamp-1">{en.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {ws.notes && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</div>
            <p className="text-xs text-gray-500 italic">{ws.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewMode = 'graph' | 'swimlane';

export default function WorkstreamsPage() {
  const [workstreams, setWorkstreams] = useState<Workstream[]>(initialWorkstreams);
  const [viewMode, setViewMode] = useState<ViewMode>('swimlane');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ ws: Workstream | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const selected = workstreams.find(w => w.id === selectedId) ?? null;

  const saveWorkstream = (ws: Workstream) => {
    setWorkstreams(prev =>
      prev.some(w => w.id === ws.id)
        ? prev.map(w => w.id === ws.id ? ws : w)
        : [...prev, ws]
    );
  };

  const deleteWorkstream = (id: string) => {
    setWorkstreams(prev =>
      prev
        .filter(w => w.id !== id)
        .map(w => ({ ...w, dependsOn: w.dependsOn.filter(d => d !== id) }))
    );
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirm(null);
  };

  const total = workstreams.length;
  const notStarted = workstreams.filter(w => (w.status ?? 'not-started') === 'not-started').length;
  const complete = workstreams.filter(w => w.status === 'complete').length;
  const inProgress = workstreams.filter(w => w.status === 'in-progress').length;
  const blocked = workstreams.filter(w => w.status === 'blocked').length;
  const totalDeps = workstreams.reduce((s, w) => s + w.dependsOn.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">RBAC Workstreams</h1>
              <p className="text-indigo-200 text-sm mt-0.5">High-level workstreams, activities, and dependency sequencing</p>
            </div>
          </div>
          <button
            onClick={() => setModal({ ws: null })}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Workstream
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-3 mt-5">
          {[
            { label: 'Total', value: total, color: 'bg-white/10' },
            { label: 'Not Started', value: notStarted, color: 'bg-gray-500/20' },
            { label: 'In Progress', value: inProgress, color: 'bg-blue-500/30' },
            { label: 'Complete', value: complete, color: 'bg-green-500/30' },
            { label: 'Blocked', value: blocked, color: 'bg-red-500/30' },
            { label: 'Dependencies', value: totalDeps, color: 'bg-white/10' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-lg px-3 py-2 text-center`}>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-indigo-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('swimlane')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'swimlane' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Layers className="w-4 h-4" /> Swimlane
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'graph' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Network className="w-4 h-4" /> Dependency Graph
          </button>
        </div>
        {selectedId && (
          <button onClick={() => setSelectedId(null)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Clear selection
          </button>
        )}
      </div>

      {/* Main content */}
      <div className={`flex gap-6 ${selected ? 'items-start' : ''}`}>
        <div className="flex-1 min-w-0">
          {viewMode === 'swimlane' ? (
            <SwimlaneView
              workstreams={workstreams}
              onEdit={ws => setModal({ ws })}
              onDelete={id => setDeleteConfirm(id)}
              onSelect={ws => setSelectedId(ws.id === selectedId ? null : ws.id)}
              selectedId={selectedId}
            />
          ) : (
            <DependencyGraph
              workstreams={workstreams}
              onSelect={ws => setSelectedId(ws.id === selectedId ? null : ws.id)}
              selectedId={selectedId}
            />
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 shrink-0 self-stretch">
            <DetailPanel
              ws={selected}
              allWorkstreams={workstreams}
              onEdit={() => setModal({ ws: selected })}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>

      {/* Workstream modal */}
      {modal && (
        <WorkstreamModal
          workstream={modal.ws}
          allWorkstreams={workstreams}
          onSave={saveWorkstream}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (() => {
        const ws = workstreams.find(w => w.id === deleteConfirm)!;
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Workstream</h3>
              <p className="text-sm text-gray-600 mb-1">
                Are you sure you want to delete <strong>{ws?.title}</strong>?
              </p>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
                Any workstreams that depend on <span className="font-mono">{deleteConfirm}</span> will have that dependency removed.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">Cancel</button>
                <button onClick={() => deleteWorkstream(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Delete</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
