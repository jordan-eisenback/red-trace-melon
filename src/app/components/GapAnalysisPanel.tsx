import { useMemo, useState } from "react";
import { useRequirements } from "../contexts/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { useVendor } from "../contexts/VendorContext";
import { analyzeGaps, getGapSeverityColor, getGapTypeLabel } from "../utils/gapAnalysis";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronRight,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router";

export function GapAnalysisPanel() {
  const { requirements } = useRequirements();
  const { frameworks } = useFrameworks();
  const { getCriteriaForRequirement, getActiveCriteriaProfile } = useVendor();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["unmapped", "empty", "coverage", "byType", "vendorGaps"])
  );

  const gapAnalysis = useMemo(
    () => analyzeGaps(requirements, frameworks),
    [requirements, frameworks]
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const filteredGaps = useMemo(() => {
    return gapAnalysis.criticalGaps.filter((gap) => {
      const matchesSeverity = severityFilter === "all" || gap.severity === severityFilter;
      const matchesType = typeFilter === "all" || gap.type === typeFilter;
      return matchesSeverity && matchesType;
    });
  }, [gapAnalysis.criticalGaps, severityFilter, typeFilter]);

  const gapCountBySeverity = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    gapAnalysis.criticalGaps.forEach((gap) => {
      counts[gap.severity]++;
    });
    return counts;
  }, [gapAnalysis.criticalGaps]);

  // Vendor gap rule: requirements with no linked vendor criterion
  const vendorCriteriaProfile = getActiveCriteriaProfile();
  const vendorGaps = useMemo(() => {
    if (!vendorCriteriaProfile) return [];
    return requirements.filter(
      (req) => getCriteriaForRequirement(req.id).length === 0
    );
  }, [requirements, getCriteriaForRequirement, vendorCriteriaProfile]);

  const getCoverageColor = (percent: number) => {
    if (percent >= 80) return "text-green-600";
    if (percent >= 60) return "text-yellow-600";
    if (percent >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getCoverageIcon = (percent: number) => {
    if (percent >= 80)
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percent >= 60)
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gap Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">
              Identify unmapped requirements and coverage gaps
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getCoverageIcon(gapAnalysis.overallCoverage)}
            <div className="text-right">
              <div
                className={`text-2xl font-semibold ${getCoverageColor(
                  gapAnalysis.overallCoverage
                )}`}
              >
                {Math.round(gapAnalysis.overallCoverage)}%
              </div>
              <div className="text-xs text-gray-500">Overall Coverage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">Critical</div>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            </div>
            <div className="text-xl font-semibold text-red-600 mt-1">
              {gapCountBySeverity.critical}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">High</div>
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            </div>
            <div className="text-xl font-semibold text-orange-600 mt-1">
              {gapCountBySeverity.high}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">Medium</div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            </div>
            <div className="text-xl font-semibold text-yellow-600 mt-1">
              {gapCountBySeverity.medium}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">Low</div>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="text-xl font-semibold text-blue-600 mt-1">
              {gapCountBySeverity.low}
            </div>
          </div>
        </div>
        {vendorCriteriaProfile && vendorGaps.length > 0 && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Star className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="text-sm text-indigo-700">
              <span className="font-semibold">{vendorGaps.length}</span> requirement{vendorGaps.length !== 1 ? "s" : ""} have no vendor evaluation criterion linked
            </p>
            <button
              onClick={() => navigate("/requirement-coverage")}
              className="ml-auto text-xs text-indigo-600 hover:underline whitespace-nowrap"
            >
              View coverage →
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Gap Types</option>
            <option value="unmapped_requirement">Unmapped Requirements</option>
            <option value="empty_control">Empty Controls</option>
            <option value="low_coverage_framework">Low Coverage</option>
          </select>
        </div>
      </div>

      {/* Unmapped Requirements */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("unmapped")}
          className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has("unmapped") ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <XCircle className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Unmapped Requirements</h3>
              <p className="text-sm text-gray-500">
                {gapAnalysis.unmappedRequirements.length} requirements not mapped to any control
              </p>
            </div>
          </div>
          <span className="text-lg font-semibold text-red-600">
            {gapAnalysis.unmappedRequirements.length}
          </span>
        </button>

        {expandedSections.has("unmapped") && gapAnalysis.unmappedRequirements.length > 0 && (
          <div className="p-4 bg-gray-50 space-y-2">
            {gapAnalysis.unmappedRequirements.slice(0, 10).map((req) => (
              <div
                key={req.id}
                className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => navigate(`/requirements/${req.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-blue-600 font-medium">
                        {req.id}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {req.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{req.req}</p>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
            {gapAnalysis.unmappedRequirements.length > 10 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {gapAnalysis.unmappedRequirements.length} unmapped requirements →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty Controls */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("empty")}
          className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has("empty") ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Empty Controls</h3>
              <p className="text-sm text-gray-500">
                {gapAnalysis.emptyControls.length} controls with no requirements mapped
              </p>
            </div>
          </div>
          <span className="text-lg font-semibold text-orange-600">
            {gapAnalysis.emptyControls.length}
          </span>
        </button>

        {expandedSections.has("empty") && gapAnalysis.emptyControls.length > 0 && (
          <div className="p-4 bg-gray-50 space-y-2">
            {gapAnalysis.emptyControls.map(({ framework, control }) => (
              <div
                key={control.id}
                className="bg-white p-3 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-blue-600 font-medium">
                        {control.controlId}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {framework.name}
                      </span>
                      {control.priority && (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded border ${
                            control.priority === "Critical"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : control.priority === "High"
                              ? "bg-orange-100 text-orange-800 border-orange-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }`}
                        >
                          {control.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{control.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Coverage Frameworks */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("coverage")}
          className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has("coverage") ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <TrendingDown className="w-5 h-5 text-yellow-600" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Low Coverage Frameworks</h3>
              <p className="text-sm text-gray-500">
                {gapAnalysis.lowCoverageFrameworks.length} frameworks below 50% coverage
              </p>
            </div>
          </div>
          <span className="text-lg font-semibold text-yellow-600">
            {gapAnalysis.lowCoverageFrameworks.length}
          </span>
        </button>

        {expandedSections.has("coverage") && gapAnalysis.lowCoverageFrameworks.length > 0 && (
          <div className="p-4 bg-gray-50 space-y-2">
            {gapAnalysis.lowCoverageFrameworks.map(({ framework, coveragePercent }) => (
              <div
                key={framework.id}
                className="bg-white p-3 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{framework.name}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            coveragePercent >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${coveragePercent}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12 text-right">
                        {Math.round(coveragePercent)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coverage by Requirement Type */}
      <div>
        <button
          onClick={() => toggleSection("byType")}
          className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has("byType") ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Coverage by Requirement Type</h3>
              <p className="text-sm text-gray-500">
                Mapping coverage breakdown by requirement category
              </p>
            </div>
          </div>
        </button>

        {expandedSections.has("byType") && (
          <div className="p-4 bg-gray-50 space-y-3">
            {Array.from(gapAnalysis.requirementsByType.entries()).map(
              ([type, stats]) => {
                const percent = (stats.mapped / stats.total) * 100;
                return (
                  <div key={type} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{type}</span>
                      <span className="text-sm text-gray-600">
                        {stats.mapped} / {stats.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percent >= 80
                              ? "bg-green-500"
                              : percent >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium w-12 text-right ${getCoverageColor(percent)}`}>
                        {Math.round(percent)}%
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Vendor Coverage Gaps */}
      {vendorCriteriaProfile && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => toggleSection("vendorGaps")}
            className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {expandedSections.has("vendorGaps") ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <Star className="w-5 h-5 text-indigo-500" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Vendor Coverage Gaps</h3>
                <p className="text-sm text-gray-500">
                  {vendorGaps.length} requirement{vendorGaps.length !== 1 ? "s" : ""} not linked to any vendor evaluation criterion
                </p>
              </div>
            </div>
            <span className="text-lg font-semibold text-indigo-600">{vendorGaps.length}</span>
          </button>

          {expandedSections.has("vendorGaps") && vendorGaps.length > 0 && (
            <div className="p-4 bg-gray-50 space-y-2">
              {vendorGaps.slice(0, 10).map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 cursor-pointer transition-colors"
                  onClick={() => navigate(`/requirement-coverage`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-indigo-600 font-medium">{req.id}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{req.type}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{req.req}</p>
                    </div>
                    <AlertTriangle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
              {vendorGaps.length > 10 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => navigate("/requirement-coverage")}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View all {vendorGaps.length} vendor coverage gaps →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
