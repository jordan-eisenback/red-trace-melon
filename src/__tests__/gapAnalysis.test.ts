import { describe, it, expect } from 'vitest';
import {
  analyzeGaps,
  getGapSeverityColor,
  getGapTypeLabel,
} from '../app/utils/gapAnalysis';
import type { Framework } from '../app/types/framework';
import type { Requirement } from '../app/types/requirement';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: 'REQ-001',
    req: 'Sample requirement text',
    type: 'Enterprise',
    owner: 'Team A',
    parent: null,
    outcome: 'Outcome',
    notes: '',
    ...overrides,
  };
}

function makeFramework(overrides: Partial<Framework> = {}): Framework {
  return {
    id: 'fw-1',
    name: 'Test Framework',
    version: '1.0',
    description: '',
    category: 'Compliance',
    controls: [],
    isActive: true,
    ...overrides,
  };
}

// ─── analyzeGaps ─────────────────────────────────────────────────────────────

describe('analyzeGaps', () => {
  it('returns 100% coverage and empty arrays when there are no requirements or frameworks', () => {
    const result = analyzeGaps([], []);
    expect(result.overallCoverage).toBe(100);
    expect(result.unmappedRequirements).toHaveLength(0);
    expect(result.emptyControls).toHaveLength(0);
    expect(result.lowCoverageFrameworks).toHaveLength(0);
    expect(result.criticalGaps).toHaveLength(0);
  });

  it('marks all requirements as unmapped when there are no frameworks', () => {
    const reqs = [makeReq({ id: 'R1' }), makeReq({ id: 'R2' })];
    const result = analyzeGaps(reqs, []);
    expect(result.unmappedRequirements).toHaveLength(2);
    expect(result.overallCoverage).toBe(0);
  });

  it('marks requirements as mapped when they appear in control.requirements', () => {
    const req = makeReq({ id: 'R1' });
    const fw = makeFramework({
      controls: [
        {
          id: 'ctrl-1',
          frameworkId: 'fw-1',
          controlId: 'AC-1',
          title: 'Access Control',
          description: '',
          requirements: ['R1'],
        },
      ],
    });
    const result = analyzeGaps([req], [fw]);
    expect(result.unmappedRequirements).toHaveLength(0);
    expect(result.overallCoverage).toBe(100);
  });

  it('identifies empty controls (controls with no mapped requirements)', () => {
    const fw = makeFramework({
      controls: [
        {
          id: 'ctrl-1',
          frameworkId: 'fw-1',
          controlId: 'AC-1',
          title: 'Empty Control',
          description: '',
          requirements: [],
        },
      ],
    });
    const result = analyzeGaps([], [fw]);
    expect(result.emptyControls).toHaveLength(1);
    expect(result.emptyControls[0].control.controlId).toBe('AC-1');
    expect(result.emptyControls[0].framework.name).toBe('Test Framework');
  });

  it('flags frameworks with less than 50% control coverage as low coverage', () => {
    const fw = makeFramework({
      controls: [
        { id: 'c1', frameworkId: 'fw-1', controlId: 'AC-1', title: 'A', description: '', requirements: ['R1'] },
        { id: 'c2', frameworkId: 'fw-1', controlId: 'AC-2', title: 'B', description: '', requirements: [] },
        { id: 'c3', frameworkId: 'fw-1', controlId: 'AC-3', title: 'C', description: '', requirements: [] },
      ],
    });
    const result = analyzeGaps([], [fw]);
    expect(result.lowCoverageFrameworks).toHaveLength(1);
    expect(result.lowCoverageFrameworks[0].coveragePercent).toBeCloseTo(33.33, 1);
  });

  it('does NOT flag frameworks with exactly 50% or more coverage', () => {
    const fw = makeFramework({
      controls: [
        { id: 'c1', frameworkId: 'fw-1', controlId: 'AC-1', title: 'A', description: '', requirements: ['R1'] },
        { id: 'c2', frameworkId: 'fw-1', controlId: 'AC-2', title: 'B', description: '', requirements: ['R2'] },
      ],
    });
    const result = analyzeGaps([], [fw]);
    expect(result.lowCoverageFrameworks).toHaveLength(0);
  });

  it('flags frameworks with no controls as low coverage (0%)', () => {
    const fw = makeFramework({ controls: [] });
    const result = analyzeGaps([], [fw]);
    expect(result.lowCoverageFrameworks).toHaveLength(1);
    expect(result.lowCoverageFrameworks[0].coveragePercent).toBe(0);
  });

  it('groups requirementsByType correctly', () => {
    const reqs = [
      makeReq({ id: 'R1', type: 'Enterprise' }),
      makeReq({ id: 'R2', type: 'Enterprise' }),
      makeReq({ id: 'R3', type: 'Capability' }),
    ];
    const fw = makeFramework({
      controls: [
        { id: 'c1', frameworkId: 'fw-1', controlId: 'AC-1', title: 'A', description: '', requirements: ['R1'] },
      ],
    });
    const result = analyzeGaps(reqs, [fw]);
    const enterprise = result.requirementsByType.get('Enterprise');
    expect(enterprise?.total).toBe(2);
    expect(enterprise?.mapped).toBe(1);
    expect(enterprise?.unmapped).toBe(1);
    const capability = result.requirementsByType.get('Capability');
    expect(capability?.total).toBe(1);
    expect(capability?.unmapped).toBe(1);
  });

  it('assigns "critical" severity to unmapped Enterprise requirements', () => {
    const req = makeReq({ id: 'R1', type: 'Enterprise' });
    const result = analyzeGaps([req], []);
    const gap = result.criticalGaps.find(g => g.itemId === 'R1');
    expect(gap?.severity).toBe('critical');
    expect(gap?.type).toBe('unmapped_requirement');
  });

  it('assigns "high" severity to unmapped IGA Functional requirements', () => {
    const req = makeReq({ id: 'R1', type: 'IGA Functional' });
    const result = analyzeGaps([req], []);
    const gap = result.criticalGaps.find(g => g.itemId === 'R1');
    expect(gap?.severity).toBe('high');
  });

  it('assigns "high" severity to unmapped Capability requirements', () => {
    const req = makeReq({ id: 'R1', type: 'Capability' });
    const result = analyzeGaps([req], []);
    const gap = result.criticalGaps.find(g => g.itemId === 'R1');
    expect(gap?.severity).toBe('high');
  });

  it('assigns "medium" severity to other unmapped requirement types', () => {
    const req = makeReq({ id: 'R1', type: 'NFR' });
    const result = analyzeGaps([req], []);
    const gap = result.criticalGaps.find(g => g.itemId === 'R1');
    expect(gap?.severity).toBe('medium');
  });

  it('assigns "critical" severity to empty controls with Critical priority', () => {
    const fw = makeFramework({
      controls: [
        { id: 'c1', frameworkId: 'fw-1', controlId: 'AC-1', title: 'Critical Ctrl', description: '', requirements: [], priority: 'Critical' },
      ],
    });
    const result = analyzeGaps([], [fw]);
    const gap = result.criticalGaps.find(g => g.type === 'empty_control');
    expect(gap?.severity).toBe('critical');
  });

  it('assigns "high" severity to empty controls with High priority', () => {
    const fw = makeFramework({
      controls: [
        { id: 'c1', frameworkId: 'fw-1', controlId: 'AC-1', title: 'High Ctrl', description: '', requirements: [], priority: 'High' },
      ],
    });
    const result = analyzeGaps([], [fw]);
    const gap = result.criticalGaps.find(g => g.type === 'empty_control');
    expect(gap?.severity).toBe('high');
  });

  it('uses "high" severity for low-coverage framework with <25% coverage', () => {
    const fw = makeFramework({
      controls: [
        { id: 'c1', frameworkId: 'fw-1', controlId: 'AC-1', title: 'A', description: '', requirements: [] },
        { id: 'c2', frameworkId: 'fw-1', controlId: 'AC-2', title: 'B', description: '', requirements: [] },
        { id: 'c3', frameworkId: 'fw-1', controlId: 'AC-3', title: 'C', description: '', requirements: [] },
        { id: 'c4', frameworkId: 'fw-1', controlId: 'AC-4', title: 'D', description: '', requirements: [] },
        { id: 'c5', frameworkId: 'fw-1', controlId: 'AC-5', title: 'E', description: '', requirements: ['R1'] },
      ],
    });
    const result = analyzeGaps([], [fw]);
    const gap = result.criticalGaps.find(g => g.type === 'low_coverage_framework');
    // 20% coverage < 25% threshold → severity is "high"
    expect(gap?.severity).toBe('high');
  });

  it('calculates partial overall coverage correctly', () => {
    const reqs = [makeReq({ id: 'R1' }), makeReq({ id: 'R2' }), makeReq({ id: 'R3' }), makeReq({ id: 'R4' })];
    const fw = makeFramework({
      controls: [
        { id: 'c1', frameworkId: 'fw-1', controlId: 'AC-1', title: 'A', description: '', requirements: ['R1', 'R2'] },
      ],
    });
    const result = analyzeGaps(reqs, [fw]);
    expect(result.overallCoverage).toBe(50);
  });
});

// ─── getGapSeverityColor ──────────────────────────────────────────────────────

describe('getGapSeverityColor', () => {
  it('returns red classes for critical', () => {
    expect(getGapSeverityColor('critical')).toContain('red');
  });

  it('returns orange classes for high', () => {
    expect(getGapSeverityColor('high')).toContain('orange');
  });

  it('returns yellow classes for medium', () => {
    expect(getGapSeverityColor('medium')).toContain('yellow');
  });

  it('returns blue classes for low', () => {
    expect(getGapSeverityColor('low')).toContain('blue');
  });
});

// ─── getGapTypeLabel ──────────────────────────────────────────────────────────

describe('getGapTypeLabel', () => {
  it('returns human-readable label for unmapped_requirement', () => {
    expect(getGapTypeLabel('unmapped_requirement')).toBe('Unmapped Requirement');
  });

  it('returns human-readable label for empty_control', () => {
    expect(getGapTypeLabel('empty_control')).toBe('Empty Control');
  });

  it('returns human-readable label for low_coverage_framework', () => {
    expect(getGapTypeLabel('low_coverage_framework')).toBe('Low Coverage Framework');
  });
});
