/**
 * usePersistToDisk
 *
 * Returns a fire-and-forget function that POSTs data to one of the Vite
 * dev-server middleware endpoints so the in-memory state is flushed to the
 * corresponding `src/app/data/initial-*.ts` file on disk.
 *
 * In production builds (or when the dev server is not running) the call is
 * a no-op — the app continues to work from localStorage as normal.
 */

type Endpoint =
  | '/api/save-epics'
  | '/api/save-requirements'
  | '/api/save-frameworks'
  | '/api/save-vendors'
  | '/api/save-workstreams';

export function usePersistToDisk() {
  /**
   * Persist `payload` to disk via the Vite middleware.
   * Errors are swallowed (the app should never crash because a disk-write
   * failed — localStorage is still the live source of truth).
   */
  function persist(endpoint: Endpoint, payload: Record<string, unknown>): void {
    // Only attempt when running under the Vite dev server
    if (import.meta.env.PROD) return;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently ignore — disk persistence is best-effort in dev
    });
  }

  return persist;
}
