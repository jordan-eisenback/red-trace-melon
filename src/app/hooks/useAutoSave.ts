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
 * No-op in production builds.
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
