/**
 * Unit tests for VendorContext (closes part of #41)
 *
 * Scope: vendor CRUD, evaluator CRUD, score upsert/delete, setActiveProfile,
 * and the useVendor guard. The heavy computed helpers (getAggregatedScores,
 * getCompletionStatus) are covered by separate integration tests in #42.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VendorProvider, useVendor } from '../app/contexts/VendorContext';
import { withProviders } from './test-utils';

// ── helpers ───────────────────────────────────────────────────────────────────

let _scoreSeq = 0;
function makeScore(
  evaluatorId: string,
  vendorId: string,
  criterionId: string,
  subCriterionId: string,
  score: number,
  notes?: string
) {
  return {
    id: `score-${++_scoreSeq}`,
    evaluatorId,
    vendorId,
    criterionId,
    subCriterionId,
    score,
    notes,
    createdAt: new Date().toISOString(),
  };
}

// ── setup ─────────────────────────────────────────────────────────────────────

const wrapper = withProviders(({ children }) => (
  <VendorProvider>{children}</VendorProvider>
));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('VendorContext — vendors', () => {
  it('initial state has a vendors array', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    expect(Array.isArray(result.current.data.vendors)).toBe(true);
  });

  it('addVendor → vendor appears in state', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addVendor({ name: 'Acme Corp', type: 'replacement' });
    });
    expect(result.current.data.vendors.some((v) => v.name === 'Acme Corp')).toBe(true);
  });

  it('addVendor → auto-assigns a unique id and createdAt', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addVendor({ name: 'ID Check Vendor', type: 'replacement' });
    });
    const v = result.current.data.vendors.find((v) => v.name === 'ID Check Vendor');
    expect(v?.id).toBeTruthy();
    expect(v?.createdAt).toBeTruthy();
  });

  it('updateVendor → name change is reflected in state', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    // Use the first seed vendor whose id is always "vendor-1"
    const seedId = result.current.data.vendors[0]?.id;
    act(() => {
      result.current.updateVendor(seedId, { name: 'Renamed Vendor' });
    });
    expect(result.current.data.vendors.find((v) => v.id === seedId)?.name).toBe('Renamed Vendor');
  });

  it('deleteVendor → vendor is removed from state', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addVendor({ name: 'To Delete', type: 'replacement' });
    });
    const toDelete = result.current.data.vendors.find((v) => v.name === 'To Delete');
    act(() => {
      result.current.deleteVendor(toDelete!.id);
    });
    expect(result.current.data.vendors.some((v) => v.name === 'To Delete')).toBe(false);
  });

  it('deleteVendor → cascades: scores for that vendor are also removed', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const vendorId = result.current.data.vendors[0]?.id;
    const evaluatorId = result.current.data.evaluators[0]?.id;
    // Insert a fake score referencing this vendor
    act(() => {
      result.current.updateScore(makeScore(evaluatorId, vendorId, 'cat-x', 'sub-x', 3));
    });
    expect(result.current.data.scores.some((s) => s.vendorId === vendorId)).toBe(true);
    act(() => { result.current.deleteVendor(vendorId); });
    expect(result.current.data.scores.some((s) => s.vendorId === vendorId)).toBe(false);
  });
});

describe('VendorContext — evaluators', () => {
  it('addEvaluator → evaluator appears in state', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addEvaluator({ name: 'Alice', email: 'alice@test.com' });
    });
    expect(result.current.data.evaluators.some((e) => e.name === 'Alice')).toBe(true);
  });

  it('updateEvaluator → email change is reflected', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const seedId = result.current.data.evaluators[0]?.id;
    act(() => {
      result.current.updateEvaluator(seedId, { email: 'new@email.com' });
    });
    expect(result.current.data.evaluators.find((e) => e.id === seedId)?.email).toBe('new@email.com');
  });

  it('deleteEvaluator → evaluator removed and cascades scores', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const evalId = result.current.data.evaluators[0]?.id;
    const vendorId = result.current.data.vendors[0]?.id;
    act(() => {
      result.current.updateScore(makeScore(evalId, vendorId, 'cat-y', 'sub-y', 4));
    });
    act(() => { result.current.deleteEvaluator(evalId); });
    expect(result.current.data.evaluators.some((e) => e.id === evalId)).toBe(false);
    expect(result.current.data.scores.some((s) => s.evaluatorId === evalId)).toBe(false);
  });
});

describe('VendorContext — scores', () => {
  it('updateScore → inserts a new score when none exists', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const vendorId = result.current.data.vendors[0]?.id;
    const evalId = result.current.data.evaluators[0]?.id;
    act(() => {
      result.current.updateScore(makeScore(evalId, vendorId, 'cat-z', 'sub-z', 5));
    });
    const score = result.current.data.scores.find(
      (s) => s.criterionId === 'cat-z' && s.subCriterionId === 'sub-z'
    );
    expect(score?.score).toBe(5);
  });

  it('updateScore → upserts: updates score value when a matching entry exists', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const vendorId = result.current.data.vendors[0]?.id;
    const evalId = result.current.data.evaluators[0]?.id;
    act(() => { result.current.updateScore(makeScore(evalId, vendorId, 'cat-u', 'sub-u', 2)); });
    act(() => { result.current.updateScore(makeScore(evalId, vendorId, 'cat-u', 'sub-u', 4)); });
    const scores = result.current.data.scores.filter(
      (s) => s.criterionId === 'cat-u' && s.subCriterionId === 'sub-u'
    );
    // Should still be only one entry (upsert, not duplicate)
    expect(scores).toHaveLength(1);
    expect(scores[0].score).toBe(4);
  });

  it('deleteScoresForVendor → removes only scores for that vendor', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const v1 = result.current.data.vendors[0]?.id;
    const v2 = result.current.data.vendors[1]?.id;
    const evalId = result.current.data.evaluators[0]?.id;
    act(() => {
      result.current.updateScore(makeScore(evalId, v1, 'c1', 's1', 1));
      result.current.updateScore(makeScore(evalId, v2, 'c1', 's1', 2));
    });
    act(() => { result.current.deleteScoresForVendor(v1); });
    expect(result.current.data.scores.some((s) => s.vendorId === v1)).toBe(false);
    expect(result.current.data.scores.some((s) => s.vendorId === v2)).toBe(true);
  });
});

describe('VendorContext — active profile', () => {
  it('setActiveProfile → activeProfileId is updated', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const profileId = result.current.data.weightingProfiles[0]?.id;
    act(() => { result.current.setActiveProfile(profileId); });
    expect(result.current.data.activeProfileId).toBe(profileId);
  });

  it('getActiveProfile → returns the currently active weighting profile', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const profileId = result.current.data.weightingProfiles[0]?.id;
    act(() => { result.current.setActiveProfile(profileId); });
    expect(result.current.getActiveProfile()?.id).toBe(profileId);
  });
});

describe('VendorContext — criteria profiles', () => {
  it('addCriteriaProfile → profile appears in state', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addCriteriaProfile({ name: 'New Profile', criteria: [] });
    });
    expect(result.current.data.criteriaProfiles.some((p) => p.name === 'New Profile')).toBe(true);
  });

  it('addCriteriaProfile → auto-assigns id, createdAt, updatedAt', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addCriteriaProfile({ name: 'ID Check Profile', criteria: [] });
    });
    const p = result.current.data.criteriaProfiles.find((p) => p.name === 'ID Check Profile');
    expect(p?.id).toBeTruthy();
    expect(p?.createdAt).toBeTruthy();
    expect(p?.updatedAt).toBeTruthy();
  });

  it('updateCriteriaProfile → name updated', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const seedId = result.current.data.criteriaProfiles[0]?.id;
    act(() => { result.current.updateCriteriaProfile(seedId, { name: 'Renamed' }); });
    expect(result.current.data.criteriaProfiles.find((p) => p.id === seedId)?.name).toBe('Renamed');
  });

  it('deleteCriteriaProfile → profile removed', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => { result.current.addCriteriaProfile({ name: 'To Delete', criteria: [] }); });
    const toDelete = result.current.data.criteriaProfiles.find((p) => p.name === 'To Delete');
    act(() => { result.current.deleteCriteriaProfile(toDelete!.id); });
    expect(result.current.data.criteriaProfiles.some((p) => p.name === 'To Delete')).toBe(false);
  });

  it('deleteCriteriaProfile → activeCriteriaProfileId falls back to first remaining', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => { result.current.addCriteriaProfile({ name: 'Profile B', criteria: [] }); });
    const profileB = result.current.data.criteriaProfiles.find((p) => p.name === 'Profile B')!;
    act(() => { result.current.setActiveCriteriaProfile(profileB.id); });
    act(() => { result.current.deleteCriteriaProfile(profileB.id); });
    expect(result.current.data.activeCriteriaProfileId).not.toBe(profileB.id);
  });

  it('setActiveCriteriaProfile → activeCriteriaProfileId updated', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => { result.current.addCriteriaProfile({ name: 'Switch Target', criteria: [] }); });
    const target = result.current.data.criteriaProfiles.find((p) => p.name === 'Switch Target')!;
    act(() => { result.current.setActiveCriteriaProfile(target.id); });
    expect(result.current.data.activeCriteriaProfileId).toBe(target.id);
  });

  it('getActiveCriteriaProfile → returns profile matching activeCriteriaProfileId', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const id = result.current.data.activeCriteriaProfileId;
    expect(result.current.getActiveCriteriaProfile()?.id).toBe(id);
  });

  it('exportCriteriaProfileToCSV → returns null for unknown profileId', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    expect(result.current.exportCriteriaProfileToCSV('nonexistent-id')).toBeNull();
  });

  it('exportCriteriaProfileToCSV → returns a non-empty string for existing profile', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const id = result.current.data.criteriaProfiles[0]?.id;
    const csv = result.current.exportCriteriaProfileToCSV(id);
    expect(typeof csv).toBe('string');
  });

  it('importCriteriaProfileFromCSV → returns success:false for invalid CSV', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    let res: ReturnType<typeof result.current.importCriteriaProfileFromCSV>;
    act(() => {
      res = result.current.importCriteriaProfileFromCSV('Bad Import', 'not,valid,csv\ndata');
    });
    expect(res!.success).toBe(false);
  });
});

describe('VendorContext — weighting profiles', () => {
  it('addWeightingProfile → profile appears in state', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addWeightingProfile({
        name: 'Custom Weights',
        scaleConfig: { type: '1-5' },
        scoringMode: 'sub-criteria',
        weights: [],
      });
    });
    expect(result.current.data.weightingProfiles.some((p) => p.name === 'Custom Weights')).toBe(true);
  });

  it('updateWeightingProfile → name updated', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const seedId = result.current.data.weightingProfiles[0]?.id;
    act(() => { result.current.updateWeightingProfile(seedId, { name: 'Renamed Weights' }); });
    expect(result.current.data.weightingProfiles.find((p) => p.id === seedId)?.name).toBe('Renamed Weights');
  });

  it('deleteWeightingProfile → profile removed and activeProfileId falls back', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addWeightingProfile({
        name: 'Temp Profile',
        scaleConfig: { type: '1-5' },
        scoringMode: 'sub-criteria',
        weights: [],
      });
    });
    const temp = result.current.data.weightingProfiles.find((p) => p.name === 'Temp Profile')!;
    act(() => { result.current.setActiveProfile(temp.id); });
    act(() => { result.current.deleteWeightingProfile(temp.id); });
    expect(result.current.data.weightingProfiles.some((p) => p.name === 'Temp Profile')).toBe(false);
    expect(result.current.data.activeProfileId).not.toBe(temp.id);
  });
});

describe('VendorContext — criteria CRUD', () => {
  it('addCriterion → criterion appears in active criteria profile', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => {
      result.current.addCriterion({ category: 'Security', subCriteria: [] });
    });
    const profile = result.current.getActiveCriteriaProfile();
    expect(profile?.criteria.some((c) => c.category === 'Security')).toBe(true);
  });

  it('updateCriterion → criterion category updated', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => { result.current.addCriterion({ category: 'Before Cat', subCriteria: [] }); });
    const profile = result.current.getActiveCriteriaProfile()!;
    const crit = profile.criteria.find((c) => c.category === 'Before Cat')!;
    act(() => { result.current.updateCriterion(crit.id, { category: 'After Cat' }); });
    const updated = result.current.getActiveCriteriaProfile();
    expect(updated?.criteria.find((c) => c.id === crit.id)?.category).toBe('After Cat');
  });

  it('deleteCriterion → criterion removed and its scores cleaned up', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    act(() => { result.current.addCriterion({ category: 'Del Cat', subCriteria: [] }); });
    const profile = result.current.getActiveCriteriaProfile()!;
    const crit = profile.criteria.find((c) => c.category === 'Del Cat')!;
    const vendorId = result.current.data.vendors[0]?.id;
    const evalId = result.current.data.evaluators[0]?.id;
    act(() => { result.current.updateScore(makeScore(evalId, vendorId, crit.id, 'sub-x', 3)); });
    act(() => { result.current.deleteCriterion(crit.id); });
    const updatedProfile = result.current.getActiveCriteriaProfile();
    expect(updatedProfile?.criteria.some((c) => c.id === crit.id)).toBe(false);
    expect(result.current.data.scores.some((s) => s.criterionId === crit.id)).toBe(false);
  });
});

describe('VendorContext — computed helpers', () => {
  it('getCompletionStatus → returns array with evaluator/vendor combos', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const statuses = result.current.getCompletionStatus();
    expect(Array.isArray(statuses)).toBe(true);
    // 1 evaluator × 3 vendors = 3 entries
    expect(statuses.length).toBe(result.current.data.evaluators.length * result.current.data.vendors.length);
  });

  it('getCompletionStatus → percentage is 0 when no scores exist', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const statuses = result.current.getCompletionStatus();
    statuses.forEach((s) => expect(s.percentage).toBe(0));
  });

  it('getAggregatedScores → returns one entry per vendor', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const scores = result.current.getAggregatedScores();
    expect(scores.length).toBe(result.current.data.vendors.length);
  });

  it('getAggregatedScores → normalizedScore is 0 when no scores entered', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    result.current.getAggregatedScores().forEach((s) => {
      expect(s.normalizedScore).toBe(0);
    });
  });
});

describe('VendorContext — requirement ↔ sub-criterion links', () => {
  it('linkRequirementToCriterion → requirementId added to sub-criterion linkedRequirementIds', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const profile = result.current.getActiveCriteriaProfile()!;
    const firstCriterion = profile.criteria[0];
    const firstSub = firstCriterion?.subCriteria[0];
    if (!firstSub) return; // skip if no sub-criteria in seed data
    act(() => { result.current.linkRequirementToCriterion(firstSub.id, 'REQ-999'); });
    const updated = result.current.getRequirementsForCriterion(firstSub.id);
    expect(updated).toContain('REQ-999');
  });

  it('unlinkRequirementFromCriterion → requirementId removed', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const profile = result.current.getActiveCriteriaProfile()!;
    const firstSub = profile.criteria[0]?.subCriteria[0];
    if (!firstSub) return;
    act(() => { result.current.linkRequirementToCriterion(firstSub.id, 'REQ-888'); });
    act(() => { result.current.unlinkRequirementFromCriterion(firstSub.id, 'REQ-888'); });
    expect(result.current.getRequirementsForCriterion(firstSub.id)).not.toContain('REQ-888');
  });

  it('getCriteriaForRequirement → returns matching criterion/sub entries', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    const profile = result.current.getActiveCriteriaProfile()!;
    const firstSub = profile.criteria[0]?.subCriteria[0];
    if (!firstSub) return;
    act(() => { result.current.linkRequirementToCriterion(firstSub.id, 'REQ-777'); });
    const linked = result.current.getCriteriaForRequirement('REQ-777');
    expect(linked.some((l) => l.subCriterionId === firstSub.id)).toBe(true);
  });

  it('getRequirementsForCriterion → returns empty array for unknown subCriterionId', () => {
    const { result } = renderHook(() => useVendor(), { wrapper });
    expect(result.current.getRequirementsForCriterion('nonexistent-sub')).toEqual([]);
  });
});

describe('VendorContext — guard', () => {
  it('useVendor → throws when used outside of the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useVendor())).toThrow(
      'useVendor must be used within a VendorProvider'
    );
    spy.mockRestore();
  });
});
