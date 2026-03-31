import { createContext, useContext, useCallback, ReactNode } from "react";
import { Framework, Control } from "../types/framework";
import { initialFrameworks } from "../data/initial-frameworks";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface FrameworkContextType {
  frameworks: Framework[];
  addFramework: (framework: Framework) => void;
  updateFramework: (id: string, framework: Framework) => void;
  deleteFramework: (id: string) => void;
  addControl: (frameworkId: string, control: Control) => void;
  updateControl: (frameworkId: string, controlId: string, control: Control) => void;
  deleteControl: (frameworkId: string, controlId: string) => void;
  addRequirementToControl: (frameworkId: string, controlId: string, requirementId: string) => void;
  removeRequirementFromControl: (frameworkId: string, controlId: string, requirementId: string) => void;
  getControlsByFramework: (frameworkId: string) => Control[];
}

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

export const FrameworkProvider = ({ children }: { children: ReactNode }) => {
  const [frameworks, setFrameworks] = useLocalStorage<Framework[]>("rtm-frameworks", initialFrameworks);

  const addFramework = useCallback((framework: Framework) => {
    setFrameworks((prev) => [...prev, framework]);
  }, []);

  const updateFramework = useCallback((id: string, framework: Framework) => {
    setFrameworks((prev) => prev.map((f) => (f.id === id ? framework : f)));
  }, []);

  const deleteFramework = useCallback((id: string) => {
    setFrameworks((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addControl = useCallback((frameworkId: string, control: Control) => {
    setFrameworks((prev) =>
      prev.map((f) => (f.id === frameworkId ? { ...f, controls: [...f.controls, control] } : f))
    );
  }, []);

  const updateControl = useCallback((frameworkId: string, controlId: string, control: Control) => {
    setFrameworks((prev) =>
      prev.map((f) =>
        f.id === frameworkId
          ? { ...f, controls: f.controls.map((c) => (c.id === controlId ? control : c)) }
          : f
      )
    );
  }, []);

  const deleteControl = useCallback((frameworkId: string, controlId: string) => {
    setFrameworks((prev) =>
      prev.map((f) =>
        f.id === frameworkId ? { ...f, controls: f.controls.filter((c) => c.id !== controlId) } : f
      )
    );
  }, []);

  const addRequirementToControl = useCallback((
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
  }, []);

  const removeRequirementFromControl = useCallback((
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
  }, []);

  const getControlsByFramework = useCallback((frameworkId: string): Control[] => {
    const framework = frameworks.find((f) => f.id === frameworkId);
    return framework ? framework.controls : [];
  }, [frameworks]);

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