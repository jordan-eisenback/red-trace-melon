/**
 * Unit tests for AdminContext (closes part of #41)
 *
 * Strategy: renderHook with AdminProvider wrapper. localStorage is cleared
 * before each test so we start from the DEFAULT_VISIBILITY defaults.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AdminProvider, useAdmin } from '../app/contexts/AdminContext';
import type { VisibilityKey } from '../app/contexts/AdminContext';

// ── setup ─────────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AdminProvider>{children}</AdminProvider>
);

beforeEach(() => {
  localStorage.clear();
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('AdminContext', () => {
  it('isVisible → all keys default to true', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    expect(result.current.isVisible('page:requirements')).toBe(true);
    expect(result.current.isVisible('feature:gap-analysis')).toBe(true);
  });

  it('toggle → flips a key from true to false', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => { result.current.toggle('page:help'); });
    expect(result.current.isVisible('page:help')).toBe(false);
  });

  it('toggle → flips a key from false back to true', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => { result.current.toggle('page:help'); });   // → false
    act(() => { result.current.toggle('page:help'); });   // → true
    expect(result.current.isVisible('page:help')).toBe(true);
  });

  it('set → explicitly sets a key to false', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => { result.current.set('feature:epics', false); });
    expect(result.current.isVisible('feature:epics')).toBe(false);
  });

  it('set → explicitly sets a key to true', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => { result.current.set('feature:epics', false); });
    act(() => { result.current.set('feature:epics', true); });
    expect(result.current.isVisible('feature:epics')).toBe(true);
  });

  it('hideAll("page") → hides all page keys except page:requirements', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => { result.current.hideAll('page'); });
    // requirements is protected — must stay visible
    expect(result.current.isVisible('page:requirements')).toBe(true);
    // all others should be hidden
    const hiddenKeys: VisibilityKey[] = [
      'page:dependencies',
      'page:hierarchy',
      'page:story-mapping',
      'page:epics-stories',
      'page:frameworks',
      'page:help',
    ];
    hiddenKeys.forEach((k) => expect(result.current.isVisible(k)).toBe(false));
  });

  it('showAll("page") → restores all page keys to visible', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => { result.current.hideAll('page'); });
    act(() => { result.current.showAll('page'); });
    const pageKeys: VisibilityKey[] = [
      'page:requirements', 'page:dependencies', 'page:hierarchy',
      'page:story-mapping', 'page:epics-stories', 'page:frameworks', 'page:help',
    ];
    pageKeys.forEach((k) => expect(result.current.isVisible(k)).toBe(true));
  });

  it('hideAll("feature") → hides all feature keys', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => { result.current.hideAll('feature'); });
    const featureKeys: VisibilityKey[] = [
      'feature:epics', 'feature:frameworks', 'feature:gap-analysis',
      'feature:story-jam', 'feature:dependency-graph', 'feature:hierarchy',
    ];
    featureKeys.forEach((k) => expect(result.current.isVisible(k)).toBe(false));
  });

  it('resetAll → restores every key to true', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => {
      result.current.hideAll('page');
      result.current.hideAll('feature');
    });
    act(() => { result.current.resetAll(); });
    expect(result.current.isVisible('page:requirements')).toBe(true);
    expect(result.current.isVisible('feature:gap-analysis')).toBe(true);
    expect(result.current.isVisible('page:help')).toBe(true);
  });

  it('visibility map is persisted in localStorage', () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => { result.current.set('page:help', false); });
    const stored = JSON.parse(localStorage.getItem('rtm-admin-visibility') || '{}');
    expect(stored['page:help']).toBe(false);
  });
});
