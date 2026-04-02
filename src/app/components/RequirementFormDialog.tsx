import { useState, useEffect, type FormEvent } from "react";
import { useRequirements } from "../contexts/RequirementsContext";
import { Requirement, RequirementType, RequirementStatus, RequirementPriority } from "../types/requirement";
import { X } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";

// Draft form state allows empty string for type before submission
type RequirementDraft = Omit<Requirement, "type"> & { type: RequirementType | "" };

interface RequirementFormDialogProps {
  open: boolean;
  onClose: () => void;
  requirement?: Requirement;
}

export function RequirementFormDialog({
  open,
  onClose,
  requirement,
}: RequirementFormDialogProps) {
  const { addRequirement, updateRequirement, requirements } = useRequirements();
  const [formData, setFormData] = useState<RequirementDraft>({
    id: "",
    req: "",
    type: "",
    owner: "",
    parent: null,
    outcome: "",
    notes: "",
  });

  // Sync form state when the requirement prop changes (controlled form pattern)
   
  useEffect(() => {
    if (requirement) {
      setFormData(requirement);
    } else {
      setFormData({
        id: "",
        req: "",
        type: "",
        owner: "",
        parent: null,
        outcome: "",
        notes: "",
      });
    }
  }, [requirement]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: Requirement = { ...formData, type: (formData.type || "Other") as RequirementType };
    if (requirement) {
      updateRequirement(requirement.id, data);
    } else {
      addRequirement(data);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg text-slate-900">
            {requirement ? "Edit Requirement" : "Add Requirement"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                ID <span className="text-red-500">*</span>
                <HelpTooltip content="Unique identifier for the requirement. Use a consistent format like RBAC-REQ-1.1" />
              </label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., RBAC-REQ-1.1"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                Requirement <span className="text-red-500">*</span>
                <HelpTooltip content="Clear, concise description of what the system must do. Use active voice and specific language." />
              </label>
              <textarea
                required
                value={formData.req}
                onChange={(e) => setFormData({ ...formData, req: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the requirement description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                  Type <span className="text-red-500">*</span>
                  <HelpTooltip content="Classification of the requirement: Enterprise, Capability Category, Capability, IGA Functional, or Non-Functional" />
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as RequirementType | "" })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Enterprise, Capability"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                  Owner <span className="text-red-500">*</span>
                  <HelpTooltip content="Team or individual responsible for implementing and maintaining this requirement" />
                </label>
                <input
                  type="text"
                  required
                  value={formData.owner}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., RBAC Product"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                Parent
                <HelpTooltip content="Select a parent requirement to create hierarchical relationships. This helps trace high-level goals to specific implementations." />
              </label>
              <select
                value={formData.parent || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {requirements.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.id} - {req.req.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                Outcome
                <HelpTooltip content="Measurable result or benefit when this requirement is fulfilled. Helps validate successful implementation." />
              </label>
              <textarea
                value={formData.outcome}
                onChange={(e) =>
                  setFormData({ ...formData, outcome: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Expected outcome"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                Notes
                <HelpTooltip content="Additional context, implementation details, or considerations for this requirement" />
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                  Status
                  <HelpTooltip content="Whether this requirement has been formally validated and signed off." />
                </label>
                <select
                  value={formData.status ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: (e.target.value as RequirementStatus) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Not set —</option>
                  <option value="Validated">Validated</option>
                  <option value="Not Validated">Not Validated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1 flex items-center gap-2">
                  Priority
                  <HelpTooltip content="MoSCoW priority: Must have (critical for launch), Should have (important but not vital), Could have (nice to have), Would have (deferred to a future release)." />
                </label>
                <select
                  value={formData.priority ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: (e.target.value as RequirementPriority) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Not set —</option>
                  <option value="Must">Must</option>
                  <option value="Should">Should</option>
                  <option value="Could">Could</option>
                  <option value="Would">Would</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {requirement ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}