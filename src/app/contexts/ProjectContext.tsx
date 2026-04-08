import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { logger } from "../utils/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project;
  activeProjectId: string;
  setActiveProject: (id: string) => void;
  createProject: (name: string, opts?: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>) => Project;
  updateProject: (id: string, patch: Partial<Omit<Project, "id" | "createdAt">>) => void;
  deleteProject: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const PROJECT_COLORS = [
  "#6366f1", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
];

/** The legacy RBAC project — fixed ID so existing unnamespaced data migrates to it */
export const LEGACY_PROJECT_ID = "proj_rbac";

const DEFAULT_PROJECT: Project = {
  id:          LEGACY_PROJECT_ID,
  name:        "RBAC / IGA",
  description: "Role-based access control and identity governance requirements",
  color:       PROJECT_COLORS[0],
  createdAt:   "2024-01-01T00:00:00.000Z",
  updatedAt:   new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `proj_${Math.random().toString(36).slice(2, 10)}`;
}

function nextColor(projects: Project[]): string {
  return PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
}

/** Purge all localStorage keys that belong to a given project */
function purgeProjectKeys(projectId: string) {
  const prefix = `-${projectId}`;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith(prefix)) toRemove.push(key);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
  logger.info("ProjectContext", "purgeProjectKeys", { projectId, purged: toRemove.length });
}

/** One-time migration: copy unnamespaced legacy keys → namespaced proj_rbac keys */
function migrateLegacyKeys() {
  const legacyKeys = [
    "rtm-requirements",
    "rtm-epics",
    "rtm-user-stories",
    "rtm-story-map",
    "rtm-story-jam",
    "rtm-frameworks",
    "rtm-vendor-data",
    "rtm-admin-visibility",
  ];
  let migrated = 0;
  for (const key of legacyKeys) {
    const namespaced = `${key}-${LEGACY_PROJECT_ID}`;
    const legacy = localStorage.getItem(key);
    const already = localStorage.getItem(namespaced);
    if (legacy !== null && already === null) {
      localStorage.setItem(namespaced, legacy);
      localStorage.removeItem(key);
      migrated++;
    } else if (legacy !== null && already !== null) {
      // Namespaced already exists — just remove the stale legacy key
      localStorage.removeItem(key);
    }
  }
  if (migrated > 0) {
    logger.info("ProjectContext", "migrateLegacyKeys", { migrated });
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Run migration once synchronously before any context reads storage
  migrateLegacyKeys();

  const [projects, setProjects] = useLocalStorage<Project[]>(
    "rtm-projects",
    [DEFAULT_PROJECT]
  );

  const [activeProjectId, setActiveProjectId] = useLocalStorage<string>(
    "rtm-active-project",
    LEGACY_PROJECT_ID
  );

  // Ensure activeProjectId always points to a real project
  const resolvedId =
    projects.find(p => p.id === activeProjectId)?.id ?? projects[0]?.id ?? LEGACY_PROJECT_ID;

  const activeProject =
    projects.find(p => p.id === resolvedId) ?? DEFAULT_PROJECT;

  const setActiveProject = useCallback((id: string) => {
    logger.info("ProjectContext", "setActiveProject", id);
    setActiveProjectId(id);
  }, [setActiveProjectId]);

  const createProject = useCallback((
    name: string,
    opts?: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>
  ): Project => {
    const now = new Date().toISOString();
    const project: Project = {
      id:          generateId(),
      name,
      description: opts?.description,
      color:       opts?.color ?? nextColor(projects),
      createdAt:   now,
      updatedAt:   now,
    };
    logger.info("ProjectContext", "createProject", project.id, name);
    setProjects(prev => [...prev, project]);
    return project;
  }, [projects, setProjects]);

  const updateProject = useCallback((
    id: string,
    patch: Partial<Omit<Project, "id" | "createdAt">>
  ) => {
    logger.debug("ProjectContext", "updateProject", id);
    setProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
      )
    );
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    if (projects.length <= 1) {
      logger.warn("ProjectContext", "deleteProject", "cannot delete last project");
      return;
    }
    logger.info("ProjectContext", "deleteProject", id);
    purgeProjectKeys(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    // Switch away if we deleted the active project
    if (resolvedId === id) {
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length > 0) setActiveProjectId(remaining[0].id);
    }
  }, [projects, resolvedId, setProjects, setActiveProjectId]);

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      activeProjectId: resolvedId,
      setActiveProject,
      createProject,
      updateProject,
      deleteProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside ProjectProvider");
  return ctx;
}
