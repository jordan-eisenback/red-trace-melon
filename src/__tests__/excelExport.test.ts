/**
 * Unit tests for excelExport.ts (closes part of #42)
 *
 * ExcelJS does real file I/O via workbook.xlsx.writeFile(), so we mock the
 * entire module. Tests focus on the data-mapping logic — ensuring the correct
 * rows, columns, and sheet names are passed to ExcelJS, and that edge-cases
 * like empty arrays or missing optional fields are handled gracefully.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Requirement } from '../app/types/requirement';
import type { Framework } from '../app/types/framework';
import type { Epic, UserStory } from '../app/types/epic';

// ── ExcelJS mock ─────────────────────────────────────────────────────────────

// Capture every addWorksheet / addRows call so assertions can inspect them.
const sheets: Record<string, { columns: { header: string; key: string }[]; rows: unknown[] }> = {};
const mockWriteFile = vi.fn().mockResolvedValue(undefined);

vi.mock('exceljs', () => {
  class MockWorkbook {
    addWorksheet(name: string) {
      sheets[name] = { columns: [], rows: [] };
      return {
        set columns(cols: { header: string; key: string }[]) {
          sheets[name].columns = cols;
        },
        addRows(rows: unknown[]) {
          sheets[name].rows.push(...rows);
        },
      };
    }
    xlsx = { writeFile: mockWriteFile };
  }
  return { default: { Workbook: MockWorkbook } };
});

// ── helpers ───────────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: 'req-1',
    req: 'Test requirement',
    type: 'Enterprise',
    owner: 'Alice',
    parent: null,
    outcome: 'Outcome',
    notes: 'Some note',
    ...overrides,
  };
}

function makeFramework(overrides: Partial<Framework> = {}): Framework {
  return {
    id: 'fw-1',
    name: 'NIST',
    version: '1.0',
    description: '',
    category: 'Compliance',
    controls: [],
    isActive: true,
    ...overrides,
  };
}

function makeEpic(overrides: Partial<Epic> = {}): Epic {
  return {
    id: 'epic-1',
    title: 'Auth Epic',
    description: 'Desc',
    requirements: [],
    owner: 'Bob',
    status: 'Backlog',
    priority: 'High',
    ...overrides,
  };
}

function makeStory(overrides: Partial<UserStory> = {}): UserStory {
  return {
    id: 'story-1',
    epicId: 'epic-1',
    title: 'Login story',
    description: 'As a user...',
    acceptanceCriteria: ['AC1', 'AC2'],
    requirements: [],
    priority: 'Medium',
    status: 'Backlog',
    ...overrides,
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset the captured sheets between tests
  Object.keys(sheets).forEach((k) => delete sheets[k]);
  mockWriteFile.mockClear();
});

describe('exportToExcel', () => {
  it('returns a filename that includes today\'s date', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const filename = await exportToExcel({ requirements: [], frameworks: [], epics: [], userStories: [] });
    const today = new Date().toISOString().split('T')[0];
    expect(filename).toContain(today);
    expect(filename).toMatch(/\.xlsx$/);
  });

  it('creates all 8 expected worksheet tabs', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    await exportToExcel({ requirements: [], frameworks: [], epics: [], userStories: [] });
    const names = Object.keys(sheets);
    expect(names).toContain('Requirements');
    expect(names).toContain('Dependencies');
    expect(names).toContain('Framework Mappings');
    expect(names).toContain('Controls');
    expect(names).toContain('Epics');
    expect(names).toContain('User Stories');
    expect(names).toContain('Summary');
    expect(names).toContain('Traceability Matrix');
  });

  it('writes one row per requirement to the Requirements sheet', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    await exportToExcel({
      requirements: [makeReq({ id: 'r1' }), makeReq({ id: 'r2' })],
      frameworks: [],
      epics: [],
      userStories: [],
    });
    expect(sheets['Requirements'].rows).toHaveLength(2);
  });

  it('maps requirement fields — ID, Description, Owner, Priority, Status — correctly', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const req = makeReq({ id: 'r-mapped', req: 'Must have SSO', owner: 'Eve', priority: 'Must', status: 'Validated' });
    await exportToExcel({ requirements: [req], frameworks: [], epics: [], userStories: [] });
    const row = sheets['Requirements'].rows[0] as Record<string, unknown>;
    expect(row['ID']).toBe('r-mapped');
    expect(row['Description']).toBe('Must have SSO');
    expect(row['Owner']).toBe('Eve');
    expect(row['Priority']).toBe('Must');
    expect(row['Status']).toBe('Validated');
  });

  it('maps optional fields to empty string when absent', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const req = makeReq({ notes: undefined, priority: undefined, status: undefined, parent: null });
    await exportToExcel({ requirements: [req], frameworks: [], epics: [], userStories: [] });
    const row = sheets['Requirements'].rows[0] as Record<string, unknown>;
    expect(row['Notes']).toBe('');
    expect(row['Priority']).toBe('');
    expect(row['Status']).toBe('');
    expect(row['Parent']).toBe('');
  });

  it('populates Dependencies sheet only for requirements that have a parent', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const parent = makeReq({ id: 'parent-1', parent: null });
    const child = makeReq({ id: 'child-1', parent: 'parent-1' });
    const orphan = makeReq({ id: 'orphan-1', parent: null });
    await exportToExcel({ requirements: [parent, child, orphan], frameworks: [], epics: [], userStories: [] });
    expect(sheets['Dependencies'].rows).toHaveLength(1);
    const row = sheets['Dependencies'].rows[0] as Record<string, unknown>;
    expect(row['Requirement ID']).toBe('child-1');
    expect(row['Parent ID']).toBe('parent-1');
  });

  it('produces "Not Found" for parent description when parent is missing from requirements list', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const child = makeReq({ id: 'orphan', parent: 'ghost-parent' });
    await exportToExcel({ requirements: [child], frameworks: [], epics: [], userStories: [] });
    const row = sheets['Dependencies'].rows[0] as Record<string, unknown>;
    expect(row['Parent Description']).toBe('Not Found');
  });

  it('writes Framework Mappings rows for each (control, requirement) pair', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const req = makeReq({ id: 'req-fw' });
    const fw = makeFramework({
      name: 'SOC 2',
      controls: [
        { id: 'ctrl-1', frameworkId: 'fw-1', controlId: 'CC1', title: 'C1', description: 'Ctrl 1', requirements: ['req-fw'] },
      ],
    });
    await exportToExcel({ requirements: [req], frameworks: [fw], epics: [], userStories: [] });
    expect(sheets['Framework Mappings'].rows).toHaveLength(1);
    const row = sheets['Framework Mappings'].rows[0] as Record<string, unknown>;
    expect(row['Framework']).toBe('SOC 2');
    expect(row['Requirement ID']).toBe('req-fw');
  });

  it('writes one row per control to the Controls sheet', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const fw = makeFramework({
      controls: [
        { id: 'c1', frameworkId: 'fw-1', controlId: 'AC-1', title: '', description: 'D1', requirements: [] },
        { id: 'c2', frameworkId: 'fw-1', controlId: 'AC-2', title: '', description: 'D2', requirements: ['req-1'] },
      ],
    });
    await exportToExcel({ requirements: [], frameworks: [fw], epics: [], userStories: [] });
    expect(sheets['Controls'].rows).toHaveLength(2);
  });

  it('concatenates acceptance criteria with "; " in User Stories sheet', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const story = makeStory({ acceptanceCriteria: ['AC1', 'AC2', 'AC3'] });
    await exportToExcel({ requirements: [], frameworks: [], epics: [makeEpic()], userStories: [story] });
    const row = sheets['User Stories'].rows[0] as Record<string, unknown>;
    expect(row['Acceptance Criteria']).toBe('AC1; AC2; AC3');
  });

  it('resolves Epic Title for a user story', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const epic = makeEpic({ id: 'epic-x', title: 'My Epic' });
    const story = makeStory({ epicId: 'epic-x' });
    await exportToExcel({ requirements: [], frameworks: [], epics: [epic], userStories: [story] });
    const row = sheets['User Stories'].rows[0] as Record<string, unknown>;
    expect(row['Epic Title']).toBe('My Epic');
  });

  it('Summary sheet includes Total Requirements and Total Frameworks rows', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    await exportToExcel({
      requirements: [makeReq({ id: 'r1' }), makeReq({ id: 'r2' })],
      frameworks: [makeFramework()],
      epics: [],
      userStories: [],
    });
    const summaryRows = sheets['Summary'].rows as Array<Record<string, unknown>>;
    const totalReqs = summaryRows.find((r) => r['Metric'] === 'Total Requirements');
    const totalFws = summaryRows.find((r) => r['Metric'] === 'Total Frameworks');
    expect(totalReqs?.['Value']).toBe(2);
    expect(totalFws?.['Value']).toBe(1);
  });

  it('Traceability Matrix has one row per requirement', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    const reqs = [makeReq({ id: 'r1' }), makeReq({ id: 'r2' }), makeReq({ id: 'r3' })];
    await exportToExcel({ requirements: reqs, frameworks: [], epics: [], userStories: [] });
    expect(sheets['Traceability Matrix'].rows).toHaveLength(3);
  });

  it('calls workbook.xlsx.writeFile exactly once per export', async () => {
    const { exportToExcel } = await import('../app/utils/excelExport');
    await exportToExcel({ requirements: [], frameworks: [], epics: [], userStories: [] });
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });
});
