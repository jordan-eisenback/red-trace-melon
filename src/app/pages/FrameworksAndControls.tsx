import { useState } from "react";
import { useFrameworks } from "../contexts/FrameworkContext";
import { useRequirements } from "../contexts/RequirementsContext";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  MinusCircle,
  Link2,
  X,
} from "lucide-react";
import { Framework, Control } from "../types/framework";
import { GapAnalysisPanel } from "../components/GapAnalysisPanel";
import { RequirementMappingModal } from "../components/RequirementMappingModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { HelpTooltip, InfoTooltip } from "../components/HelpTooltip";
import { Tip } from "../components/Tip";

// ─── Framework modal ────────────────────────────────────────────────────────
interface FrameworkModalProps {
  framework: Framework | null; // null = create
  onClose: () => void;
}

function FrameworkModal({ framework, onClose }: FrameworkModalProps) {
  const { addFramework, updateFramework, frameworks } = useFrameworks();
  const isEditing = framework !== null;

  const [form, setForm] = useState<Omit<Framework, "controls">>(() =>
    framework
      ? { id: framework.id, name: framework.name, version: framework.version, description: framework.description, category: framework.category, isActive: framework.isActive, effectiveDate: framework.effectiveDate ?? "", notes: framework.notes ?? "" }
      : { id: "", name: "", version: "", description: "", category: "Compliance", isActive: true, effectiveDate: "", notes: "" }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateFramework(framework.id, { ...framework, ...form });
    } else {
      const nextNum = frameworks.length + 1;
      addFramework({ ...form, id: form.id || `FW-${nextNum}`, controls: [] });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{isEditing ? "Edit Framework" : "Add Framework"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <input value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} disabled={isEditing} placeholder="e.g. FW-5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input value={form.version} onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))} placeholder="e.g. 2022" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. ISO 27001" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Framework["category"] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {["Compliance", "Security", "Privacy", "Quality", "Other"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input type="date" value={form.effectiveDate ?? ""} onChange={(e) => setForm((p) => ({ ...p, effectiveDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded" />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{isEditing ? "Save Changes" : "Add Framework"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Control modal ───────────────────────────────────────────────────────────
interface ControlModalProps {
  frameworkId: string;
  control: Control | null; // null = create
  onClose: () => void;
}

function ControlModal({ frameworkId, control, onClose }: ControlModalProps) {
  const { addControl, updateControl } = useFrameworks();
  const isEditing = control !== null;

  const [form, setForm] = useState<Omit<Control, "requirements">>(() =>
    control
      ? { id: control.id, frameworkId: control.frameworkId, controlId: control.controlId, title: control.title, description: control.description, category: control.category ?? "", priority: control.priority ?? "Medium", notes: control.notes ?? "" }
      : { id: "", frameworkId, controlId: "", title: "", description: "", category: "", priority: "Medium", notes: "" }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateControl(frameworkId, control.id, { ...control, ...form });
    } else {
      addControl(frameworkId, {
        ...form,
        id: form.id || `${frameworkId}-${form.controlId || Date.now()}`,
        requirements: [],
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{isEditing ? "Edit Control" : "Add Control"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Control ID *</label>
              <input required value={form.controlId} onChange={(e) => setForm((p) => ({ ...p, controlId: e.target.value }))} placeholder="e.g. AC-1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority ?? "Medium"} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Control["priority"] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {["Critical", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Control title" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input value={form.category ?? ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Access Control" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{isEditing ? "Save Changes" : "Add Control"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FrameworksAndControls() {
  const { frameworks, deleteFramework, deleteControl, removeRequirementFromControl } = useFrameworks();
  const { requirements } = useRequirements();
  
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(
    new Set(frameworks.map((f) => f.id))
  );
  const [expandedControls, setExpandedControls] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showGapAnalysis, setShowGapAnalysis] = useState(true);
  const [mappingModal, setMappingModal] = useState<{
    controlId: string;
    frameworkId: string;
  } | null>(null);

  // Framework / Control CRUD modal state
  const [frameworkModal, setFrameworkModal] = useState<{ framework: Framework | null } | null>(null);
  const [controlModal, setControlModal] = useState<{ frameworkId: string; control: Control | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const toggleFramework = (frameworkId: string) => {
    setExpandedFrameworks((prev) => {
      const next = new Set(prev);
      if (next.has(frameworkId)) {
        next.delete(frameworkId);
        // Also collapse all controls in this framework
        frameworks
          .find((f) => f.id === frameworkId)
          ?.controls.forEach((c) => {
            const nextControls = new Set(expandedControls);
            nextControls.delete(c.id);
            setExpandedControls(nextControls);
          });
      } else {
        next.add(frameworkId);
      }
      return next;
    });
  };

  const toggleControl = (controlId: string) => {
    setExpandedControls((prev) => {
      const next = new Set(prev);
      if (next.has(controlId)) {
        next.delete(controlId);
      } else {
        next.add(controlId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedFrameworks(new Set(frameworks.map((f) => f.id)));
    const allControls = frameworks.flatMap((f) => f.controls.map((c) => c.id));
    setExpandedControls(new Set(allControls));
  };

  const collapseAll = () => {
    setExpandedFrameworks(new Set());
    setExpandedControls(new Set());
  };

  const handleDeleteFramework = (id: string, name: string) => {
    setDeleteConfirm({
      title: 'Delete Framework',
      description: `Are you sure you want to delete the "${name}" framework and all its controls? This action cannot be undone.`,
      onConfirm: () => { deleteFramework(id); setDeleteConfirm(null); },
    });
  };

  const handleDeleteControl = (frameworkId: string, controlId: string, title: string) => {
    setDeleteConfirm({
      title: 'Delete Control',
      description: `Are you sure you want to delete control "${title}"? This action cannot be undone.`,
      onConfirm: () => { deleteControl(frameworkId, controlId); setDeleteConfirm(null); },
    });
  };

  const getRequirementTitle = (reqId: string): string => {
    const req = requirements.find((r) => r.id === reqId);
    return req ? `${req.id}: ${req.req.substring(0, 60)}...` : reqId;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Compliance":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "Security":
        return <Shield className="w-5 h-5 text-red-600" />;
      case "Privacy":
        return <AlertCircle className="w-5 h-5 text-purple-600" />;
      case "Quality":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <MinusCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const filteredFrameworks = frameworks.filter((framework) => {
    const matchesSearch =
      framework.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      framework.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      framework.controls.some((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory = categoryFilter === "all" || framework.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalControls = frameworks.reduce((sum, f) => sum + f.controls.length, 0);
  const totalMappings = frameworks.reduce(
    (sum, f) => sum + f.controls.reduce((cSum, c) => cSum + c.requirements.length, 0),
    0
  );
  const activeFrameworks = frameworks.filter((f) => f.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Frameworks & Controls</h1>
            <p className="text-sm text-gray-600 mt-1">
              Map requirements to compliance frameworks and security controls
            </p>
          </div>
          <Tip label="Add a new compliance framework" side="bottom">
            <button
              onClick={() => setFrameworkModal({ framework: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Framework
            </button>
          </Tip>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Active Frameworks</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">{activeFrameworks}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Controls</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">{totalControls}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Mappings</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">{totalMappings}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Coverage</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">
              {totalControls > 0 ? Math.round((totalMappings / totalControls) * 10) / 10 : 0} avg
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="text"
              placeholder="Search frameworks and controls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Compliance">Compliance</option>
              <option value="Security">Security</option>
              <option value="Privacy">Privacy</option>
              <option value="Quality">Quality</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Tip label="Expand all frameworks and controls" side="bottom">
              <button
                onClick={expandAll}
                className="px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Expand All
              </button>
            </Tip>
            <Tip label="Collapse all frameworks and controls" side="bottom">
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Collapse All
              </button>
            </Tip>
          </div>
        </div>
      </div>

      {/* Frameworks List */}
      <div className="p-6">
        {/* Gap Analysis Panel */}
        {showGapAnalysis && (
          <div className="mb-6">
            <GapAnalysisPanel />
          </div>
        )}

        <div className="space-y-4">
          {filteredFrameworks.map((framework) => {
            const isExpanded = expandedFrameworks.has(framework.id);
            const mappedCount = framework.controls.reduce(
              (sum, c) => sum + c.requirements.length,
              0
            );

            return (
              <div key={framework.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Framework Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFramework(framework.id)}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-1 text-gray-400 hover:text-gray-600">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="mt-0.5">{getCategoryIcon(framework.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {framework.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              {framework.version}
                            </span>
                            {framework.isActive && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                                Active
                              </span>
                            )}
                            {!framework.isActive && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{framework.controls.length} controls</span>
                            <span>•</span>
                            <span>{mappedCount} mappings</span>
                            {framework.effectiveDate && (
                              <>
                                <span>•</span>
                                <span>Effective: {framework.effectiveDate}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Tip label="Edit framework">
                            <button
                              data-testid="edit-framework"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFrameworkModal({ framework });
                              }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Tip>
                          <Tip label="Delete framework and all its controls">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFramework(framework.id, framework.name);
                              }}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Tip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                {isExpanded && framework.controls.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4 space-y-3">
                      <div className="flex justify-end mb-1">
                        <Tip label="Add a control to this framework" side="bottom">
                          <button
                            onClick={() => setControlModal({ frameworkId: framework.id, control: null })}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Control
                          </button>
                        </Tip>
                      </div>
                      {framework.controls.map((control) => {
                        const isControlExpanded = expandedControls.has(control.id);

                        return (
                          <div
                            key={control.id}
                            className="bg-white rounded-lg border border-gray-200"
                          >
                            {/* Control Header */}
                            <div
                              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleControl(control.id)}
                            >
                              <div className="flex items-start gap-3">
                                <button className="mt-0.5 text-gray-400 hover:text-gray-600">
                                  {isControlExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm text-blue-600 font-medium">
                                          {control.controlId}
                                        </span>
                                        {control.priority && (
                                          <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(
                                              control.priority
                                            )}`}
                                          >
                                            {control.priority}
                                          </span>
                                        )}
                                        {control.category && (
                                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                            {control.category}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-medium text-gray-900 mt-1">
                                        {control.title}
                                      </h4>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {control.description}
                                      </p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-gray-500">
                                          {control.requirements.length} requirement
                                          {control.requirements.length !== 1 ? "s" : ""} mapped
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      <Tip label="Edit control">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setControlModal({ frameworkId: framework.id, control });
                                          }}
                                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                      </Tip>
                                      <Tip label="Delete control">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteControl(
                                              framework.id,
                                              control.id,
                                              control.title
                                            );
                                          }}
                                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </Tip>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Mapped Requirements */}
                            {isControlExpanded && (
                              <div className="border-t border-gray-200 bg-gray-50 p-3">
                                {control.requirements.length > 0 ? (
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-xs font-medium text-gray-700">
                                        Mapped Requirements:
                                      </div>
                                      <Tip label="Manage requirement mappings for this control" side="left">
                                        <button
                                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                          onClick={() =>
                                            setMappingModal({ controlId: control.id, frameworkId: framework.id })
                                          }
                                        >
                                          <Link2 className="w-3 h-3" />
                                          Manage Mappings
                                        </button>
                                      </Tip>
                                    </div>
                                    <div className="space-y-1">
                                      {control.requirements.map((reqId) => {
                                        const req = requirements.find((r) => r.id === reqId);
                                        return (
                                          <div
                                            key={reqId}
                                            className="flex items-start gap-2 bg-white p-2 rounded border border-gray-200"
                                          >
                                            <div className="flex-1">
                                              <span className="font-mono text-xs text-blue-600 font-medium">
                                                {reqId}
                                              </span>
                                              {req && (
                                                <p className="text-xs text-gray-700 mt-0.5">
                                                  {req.req}
                                                </p>
                                              )}
                                            </div>
                                            <Tip label="Remove requirement mapping" side="left">
                                              <button
                                                onClick={() => {
                                                  removeRequirementFromControl(framework.id, control.id, reqId);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                              >
                                                <XCircle className="w-4 h-4" />
                                              </button>
                                            </Tip>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">
                                      No requirements mapped to this control
                                    </p>
                                    <button
                                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                      onClick={() =>
                                        setMappingModal({ controlId: control.id, frameworkId: framework.id })
                                      }
                                    >
                                      Add Mapping
                                    </button>
                                  </div>
                                )}
                                {control.notes && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 italic">{control.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isExpanded && framework.controls.length === 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-8 text-center">
                    <p className="text-sm text-gray-500">No controls defined for this framework</p>
                    <button
                      onClick={() => setControlModal({ frameworkId: framework.id, control: null })}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add Control
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFrameworks.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No frameworks found</p>
            </div>
          )}
        </div>
      </div>

      {/* Requirement Mapping Modal */}
      {mappingModal && (
        <RequirementMappingModal
          open={true}
          controlId={mappingModal.controlId}
          frameworkId={mappingModal.frameworkId}
          onClose={() => setMappingModal(null)}
        />
      )}

      {/* Framework add/edit modal */}
      {frameworkModal && (
        <FrameworkModal
          framework={frameworkModal.framework}
          onClose={() => setFrameworkModal(null)}
        />
      )}

      {/* Control add/edit modal */}
      {controlModal && (
        <ControlModal
          frameworkId={controlModal.frameworkId}
          control={controlModal.control}
          onClose={() => setControlModal(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title={deleteConfirm?.title ?? 'Delete'}
        description={deleteConfirm?.description ?? ''}
        confirmLabel="Delete"
        onConfirm={() => deleteConfirm?.onConfirm()}
        variant="danger"
      />
    </div>
  );
}