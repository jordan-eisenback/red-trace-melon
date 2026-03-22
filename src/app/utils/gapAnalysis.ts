import { Framework, Control } from "../types/framework";
import { Requirement } from "../types/requirement";

export interface GapAnalysisResult {
  unmappedRequirements: Requirement[];
  emptyControls: Array<{ framework: Framework; control: Control }>;
  lowCoverageFrameworks: Array<{ framework: Framework; coveragePercent: number }>;
  requirementsByType: Map<string, { total: number; mapped: number; unmapped: number }>;
  overallCoverage: number;
  criticalGaps: Array<{
    type: "unmapped_requirement" | "empty_control" | "low_coverage_framework";
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    itemId: string;
  }>;
}

export function analyzeGaps(
  requirements: Requirement[],
  frameworks: Framework[]
): GapAnalysisResult {
  // Get all mapped requirement IDs
  const mappedRequirementIds = new Set<string>();
  frameworks.forEach((framework) => {
    framework.controls.forEach((control) => {
      control.requirements.forEach((reqId) => {
        mappedRequirementIds.add(reqId);
      });
    });
  });

  // Find unmapped requirements
  const unmappedRequirements = requirements.filter(
    (req) => !mappedRequirementIds.has(req.id)
  );

  // Find empty controls (controls with no requirements)
  const emptyControls: Array<{ framework: Framework; control: Control }> = [];
  frameworks.forEach((framework) => {
    framework.controls.forEach((control) => {
      if (control.requirements.length === 0) {
        emptyControls.push({ framework, control });
      }
    });
  });

  // Calculate coverage by framework
  const lowCoverageFrameworks: Array<{ framework: Framework; coveragePercent: number }> = [];
  frameworks.forEach((framework) => {
    if (framework.controls.length === 0) {
      lowCoverageFrameworks.push({ framework, coveragePercent: 0 });
      return;
    }

    const controlsWithMappings = framework.controls.filter(
      (c) => c.requirements.length > 0
    ).length;
    const coveragePercent = (controlsWithMappings / framework.controls.length) * 100;

    if (coveragePercent < 50) {
      lowCoverageFrameworks.push({ framework, coveragePercent });
    }
  });

  // Analyze by requirement type
  const requirementsByType = new Map<
    string,
    { total: number; mapped: number; unmapped: number }
  >();

  requirements.forEach((req) => {
    const type = req.type || "Unknown";
    if (!requirementsByType.has(type)) {
      requirementsByType.set(type, { total: 0, mapped: 0, unmapped: 0 });
    }

    const stats = requirementsByType.get(type)!;
    stats.total++;

    if (mappedRequirementIds.has(req.id)) {
      stats.mapped++;
    } else {
      stats.unmapped++;
    }
  });

  // Calculate overall coverage
  const overallCoverage =
    requirements.length > 0
      ? (mappedRequirementIds.size / requirements.length) * 100
      : 100;

  // Identify critical gaps
  const criticalGaps: GapAnalysisResult["criticalGaps"] = [];

  // Critical unmapped requirements (Enterprise, IGA Functional)
  unmappedRequirements.forEach((req) => {
    let severity: "critical" | "high" | "medium" | "low" = "medium";

    if (req.type === "Enterprise") {
      severity = "critical";
    } else if (req.type === "IGA Functional") {
      severity = "high";
    } else if (req.type === "Capability") {
      severity = "high";
    }

    criticalGaps.push({
      type: "unmapped_requirement",
      severity,
      description: `${req.id}: ${req.req.substring(0, 80)}...`,
      itemId: req.id,
    });
  });

  // Critical empty controls
  emptyControls.forEach(({ framework, control }) => {
    let severity: "critical" | "high" | "medium" | "low" = "medium";

    if (control.priority === "Critical") {
      severity = "critical";
    } else if (control.priority === "High") {
      severity = "high";
    }

    criticalGaps.push({
      type: "empty_control",
      severity,
      description: `${framework.name} - ${control.controlId}: ${control.title}`,
      itemId: control.id,
    });
  });

  // Low coverage frameworks
  lowCoverageFrameworks.forEach(({ framework, coveragePercent }) => {
    criticalGaps.push({
      type: "low_coverage_framework",
      severity: coveragePercent < 25 ? "high" : "medium",
      description: `${framework.name} has only ${Math.round(coveragePercent)}% control coverage`,
      itemId: framework.id,
    });
  });

  return {
    unmappedRequirements,
    emptyControls,
    lowCoverageFrameworks,
    requirementsByType,
    overallCoverage,
    criticalGaps,
  };
}

export function getGapSeverityColor(severity: "critical" | "high" | "medium" | "low"): string {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-300";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-300";
  }
}

export function getGapTypeLabel(
  type: "unmapped_requirement" | "empty_control" | "low_coverage_framework"
): string {
  switch (type) {
    case "unmapped_requirement":
      return "Unmapped Requirement";
    case "empty_control":
      return "Empty Control";
    case "low_coverage_framework":
      return "Low Coverage Framework";
  }
}
