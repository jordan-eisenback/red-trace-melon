import React, { createContext, useContext, useCallback, useEffect } from "react";
import { Requirement } from "../types/requirement";
import { initialRequirements } from "../data/initial-requirements";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePersistToDisk } from "../hooks/usePersistToDisk";
import { logger } from "../utils/logger";

interface RequirementsContextType {
  requirements: Requirement[];
  addRequirement: (requirement: Requirement) => void;
  updateRequirement: (id: string, requirement: Requirement) => void;
  deleteRequirement: (id: string) => void;
  getRequirement: (id: string) => Requirement | undefined;
  getChildren: (parentId: string) => Requirement[];
  getParent: (childId: string) => Requirement | undefined;
}

const RequirementsContext = createContext<RequirementsContextType | undefined>(undefined);

export function RequirementsProvider({ children }: { children: React.ReactNode }) {
  const [requirements, setRequirements] = useLocalStorage<Requirement[]>("rtm-requirements", initialRequirements);
  const persist = usePersistToDisk();

  // Flush to disk whenever requirements change
  useEffect(() => {
    persist('/api/save-requirements', { requirements });
  }, [requirements]); // eslint-disable-line react-hooks/exhaustive-deps

  const addRequirement = useCallback((requirement: Requirement) => {
    logger.debug('RequirementsContext', 'addRequirement', requirement.id);
    setRequirements((prev) => [...prev, requirement]);
  }, []);

  const updateRequirement = useCallback((id: string, requirement: Requirement) => {
    logger.debug('RequirementsContext', 'updateRequirement', id);
    setRequirements((prev) =>
      prev.map((req) => (req.id === id ? requirement : req))
    );
  }, []);

  const deleteRequirement = useCallback((id: string) => {
    logger.debug('RequirementsContext', 'deleteRequirement', id);
    setRequirements((prev) => prev.filter((req) => req.id !== id));
  }, []);

  const getRequirement = useCallback(
    (id: string) => {
      return requirements.find((req) => req.id === id);
    },
    [requirements]
  );

  const getChildren = useCallback(
    (parentId: string) => {
      return requirements.filter((req) => req.parent === parentId);
    },
    [requirements]
  );

  const getParent = useCallback(
    (childId: string) => {
      const child = requirements.find((req) => req.id === childId);
      if (!child || !child.parent) return undefined;
      return requirements.find((req) => req.id === child.parent);
    },
    [requirements]
  );

  return (
    <RequirementsContext.Provider
      value={{
        requirements,
        addRequirement,
        updateRequirement,
        deleteRequirement,
        getRequirement,
        getChildren,
        getParent,
      }}
    >
      {children}
    </RequirementsContext.Provider>
  );
}

export function useRequirements() {
  const context = useContext(RequirementsContext);
  if (!context) {
    throw new Error("useRequirements must be used within RequirementsProvider");
  }
  return context;
}
