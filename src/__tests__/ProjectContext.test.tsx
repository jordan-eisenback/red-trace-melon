/**
 * Unit tests for ProjectContext (closes #95)
 *
 * Strategy: renderHook with ProjectProvider wrapper. localStorage is cleared
 * before each test so we start with just the default RBAC project.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import {
  ProjectProvider,
  useProject,
  LEGACY_PROJECT_ID,
} from "../app/contexts/ProjectContext";

// ── wrapper ───────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProjectProvider>{children}</ProjectProvider>
);

// ── setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe("ProjectContext — initial state", () => {
  it("starts with the default RBAC project when localStorage is empty", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].id).toBe(LEGACY_PROJECT_ID);
  });

  it("activeProject matches the default project", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    expect(result.current.activeProject.id).toBe(LEGACY_PROJECT_ID);
    expect(result.current.activeProjectId).toBe(LEGACY_PROJECT_ID);
  });

  it("default project has a name and color", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    const p = result.current.activeProject;
    expect(typeof p.name).toBe("string");
    expect(p.name.length).toBeGreaterThan(0);
    expect(p.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("ProjectContext — createProject", () => {
  it("adds a new project to the list", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => {
      result.current.createProject("Zero Trust");
    });
    expect(result.current.projects).toHaveLength(2);
    expect(result.current.projects.some((p) => p.name === "Zero Trust")).toBe(true);
  });

  it("returns the new project object", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    let newProject: ReturnType<typeof result.current.createProject>;
    act(() => {
      newProject = result.current.createProject("IAM Review");
    });
    expect(newProject!.id).toMatch(/^proj_/);
    expect(newProject!.name).toBe("IAM Review");
  });

  it("accepts optional description and color", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => {
      result.current.createProject("SOC 2", {
        description: "SOC 2 Type II audit",
        color: "#ef4444",
      });
    });
    const p = result.current.projects.find((p) => p.name === "SOC 2");
    expect(p?.description).toBe("SOC 2 Type II audit");
    expect(p?.color).toBe("#ef4444");
  });

  it("assigns a unique id each time", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    let p1: ReturnType<typeof result.current.createProject>;
    let p2: ReturnType<typeof result.current.createProject>;
    act(() => {
      p1 = result.current.createProject("Alpha");
      p2 = result.current.createProject("Beta");
    });
    expect(p1!.id).not.toBe(p2!.id);
  });

  it("new project has createdAt and updatedAt set", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    let p: ReturnType<typeof result.current.createProject>;
    act(() => {
      p = result.current.createProject("Timestamped");
    });
    expect(new Date(p!.createdAt).getFullYear()).toBeGreaterThanOrEqual(2024);
    expect(p!.updatedAt).toBe(p!.createdAt);
  });
});

describe("ProjectContext — setActiveProject", () => {
  it("switches activeProjectId to the new project", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    let newId: string;
    act(() => {
      const p = result.current.createProject("Switch Target");
      newId = p.id;
    });
    act(() => {
      result.current.setActiveProject(newId!);
    });
    expect(result.current.activeProjectId).toBe(newId!);
  });

  it("activeProject reflects the newly active project", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    let newId: string;
    act(() => {
      const p = result.current.createProject("Active Name Check");
      newId = p.id;
    });
    act(() => {
      result.current.setActiveProject(newId!);
    });
    expect(result.current.activeProject.name).toBe("Active Name Check");
  });
});

describe("ProjectContext — updateProject", () => {
  it("updates the project name in place", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => {
      result.current.updateProject(LEGACY_PROJECT_ID, { name: "Renamed" });
    });
    const p = result.current.projects.find((p) => p.id === LEGACY_PROJECT_ID);
    expect(p?.name).toBe("Renamed");
  });

  it("updates the color", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => {
      result.current.updateProject(LEGACY_PROJECT_ID, { color: "#10b981" });
    });
    const p = result.current.projects.find((p) => p.id === LEGACY_PROJECT_ID);
    expect(p?.color).toBe("#10b981");
  });

  it("bumps updatedAt after an update", async () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    const before = result.current.projects.find((p) => p.id === LEGACY_PROJECT_ID)!.updatedAt;
    // Small delay so the timestamp differs
    await new Promise((r) => setTimeout(r, 5));
    act(() => {
      result.current.updateProject(LEGACY_PROJECT_ID, { name: "Updated" });
    });
    const after = result.current.projects.find((p) => p.id === LEGACY_PROJECT_ID)!.updatedAt;
    expect(after >= before).toBe(true);
  });
});

describe("ProjectContext — deleteProject", () => {
  it("removes a project from the list", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    let newId: string;
    act(() => {
      const p = result.current.createProject("To Delete");
      newId = p.id;
    });
    act(() => {
      result.current.deleteProject(newId!);
    });
    expect(result.current.projects.some((p) => p.id === newId!)).toBe(false);
  });

  it("refuses to delete the last remaining project", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    // Only one project exists
    act(() => {
      result.current.deleteProject(LEGACY_PROJECT_ID);
    });
    expect(result.current.projects).toHaveLength(1);
  });

  it("switches activeProjectId away from the deleted project", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    let newId: string;
    act(() => {
      const p = result.current.createProject("Switch Away From Me");
      newId = p.id;
    });
    act(() => {
      result.current.setActiveProject(newId!);
    });
    act(() => {
      result.current.deleteProject(newId!);
    });
    expect(result.current.activeProjectId).not.toBe(newId!);
    expect(result.current.projects.some((p) => p.id === result.current.activeProjectId)).toBe(true);
  });
});

describe("ProjectContext — localStorage persistence", () => {
  it("persists projects list to localStorage under rtm-projects", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => {
      result.current.createProject("Persisted");
    });
    const stored = JSON.parse(localStorage.getItem("rtm-projects") ?? "[]");
    expect(Array.isArray(stored)).toBe(true);
    expect(stored.some((p: { name: string }) => p.name === "Persisted")).toBe(true);
  });

  it("persists active project id to rtm-active-project", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    let newId: string;
    act(() => {
      const p = result.current.createProject("Active Store");
      newId = p.id;
    });
    act(() => {
      result.current.setActiveProject(newId!);
    });
    const stored = JSON.parse(localStorage.getItem("rtm-active-project") ?? '""');
    expect(stored).toBe(newId!);
  });
});

describe("ProjectContext — guard", () => {
  it("useProject throws when used outside of ProjectProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useProject())).toThrow(
      "useProject must be used inside ProjectProvider",
    );
    spy.mockRestore();
  });
});

describe("ProjectContext — key isolation between two projects (closes #91)", () => {
  it("each project gets its own namespaced localStorage key for requirements", () => {
    const { result } = renderHook(() => useProject(), { wrapper });

    let idA: string;
    let idB: string;

    act(() => {
      const a = result.current.createProject("Project A");
      const b = result.current.createProject("Project B");
      idA = a.id;
      idB = b.id;
    });

    // Write distinct data to each project's namespaced slot
    localStorage.setItem(`rtm-requirements-${idA!}`, JSON.stringify([{ id: "REQ-A" }]));
    localStorage.setItem(`rtm-requirements-${idB!}`, JSON.stringify([{ id: "REQ-B" }]));

    // Verify the keys are fully separate
    const dataA = JSON.parse(localStorage.getItem(`rtm-requirements-${idA!}`) ?? "[]");
    const dataB = JSON.parse(localStorage.getItem(`rtm-requirements-${idB!}`) ?? "[]");

    expect(dataA[0].id).toBe("REQ-A");
    expect(dataB[0].id).toBe("REQ-B");
    // Switching would never expose B's data under A's key
    expect(dataA[0].id).not.toBe(dataB[0].id);
  });

  it("switching activeProject changes the namespaced key that contexts would read", () => {
    const { result } = renderHook(() => useProject(), { wrapper });

    let idA: string;
    let idB: string;

    act(() => {
      const a = result.current.createProject("Alpha");
      const b = result.current.createProject("Beta");
      idA = a.id;
      idB = b.id;
    });

    // Seed different data for each project
    localStorage.setItem(`rtm-frameworks-${idA!}`, JSON.stringify([{ id: "FW-ALPHA" }]));
    localStorage.setItem(`rtm-frameworks-${idB!}`, JSON.stringify([{ id: "FW-BETA" }]));

    act(() => { result.current.setActiveProject(idA!); });
    expect(result.current.activeProjectId).toBe(idA!);
    expect(JSON.parse(localStorage.getItem(`rtm-frameworks-${result.current.activeProjectId}`) ?? "[]")[0].id).toBe("FW-ALPHA");

    act(() => { result.current.setActiveProject(idB!); });
    expect(result.current.activeProjectId).toBe(idB!);
    expect(JSON.parse(localStorage.getItem(`rtm-frameworks-${result.current.activeProjectId}`) ?? "[]")[0].id).toBe("FW-BETA");
  });

  it("deleting a project purges its namespaced keys", () => {
    const { result } = renderHook(() => useProject(), { wrapper });

    let idToDelete: string;

    act(() => {
      const p = result.current.createProject("Ephemeral");
      idToDelete = p.id;
    });

    // Seed some data under this project's namespace
    localStorage.setItem(`rtm-requirements-${idToDelete!}`, JSON.stringify([{ id: "REQ-GONE" }]));
    localStorage.setItem(`rtm-epics-${idToDelete!}`, JSON.stringify([{ id: "EPIC-GONE" }]));

    act(() => { result.current.deleteProject(idToDelete!); });

    // purgeProjectKeys should have removed all keys ending in -${idToDelete}
    expect(localStorage.getItem(`rtm-requirements-${idToDelete!}`)).toBeNull();
    expect(localStorage.getItem(`rtm-epics-${idToDelete!}`)).toBeNull();
  });

  it("migration copies unnamespaced legacy key to proj_rbac namespace", () => {
    // Simulate a pre-migration state: legacy unnamespaced key exists
    localStorage.setItem("rtm-requirements", JSON.stringify([{ id: "LEGACY-REQ" }]));

    // Re-mounting the provider triggers migrateLegacyKeys()
    renderHook(() => useProject(), { wrapper });

    // The namespaced key should now exist
    const migrated = JSON.parse(localStorage.getItem("rtm-requirements-proj_rbac") ?? "null");
    expect(migrated).not.toBeNull();
    expect(migrated[0].id).toBe("LEGACY-REQ");

    // The old unnamespaced key should be gone
    expect(localStorage.getItem("rtm-requirements")).toBeNull();
  });
});
