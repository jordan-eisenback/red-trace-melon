/**
 * Unit tests for importValidator (closes part of #48)
 *
 * Tests:
 *  - validateRequirements: passes valid, skips invalid with errors
 *  - validateFrameworks:   passes valid, skips invalid with errors
 *  - validateEpics:        passes valid, skips invalid with errors
 *  - validateUserStories:  passes valid, skips malformed with errors
 *  - validateRestorePayload: aggregates results, allValid flag
 *  - Edge cases: non-array input, empty arrays, mixed valid/invalid
 */
import { describe, it, expect } from 'vitest';
import {
  validateRequirements,
  validateFrameworks,
  validateEpics,
  validateUserStories,
  validateRestorePayload,
} from '../app/utils/importValidator';
import type { Requirement } from '../app/types/requirement';
import type { Framework, Control } from '../app/types/framework';
import type { Epic, UserStory } from '../app/types/epic';

// ── helpers ────────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: 'REQ-001', req: 'The system shall …', type: 'Enterprise',
    owner: 'Test Team', parent: null, outcome: 'Outcome', notes: '',
    ...overrides,
  };
}

function makeControl(overrides: Partial<Control> = {}): Control {
  return {
    id: 'ctrl-1', frameworkId: 'fw-1', controlId: 'AC-1',
    title: 'Access Control', description: 'Controls access', requirements: [],
    ...overrides,
  };
}

function makeFramework(overrides: Partial<Framework> = {}): Framework {
  return {
    id: 'fw-1', name: 'NIST', version: 'Rev 5',
    description: 'Security controls', category: 'Compliance',
    isActive: true, controls: [makeControl()],
    ...overrides,
  };
}

function makeEpic(overrides: Partial<Epic> = {}): Epic {
  return {
    id: 'epic-1', title: 'Auth Epic', description: 'Auth work',
    requirements: [], owner: 'Team', status: 'Backlog', priority: 'High',
    ...overrides,
  };
}

function makeStory(overrides: Partial<UserStory> = {}): UserStory {
  return {
    id: 'story-1', epicId: 'epic-1', title: 'As a user…',
    description: 'Story desc', acceptanceCriteria: [], requirements: [],
    priority: 'High', status: 'Backlog',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// validateRequirements
// ═══════════════════════════════════════════════════════════════════════════

describe('validateRequirements', () => {
  it('returns valid item and no errors for a correct requirement', () => {
    const result = validateRequirements([makeReq()]);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('returns an error and no valid items when required field is missing', () => {
    const { id: _id, ...withoutId } = makeReq();
    const result = validateRequirements([withoutId]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/id/i);
  });

  it('rejects a requirement with an invalid type enum value', () => {
    const result = validateRequirements([makeReq({ type: 'Bogus' as never })]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]).toMatch(/type/i);
  });

  it('accepts optional fields when present with valid values', () => {
    const result = validateRequirements([
      makeReq({ status: 'Validated', priority: 'Must' }),
    ]);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid status enum', () => {
    const result = validateRequirements([makeReq({ status: 'Pending' as never })]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('handles mixed valid and invalid items — returns only valid ones', () => {
    const bad = { ...makeReq(), type: 'INVALID' as never };
    const result = validateRequirements([makeReq({ id: 'REQ-002' }), bad, makeReq({ id: 'REQ-003' })]);
    expect(result.valid).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
  });

  it('returns an error (not throw) when given a non-array', () => {
    const result = validateRequirements({ id: 'REQ-001' });
    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]).toMatch(/array/i);
  });

  it('returns empty valid and no errors for an empty array', () => {
    const result = validateRequirements([]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validateFrameworks
// ═══════════════════════════════════════════════════════════════════════════

describe('validateFrameworks', () => {
  it('returns valid item for a correct framework', () => {
    const result = validateFrameworks([makeFramework()]);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a framework missing required name field', () => {
    const { name: _n, ...withoutName } = makeFramework();
    const result = validateFrameworks([withoutName]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]).toMatch(/name/i);
  });

  it('rejects an invalid category enum', () => {
    const result = validateFrameworks([makeFramework({ category: 'Invalid' as never })]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validates nested controls — rejects control missing controlId', () => {
    const badControl = { ...makeControl(), controlId: undefined } as unknown as Control;
    const result = validateFrameworks([makeFramework({ controls: [badControl] })]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validateEpics
// ═══════════════════════════════════════════════════════════════════════════

describe('validateEpics', () => {
  it('returns valid item for a correct epic', () => {
    const result = validateEpics([makeEpic()]);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects an epic with an invalid status enum', () => {
    const result = validateEpics([makeEpic({ status: 'Unknown' as never })]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects an epic missing title', () => {
    const { title: _t, ...withoutTitle } = makeEpic();
    const result = validateEpics([withoutTitle]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]).toMatch(/title/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validateUserStories
// ═══════════════════════════════════════════════════════════════════════════

describe('validateUserStories', () => {
  it('returns valid item for a correct user story', () => {
    const result = validateUserStories([makeStory()]);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a story missing epicId', () => {
    const { epicId: _e, ...withoutEpicId } = makeStory();
    const result = validateUserStories([withoutEpicId]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]).toMatch(/epicId/i);
  });

  it('returns error for non-array input', () => {
    const result = validateUserStories(null);
    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]).toMatch(/array/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validateRestorePayload
// ═══════════════════════════════════════════════════════════════════════════

describe('validateRestorePayload', () => {
  it('allValid is true when all collections pass', () => {
    const result = validateRestorePayload({
      requirements: [makeReq()],
      frameworks:   [makeFramework()],
      epics:        [makeEpic()],
      userStories:  [makeStory()],
    });
    expect(result.allValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.requirements).toHaveLength(1);
    expect(result.frameworks).toHaveLength(1);
    expect(result.epics).toHaveLength(1);
    expect(result.userStories).toHaveLength(1);
  });

  it('allValid is false and errors are aggregated when any item fails', () => {
    const result = validateRestorePayload({
      requirements: [{ ...makeReq(), type: 'Bad' as never }],
      frameworks:   [makeFramework()],
      epics:        [makeEpic()],
      userStories:  [makeStory()],
    });
    expect(result.allValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // Valid items in other collections still come through
    expect(result.frameworks).toHaveLength(1);
    expect(result.epics).toHaveLength(1);
  });

  it('handles missing collections (undefined) gracefully', () => {
    const result = validateRestorePayload({});
    expect(result.allValid).toBe(true);
    expect(result.requirements).toHaveLength(0);
    expect(result.frameworks).toHaveLength(0);
    expect(result.epics).toHaveLength(0);
    expect(result.userStories).toHaveLength(0);
  });
});
