import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";

/**
 * A drop-in replacement for useState that persists the value in localStorage.
 * Serialises/deserialises via JSON. Falls back to the initial value if the
 * stored value is missing or cannot be parsed.
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
    } catch {
      // Storage quota exceeded or private browsing — silently ignore
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
