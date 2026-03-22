import { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Link2Off,
  Copy,
  Zap,
  ExternalLink,
  Edit,
} from "lucide-react";
import { useRequirements } from "../context/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { Requirement } from "../types/requirement";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { BulkMappingTool } from "./BulkMappingTool";
import { RequirementRemapTool } from "./RequirementRemapTool";

interface ValidationIssue {
  id: string;
  requirementId: string;
  severity: "error" | "warning" | "info";
  category: string;
  message: string;
  suggestion?: string;
  autoFix?: () => void;
  autoFixLabel?: string;
}

interface RefinementSuggestion {
  id: string;
  requirementId: string;
  type: "enhancement" | "split" | "merge" | "mapping";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  action?: () => void;
  actionLabel?: string;
}

export function RequirementValidationPanel() {
  const { requirements, updateRequirement } = useRequirements();
  const { frameworks } = useFrameworks();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["errors"]));
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showBulkMapping, setShowBulkMapping] = useState(false);
  const [showRemapTool, setShowRemapTool] = useState(false);
  const navigate = useNavigate();

  // Validation Rules
  const issues = useMemo(() => {
    const foundIssues: ValidationIssue[] = [];
    const reqMap = new Map(requirements.map((r) => [r.id, r]));

    // Get all mapped requirement IDs
    const mappedReqIds = new Set<string>();
    frameworks.forEach((framework) => {
      framework.controls.forEach((control) => {
        control.requirements.forEach((reqId) => {
          mappedReqIds.add(reqId);
        });
      });
    });

    requirements.forEach((req) => {
      // 1. Missing critical fields (check for truly empty, not just default values)
      if (!req.owner || req.owner.trim() === "" || req.owner === "Unassigned") {
        foundIssues.push({
          id: `missing-owner-${req.id}`,
          requirementId: req.id,
          severity: "error",
          category: "Missing Data",
          message: `${req.id}: Missing owner assignment`,
          suggestion: "Assign an owner to establish accountability",
          autoFix: () => {
            updateRequirement(req.id, { ...req, owner: "RBAC Product" });
            toast.success(`Auto-assigned owner to ${req.id}`);
          },
          autoFixLabel: "Auto-assign default owner",
        });
      }

      if (!req.outcome || req.outcome.trim() === "" || req.outcome === "TBD") {
        foundIssues.push({
          id: `missing-outcome-${req.id}`,
          requirementId: req.id,
          severity: "warning",
          category: "Missing Data",
          message: `${req.id}: Missing expected outcome`,
          suggestion: "Define the measurable outcome this requirement delivers",
          autoFix: () => {
            const generatedOutcome = `Deliver ${req.req.substring(0, 60).toLowerCase()}...`;
            updateRequirement(req.id, { ...req, outcome: generatedOutcome });
            toast.success(`Generated outcome for ${req.id}`);
          },
          autoFixLabel: "Generate outcome",
        });
      }

      if (!req.notes || req.notes.trim() === "" || req.notes === "N/A") {
        foundIssues.push({
          id: `missing-notes-${req.id}`,
          requirementId: req.id,
          severity: "info",
          category: "Missing Data",
          message: `${req.id}: Missing implementation notes`,
          suggestion: "Add context or implementation guidance",
        });
      }

      // 2. Vague or generic content
      const vagueWords = ["TBD", "TODO", "placeholder", "to be determined", "update this"];
      const hasVagueContent = vagueWords.some(
        (word) =>
          req.req.toLowerCase().includes(word.toLowerCase()) ||
          (req.outcome && req.outcome.toLowerCase().includes(word.toLowerCase()))
      );
      
      if (hasVagueContent) {
        foundIssues.push({
          id: `vague-content-${req.id}`,
          requirementId: req.id,
          severity: "warning",
          category: "Quality Issues",
          message: `${req.id}: Contains placeholder or vague content`,
          suggestion: "Replace placeholder text with specific requirements",
        });
      }

      // 3. Orphaned parent references
      if (req.parent && !reqMap.has(req.parent)) {
        foundIssues.push({
          id: `orphaned-parent-${req.id}`,
          requirementId: req.id,
          severity: "error",
          category: "Broken Relationships",
          message: `${req.id}: References non-existent parent "${req.parent}"`,
          suggestion: "Remove invalid parent reference or create the missing parent",
          autoFix: () => {
            updateRequirement(req.id, { ...req, parent: null });
            toast.success(`Removed invalid parent from ${req.id}`);
          },
          autoFixLabel: "Remove invalid parent",
        });
      }

      // 4. Circular dependencies
      if (req.parent) {
        const visited = new Set<string>();
        let current: string | null = req.parent;
        while (current && !visited.has(current)) {
          visited.add(current);
          const parent = reqMap.get(current);
          if (parent?.parent === req.id) {
            foundIssues.push({
              id: `circular-dep-${req.id}`,
              requirementId: req.id,
              severity: "error",
              category: "Broken Relationships",
              message: `${req.id}: Circular dependency with ${current}`,
              suggestion: "Break the circular reference to restore hierarchy",
              autoFix: () => {
                updateRequirement(req.id, { ...req, parent: null });
                toast.success(`Broke circular dependency for ${req.id}`);
              },
              autoFixLabel: "Break circular dependency",
            });
            break;
          }
          current = parent?.parent || null;
        }
      }

      // 5. Very short descriptions (likely incomplete)
      if (req.req.length < 20) {
        foundIssues.push({
          id: `vague-desc-${req.id}`,
          requirementId: req.id,
          severity: "warning",
          category: "Quality Issues",
          message: `${req.id}: Description is too brief (${req.req.length} chars)`,
          suggestion: "Expand description to provide clear, actionable detail",
        });
      }

      // 6. Overly long descriptions (may need splitting)
      if (req.req.length > 300) {
        foundIssues.push({
          id: `long-desc-${req.id}`,
          requirementId: req.id,
          severity: "info",
          category: "Quality Issues",
          message: `${req.id}: Description is very long (${req.req.length} chars)`,
          suggestion: "Consider splitting into multiple focused requirements",
        });
      }

      // 7. Missing framework mappings (for key requirement types)
      if (
        (req.type === "Capability" || req.type === "IGA Functional") &&
        !mappedReqIds.has(req.id)
      ) {
        // Check if it's a compliance-related requirement
        const complianceKeywords = ["audit", "approval", "review", "certif", "attest", "compliance", "sox", "control"];
        const hasComplianceKeyword = complianceKeywords.some((keyword) =>
          req.req.toLowerCase().includes(keyword)
        );

        if (hasComplianceKeyword) {
          foundIssues.push({
            id: `no-mapping-${req.id}`,
            requirementId: req.id,
            severity: "warning",
            category: "Traceability",
            message: `${req.id}: Compliance-related requirement not mapped to framework controls`,
            suggestion: "Map to relevant compliance controls for traceability",
          });
        }
      }

      // 8. Category requirements without children
      if (req.type === "Capability Category") {
        const hasChildren = requirements.some((r) => r.parent === req.id);
        if (!hasChildren) {
          foundIssues.push({
            id: `empty-category-${req.id}`,
            requirementId: req.id,
            severity: "warning",
            category: "Structural Issues",
            message: `${req.id}: Category has no child requirements`,
            suggestion: "Add child requirements or change type to 'Capability'",
            autoFix: () => {
              updateRequirement(req.id, { ...req, type: "Capability" });
              toast.success(`Changed ${req.id} to Capability type`);
            },
            autoFixLabel: "Change to Capability",
          });
        }
      }

      // 9. Weak outcome statements
      if (req.outcome) {
        const weakStarts = ["the ", "will ", "should ", "may ", "can "];
        const startsWeakly = weakStarts.some((start) =>
          req.outcome.toLowerCase().startsWith(start)
        );

        if (startsWeakly) {
          foundIssues.push({
            id: `weak-outcome-${req.id}`,
            requirementId: req.id,
            severity: "info",
            category: "Quality Issues",
            message: `${req.id}: Outcome statement could be more direct`,
            suggestion: "Start outcomes with a noun or strong verb for clarity",
            autoFix: () => {
              let improved = req.outcome;
              weakStarts.forEach((start) => {
                improved = improved.replace(new RegExp(`^${start}`, "i"), "");
              });
              const capitalized = improved.charAt(0).toUpperCase() + improved.slice(1);
              updateRequirement(req.id, { ...req, outcome: capitalized });
              toast.success(`Improved outcome phrasing for ${req.id}`);
            },
            autoFixLabel: "Improve phrasing",
          });
        }
      }

      // 10. Owner field looks like placeholder
      const placeholderOwners = ["tbd", "unassigned", "unknown", "todo", "n/a"];
      if (placeholderOwners.some((ph) => req.owner.toLowerCase().includes(ph))) {
        foundIssues.push({
          id: `placeholder-owner-${req.id}`,
          requirementId: req.id,
          severity: "warning",
          category: "Missing Data",
          message: `${req.id}: Owner appears to be a placeholder`,
          suggestion: "Assign a real owner or team",
          autoFix: () => {
            updateRequirement(req.id, { ...req, owner: "RBAC Product" });
            toast.success(`Assigned default owner to ${req.id}`);
          },
          autoFixLabel: "Assign default owner",
        });
      }
    });

    return foundIssues;
  }, [requirements, frameworks, updateRequirement]);

  // Smart Refinement Suggestions
  const suggestions = useMemo(() => {
    const foundSuggestions: RefinementSuggestion[] = [];
    const reqMap = new Map(requirements.map((r) => [r.id, r]));

    // Get mapping counts
    const mappingCounts = new Map<string, number>();
    frameworks.forEach((framework) => {
      framework.controls.forEach((control) => {
        control.requirements.forEach((reqId) => {
          mappingCounts.set(reqId, (mappingCounts.get(reqId) || 0) + 1);
        });
      });
    });

    requirements.forEach((req) => {
      // 1. Suggest splitting complex requirements (very long descriptions)
      if (req.req.length > 200 && req.req.includes(" and ")) {
        foundSuggestions.push({
          id: `split-${req.id}`,
          requirementId: req.id,
          type: "split",
          title: "Consider splitting requirement",
          description: `${req.id} has a long, complex description. Consider breaking into multiple focused requirements.`,
          impact: "medium",
          actionLabel: "View requirement",
        });
      }

      // 2. Suggest better outcome phrasing
      if (req.outcome && req.outcome.toLowerCase().startsWith("the ")) {
        foundSuggestions.push({
          id: `rephrase-outcome-${req.id}`,
          requirementId: req.id,
          type: "enhancement",
          title: "Improve outcome phrasing",
          description: `${req.id}: Outcomes should be measurable results, not descriptions. Start with a verb or noun phrase.`,
          impact: "low",
          action: () => {
            const improved = req.outcome.replace(/^the\s+/i, "").trim();
            const capitalized = improved.charAt(0).toUpperCase() + improved.slice(1);
            updateRequirement(req.id, { ...req, outcome: capitalized });
            toast.success(`Improved outcome phrasing for ${req.id}`);
          },
          actionLabel: "Auto-improve phrasing",
        });
      }

      // 3. Suggest parent relationships for orphaned requirements
      if (!req.parent && req.type === "Capability") {
        const potentialParents = requirements.filter(
          (r) =>
            r.type === "Capability Category" &&
            r.id !== req.id &&
            req.id.startsWith(r.id.replace(/[‑-]\d+$/, ""))
        );
        if (potentialParents.length > 0) {
          const parent = potentialParents[0];
          foundSuggestions.push({
            id: `suggest-parent-${req.id}`,
            requirementId: req.id,
            type: "enhancement",
            title: "Suggested parent relationship",
            description: `${req.id} appears to belong under ${parent.id} based on naming convention.`,
            impact: "high",
            action: () => {
              updateRequirement(req.id, { ...req, parent: parent.id });
              toast.success(`Linked ${req.id} to parent ${parent.id}`);
            },
            actionLabel: `Link to ${parent.id}`,
          });
        }
      }

      // 4. Suggest mapping to frameworks (if high-value and unmapped)
      if (
        req.type === "Capability" &&
        !mappingCounts.has(req.id) &&
        (req.req.toLowerCase().includes("audit") ||
          req.req.toLowerCase().includes("approval") ||
          req.req.toLowerCase().includes("access") ||
          req.req.toLowerCase().includes("review"))
      ) {
        foundSuggestions.push({
          id: `suggest-mapping-${req.id}`,
          requirementId: req.id,
          type: "mapping",
          title: "High-value requirement needs mapping",
          description: `${req.id} contains compliance keywords but isn't mapped to any framework controls.`,
          impact: "high",
          actionLabel: "Open mapping tool",
        });
      }

      // 5. Suggest type refinement
      if (req.type === "IGA Functional" && req.id.includes("REQ-8")) {
        const childCount = requirements.filter((r) => r.parent === req.id).length;
        if (childCount > 3) {
          foundSuggestions.push({
            id: `retype-${req.id}`,
            requirementId: req.id,
            type: "enhancement",
            title: "Consider reclassifying type",
            description: `${req.id} has ${childCount} children. Consider changing to "Capability Category" for better organization.`,
            impact: "medium",
            action: () => {
              updateRequirement(req.id, { ...req, type: "Capability Category" });
              toast.success(`Changed ${req.id} to Capability Category`);
            },
            actionLabel: "Change to Category",
          });
        }
      }

      // 6. Suggest consolidation of similar requirements
      const similar = requirements.filter((r) => {
        if (r.id === req.id || r.type !== req.type) return false;
        const words1 = new Set(req.req.toLowerCase().split(/\s+/));
        const words2 = new Set(r.req.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter((w) => words2.has(w) && w.length > 4));
        return intersection.size >= 5; // 5+ common significant words
      });

      if (similar.length > 0 && req.id < similar[0].id) {
        foundSuggestions.push({
          id: `merge-${req.id}`,
          requirementId: req.id,
          type: "merge",
          title: "Potential duplicate detected",
          description: `${req.id} and ${similar[0].id} have significant overlap. Consider merging.`,
          impact: "medium",
          actionLabel: "Review both",
        });
      }
    });

    return foundSuggestions;
  }, [requirements, frameworks, updateRequirement]);

  // Calculate health score
  const healthScore = useMemo(() => {
    const totalReqs = requirements.length;
    if (totalReqs === 0) return 100;

    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    const infoCount = issues.filter((i) => i.severity === "info").length;

    const deductions = errorCount * 5 + warningCount * 2 + infoCount * 0.5;
    const score = Math.max(0, 100 - deductions);
    return Math.round(score);
  }, [issues, requirements]);

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthBg = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 70) return "bg-yellow-100";
    if (score >= 50) return "bg-orange-100";
    return "bg-red-100";
  };

  const issuesByCategory = useMemo(() => {
    const grouped = new Map<string, ValidationIssue[]>();
    issues.forEach((issue) => {
      const existing = grouped.get(issue.category) || [];
      grouped.set(issue.category, [...existing, issue]);
    });
    return grouped;
  }, [issues]);

  const suggestionsByType = useMemo(() => {
    const grouped = new Map<string, RefinementSuggestion[]>();
    suggestions.forEach((suggestion) => {
      const existing = grouped.get(suggestion.type) || [];
      grouped.set(suggestion.type, [...existing, suggestion]);
    });
    return grouped;
  }, [suggestions]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const autoFixAll = () => {
    const fixableIssues = issues.filter((i) => i.autoFix);
    if (fixableIssues.length === 0) {
      toast.info("No auto-fixable issues found");
      return;
    }

    fixableIssues.forEach((issue) => {
      if (issue.autoFix) {
        issue.autoFix();
      }
    });
    toast.success(`Auto-fixed ${fixableIssues.length} issues`);
  };

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;
  const traceabilityWarnings = issues.filter((i) => i.category === "Traceability");

  return (
    <>
      <BulkMappingTool
        open={showBulkMapping}
        onClose={() => setShowBulkMapping(false)}
        unmappedRequirementIds={traceabilityWarnings.map((i) => i.requirementId)}
      />
      
      <RequirementRemapTool
        open={showRemapTool}
        onClose={() => setShowRemapTool(false)}
        requirementId={undefined}
      />
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-semibold">Requirement Health Check</h3>
                  <p className="text-purple-100 text-sm mt-1">
                    AI-powered validation and improvement suggestions
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getHealthColor(healthScore)}`}>
                <span className="text-white">{healthScore}</span>
                <span className="text-2xl text-purple-200">/100</span>
              </div>
              <p className="text-sm text-purple-100 mt-1">Quality Score</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className="text-2xl font-semibold">{requirements.length}</div>
              <div className="text-xs text-purple-100">Total Requirements</div>
            </div>
            <div className="bg-red-500/20 backdrop-blur rounded-lg p-3">
              <div className="text-2xl font-semibold flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {errorCount}
              </div>
              <div className="text-xs text-purple-100">Errors</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur rounded-lg p-3">
              <div className="text-2xl font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {warningCount}
              </div>
              <div className="text-xs text-purple-100">Warnings</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur rounded-lg p-3">
              <div className="text-2xl font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                {suggestions.length}
              </div>
              <div className="text-xs text-purple-100">Suggestions</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(errorCount > 0 || warningCount > 0) && (
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {issues.filter((i) => i.autoFix).length} issues can be auto-fixed
              </p>
              <button
                onClick={autoFixAll}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Zap className="w-4 h-4" />
                Auto-Fix All
              </button>
            </div>
          </div>
        )}

        {/* Traceability Banner */}
        {traceabilityWarnings.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 border-b border-orange-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-medium">
                    {traceabilityWarnings.length} compliance requirements need framework mapping
                  </p>
                  <p className="text-orange-100 text-sm mt-0.5">
                    Use AI-powered bulk mapping to resolve all traceability warnings at once
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkMapping(true)}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                Bulk Map ({traceabilityWarnings.length})
              </button>
            </div>
          </div>
        )}

        {/* Validation Issues */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Validation Issues ({issues.length})
          </h4>

          {issues.length === 0 ? (
            <div className="text-center py-8 bg-green-50 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-green-700 font-medium">No validation issues found!</p>
              <p className="text-sm text-green-600 mt-1">All requirements pass validation checks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(issuesByCategory.entries()).map(([category, categoryIssues]) => {
                const isExpanded = expandedCategories.has(category);
                const errorInCategory = categoryIssues.filter((i) => i.severity === "error").length;
                const warningInCategory = categoryIssues.filter(
                  (i) => i.severity === "warning"
                ).length;

                return (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="font-medium text-gray-900">{category}</span>
                        <div className="flex items-center gap-2">
                          {errorInCategory > 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">
                              {errorInCategory} errors
                            </span>
                          )}
                          {warningInCategory > 0 && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                              {warningInCategory} warnings
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{categoryIssues.length} issues</span>
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-3 bg-white">
                        {categoryIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className={`p-3 rounded-lg border-l-4 ${
                              issue.severity === "error"
                                ? "bg-red-50 border-red-500"
                                : issue.severity === "warning"
                                ? "bg-yellow-50 border-yellow-500"
                                : "bg-blue-50 border-blue-500"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {issue.severity === "error" && (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                  {issue.severity === "warning" && (
                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                  )}
                                  {issue.severity === "info" && (
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                  )}
                                  <span className="text-sm font-medium text-gray-900">
                                    {issue.message}
                                  </span>
                                </div>
                                {issue.suggestion && (
                                  <p className="text-xs text-gray-600 ml-6">{issue.suggestion}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Go to Requirement Button */}
                                <button
                                  onClick={() => navigate(`/requirements/${issue.requirementId}`)}
                                  className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
                                  title="Go to requirement to edit manually"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit Manually
                                </button>
                                {issue.autoFix && (
                                  <button
                                    onClick={issue.autoFix}
                                    className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
                                  >
                                    <Zap className="w-3 h-3" />
                                    {issue.autoFixLabel || "Fix"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Refinement Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Smart Suggestions ({suggestions.length})
              </h4>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide
              </button>
            </div>

            <div className="space-y-3">
              {Array.from(suggestionsByType.entries()).map(([type, typeSuggestions]) => {
                const typeLabels = {
                  enhancement: "Enhancements",
                  split: "Split Recommendations",
                  merge: "Merge Opportunities",
                  mapping: "Mapping Suggestions",
                };

                return (
                  <div key={type}>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      {typeLabels[type as keyof typeof typeLabels]} ({typeSuggestions.length})
                    </h5>
                    <div className="space-y-2">
                      {typeSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {suggestion.title}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded ${
                                    suggestion.impact === "high"
                                      ? "bg-red-100 text-red-700"
                                      : suggestion.impact === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {suggestion.impact} impact
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 ml-6">{suggestion.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Go to Requirement Button for Suggestions */}
                              <button
                                onClick={() => navigate(`/requirements/${suggestion.requirementId}`)}
                                className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded text-xs font-medium hover:bg-purple-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
                                title="View requirement details"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View
                              </button>
                              {(suggestion.action || suggestion.actionLabel) && (
                                <button
                                  onClick={suggestion.action}
                                  className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
                                >
                                  {suggestion.actionLabel || "Apply"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}