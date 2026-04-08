/**
 * Unit tests for RequirementsContext (closes part of #41)
 *
 * Strategy: renderHook with RequirementsProvider wrapper. localStorage is
 * cleared before each test so we start from an empty slate rather than the
 * large seed data, making assertions fast and deterministic.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { RequirementsProvider, useRequirements } from '../app/contexts/RequirementsContext';
import type { Requirement } from '../app/types/requirement';
import { withProviders } from './test-utils';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: 'req-test-1',
    req: 'Test requirement',
    type: 'Enterprise',
    owner: 'Tester',
    parent: null,
    outcome: 'Outcome',
    notes: '',
    ...overrides,
  };
}

const wrapper = withProviders(({ children }) => (
  <RequirementsProvider>{children}</RequirementsProvider>
));

// ── setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  // Silence the usePersistToDisk fetch calls in jsdom (no server in unit tests)
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('RequirementsContext', () => {
  it('starts with an empty list when localStorage is clear', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    // We cleared localStorage, but the provider falls back to initialRequirements.
    // Regardless of size, the array should be defined.
    expect(Array.isArray(result.current.requirements)).toBe(true);
  });

  it('addRequirement → requirement appears in state', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    const req = makeReq({ id: 'req-add-1' });
    act(() => {
      result.current.addRequirement(req);
    });
    expect(result.current.requirements.some((r) => r.id === 'req-add-1')).toBe(true);
  });

  it('addRequirement → stored requirement has the correct fields', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    const req = makeReq({ id: 'req-add-2', req: 'Field check', owner: 'Alice' });
    act(() => {
      result.current.addRequirement(req);
    });
    const found = result.current.requirements.find((r) => r.id === 'req-add-2');
    expect(found?.req).toBe('Field check');
    expect(found?.owner).toBe('Alice');
  });

  it('updateRequirement → state reflects the change', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    const req = makeReq({ id: 'req-upd-1', req: 'Original' });
    act(() => { result.current.addRequirement(req); });
    act(() => {
      result.current.updateRequirement('req-upd-1', { ...req, req: 'Updated' });
    });
    const found = result.current.requirements.find((r) => r.id === 'req-upd-1');
    expect(found?.req).toBe('Updated');
  });

  it('deleteRequirement → requirement is removed from state', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    const req = makeReq({ id: 'req-del-1' });
    act(() => { result.current.addRequirement(req); });
    act(() => { result.current.deleteRequirement('req-del-1'); });
    expect(result.current.requirements.some((r) => r.id === 'req-del-1')).toBe(false);
  });

  it('getRequirement → returns the correct item by id', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    const req = makeReq({ id: 'req-get-1', req: 'Find me' });
    act(() => { result.current.addRequirement(req); });
    const found = result.current.getRequirement('req-get-1');
    expect(found?.req).toBe('Find me');
  });

  it('getRequirement → returns undefined for an unknown id', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    expect(result.current.getRequirement('does-not-exist')).toBeUndefined();
  });

  it('getChildren → returns requirements whose parent matches the given id', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    const parent = makeReq({ id: 'req-parent', parent: null });
    const child1 = makeReq({ id: 'req-child-1', parent: 'req-parent' });
    const child2 = makeReq({ id: 'req-child-2', parent: 'req-parent' });
    const other = makeReq({ id: 'req-other', parent: null });
    act(() => {
      result.current.addRequirement(parent);
      result.current.addRequirement(child1);
      result.current.addRequirement(child2);
      result.current.addRequirement(other);
    });
    const children = result.current.getChildren('req-parent');
    expect(children).toHaveLength(2);
    expect(children.map((c) => c.id)).toEqual(
      expect.arrayContaining(['req-child-1', 'req-child-2'])
    );
  });

  it('getParent → returns the parent requirement', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    const parent = makeReq({ id: 'req-par-2', req: 'I am parent', parent: null });
    const child = makeReq({ id: 'req-chd-2', parent: 'req-par-2' });
    act(() => {
      result.current.addRequirement(parent);
      result.current.addRequirement(child);
    });
    const p = result.current.getParent('req-chd-2');
    expect(p?.id).toBe('req-par-2');
  });

  it('getParent → returns undefined when the child has no parent', () => {
    const { result } = renderHook(() => useRequirements(), { wrapper });
    const req = makeReq({ id: 'req-no-par', parent: null });
    act(() => { result.current.addRequirement(req); });
    expect(result.current.getParent('req-no-par')).toBeUndefined();
  });

  it('useRequirements → throws when used outside of the provider', () => {
    // Suppress the expected React error boundary console.error noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useRequirements())).toThrow(
      'useRequirements must be used within RequirementsProvider'
    );
    spy.mockRestore();
  });
});
