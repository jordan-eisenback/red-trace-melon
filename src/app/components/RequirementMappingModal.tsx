import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Search, CheckCircle, Circle, Link2, Sparkles } from "lucide-react";
import { useRequirements } from "../context/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { Control } from "../types/framework";
import { toast } from "sonner";

interface RequirementMappingModalProps {
  open: boolean;
  onClose: () => void;
  controlId: string;
  frameworkId: string;
}

export function RequirementMappingModal({
  open,
  onClose,
  controlId,
  frameworkId,
}: RequirementMappingModalProps) {
  const { requirements } = useRequirements();
  const { frameworks, updateControl } = useFrameworks();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showOnlyUnmapped, setShowOnlyUnmapped] = useState(false);

  // Find the current control
  const currentFramework = frameworks.find((f) => f.id === frameworkId);
  const currentControl = currentFramework?.controls.find((c) => c.id === controlId);

  // Get currently mapped requirement IDs for this control
  const mappedIds = new Set(currentControl?.requirements || []);

  // Get all mapped requirement IDs across all frameworks
  const allMappedIds = useMemo(() => {
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

  // Get requirement types
  const types = useMemo(() => {
    const uniqueTypes = new Set(requirements.map((r) => r.type));
    return Array.from(uniqueTypes).sort();
  }, [requirements]);

  // Smart suggestions based on keywords
  const getSuggestions = (control: Control) => {
    if (!control) return new Set<string>();
    
    const keywords = [
      ...control.title.toLowerCase().split(" "),
      ...control.description.toLowerCase().split(" "),
      control.controlId.toLowerCase(),
    ];

    const suggestions = new Set<string>();
    requirements.forEach((req) => {
      const reqText = `${req.id} ${req.req} ${req.outcome}`.toLowerCase();
      const matches = keywords.filter((keyword) => 
        keyword.length > 3 && reqText.includes(keyword)
      );
      
      if (matches.length >= 2) {
        suggestions.add(req.id);
      }
    });

    return suggestions;
  };

  const suggestions = currentControl ? getSuggestions(currentControl) : new Set<string>();

  // Filter requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesSearch =
        searchTerm === "" ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.req.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.outcome.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || req.type === typeFilter;
      
      const matchesUnmapped = !showOnlyUnmapped || !allMappedIds.has(req.id);

      return matchesSearch && matchesType && matchesUnmapped;
    });
  }, [requirements, searchTerm, typeFilter, showOnlyUnmapped, allMappedIds]);

  const toggleRequirement = (reqId: string) => {
    if (!currentControl || !currentFramework) return;

    const newRequirements = mappedIds.has(reqId)
      ? currentControl.requirements.filter((id) => id !== reqId)
      : [...currentControl.requirements, reqId];

    updateControl(frameworkId, controlId, {
      ...currentControl,
      requirements: newRequirements,
    });

    const action = mappedIds.has(reqId) ? "unmapped from" : "mapped to";
    toast.success(`Requirement ${reqId} ${action} ${currentControl.controlId}`);
  };

  const mapAllSuggestions = () => {
    if (!currentControl || !currentFramework) return;

    const newMappings = Array.from(suggestions).filter((id) => !mappedIds.has(id));
    const updatedRequirements = [...currentControl.requirements, ...newMappings];

    updateControl(frameworkId, controlId, {
      ...currentControl,
      requirements: updatedRequirements,
    });

    toast.success(`Mapped ${newMappings.length} suggested requirements`);
  };

  if (!currentControl || !currentFramework) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-scale-in z-50">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Map Requirements to Control
                </Dialog.Title>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{currentFramework.name}</span> -{" "}
                    <span className="font-mono text-blue-600">{currentControl.controlId}</span>
                  </p>
                  <p className="text-sm text-gray-700">{currentControl.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-600">
                      {mappedIds.size} requirements mapped
                    </span>
                    {suggestions.size > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-purple-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {suggestions.size} suggestions
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="p-4 border-b border-gray-200 bg-white space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyUnmapped}
                  onChange={(e) => setShowOnlyUnmapped(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Show only unmapped requirements
              </label>

              {suggestions.size > 0 && (
                <button
                  onClick={mapAllSuggestions}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Map all {suggestions.size} suggestions
                </button>
              )}
            </div>
          </div>

          {/* Requirements List */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 280px)" }}>
            <div className="p-4 space-y-2">
              {filteredRequirements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No requirements found</p>
                </div>
              ) : (
                filteredRequirements.map((req) => {
                  const isMapped = mappedIds.has(req.id);
                  const isSuggested = suggestions.has(req.id);
                  const isMappedElsewhere = !isMapped && allMappedIds.has(req.id);

                  return (
                    <button
                      key={req.id}
                      onClick={() => toggleRequirement(req.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isMapped
                          ? "border-blue-500 bg-blue-50"
                          : isSuggested
                          ? "border-purple-300 bg-purple-50 hover:border-purple-400"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isMapped ? (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-medium text-blue-600">
                              {req.id}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {req.type}
                            </span>
                            {isSuggested && !isMapped && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Suggested
                              </span>
                            )}
                            {isMappedElsewhere && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                                <Link2 className="w-3 h-3" />
                                Mapped elsewhere
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{req.req}</p>
                          {req.outcome && (
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Outcome:</span> {req.outcome}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredRequirements.filter((req) => mappedIds.has(req.id)).length} of{" "}
                {filteredRequirements.length} selected
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
