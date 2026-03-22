import React, { createContext, useContext, useState, ReactNode } from "react";
import { Framework, Control } from "../types/framework";
import { initialFrameworks } from "../data/initial-frameworks";

interface FrameworkContextType {
  frameworks: Framework[];
  addFramework: (framework: Framework) => void;
  updateFramework: (id: string, framework: Framework) => void;
  deleteFramework: (id: string) => void;
  addControl: (frameworkId: string, control: Control) => void;
  updateControl: (frameworkId: string, controlId: string, control: Control) => void;
  deleteControl: (frameworkId: string, controlId: string) => void;
  mapRequirementToControl: (frameworkId: string, controlId: string, requirementId: string) => void;
  unmapRequirementFromControl: (
    frameworkId: string,
    controlId: string,
    requirementId: string
  ) => void;
  addRequirementToControl: (frameworkId: string, controlId: string, requirementId: string) => void;
  removeRequirementFromControl: (frameworkId: string, controlId: string, requirementId: string) => void;
  getControlsByFramework: (frameworkId: string) => Control[];
}

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

export const FrameworkProvider = ({ children }: { children: ReactNode }) => {
  const [frameworks, setFrameworks] = useState<Framework[]>(initialFrameworks);

  const addFramework = (framework: Framework) => {
    setFrameworks((prev) => [...prev, framework]);
  };

  const updateFramework = (id: string, framework: Framework) => {
    setFrameworks((prev) => prev.map((f) => (f.id === id ? framework : f)));
  };

  const deleteFramework = (id: string) => {
    setFrameworks((prev) => prev.filter((f) => f.id !== id));
  };

  const addControl = (frameworkId: string, control: Control) => {
    setFrameworks((prev) =>
      prev.map((f) => (f.id === frameworkId ? { ...f, controls: [...f.controls, control] } : f))
    );
  };

  const updateControl = (frameworkId: string, controlId: string, control: Control) => {
    setFrameworks((prev) =>
      prev.map((f) =>
        f.id === frameworkId
          ? { ...f, controls: f.controls.map((c) => (c.id === controlId ? control : c)) }
          : f
      )
    );
  };

  const deleteControl = (frameworkId: string, controlId: string) => {
    setFrameworks((prev) =>
      prev.map((f) =>
        f.id === frameworkId ? { ...f, controls: f.controls.filter((c) => c.id !== controlId) } : f
      )
    );
  };

  const mapRequirementToControl = (
    frameworkId: string,
    controlId: string,
    requirementId: string
  ) => {
    setFrameworks((prev) =>
      prev.map((f) =>
        f.id === frameworkId
          ? {
              ...f,
              controls: f.controls.map((c) =>
                c.id === controlId && !c.requirements.includes(requirementId)
                  ? { ...c, requirements: [...c.requirements, requirementId] }
                  : c
              ),
            }
          : f
      )
    );
  };

  const unmapRequirementFromControl = (
    frameworkId: string,
    controlId: string,
    requirementId: string
  ) => {
    setFrameworks((prev) =>
      prev.map((f) =>
        f.id === frameworkId
          ? {
              ...f,
              controls: f.controls.map((c) =>
                c.id === controlId
                  ? { ...c, requirements: c.requirements.filter((r) => r !== requirementId) }
                  : c
              ),
            }
          : f
      )
    );
  };

  const addRequirementToControl = (
    frameworkId: string,
    controlId: string,
    requirementId: string
  ) => {
    setFrameworks((prev) =>
      prev.map((f) =>
        f.id === frameworkId
          ? {
              ...f,
              controls: f.controls.map((c) =>
                c.id === controlId && !c.requirements.includes(requirementId)
                  ? { ...c, requirements: [...c.requirements, requirementId] }
                  : c
              ),
            }
          : f
      )
    );
  };

  const removeRequirementFromControl = (
    frameworkId: string,
    controlId: string,
    requirementId: string
  ) => {
    setFrameworks((prev) =>
      prev.map((f) =>
        f.id === frameworkId
          ? {
              ...f,
              controls: f.controls.map((c) =>
                c.id === controlId
                  ? { ...c, requirements: c.requirements.filter((r) => r !== requirementId) }
                  : c
              ),
            }
          : f
      )
    );
  };

  const getControlsByFramework = (frameworkId: string): Control[] => {
    const framework = frameworks.find((f) => f.id === frameworkId);
    return framework ? framework.controls : [];
  };

  return (
    <FrameworkContext.Provider
      value={{
        frameworks,
        addFramework,
        updateFramework,
        deleteFramework,
        addControl,
        updateControl,
        deleteControl,
        mapRequirementToControl,
        unmapRequirementFromControl,
        addRequirementToControl,
        removeRequirementFromControl,
        getControlsByFramework,
      }}
    >
      {children}
    </FrameworkContext.Provider>
  );
};

export const useFrameworks = () => {
  const context = useContext(FrameworkContext);
  if (context === undefined) {
    throw new Error("useFrameworks must be used within a FrameworkProvider");
  }
  return context;
};

export default { FrameworkProvider, useFrameworks };