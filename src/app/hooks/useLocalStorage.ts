import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

/**
 * A drop-in replacement for useState that persists the value in localStorage.
 * Serialises/deserialises via JSON. Falls back to the initial value if the
 * stored value is missing or cannot be parsed.
 *
 * Shows a Sonner toast if the write fails (e.g. QuotaExceededError in
 * private browsing mode) so the user knows their change was not persisted.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist to localStorage whenever the value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (err) {
      // Storage quota exceeded or private browsing — notify the user
      const isQuota =
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
      toast.error(
        isQuota
          ? "Storage quota exceeded — your change was not saved. Try clearing browser data or exporting a backup."
          : "Could not save to browser storage — your change may be lost on refresh.",
        { id: `ls-error-${key}`, duration: 6000 }
      );
    }
  }, [key, storedValue]);

  // Stable setter that matches the useState signature (value or updater fn)
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      setStoredValue(value);
    },
    []
  );

  return [storedValue, setValue];
}
