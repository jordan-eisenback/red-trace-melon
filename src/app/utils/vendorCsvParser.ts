/**
 * CSV parser utility for vendor evaluation criteria profiles.
 * Ported from velocity-snake with adaptations for red-trace-melon:
 *  - Imports updated to use local vendor types
 *  - CSV bundled at src/app/data/identity-governance-comparison.csv
 *  - validateCSV return shape uses `success` (matches RTM convention)
 */

import { Criterion, Weight } from "../types/vendor";
import csvData from "../data/identity-governance-comparison.csv?raw";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface CSVValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCSV(csvContent: string): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    errors.push("File is empty");
    return { success: false, errors, warnings };
  }

  // Auto-detect delimiter: prefer tab, fall back to comma
  const firstLine = lines[0];
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  const header = firstLine.split(delimiter);
  if (header.length < 2) {
    errors.push(
      "File must have at least 2 columns separated by tabs or commas. " +
      "Expected columns: Category, Sub-Criterion. " +
      "Export an existing profile to see the required format."
    );
    return { success: false, errors, warnings };
  }

  if (!header[0].toLowerCase().includes("categ")) {
    warnings.push('First column header should be "Category" or similar');
  }
  if (!header[1].toLowerCase().includes("crit") && !header[1].toLowerCase().includes("sub")) {
    warnings.push('Second column header should contain "Sub-Criterion" or similar');
  }

  const dataLines = lines.slice(1);
  if (dataLines.length === 0) {
    errors.push("File has no data rows");
    return { success: false, errors, warnings };
  }

  const categoriesFound = new Set<string>();
  let rowsWithIssues = 0;

  dataLines.forEach((line) => {
    const parts = line.split(delimiter);
    if (parts.length < 2) {
      rowsWithIssues++;
      return;
    }

    const firstPart = parts[0] ?? "";
    const match = firstPart.match(/^(\d+):\s*(.+)$/);
    if (match) {
      categoriesFound.add(match[2].trim());
    } else if (firstPart.trim()) {
      categoriesFound.add(firstPart.trim());
    } else {
      rowsWithIssues++;
    }

    if (!(parts[1] ?? "").trim()) {
      rowsWithIssues++;
    }
  });

  if (categoriesFound.size === 0) {
    errors.push("No valid categories found in file");
  }
  if (rowsWithIssues > 0) {
    warnings.push(
      `${rowsWithIssues} row(s) had missing or incomplete data and will be skipped`
    );
  }

  return { success: errors.length === 0, errors, warnings };
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse criteria from arbitrary tab-separated CSV content.
 * Supports both "1: Category Name" and plain "Category Name" in column 1.
 */
export function parseCriteriaFromCSVContent(csvContent: string): Criterion[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
  const dataLines = lines.slice(1); // skip header

  // Auto-detect delimiter matching validateCSV
  const delimiter = lines[0]?.includes("\t") ? "\t" : ",";

  // Unique prefix so IDs don't collide when multiple profiles share category names
  const profilePrefix = `p${Date.now().toString(36)}`;

  const criteriaMap = new Map<string, Criterion>();

  dataLines.forEach((line) => {
    const parts = line.split(delimiter);
    if (parts.length < 2) return;

    const firstPart = parts[0] ?? "";
    const match = firstPart.match(/^(\d+):\s*(.+)$/);
    const category = match ? match[2].trim() : firstPart.trim();
    const subCriterionName = (parts[1] ?? "").trim();

    if (!category || !subCriterionName) return;

    if (!criteriaMap.has(category)) {
      criteriaMap.set(category, {
        id: `cat-${profilePrefix}-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        category,
        subCriteria: [],
      });
    }

    const criterion = criteriaMap.get(category)!;
    const subCriterionId = `sub-${profilePrefix}-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${subCriterionName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    criterion.subCriteria.push({
      id: subCriterionId,
      name: subCriterionName,
      description: "",
      linkedRequirementIds: [],
    });
  });

  return Array.from(criteriaMap.values());
}

/**
 * Parse criteria from the bundled identity-governance-comparison.csv.
 */
export function parseCriteriaFromCSV(): Criterion[] {
  return parseCriteriaFromCSVContent(csvData);
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Serialize a criteria array back to tab-separated CSV format.
 */
export function exportCriteriaToCSV(criteria: Criterion[]): string {
  let csv = "Category\tSub-Criterion\n";

  criteria.forEach((criterion, idx) => {
    criterion.subCriteria.forEach((sub) => {
      csv += `${idx + 1}: ${criterion.category}\t${sub.name}\n`;
    });
  });

  return csv;
}

// ---------------------------------------------------------------------------
// Weights helpers
// ---------------------------------------------------------------------------

/**
 * Generate equal default weights for every criterion / sub-criterion.
 */
export function getDefaultWeights(
  criteria: Criterion[],
  scoringMode: "category" | "sub-criteria" = "sub-criteria"
): Weight[] {
  const weights: Weight[] = [];

  if (scoringMode === "category") {
    criteria.forEach((c) => {
      weights.push({ criterionId: c.id, weight: 1 });
    });
  } else {
    criteria.forEach((c) => {
      c.subCriteria.forEach((sub) => {
        weights.push({ criterionId: c.id, subCriterionId: sub.id, weight: 1 });
      });
    });
  }

  return weights;
}
