import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useProject } from "./ProjectContext";
import { logger } from "../utils/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Every key that can be hidden in the UI */
export type VisibilityKey =
  // Pages (nav items)
  | "page:requirements"
  | "page:dependencies"
  | "page:hierarchy"
  | "page:story-mapping"
  | "page:epics-stories"
  | "page:frameworks"
  | "page:workstreams"
  | "page:vendor-scorecard"
  | "page:requirement-coverage"
  | "page:vendor-settings"
  | "page:help"
  // Data sections / feature panels
  | "feature:epics"
  | "feature:frameworks"
  | "feature:workstreams"
  | "feature:vendor-integration"
  | "feature:gap-analysis"
  | "feature:story-jam"
  | "feature:dependency-graph"
  | "feature:hierarchy";

export type VisibilityMap = Record<VisibilityKey, boolean>;

/** All keys default to visible (true) */
const DEFAULT_VISIBILITY: VisibilityMap = {
  "page:requirements": true,
  "page:dependencies": true,
  "page:hierarchy": true,
  "page:story-mapping": true,
  "page:epics-stories": true,
  "page:frameworks": true,
  "page:workstreams": true,
  "page:vendor-scorecard": true,
  "page:requirement-coverage": true,
  "page:vendor-settings": true,
  "page:help": true,
  "feature:epics": true,
  "feature:frameworks": true,
  "feature:workstreams": true,
  "feature:vendor-integration": true,
  "feature:gap-analysis": true,
  "feature:story-jam": true,
  "feature:dependency-graph": true,
  "feature:hierarchy": true,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AdminContextType {
  visibility: VisibilityMap;
  /** Returns true if a given key is visible */
  isVisible: (key: VisibilityKey) => boolean;
  /** Toggle a single key */
  toggle: (key: VisibilityKey) => void;
  /** Set a key explicitly */
  set: (key: VisibilityKey, value: boolean) => void;
  /** Reset everything to fully visible */
  resetAll: () => void;
  /** Show all items of a category at once ("page" or "feature") */
  showAll: (category: "page" | "feature") => void;
  /** Hide all items of a category at once */
  hideAll: (category: "page" | "feature") => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AdminProvider({ children }: { children: ReactNode }) {
  const { activeProjectId } = useProject();
  const [visibility, setVisibility] = useLocalStorage<VisibilityMap>(
    `rtm-admin-visibility-${activeProjectId}`,
    DEFAULT_VISIBILITY
  );

  // Merge with defaults so new keys added in future releases become visible
  const merged: VisibilityMap = { ...DEFAULT_VISIBILITY, ...visibility };

  const isVisible = (key: VisibilityKey) => merged[key] ?? true;

  const toggle = (key: VisibilityKey) => {
    logger.debug('AdminContext', 'toggle', key);
    setVisibility((prev) => ({ ...DEFAULT_VISIBILITY, ...prev, [key]: !(prev[key] ?? true) }));
  };

  const set = (key: VisibilityKey, value: boolean) => {
    logger.debug('AdminContext', 'set', key, value);
    setVisibility((prev) => ({ ...DEFAULT_VISIBILITY, ...prev, [key]: value }));
  };

  const resetAll = () => {
    logger.info('AdminContext', 'resetAll');
    setVisibility(DEFAULT_VISIBILITY);
  };

  const showAll = (category: "page" | "feature") => {
    logger.debug('AdminContext', 'showAll', category);
    setVisibility((prev) => {
      const next = { ...DEFAULT_VISIBILITY, ...prev };
      (Object.keys(next) as VisibilityKey[]).forEach((k) => {
        if (k.startsWith(`${category}:`)) next[k] = true;
      });
      return next;
    });
  };

  const hideAll = (category: "page" | "feature") => {
    logger.debug('AdminContext', 'hideAll', category);
    setVisibility((prev) => {
      const next = { ...DEFAULT_VISIBILITY, ...prev };
      (Object.keys(next) as VisibilityKey[]).forEach((k) => {
        // Never hide the requirements page — it's the app home and is protected
        if (k.startsWith(`${category}:`) && k !== "page:requirements") next[k] = false;
      });
      return next;
    });
  };

  return (
    <AdminContext.Provider value={{ visibility: merged, isVisible, toggle, set, resetAll, showAll, hideAll }}>
      {children}
    </AdminContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
