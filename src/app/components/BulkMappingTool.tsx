import { useState, useMemo } from "react";
import { X, Link2, Shield, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { useRequirements } from "../context/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { toast } from "sonner";

interface BulkMappingToolProps {
  open: boolean;
  onClose: () => void;
  unmappedRequirementIds?: string[];
}

// Smart keyword-to-framework mapping rules
const mappingRules = {
  SOX: {
    keywords: ["audit", "sox", "review", "approval", "attest", "certif", "evidence", "control"],
    controls: ["SOX-ITGC-01", "SOX-ITGC-02", "SOX-ITGC-04"],
  },
  "NIST 800-53": {
    keywords: ["access", "authentication", "authorization", "security", "privilege", "identity"],
    controls: ["AC-2", "AC-3", "AC-5", "AC-6", "IA-2"],
  },
  "ISO 27001": {
    keywords: ["policy", "procedure", "governance", "manage", "control", "document"],
    controls: ["A.9.1.1", "A.9.1.2", "A.9.2.1", "A.9.2.2"],
  },
  COBIT: {
    keywords: ["process", "workflow", "lifecycle", "request", "provisioning", "deprovisioning"],
    controls: ["DSS05.04", "DSS05.05", "APO13.01"],
  },
};

export function BulkMappingTool({ open, onClose, unmappedRequirementIds }: BulkMappingToolProps) {
  const { requirements } = useRequirements();
  const { frameworks, addRequirementToControl } = useFrameworks();
  const [selectedMappings, setSelectedMappings] = useState<Map<string, Set<string>>>(new Map());

  // Get unmapped compliance requirements
  const unmappedRequirements = useMemo(() => {
    const mappedReqIds = new Set<string>();
    frameworks.forEach((framework) => {
      framework.controls.forEach((control) => {
        control.requirements.forEach((reqId) => {
          mappedReqIds.add(reqId);
        });
      });
    });

    const complianceKeywords = ["audit", "approval", "review", "certif", "attest", "compliance", "sox", "control"];
    
    return requirements.filter((req) => {
      if (unmappedRequirementIds && !unmappedRequirementIds.includes(req.id)) {
        return false;
      }

      if (mappedReqIds.has(req.id)) {
        return false;
      }

      if (req.type !== "Capability" && req.type !== "IGA Functional") {
        return false;
      }

      const hasComplianceKeyword = complianceKeywords.some((keyword) =>
        req.req.toLowerCase().includes(keyword)
      );

      return hasComplianceKeyword;
    });
  }, [requirements, frameworks, unmappedRequirementIds]);

  // Generate AI suggestions for each requirement
  const suggestedMappings = useMemo(() => {
    const suggestions = new Map<string, Array<{ frameworkId: string; controlId: string; score: number }>>();

    unmappedRequirements.forEach((req) => {
      const reqText = `${req.req} ${req.outcome || ""}`.toLowerCase();
      const reqSuggestions: Array<{ frameworkId: string; controlId: string; score: number }> = [];

      frameworks.forEach((framework) => {
        const rule = mappingRules[framework.name as keyof typeof mappingRules];
        if (!rule) return;

        const matchCount = rule.keywords.filter((keyword) => reqText.includes(keyword)).length;
        
        if (matchCount > 0) {
          rule.controls.forEach((controlId) => {
            const control = framework.controls.find((c) => c.id === controlId);
            if (control) {
              // Calculate relevance score (0-100)
              const score = Math.min(100, (matchCount / rule.keywords.length) * 100);
              reqSuggestions.push({
                frameworkId: framework.id,
                controlId: control.id,
                score,
              });
            }
          });
        }
      });

      // Sort by score and take top 3
      reqSuggestions.sort((a, b) => b.score - a.score);
      suggestions.set(req.id, reqSuggestions.slice(0, 3));
    });

    return suggestions;
  }, [unmappedRequirements, frameworks]);

  const toggleMapping = (reqId: string, frameworkId: string, controlId: string) => {
    const key = `${frameworkId}:${controlId}`;
    setSelectedMappings((prev) => {
      const next = new Map(prev);
      const existing = next.get(reqId) || new Set();
      const updated = new Set(existing);
      
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      
      next.set(reqId, updated);
      return next;
    });
  };

  const applyAllSuggestions = () => {
    let count = 0;
    unmappedRequirements.forEach((req) => {
      const suggestions = suggestedMappings.get(req.id) || [];
      if (suggestions.length > 0) {
        const topSuggestion = suggestions[0];
        const key = `${topSuggestion.frameworkId}:${topSuggestion.controlId}`;
        setSelectedMappings((prev) => {
          const next = new Map(prev);
          next.set(req.id, new Set([key]));
          return next;
        });
        count++;
      }
    });
    toast.success(`Selected ${count} AI-recommended mappings`);
  };

  const applyMappings = () => {
    let count = 0;
    selectedMappings.forEach((mappings, reqId) => {
      mappings.forEach((mapping) => {
        const [frameworkId, controlId] = mapping.split(":");
        addRequirementToControl(frameworkId, controlId, reqId);
        count++;
      });
    });
    
    toast.success(`Applied ${count} requirement-to-control mappings`);
    setSelectedMappings(new Map());
    onClose();
  };

  const getTotalSelected = () => {
    let total = 0;
    selectedMappings.forEach((mappings) => {
      total += mappings.size;
    });
    return total;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Link2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bulk Framework Mapping</h2>
                <p className="text-green-100 text-sm mt-1">
                  AI-powered suggestions for {unmappedRequirements.length} unmapped compliance requirements
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={applyAllSuggestions}
              className="px-4 py-2 bg-white/20 backdrop-blur hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Select All Top Suggestions
            </button>
            <button
              onClick={() => setSelectedMappings(new Map())}
              className="px-4 py-2 bg-white/10 backdrop-blur hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              Clear All Selections
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {unmappedRequirements.length === 0 ? (
            <div className="text-center py-12 bg-green-50 rounded-lg">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
              <p className="text-green-700 font-medium text-lg">All Set!</p>
              <p className="text-sm text-green-600 mt-1">
                No unmapped compliance requirements found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unmappedRequirements.map((req) => {
                const suggestions = suggestedMappings.get(req.id) || [];
                const selected = selectedMappings.get(req.id) || new Set();

                return (
                  <div key={req.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {req.id}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                              {req.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{req.req}</p>
                          {req.outcome && (
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Outcome:</strong> {req.outcome}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {suggestions.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-gray-700">
                            AI-Suggested Mappings:
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {suggestions.map((suggestion) => {
                            const framework = frameworks.find((f) => f.id === suggestion.frameworkId);
                            const control = framework?.controls.find((c) => c.id === suggestion.controlId);
                            const key = `${suggestion.frameworkId}:${suggestion.controlId}`;
                            const isSelected = selected.has(key);

                            if (!framework || !control) return null;

                            return (
                              <button
                                key={key}
                                onClick={() => toggleMapping(req.id, framework.id, control.id)}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${
                                  isSelected
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="text-xs font-medium text-gray-900 truncate">
                                      {control.id}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {control.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">{framework.name}</span>
                                  <span className="text-xs font-medium text-purple-600">
                                    {Math.round(suggestion.score)}% match
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">
                        No automatic suggestions available. Review manually in Frameworks page.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {unmappedRequirements.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {getTotalSelected()} mappings selected across {selectedMappings.size} requirements
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyMappings}
                disabled={getTotalSelected() === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply {getTotalSelected()} Mappings
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
