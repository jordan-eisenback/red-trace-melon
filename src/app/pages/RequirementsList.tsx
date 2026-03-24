import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useRequirements } from "../context/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { useEpics } from "../contexts/EpicContext";
import { Search, Edit, Trash2, Eye, AlertTriangle, CheckCircle, FileText, Sparkles, Download } from "lucide-react";
import { RequirementFormDialog } from "../components/RequirementFormDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { RequirementValidationPanel } from "../components/RequirementValidationPanel";
import { HelpTooltip, InfoTooltip } from "../components/HelpTooltip";
import { Requirement } from "../types/requirement";
import { exportToExcel } from "../utils/excelExport";
import { toast } from "sonner";
import { UpdateBanner } from "../components/UpdateBanner";

export function RequirementsList() {
  const { requirements, deleteRequirement } = useRequirements();
  const { frameworks } = useFrameworks();
  const { epics, userStories } = useEpics();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
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

      return matchesSearch && matchesType;
    });
  }, [requirements, searchTerm, typeFilter]);

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
    } catch (err) {
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
      console.error("Export error:", error);
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
          <button
            onClick={handleExportToExcel}
            className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            title="Export all requirements, framework mappings, epics, and user stories to an Excel workbook with 8 comprehensive sheets including a full traceability matrix."
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          <button
            onClick={() => setShowValidation(!showValidation)}
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-2"
            title="Toggle the AI-powered validation panel to view quality scores, validation issues, and smart suggestions for improving requirements."
          >
            <Sparkles className="w-4 h-4" />
            {showValidation ? "Hide" : "Show"} Validation
          </button>
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
                  className="hover:bg-slate-50 transition-colors"
                  draggable
                  onDragStart={(e) => onRequirementDragStart(e, req.id)}
                  title="Drag this requirement to a user story to create a linked activity/step"
                >
                  <td className="px-4 py-3">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                      {req.id}
                    </code>
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
                    <div className="flex items-center justify-center gap-2">
                      {isRequirementMapped(req.id) ? (
                        <CheckCircle 
                          className="w-4 h-4 text-green-600" 
                          title="Mapped to framework control"
                        />
                      ) : (
                        <AlertTriangle 
                          className="w-4 h-4 text-orange-500" 
                          title="Not mapped to any framework"
                        />
                      )}
                      <Link
                        to={`/requirements/${req.id}`}
                        className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setEditingRequirement(req)}
                        className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequirements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No requirements found</p>
            </div>
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