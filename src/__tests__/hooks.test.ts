/**
 * Unit tests for useAutoSave and usePersistToDisk hooks (closes part of #42)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ── setup ─────────────────────────────────────────────────────────────────────
// NOTE: We do NOT install fake timers globally because waitFor() uses real
// setTimeout internally. Tests that exercise setInterval install/restore fake
// timers locally within the test body.

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

// ── usePersistToDisk ──────────────────────────────────────────────────────────

describe('usePersistToDisk', () => {
  it('calls fetch with the correct endpoint and payload in dev mode', async () => {
    vi.stubEnv('PROD', false);
    const { usePersistToDisk } = await import('../app/hooks/usePersistToDisk');
    const { result } = renderHook(() => usePersistToDisk());
    act(() => {
      result.current('/api/save-requirements', { requirements: [] });
    });
    // Drain the microtask queue so the fire-and-forget fetch promise settles
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledWith(
      '/api/save-requirements',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ requirements: [] }),
      })
    );
  });

  it('is a no-op in production — fetch is never called', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const { usePersistToDisk } = await import('../app/hooks/usePersistToDisk');
    const { result } = renderHook(() => usePersistToDisk());
    act(() => {
      result.current('/api/save-requirements', { requirements: [] });
    });
    await Promise.resolve();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('swallows fetch errors silently — does not throw', async () => {
    vi.stubEnv('PROD', false);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const { usePersistToDisk } = await import('../app/hooks/usePersistToDisk');
    const { result } = renderHook(() => usePersistToDisk());
    // Fire and let the rejection bubble through the .catch() inside the hook
    await expect(
      act(async () => {
        result.current('/api/save-frameworks', { frameworks: [] });
        await Promise.resolve();
      })
    ).resolves.not.toThrow();
  });
});

// ── useAutoSave ───────────────────────────────────────────────────────────────

describe('useAutoSave', () => {
  it('transitions to "saving" or "saved" immediately on mount in dev mode', async () => {
    vi.stubEnv('PROD', false);
    const { useAutoSave } = await import('../app/hooks/useAutoSave');
    const { result } = renderHook(() =>
      useAutoSave({ getPayload: () => ({ data: 1 }) })
    );
    await waitFor(() =>
      expect(['saving', 'saved']).toContain(result.current.status)
    );
  });

  it('transitions status to "saved" after a successful fetch', async () => {
    vi.stubEnv('PROD', false);
    const { useAutoSave } = await import('../app/hooks/useAutoSave');
    const { result } = renderHook(() =>
      useAutoSave({ getPayload: () => ({ data: 1 }) })
    );
    await waitFor(() => expect(result.current.status).toBe('saved'));
  });

  it('transitions status to "error" when fetch returns a non-ok response', async () => {
    vi.stubEnv('PROD', false);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    vi.resetModules();
    const { useAutoSave } = await import('../app/hooks/useAutoSave');
    const { result } = renderHook(() =>
      useAutoSave({ getPayload: () => ({}) })
    );
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('sets lastSavedAt to a Date after a successful save', async () => {
    vi.stubEnv('PROD', false);
    const { useAutoSave } = await import('../app/hooks/useAutoSave');
    const { result } = renderHook(() =>
      useAutoSave({ getPayload: () => ({}) })
    );
    await waitFor(() => expect(result.current.lastSavedAt).toBeInstanceOf(Date));
  });

  it('calls fetch again after the interval fires', async () => {
    vi.stubEnv('PROD', false);
    vi.useFakeTimers();
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);
    vi.resetModules();
    const { useAutoSave } = await import('../app/hooks/useAutoSave');
    renderHook(() =>
      useAutoSave({ intervalMs: 1000, getPayload: () => ({}) })
    );
    // Let the mount-save settle
    await act(async () => { await Promise.resolve(); });
    const callsAfterMount = mockFetch.mock.calls.length;
    // Advance one interval and flush promises
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    vi.useRealTimers();
    expect(mockFetch.mock.calls.length).toBeGreaterThan(callsAfterMount);
  });

  it('is a no-op in production — fetch is never called', async () => {
    vi.stubEnv('PROD', true);
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);
    vi.resetModules();
    const { useAutoSave } = await import('../app/hooks/useAutoSave');
    renderHook(() =>
      useAutoSave({ getPayload: () => ({}) })
    );
    await Promise.resolve();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('saveNow() triggers an immediate save', async () => {
    vi.stubEnv('PROD', false);
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);
    vi.resetModules();
    const { useAutoSave } = await import('../app/hooks/useAutoSave');
    const { result } = renderHook(() =>
      useAutoSave({ intervalMs: 99999, getPayload: () => ({}) })
    );
    // Let the mount-save settle
    await waitFor(() => expect(mockFetch.mock.calls.length).toBeGreaterThan(0));
    const before = mockFetch.mock.calls.length;
    await act(async () => { await result.current.saveNow(); });
    expect(mockFetch.mock.calls.length).toBeGreaterThan(before);
  });
});
