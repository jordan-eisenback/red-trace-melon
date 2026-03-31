import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../app/hooks/useLocalStorage';

// ─── useLocalStorage ──────────────────────────────────────────────────────────

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the initialValue when localStorage has no entry for the key', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns a stored value from localStorage when one already exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('updates the in-memory state when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    act(() => {
      result.current[1](42);
    });
    expect(result.current[0]).toBe(42);
  });

  it('persists the updated value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    act(() => {
      result.current[1](99);
    });
    expect(JSON.parse(localStorage.getItem('test-key') as string)).toBe(99);
  });

  it('supports functional updater form', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10));
    act(() => {
      result.current[1]((prev) => prev + 5);
    });
    expect(result.current[0]).toBe(15);
  });

  it('works with object values', () => {
    const initial = { name: 'Alice', active: true };
    const { result } = renderHook(() => useLocalStorage('obj-key', initial));
    expect(result.current[0]).toEqual(initial);

    const updated = { name: 'Bob', active: false };
    act(() => {
      result.current[1](updated);
    });
    expect(result.current[0]).toEqual(updated);
    expect(JSON.parse(localStorage.getItem('obj-key') as string)).toEqual(updated);
  });

  it('works with array values', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('arr-key', []));
    act(() => {
      result.current[1](['a', 'b', 'c']);
    });
    expect(result.current[0]).toEqual(['a', 'b', 'c']);
  });

  it('falls back to initialValue when localStorage contains invalid JSON', () => {
    localStorage.setItem('bad-key', 'not-valid-json{{{');
    const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('returns the correct value when using separate hooks with different keys', () => {
    const { result: r1 } = renderHook(() => useLocalStorage('key-1', 'alpha'));
    const { result: r2 } = renderHook(() => useLocalStorage('key-2', 'beta'));
    expect(r1.current[0]).toBe('alpha');
    expect(r2.current[0]).toBe('beta');

    act(() => {
      r1.current[1]('updated-alpha');
    });
    expect(r1.current[0]).toBe('updated-alpha');
    expect(r2.current[0]).toBe('beta');
  });

  it('returns the same setter reference across re-renders (stable callback)', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('stable-key', 0));
    const setter1 = result.current[1];
    rerender();
    const setter2 = result.current[1];
    expect(setter1).toBe(setter2);
  });
});
