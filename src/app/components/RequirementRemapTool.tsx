import { useState, useMemo } from "react";
import { X, Link2, Shield, Trash2, Plus, Search, Filter } from "lucide-react";
import { useRequirements } from "../contexts/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { toast } from "sonner";

interface RequirementRemapToolProps {
  open: boolean;
  onClose: () => void;
  requirementId?: string;
}

export function RequirementRemapTool({
  open,
  onClose,
  requirementId,
}: RequirementRemapToolProps) {
  const { requirements } = useRequirements();
  const { frameworks, removeRequirementFromControl, addRequirementToControl } = useFrameworks();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [pendingMappings, setPendingMappings] = useState<
    Map<string, { frameworkId: string; controlId: string }[]>
  >(new Map());

  // Get requirement
  const requirement = useMemo(() => {
    return requirements.find((r) => r.id === requirementId);
  }, [requirements, requirementId]);

  // Get current mappings
  const currentMappings = useMemo(() => {
    const mappings: Array<{
      frameworkId: string;
      frameworkName: string;
      controlId: string;
      controlDescription: string;
    }> = [];

    if (!requirementId) return mappings;

    frameworks.forEach((framework) => {
      framework.controls.forEach((control) => {
        if (control.requirements.includes(requirementId)) {
          mappings.push({
            frameworkId: framework.id,
            frameworkName: framework.name,
            controlId: control.id,
            controlDescription: control.description,
          });
        }
      });
    });

    return mappings;
  }, [frameworks, requirementId]);

  // Get available controls to add
  const availableControls = useMemo(() => {
    const controls: Array<{
      frameworkId: string;
      frameworkName: string;
      controlId: string;
      controlDescription: string;
    }> = [];

    const mappedControlKeys = new Set(
      currentMappings.map((m) => `${m.frameworkId}:${m.controlId}`)
    );

    frameworks.forEach((framework) => {
      if (selectedFramework !== "all" && framework.id !== selectedFramework) {
        return;
      }

      framework.controls.forEach((control) => {
        const key = `${framework.id}:${control.id}`;
        if (!mappedControlKeys.has(key)) {
          const matchesSearch =
            searchTerm === "" ||
            control.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            control.description.toLowerCase().includes(searchTerm.toLowerCase());

          if (matchesSearch) {
            controls.push({
              frameworkId: framework.id,
              frameworkName: framework.name,
              controlId: control.id,
              controlDescription: control.description,
            });
          }
        }
      });
    });

    return controls;
  }, [frameworks, currentMappings, searchTerm, selectedFramework]);

  const removeMapping = (frameworkId: string, controlId: string) => {
    if (!requirementId) return;
    removeRequirementFromControl(frameworkId, controlId, requirementId);
    toast.success(`Removed mapping to ${controlId}`);
  };

  const addMapping = (frameworkId: string, controlId: string) => {
    if (!requirementId) return;
    addRequirementToControl(frameworkId, controlId, requirementId);
    toast.success(`Added mapping to ${controlId}`);
  };

  if (!open || !requirement) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Link2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Manage Framework Mappings</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur rounded text-sm font-medium">
                    {requirement.id}
                  </span>
                  <span className="text-blue-100 text-sm">•</span>
                  <span className="text-blue-100 text-sm">{requirement.type}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Requirement Description */}
          <div className="mt-4 p-3 bg-white/10 backdrop-blur rounded-lg">
            <p className="text-sm text-white/90">{requirement.req}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Current Mappings */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Current Mappings ({currentMappings.length})
            </h3>
            {currentMappings.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No framework mappings yet</p>
                <p className="text-gray-400 text-xs mt-1">Add mappings below to improve traceability</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentMappings.map((mapping) => (
                  <div
                    key={`${mapping.frameworkId}:${mapping.controlId}`}
                    className="p-4 border border-gray-200 rounded-lg bg-blue-50 hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="font-medium text-gray-900 text-sm">
                            {mapping.controlId}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {mapping.controlDescription}
                        </p>
                        <span className="text-xs text-blue-600 font-medium">
                          {mapping.frameworkName}
                        </span>
                      </div>
                      <button
                        onClick={() => removeMapping(mapping.frameworkId, mapping.controlId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Mappings */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add New Mappings
            </h3>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search controls by ID or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Frameworks</option>
                  {frameworks.map((fw) => (
                    <option key={fw.id} value={fw.id}>
                      {fw.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Available Controls */}
            {availableControls.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {searchTerm || selectedFramework !== "all"
                    ? "No controls match your filters"
                    : "All available controls are already mapped"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {availableControls.map((control) => (
                  <button
                    key={`${control.frameworkId}:${control.controlId}`}
                    onClick={() => addMapping(control.frameworkId, control.controlId)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {control.controlId}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {control.controlDescription}
                        </p>
                        <span className="text-xs text-gray-500 font-medium">
                          {control.frameworkName}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {currentMappings.length} active mappings • {availableControls.length} available controls
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
