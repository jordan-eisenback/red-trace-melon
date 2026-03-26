/**
 * Vendor selection types — adapted from velocity-snake for use inside red-trace-melon.
 *
 * Key addition vs. the original: `SubCriterion.linkedRequirementIds`
 * This is the bridge field that connects a vendor evaluation criterion to one or
 * more `Requirement.id` values in the RTM, enabling bidirectional traceability.
 */

// ---------------------------------------------------------------------------
// Scoring scale
// ---------------------------------------------------------------------------

export type ScoringScale = "1-5" | "1-10" | "0-3" | "custom";

export interface CustomScaleOption {
  value: number;
  label: string;
}

export interface ScaleConfig {
  type: ScoringScale;
  customOptions?: CustomScaleOption[];
  /** Explicit override for min — used with 'custom' scales */
  min?: number;
  /** Explicit override for max — used with 'custom' scales */
  max?: number;
}

export interface RubricLevel {
  score: number;
  label: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Vendor & Evaluator
// ---------------------------------------------------------------------------

export interface Vendor {
  id: string;
  name: string;
  /** 'existing' = incumbent vendor being compared; 'replacement' = candidate */
  type: "existing" | "replacement";
  createdAt: string;
}

export interface Evaluator {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Criteria hierarchy
// ---------------------------------------------------------------------------

export interface SubCriterion {
  id: string;
  name: string;
  description?: string;
  rubric?: RubricLevel[];
  /**
   * RTM bridge field.
   * IDs of `Requirement` objects (from RequirementsContext) that this
   * sub-criterion evaluates.  Maintained via VendorContext link/unlink API.
   */
  linkedRequirementIds?: string[];
}

export interface Criterion {
  id: string;
  /** Display category name, e.g. "1: Core Identity Governance" */
  category: string;
  subCriteria: SubCriterion[];
}

export interface CriteriaProfile {
  id: string;
  name: string;
  description?: string;
  criteria: Criterion[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Weighting
// ---------------------------------------------------------------------------

export interface Weight {
  criterionId: string;
  /** Omit for category-level weights when scoringMode === 'category' */
  subCriterionId?: string;
  weight: number;
}

export interface WeightingProfile {
  id: string;
  name: string;
  description?: string;
  scaleConfig: ScaleConfig;
  /** 'sub-criteria' scores each leaf; 'category' scores the whole category */
  scoringMode: "category" | "sub-criteria";
  weights: Weight[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

export interface Score {
  id: string;
  evaluatorId: string;
  vendorId: string;
  criterionId: string;
  subCriterionId: string;
  score: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Root app-data shape (single localStorage key)
// ---------------------------------------------------------------------------

export interface VendorAppData {
  vendors: Vendor[];
  evaluators: Evaluator[];
  criteriaProfiles: CriteriaProfile[];
  activeCriteriaProfileId: string | null;
  weightingProfiles: WeightingProfile[];
  activeProfileId: string | null;
  scores: Score[];
}

// ---------------------------------------------------------------------------
// Computed / dashboard types
// ---------------------------------------------------------------------------

export interface CompletionStatus {
  evaluatorId: string;
  vendorId: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface AggregatedScore {
  vendorId: string;
  categoryScores: {
    category: string;
    weightedScore: number;
    maxScore: number;
  }[];
  totalWeightedScore: number;
  totalMaxScore: number;
  /** 0–100 normalised percentage */
  normalizedScore: number;
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Returns the numeric min/max for a given scale config.
 */
export function getScaleRange(scaleConfig: ScaleConfig): { min: number; max: number } {
  if (scaleConfig.min !== undefined && scaleConfig.max !== undefined) {
    return { min: scaleConfig.min, max: scaleConfig.max };
  }
  switch (scaleConfig.type) {
    case "1-5":
      return { min: 1, max: 5 };
    case "1-10":
      return { min: 1, max: 10 };
    case "0-3":
      return { min: 0, max: 3 };
    case "custom": {
      if (scaleConfig.customOptions && scaleConfig.customOptions.length > 0) {
        const values = scaleConfig.customOptions.map((o) => o.value);
        return { min: Math.min(...values), max: Math.max(...values) };
      }
      return { min: 1, max: 5 };
    }
    default:
      return { min: 1, max: 5 };
  }
}

/**
 * Generates a sensible default rubric for a given scale config.
 */
export function getDefaultRubric(scaleConfig: ScaleConfig): RubricLevel[] {
  if (scaleConfig.type === "1-5") {
    return [
      { score: 1, label: "Poor", description: "Does not meet requirements or has significant gaps" },
      { score: 2, label: "Below Average", description: "Meets some requirements but has notable limitations" },
      { score: 3, label: "Average", description: "Meets basic requirements with standard capabilities" },
      { score: 4, label: "Good", description: "Exceeds requirements with strong capabilities" },
      { score: 5, label: "Excellent", description: "Significantly exceeds requirements with exceptional capabilities" },
    ];
  }

  if (scaleConfig.type === "1-10") {
    return [
      { score: 1, label: "Very Poor", description: "Completely inadequate" },
      { score: 2, label: "Poor", description: "Major deficiencies" },
      { score: 3, label: "Below Average", description: "Significant gaps" },
      { score: 4, label: "Below Average", description: "Notable limitations" },
      { score: 5, label: "Average", description: "Meets minimum requirements" },
      { score: 6, label: "Above Average", description: "Meets requirements adequately" },
      { score: 7, label: "Good", description: "Solid capabilities" },
      { score: 8, label: "Very Good", description: "Strong capabilities" },
      { score: 9, label: "Excellent", description: "Exceptional capabilities" },
      { score: 10, label: "Outstanding", description: "Best-in-class capabilities" },
    ];
  }

  if (scaleConfig.type === "0-3") {
    return [
      { score: 0, label: "Not Supported", description: "Feature/capability not available" },
      { score: 1, label: "Limited", description: "Basic support with significant limitations" },
      { score: 2, label: "Supported", description: "Good support with standard capabilities" },
      { score: 3, label: "Fully Supported", description: "Comprehensive support with advanced capabilities" },
    ];
  }

  // Generic fallback for custom scales
  const { min, max } = getScaleRange(scaleConfig);
  const range = max - min;
  const rubric: RubricLevel[] = [];

  for (let i = min; i <= max; i++) {
    const pct = range > 0 ? ((i - min) / range) * 100 : 50;
    const label =
      pct <= 20 ? "Poor" :
      pct <= 40 ? "Below Average" :
      pct <= 60 ? "Average" :
      pct <= 80 ? "Good" :
      "Excellent";
    rubric.push({ score: i, label, description: `Score level ${i}` });
  }

  return rubric;
}
