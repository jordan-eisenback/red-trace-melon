/**
 * Unit tests for VendorContext (closes part of #41)
 *
 * Scope: vendor CRUD, evaluator CRUD, score upsert/delete, setActiveProfile,
 * and the useVendor guard. The heavy computed helpers (getAggregatedScores,
 * getCompletionStatus) are covered by separate integration tests in #42.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { VendorProvider, useVendor } from '../app/contexts/VendorContext';

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <VendorProvider>{children}</VendorProvider>
);

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

describe('VendorContext — guard', () => {
  it('useVendor → throws when used outside of the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useVendor())).toThrow(
      'useVendor must be used within a VendorProvider'
    );
    spy.mockRestore();
  });
});
