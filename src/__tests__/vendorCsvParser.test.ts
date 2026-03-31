import { describe, it, expect, vi } from 'vitest';
import {
  validateCSV,
  parseCriteriaFromCSVContent,
  exportCriteriaToCSV,
  getDefaultWeights,
} from '../app/utils/vendorCsvParser';
import type { Criterion } from '../app/types/vendor';

// Mock the bundled CSV so parseCriteriaFromCSV (which uses the ?raw import)
// can be tested without the Vite asset pipeline.
vi.mock('../app/data/identity-governance-comparison.csv?raw', () => ({
  default: 'Category\tSub-Criterion\n1: Core Identity Governance\tUser Lifecycle Automation\n1: Core Identity Governance\tAccess Requests\n2: Hybrid Architecture\tArchitecture Model\n',
}));

// ─── validateCSV ─────────────────────────────────────────────────────────────

describe('validateCSV', () => {
  it('returns an error for empty content', () => {
    const result = validateCSV('');
    expect(result.success).toBe(false);
    expect(result.errors).toContain('File is empty');
  });

  it('returns an error for whitespace-only content', () => {
    const result = validateCSV('   \n  \n  ');
    expect(result.success).toBe(false);
  });

  it('returns an error when file has fewer than 2 columns', () => {
    const result = validateCSV('OnlyOneColumn\nValue1\nValue2');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/at least 2 columns/i);
  });

  it('returns an error when there are no data rows (header only)', () => {
    const result = validateCSV('Category\tSub-Criterion');
    expect(result.success).toBe(false);
    expect(result.errors).toContain('File has no data rows');
  });

  it('succeeds for valid tab-separated CSV', () => {
    const csv =
      'Category\tSub-Criterion\n' +
      '1: Core Identity Governance\tUser Lifecycle Automation\n' +
      '2: Hybrid Architecture\tArchitecture Model\n';
    const result = validateCSV(csv);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('succeeds for valid comma-separated CSV', () => {
    const csv =
      'Category,Sub-Criterion\n' +
      'Core Identity,User Lifecycle\n' +
      'Architecture,Hybrid Model\n';
    const result = validateCSV(csv);
    expect(result.success).toBe(true);
  });

  it('adds a warning when first column header does not contain "categ"', () => {
    const csv = 'Type\tSub-Criterion\nCore Identity\tUser Lifecycle\n';
    const result = validateCSV(csv);
    expect(result.warnings.some(w => w.toLowerCase().includes('category'))).toBe(true);
  });

  it('adds a warning when second column header is not "Sub-Criterion"-like', () => {
    const csv = 'Category\tValue\nCore Identity\tUser Lifecycle\n';
    const result = validateCSV(csv);
    expect(result.warnings.some(w => w.toLowerCase().includes('sub-criterion'))).toBe(true);
  });

  it('counts rows with missing or incomplete data as warnings', () => {
    const csv =
      'Category\tSub-Criterion\n' +
      'Core Identity\tUser Lifecycle\n' +
      '\tMissing Category\n' +   // no category
      'Category Only\t\n';       // no sub-criterion
    const result = validateCSV(csv);
    expect(result.warnings.some(w => w.includes('row(s)'))).toBe(true);
  });

  it('returns an error when no valid categories are found', () => {
    // Rows with a non-empty line but empty first column — passes the line filter
    // but produces no valid categories
    const csv = 'Category\tSub-Criterion\n\tSub One\n\tSub Two\n';
    const result = validateCSV(csv);
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.toLowerCase().includes('no valid categories'))).toBe(true);
  });

  it('auto-detects tab delimiter when tabs are present', () => {
    // If tab is present in first line, should use tab as delimiter
    const csv = 'Category\tSub-Criterion\n1: Core IG\tUser Lifecycle\n';
    const result = validateCSV(csv);
    expect(result.success).toBe(true);
  });
});

// ─── parseCriteriaFromCSVContent ─────────────────────────────────────────────

describe('parseCriteriaFromCSVContent', () => {
  it('returns an empty array for empty content', () => {
    const result = parseCriteriaFromCSVContent('');
    expect(result).toHaveLength(0);
  });

  it('returns an empty array for a header-only CSV', () => {
    const result = parseCriteriaFromCSVContent('Category\tSub-Criterion');
    expect(result).toHaveLength(0);
  });

  it('parses tab-separated CSV into criteria with subCriteria', () => {
    const csv =
      'Category\tSub-Criterion\n' +
      '1: Core Identity Governance\tUser Lifecycle Automation\n' +
      '1: Core Identity Governance\tAccess Request\n' +
      '2: Hybrid Architecture\tArchitecture Model\n';
    const result = parseCriteriaFromCSVContent(csv);
    expect(result).toHaveLength(2);
    const core = result.find(c => c.category === 'Core Identity Governance');
    expect(core).toBeDefined();
    expect(core?.subCriteria).toHaveLength(2);
    expect(core?.subCriteria[0].name).toBe('User Lifecycle Automation');
    expect(core?.subCriteria[1].name).toBe('Access Request');
  });

  it('parses comma-separated CSV', () => {
    const csv = 'Category,Sub-Criterion\nCore Identity,User Lifecycle\n';
    const result = parseCriteriaFromCSVContent(csv);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Core Identity');
    expect(result[0].subCriteria[0].name).toBe('User Lifecycle');
  });

  it('handles numbered category format "N: Category Name"', () => {
    const csv =
      'Category\tSub-Criterion\n' +
      '3: Security Controls\tMFA Support\n';
    const result = parseCriteriaFromCSVContent(csv);
    expect(result[0].category).toBe('Security Controls');
  });

  it('assigns unique IDs to criteria and subCriteria', () => {
    const csv =
      'Category\tSub-Criterion\n' +
      'Core Identity\tLifecycle\n' +
      'Architecture\tHybrid\n';
    const result = parseCriteriaFromCSVContent(csv);
    const allIds = [
      ...result.map(c => c.id),
      ...result.flatMap(c => c.subCriteria.map(s => s.id)),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('initializes subCriteria with empty linkedRequirementIds', () => {
    const csv = 'Category\tSub-Criterion\nCore Identity\tLifecycle\n';
    const result = parseCriteriaFromCSVContent(csv);
    expect(result[0].subCriteria[0].linkedRequirementIds).toEqual([]);
  });

  it('skips rows with missing category or subCriterion', () => {
    const csv =
      'Category\tSub-Criterion\n' +
      '\tMissing Category\n' +
      'Core Identity\tLifecycle\n' +
      'Core Identity\t\n';
    const result = parseCriteriaFromCSVContent(csv);
    // Only "Core Identity / Lifecycle" should be parsed
    expect(result).toHaveLength(1);
    expect(result[0].subCriteria).toHaveLength(1);
  });
});

// ─── exportCriteriaToCSV ─────────────────────────────────────────────────────

describe('exportCriteriaToCSV', () => {
  it('exports an empty criteria array to just the header row', () => {
    const result = exportCriteriaToCSV([]);
    expect(result.trim()).toBe('Category\tSub-Criterion');
  });

  it('exports each subCriterion as a separate row', () => {
    const criteria: Criterion[] = [
      {
        id: 'cat-1',
        category: 'Core Identity Governance',
        subCriteria: [
          { id: 'sub-1', name: 'User Lifecycle Automation', description: '', linkedRequirementIds: [] },
          { id: 'sub-2', name: 'Access Request', description: '', linkedRequirementIds: [] },
        ],
      },
    ];
    const result = exportCriteriaToCSV(criteria);
    const lines = result.trim().split('\n');
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[1]).toBe('1: Core Identity Governance\tUser Lifecycle Automation');
    expect(lines[2]).toBe('1: Core Identity Governance\tAccess Request');
  });

  it('uses 1-based index for category numbering', () => {
    const criteria: Criterion[] = [
      {
        id: 'cat-1',
        category: 'First Category',
        subCriteria: [{ id: 'sub-1', name: 'Sub A', description: '', linkedRequirementIds: [] }],
      },
      {
        id: 'cat-2',
        category: 'Second Category',
        subCriteria: [{ id: 'sub-2', name: 'Sub B', description: '', linkedRequirementIds: [] }],
      },
    ];
    const result = exportCriteriaToCSV(criteria);
    expect(result).toContain('1: First Category');
    expect(result).toContain('2: Second Category');
  });

  it('round-trips through parseCriteriaFromCSVContent', () => {
    const original: Criterion[] = [
      {
        id: 'cat-1',
        category: 'Core Identity',
        subCriteria: [
          { id: 'sub-1', name: 'Lifecycle', description: '', linkedRequirementIds: [] },
          { id: 'sub-2', name: 'Provisioning', description: '', linkedRequirementIds: [] },
        ],
      },
      {
        id: 'cat-2',
        category: 'Architecture',
        subCriteria: [
          { id: 'sub-3', name: 'Hybrid Model', description: '', linkedRequirementIds: [] },
        ],
      },
    ];
    const csv = exportCriteriaToCSV(original);
    const reparsed = parseCriteriaFromCSVContent(csv);
    expect(reparsed).toHaveLength(2);
    const core = reparsed.find(c => c.category === 'Core Identity');
    expect(core?.subCriteria.map(s => s.name)).toEqual(['Lifecycle', 'Provisioning']);
    const arch = reparsed.find(c => c.category === 'Architecture');
    expect(arch?.subCriteria[0].name).toBe('Hybrid Model');
  });
});

// ─── getDefaultWeights ────────────────────────────────────────────────────────

describe('getDefaultWeights', () => {
  const criteria: Criterion[] = [
    {
      id: 'cat-1',
      category: 'Category A',
      subCriteria: [
        { id: 'sub-1', name: 'Sub 1', description: '', linkedRequirementIds: [] },
        { id: 'sub-2', name: 'Sub 2', description: '', linkedRequirementIds: [] },
      ],
    },
    {
      id: 'cat-2',
      category: 'Category B',
      subCriteria: [
        { id: 'sub-3', name: 'Sub 3', description: '', linkedRequirementIds: [] },
      ],
    },
  ];

  it('returns one weight per criterion in category mode', () => {
    const weights = getDefaultWeights(criteria, 'category');
    expect(weights).toHaveLength(2);
    expect(weights.every(w => w.criterionId)).toBe(true);
    expect(weights.every(w => w.subCriterionId === undefined)).toBe(true);
  });

  it('returns one weight per subCriterion in sub-criteria mode (default)', () => {
    const weights = getDefaultWeights(criteria, 'sub-criteria');
    expect(weights).toHaveLength(3);
  });

  it('defaults to sub-criteria mode when mode is not specified', () => {
    const weights = getDefaultWeights(criteria);
    expect(weights).toHaveLength(3);
  });

  it('sets all default weights to 1', () => {
    const weights = getDefaultWeights(criteria, 'sub-criteria');
    expect(weights.every(w => w.weight === 1)).toBe(true);
  });

  it('includes subCriterionId in sub-criteria mode', () => {
    const weights = getDefaultWeights(criteria, 'sub-criteria');
    expect(weights.every(w => w.subCriterionId !== undefined)).toBe(true);
  });

  it('returns an empty array for empty criteria', () => {
    const weights = getDefaultWeights([]);
    expect(weights).toHaveLength(0);
  });
});
