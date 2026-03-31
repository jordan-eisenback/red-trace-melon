import { describe, it, expect } from 'vitest';
import { getScaleRange, getDefaultRubric } from '../app/types/vendor';
import type { ScaleConfig } from '../app/types/vendor';

// ─── getScaleRange ────────────────────────────────────────────────────────────

describe('getScaleRange', () => {
  it('returns { min: 1, max: 5 } for "1-5" scale', () => {
    const config: ScaleConfig = { type: '1-5' };
    expect(getScaleRange(config)).toEqual({ min: 1, max: 5 });
  });

  it('returns { min: 1, max: 10 } for "1-10" scale', () => {
    const config: ScaleConfig = { type: '1-10' };
    expect(getScaleRange(config)).toEqual({ min: 1, max: 10 });
  });

  it('returns { min: 0, max: 3 } for "0-3" scale', () => {
    const config: ScaleConfig = { type: '0-3' };
    expect(getScaleRange(config)).toEqual({ min: 0, max: 3 });
  });

  it('derives min/max from customOptions for "custom" scale', () => {
    const config: ScaleConfig = {
      type: 'custom',
      customOptions: [
        { value: 2, label: 'Low' },
        { value: 5, label: 'Medium' },
        { value: 9, label: 'High' },
      ],
    };
    expect(getScaleRange(config)).toEqual({ min: 2, max: 9 });
  });

  it('falls back to { min: 1, max: 5 } for "custom" scale with no customOptions', () => {
    const config: ScaleConfig = { type: 'custom' };
    expect(getScaleRange(config)).toEqual({ min: 1, max: 5 });
  });

  it('uses explicit min/max overrides when provided', () => {
    const config: ScaleConfig = { type: '1-5', min: 0, max: 100 };
    expect(getScaleRange(config)).toEqual({ min: 0, max: 100 });
  });

  it('uses explicit min override even when type implies different range', () => {
    const config: ScaleConfig = { type: '1-10', min: 2, max: 8 };
    expect(getScaleRange(config)).toEqual({ min: 2, max: 8 });
  });
});

// ─── getDefaultRubric ────────────────────────────────────────────────────────

describe('getDefaultRubric', () => {
  it('returns 5 levels for "1-5" scale', () => {
    const rubric = getDefaultRubric({ type: '1-5' });
    expect(rubric).toHaveLength(5);
    expect(rubric[0].score).toBe(1);
    expect(rubric[4].score).toBe(5);
  });

  it('labels the lowest score "Poor" and highest "Excellent" for "1-5"', () => {
    const rubric = getDefaultRubric({ type: '1-5' });
    expect(rubric[0].label).toBe('Poor');
    expect(rubric[4].label).toBe('Excellent');
  });

  it('returns 10 levels for "1-10" scale', () => {
    const rubric = getDefaultRubric({ type: '1-10' });
    expect(rubric).toHaveLength(10);
    expect(rubric[0].score).toBe(1);
    expect(rubric[9].score).toBe(10);
  });

  it('labels score 1 "Very Poor" and score 10 "Outstanding" for "1-10"', () => {
    const rubric = getDefaultRubric({ type: '1-10' });
    expect(rubric[0].label).toBe('Very Poor');
    expect(rubric[9].label).toBe('Outstanding');
  });

  it('returns 4 levels for "0-3" scale', () => {
    const rubric = getDefaultRubric({ type: '0-3' });
    expect(rubric).toHaveLength(4);
    expect(rubric[0].score).toBe(0);
    expect(rubric[3].score).toBe(3);
  });

  it('labels score 0 "Not Supported" and score 3 "Fully Supported" for "0-3"', () => {
    const rubric = getDefaultRubric({ type: '0-3' });
    expect(rubric[0].label).toBe('Not Supported');
    expect(rubric[3].label).toBe('Fully Supported');
  });

  it('returns a rubric for "custom" scale with customOptions', () => {
    const config: ScaleConfig = {
      type: 'custom',
      customOptions: [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' },
      ],
    };
    const rubric = getDefaultRubric(config);
    expect(rubric).toHaveLength(3);
    expect(rubric[0].score).toBe(1);
    expect(rubric[2].score).toBe(3);
  });

  it('returns a fallback rubric for "custom" scale with no customOptions', () => {
    const config: ScaleConfig = { type: 'custom' };
    const rubric = getDefaultRubric(config);
    expect(rubric.length).toBeGreaterThan(0);
  });

  it('each rubric level has a non-empty description', () => {
    for (const type of ['1-5', '1-10', '0-3'] as const) {
      const rubric = getDefaultRubric({ type });
      rubric.forEach(level => {
        expect(level.description.length).toBeGreaterThan(0);
      });
    }
  });
});
