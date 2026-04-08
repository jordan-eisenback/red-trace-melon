import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useRequirements } from "../contexts/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { useEpics } from "../contexts/EpicContext";
import { Search, Edit, Trash2, Eye, AlertTriangle, CheckCircle, FileText, Sparkles, Download, GripVertical } from "lucide-react";
import { RequirementFormDialog } from "../components/RequirementFormDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { RequirementValidationPanel } from "../components/RequirementValidationPanel";
import { Tip } from "../components/Tip";
import { Requirement, RequirementPriority, RequirementStatus } from "../types/requirement";
import { exportToExcel } from "../utils/excelExport";
import { logger } from "../utils/logger";
import { toast } from "sonner";
import { UpdateBanner } from "../components/UpdateBanner";

// ── Shared badge helpers ───────────────────────────────────────────────────

const PRIORITY_STYLES: Record<RequirementPriority, string> = {
  Must:   "bg-red-100 text-red-700",
  Should: "bg-amber-100 text-amber-700",
  Could:  "bg-blue-100 text-blue-700",
  Would:  "bg-slate-100 text-slate-500",
};

const STATUS_STYLES: Record<RequirementStatus, string> = {
  Validated:       "bg-green-100 text-green-700",
  "Not Validated": "bg-slate-100 text-slate-500",
  duplicate:       "bg-orange-100 text-orange-600",
};

export function PriorityBadge({ priority }: { priority?: RequirementPriority }) {
  if (!priority) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status?: RequirementStatus }) {
  if (!status) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function RequirementsList() {
  const { requirements, deleteRequirement } = useRequirements();
  const { frameworks } = useFrameworks();
  const { epics, userStories } = useEpics();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [editingRequirement, setEditingRequirement] = useState<Requirement | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [showValidation, setShowValidation] = useState(true);

  // Get all mapped requirement IDs from frameworks
  const mappedRequirementIds = useMemo(() => {
    const ids = new Set<string>();
    frameworks.forEach((framework) => {
      framework.controls.forEach((control) => {
        control.requirements.forEach((reqId) => {
          ids.add(reqId);
        });
      });
    });
    return ids;
  }, [frameworks]);

  const isRequirementMapped = (reqId: string): boolean => {
    return mappedRequirementIds.has(reqId);
  };

  const types = useMemo(() => {
    const uniqueTypes = new Set(requirements.map((r) => r.type));
    return Array.from(uniqueTypes).sort();
  }, [requirements]);

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesSearch =
        searchTerm === "" ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.req.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.owner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "" || req.type === typeFilter;
      const matchesStatus = statusFilter === "" || (req.status ?? "") === statusFilter;
      const matchesPriority = priorityFilter === "" || (req.priority ?? "") === priorityFilter;

      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [requirements, searchTerm, typeFilter, statusFilter, priorityFilter]);

  const handleDelete = (id: string) => {
    const req = requirements.find((r) => r.id === id);
    if (req) {
      setDeleteConfirm({ id, name: req.req.substring(0, 60) + "..." });
    }
  };

  const onRequirementDragStart = (e: React.DragEvent, reqId: string) => {
    try {
      e.dataTransfer.setData('text/requirement-id', reqId);
      e.dataTransfer.effectAllowed = 'copy';
    } catch (_err) {
      // ignore
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteRequirement(deleteConfirm.id);
      toast.success(`Requirement ${deleteConfirm.id} deleted successfully`);
      setDeleteConfirm(null);
    }
  };

  const handleExportToExcel = () => {
    try {
      const fileName = exportToExcel({
        requirements,
        frameworks,
        epics,
        userStories,
      });
      toast.success(`RTM exported successfully as ${fileName}`);
    } catch (error) {
      toast.error("Failed to export RTM");
      logger.error('RequirementsList', 'Export failed', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Update Banner */}
      <UpdateBanner />

      {/* Validation Panel */}
      {showValidation && (
        <div className="animate-fade-in" data-tour="validation-panel">
          <RequirementValidationPanel />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            {filteredRequirements.length} of {requirements.length} requirements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tip label="Export all requirements, mappings, epics, and stories to an 8-sheet Excel workbook" side="bottom">
            <button
              onClick={handleExportToExcel}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </Tip>
          <Tip label={showValidation ? "Hide the quality score and validation panel" : "Show AI-powered quality scores and fix suggestions"} side="bottom">
            <button
              onClick={() => setShowValidation(!showValidation)}
              className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {showValidation ? "Hide" : "Show"} Validation
            </button>
          </Tip>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4" data-tour="search-filter">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, requirement, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Search requirements by ID, description, or owner name"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter requirements by type (Enterprise, Capability, IGA Functional, etc.)"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter requirements by validation status"
          >
            <option value="">All Statuses</option>
            <option value="Validated">Validated</option>
            <option value="Not Validated">Not Validated</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter requirements by MoSCoW priority"
          >
            <option value="">All Priorities</option>
            <option value="Must">Must</option>
            <option value="Should">Should</option>
            <option value="Could">Could</option>
            <option value="Would">Would</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden" data-tour="requirements-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-600" title="Unique identifier for the requirement">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-600" title="Detailed description of what must be delivered">
                  Requirement
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-600" title="Classification category of the requirement">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-600" title="Team or individual responsible for this requirement">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-600" title="MoSCoW priority">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-600" title="Validation status">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-600" title="Parent requirement in the hierarchy">
                  Parent
                </th>
                <th className="px-4 py-3 text-center text-xs uppercase tracking-wider text-slate-600" title="Available actions for this requirement">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequirements.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50 transition-colors group"
                  draggable
                  onDragStart={(e) => onRequirementDragStart(e, req.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Tip label="Drag to link this requirement to a user story" side="left">
                        <span className="cursor-grab">
                          <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0" />
                        </span>
                      </Tip>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {req.id}
                      </code>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-md">
                      <p className="text-sm text-slate-900 line-clamp-2">
                        {req.req}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{req.owner}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={req.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3">
                    {req.parent ? (
                      <Link
                        to={`/requirements/${req.parent}`}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {req.parent}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {isRequirementMapped(req.id) ? (
                        <Tip label="Mapped to at least one framework control">
                          <span><CheckCircle className="w-4 h-4 text-green-600" /></span>
                        </Tip>
                      ) : (
                        <Tip label="Not yet mapped to any framework control">
                          <span><AlertTriangle className="w-4 h-4 text-orange-500" /></span>
                        </Tip>
                      )}
                      <Tip label="View full details and traceability">
                        <Link
                          to={`/requirements/${req.id}`}
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Tip>
                      <Tip label="Edit this requirement">
                        <button
                          onClick={() => setEditingRequirement(req)}
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </Tip>
                      <Tip label="Delete this requirement">
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequirements.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No requirements found"
              description={searchTerm || typeFilter || statusFilter || priorityFilter ? "Try adjusting your search or filters." : "Add your first requirement to get started."}
              action={searchTerm || typeFilter || statusFilter || priorityFilter ? {
                label: "Clear filters",
                onClick: () => { setSearchTerm(""); setTypeFilter(""); setStatusFilter(""); setPriorityFilter(""); },
              } : undefined}
            />
          )}
        </div>
      </div>

      <RequirementFormDialog
        open={!!editingRequirement}
        onClose={() => setEditingRequirement(undefined)}
        requirement={editingRequirement}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Requirement"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}