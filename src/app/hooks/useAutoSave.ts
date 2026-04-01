import { useEffect, useRef, useState, useCallback } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  /** How often to auto-save in milliseconds. Default: 5 minutes. */
  intervalMs?: number;
  /** Called immediately on mount and then every intervalMs. Must return the full payload to POST. */
  getPayload: () => Record<string, unknown>;
}

/**
 * Periodically POSTs all context state to `/api/save-all` so data is flushed
 * to disk even when the user hasn't made any recent changes.
 *
 * No-op in production builds.
 */
export function useAutoSave({ intervalMs = 5 * 60 * 1000, getPayload }: UseAutoSaveOptions) {
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

  // Run on mount, then on the interval
  useEffect(() => {
    if (import.meta.env.PROD) return;
    save();
    const id = setInterval(save, intervalMs);
    return () => clearInterval(id);
  }, [save, intervalMs]);

  return { status, lastSavedAt, saveNow: save };
}
