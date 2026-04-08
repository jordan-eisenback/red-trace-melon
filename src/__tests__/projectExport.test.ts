/**
 * Unit tests for projectExport utilities (closes #95)
 *
 * Tests cover:
 *  - exportProject: correct ZIP structure, namespaced key reads, download trigger
 *  - parseProjectBackup: happy path, v1 manifest compat, bad manifest rejection
 *  - commitProjectBackup: writes namespaced localStorage keys
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import JSZip from "jszip";
import {
  exportProject,
  parseProjectBackup,
  commitProjectBackup,
} from "../app/utils/projectExport";
import type { Project } from "../app/contexts/ProjectContext";

// ── helpers ───────────────────────────────────────────────────────────────────

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj_test1",
    name: "Test Project",
    color: "#6366f1",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

async function buildZip(files: Record<string, unknown>): Promise<File> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(files)) {
    zip.file(name, JSON.stringify(content));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return new File([blob], "backup.zip", { type: "application/zip" });
}

// ── setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();

  // Stub URL / anchor APIs used by the download trigger
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  });

  const mockAnchor = {
    href: "",
    download: "",
    click: vi.fn(),
  };
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "a") return mockAnchor as unknown as HTMLElement;
    return document.createElement(tag);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── exportProject ─────────────────────────────────────────────────────────────

describe("exportProject", () => {
  it("reads namespaced localStorage keys for the project", async () => {
    const project = makeProject();
    const reqs = [{ id: "REQ-1", req: "Test", type: "Enterprise", owner: "Alice", parent: null, outcome: "", notes: "" }];
    localStorage.setItem("rtm-requirements-proj_test1", JSON.stringify(reqs));

    const getSpy = vi.spyOn(Storage.prototype, "getItem");
    await exportProject(project);

    const readKeys = getSpy.mock.calls.map(([k]) => k);
    expect(readKeys).toContain("rtm-requirements-proj_test1");
  });

  it("triggers a browser download (anchor.click called)", async () => {
    const project = makeProject();
    await exportProject(project);
    const mockAnchor = (document.createElement as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it("returns a filename containing the project slug", async () => {
    const project = makeProject({ name: "Zero Trust Access" });
    const { filename } = await exportProject(project);
    expect(filename).toContain("zero-trust-access");
    expect(filename.endsWith(".zip")).toBe(true);
  });

  it("includes manifest.json with version 2 in the ZIP", async () => {
    const project = makeProject();
    // Capture the blob passed to createObjectURL
    let capturedBlob: Blob | undefined;
    (URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return "blob:mock-url";
    });

    await exportProject(project);

    const zip = await JSZip.loadAsync(capturedBlob!);
    const manifestFile = zip.file("manifest.json");
    expect(manifestFile).not.toBeNull();
    const manifest = JSON.parse(await manifestFile!.async("string"));
    expect(manifest.version).toBe(2);
    expect(manifest.projectId).toBe(project.id);
  });

  it("includes project.json in the ZIP", async () => {
    const project = makeProject({ description: "desc" });
    let capturedBlob: Blob | undefined;
    (URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return "blob:mock-url";
    });

    await exportProject(project);

    const zip = await JSZip.loadAsync(capturedBlob!);
    const projectFile = zip.file("project.json");
    expect(projectFile).not.toBeNull();
    const meta = JSON.parse(await projectFile!.async("string"));
    expect(meta.id).toBe(project.id);
    expect(meta.name).toBe(project.name);
  });
});

// ── parseProjectBackup ────────────────────────────────────────────────────────

describe("parseProjectBackup", () => {
  it("parses a valid v2 ZIP successfully", async () => {
    const file = await buildZip({
      "manifest.json": { version: 2, projectId: "proj_test1", exportedAt: new Date().toISOString(), counts: {} },
      "requirements.json": [],
      "frameworks.json": [],
      "epics.json": [],
      "user-stories.json": [],
    });

    const result = await parseProjectBackup(file);
    expect(result.manifest.version).toBe(2);
    expect(Array.isArray(result.requirements)).toBe(true);
    expect(Array.isArray(result.frameworks)).toBe(true);
  });

  it("accepts a v1 manifest (AdminPage compat)", async () => {
    const file = await buildZip({
      "manifest.json": { version: 1, exportedAt: new Date().toISOString(), counts: {} },
      "requirements.json": [],
      "frameworks.json": [],
      "epics.json": [],
      "user-stories.json": [],
    });

    const result = await parseProjectBackup(file);
    expect(result.manifest.version).toBe(1);
  });

  it("throws when manifest is missing", async () => {
    const file = await buildZip({ "requirements.json": [] });
    await expect(parseProjectBackup(file)).rejects.toThrow(/manifest/i);
  });

  it("throws when manifest version is unrecognised", async () => {
    const file = await buildZip({
      "manifest.json": { version: 99 },
      "requirements.json": [],
    });
    await expect(parseProjectBackup(file)).rejects.toThrow(/incompatible/i);
  });

  it("returns warnings for items that fail schema validation", async () => {
    const file = await buildZip({
      "manifest.json": { version: 2, counts: {} },
      // Missing required fields on purpose
      "requirements.json": [{ id: "BAD" }],
      "frameworks.json": [],
      "epics.json": [],
      "user-stories.json": [],
    });

    const result = await parseProjectBackup(file);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("passes through optional data files (story-map, vendor-data, etc.)", async () => {
    const storyMap = { outcomes: [{ id: "out-1", title: "Outcome 1", activities: [] }] };
    const file = await buildZip({
      "manifest.json": { version: 2, counts: {} },
      "requirements.json": [],
      "frameworks.json": [],
      "epics.json": [],
      "user-stories.json": [],
      "story-map.json": storyMap,
    });

    const result = await parseProjectBackup(file);
    expect(result.storyMap).toEqual(storyMap);
  });
});

// ── commitProjectBackup ────────────────────────────────────────────────────────

describe("commitProjectBackup", () => {
  const mockBackup = {
    manifest: { version: 2 as const },
    requirements: [{ id: "REQ-1" }],
    frameworks: [{ id: "FW-1" }],
    epics: [],
    userStories: [],
    storyMap: { outcomes: [] },
    storyJam: null,
    vendorData: undefined,
    warnings: [],
  };

  it("writes requirements to the namespaced key", () => {
    commitProjectBackup(mockBackup, "proj_abc");
    const stored = JSON.parse(localStorage.getItem("rtm-requirements-proj_abc") ?? "null");
    expect(stored).toEqual(mockBackup.requirements);
  });

  it("writes frameworks to the namespaced key", () => {
    commitProjectBackup(mockBackup, "proj_abc");
    const stored = JSON.parse(localStorage.getItem("rtm-frameworks-proj_abc") ?? "null");
    expect(stored).toEqual(mockBackup.frameworks);
  });

  it("writes story-map to the namespaced key", () => {
    commitProjectBackup(mockBackup, "proj_abc");
    const stored = JSON.parse(localStorage.getItem("rtm-story-map-proj_abc") ?? "null");
    expect(stored).toEqual(mockBackup.storyMap);
  });

  it("does NOT write keys whose value is undefined", () => {
    commitProjectBackup(mockBackup, "proj_abc");
    // vendorData is undefined in mockBackup — key should not exist
    expect(localStorage.getItem("rtm-vendor-data-proj_abc")).toBeNull();
  });

  it("uses the provided projectId for all keys", () => {
    commitProjectBackup(mockBackup, "proj_xyz");
    expect(localStorage.getItem("rtm-requirements-proj_xyz")).not.toBeNull();
    expect(localStorage.getItem("rtm-requirements-proj_abc")).toBeNull();
  });
});
