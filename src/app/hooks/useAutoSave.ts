import { useEffect, useRef, useState, useCallback } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  /** How often to auto-save in milliseconds. Default: 5 minutes. */
  intervalMs?: number;
  /**
   * Delay before the very first auto-save fires after mount, in milliseconds.
   * Prevents a race between an in-flight POST and immediate page unload.
   * Default: 2 000 ms.
   */
  mountDelayMs?: number;
  /** Called immediately on mount and then every intervalMs. Must return the full payload to POST. */
  getPayload: () => Record<string, unknown>;
}

/**
 * Periodically POSTs all context state to `/api/save-all` so data is flushed
 * to disk even when the user hasn't made any recent changes.
 *
 * No-op in production builds (`import.meta.env.PROD === true`).
 *
 * @param options.intervalMs   - Repeat interval between saves (ms). Default: 5 min.
 * @param options.mountDelayMs - Delay before the *first* save fires after mount (ms).
 *   Prevents a race between an in-flight POST and an immediate page unload / HMR
 *   reload. Default: 2 000 ms.
 * @param options.getPayload   - Called on each save tick; must return the full JSON
 *   payload to POST.  The reference is captured via a ref so a stale closure never
 *   causes a missed update.
 *
 * @returns `{ status, lastSavedAt, saveNow }` where `saveNow` triggers an
 *   immediate save regardless of the mount delay or interval timing.
 *
 * @example
 * ```ts
 * const { status, lastSavedAt } = useAutoSave({
 *   getPayload: () => ({ requirements, epics }),
 *   mountDelayMs: 3_000,
 * });
 * ```
 */
export function useAutoSave({ intervalMs = 5 * 60 * 1000, mountDelayMs = 2_000, getPayload }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const getPayloadRef = useRef(getPayload);
  getPayloadRef.current = getPayload;

  const save = useCallback(async () => {
    if (import.meta.env.PROD) return;
    setStatus('saving');
    try {
      const payload = getPayloadRef.current();
      const res = await fetch('/api/save-all', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLastSavedAt(new Date());
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, []);

  // Delay the first save by mountDelayMs to avoid racing with page unload,
  // then repeat every intervalMs.
  useEffect(() => {
    if (import.meta.env.PROD) return;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const mountTimer = setTimeout(() => {
      save();
      intervalId = setInterval(save, intervalMs);
    }, mountDelayMs);
    return () => {
      clearTimeout(mountTimer);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [save, intervalMs, mountDelayMs]);

  return { status, lastSavedAt, saveNow: save };
}
