/**
 * projectExport.ts
 *
 * Per-project export and restore helpers.
 * All reads/writes use namespaced localStorage keys: `rtm-*-${projectId}`
 * so data never bleeds between projects.
 */

import JSZip from "jszip";
import { exportToExcel } from "./excelExport";
import { validateRestorePayload } from "./importValidator";
import type { Project } from "../contexts/ProjectContext";

// ── Key map ────────────────────────────────────────────────────────────────
// Must mirror the keys used in each context.

const DATA_KEYS = [
  "rtm-requirements",
  "rtm-epics",
  "rtm-user-stories",
  "rtm-story-map",
  "rtm-story-jam",
  "rtm-frameworks",
  "rtm-vendor-data",
] as const;

type DataKey = (typeof DATA_KEYS)[number];

/** Strip `rtm-` prefix for use as filenames inside the ZIP */
function keyToFilename(key: DataKey): string {
  return `${key.replace(/^rtm-/, "")}.json`;
}

/** Namespaced localStorage key for a project */
function nsKey(key: DataKey, projectId: string): string {
  return `${key}-${projectId}`;
}

// ── Export ─────────────────────────────────────────────────────────────────

export interface ExportProjectResult {
  filename: string;
}

export async function exportProject(project: Project): Promise<ExportProjectResult> {
  const zip = new JSZip();
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32);

  // Collect raw data from namespaced localStorage keys
  const rawData: Partial<Record<DataKey, unknown>> = {};
  for (const key of DATA_KEYS) {
    const raw = localStorage.getItem(nsKey(key, project.id));
    rawData[key] = raw ? JSON.parse(raw) : [];
  }

  // JSON files
  for (const key of DATA_KEYS) {
    zip.file(keyToFilename(key), JSON.stringify(rawData[key] ?? [], null, 2));
  }

  // Project metadata
  zip.file(
    "project.json",
    JSON.stringify(
      {
        id:          project.id,
        name:        project.name,
        description: project.description,
        color:       project.color,
        createdAt:   project.createdAt,
        exportedAt:  new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  // Manifest (for restore validation)
  const requirements = Array.isArray(rawData["rtm-requirements"]) ? rawData["rtm-requirements"] as unknown[] : [];
  const frameworks   = Array.isArray(rawData["rtm-frameworks"])   ? rawData["rtm-frameworks"]   as unknown[] : [];
  const epics        = Array.isArray(rawData["rtm-epics"])        ? rawData["rtm-epics"]         as unknown[] : [];
  const userStories  = Array.isArray(rawData["rtm-user-stories"]) ? rawData["rtm-user-stories"]  as unknown[] : [];

  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        version:    2,
        projectId:  project.id,
        exportedAt: new Date().toISOString(),
        counts: {
          requirements: requirements.length,
          frameworks:   frameworks.length,
          epics:        epics.length,
          userStories:  userStories.length,
        },
      },
      null,
      2,
    ),
  );

  // Excel export
  try {
    const xlsxDataUrl = await exportToExcel({
      requirements: requirements as Parameters<typeof exportToExcel>[0]["requirements"],
      frameworks:   frameworks   as Parameters<typeof exportToExcel>[0]["frameworks"],
      epics:        epics        as Parameters<typeof exportToExcel>[0]["epics"],
      userStories:  userStories  as Parameters<typeof exportToExcel>[0]["userStories"],
    });
    const base64 = xlsxDataUrl.split(",")[1];
    zip.file("rtm-export.xlsx", base64, { base64: true });
  } catch {
    // Excel failure is non-fatal — continue without it
  }

  // Trigger download
  const blob = await zip.generateAsync({ type: "blob" });
  const filename = `rtm-${slug}-${ts}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return { filename };
}

// ── Restore ────────────────────────────────────────────────────────────────

export interface ParsedBackup {
  /** Manifest from the ZIP */
  manifest: {
    version: number;
    projectId?: string;
    exportedAt?: string;
    counts?: Record<string, number>;
  };
  /** Validated + cleaned data ready to commit */
  requirements: unknown[];
  frameworks:   unknown[];
  epics:        unknown[];
  userStories:  unknown[];
  storyMap:     unknown;
  storyJam:     unknown;
  vendorData:   unknown;
  /** Validation warnings (items that were stripped) */
  warnings: string[];
}

/**
 * Read a ZIP file and validate its contents.
 * Supports both v1 (global, from AdminPage) and v2 (per-project) manifests.
 * Throws on fatal errors (missing manifest, wrong version).
 */
export async function parseProjectBackup(file: File): Promise<ParsedBackup> {
  const zip = await JSZip.loadAsync(file);

  async function readJson(name: string): Promise<unknown> {
    const f = zip.file(name);
    if (!f) return undefined;
    return JSON.parse(await f.async("string"));
  }

  const manifest = (await readJson("manifest.json")) as ParsedBackup["manifest"] | undefined;
  if (!manifest || (manifest.version !== 1 && manifest.version !== 2)) {
    throw new Error(
      "File does not appear to be a valid RTM backup (missing or incompatible manifest).",
    );
  }

  const rawRequirements = await readJson("requirements.json");
  const rawFrameworks   = await readJson("frameworks.json");
  const rawEpics        = await readJson("epics.json");
  const rawUserStories  = await readJson("user-stories.json");

  const validation = validateRestorePayload({
    requirements: rawRequirements,
    frameworks:   rawFrameworks,
    epics:        rawEpics,
    userStories:  rawUserStories,
  });

  return {
    manifest,
    requirements: validation.requirements,
    frameworks:   validation.frameworks,
    epics:        validation.epics,
    userStories:  validation.userStories,
    storyMap:     await readJson("story-map.json"),
    storyJam:     await readJson("story-jam.json"),
    vendorData:   await readJson("vendor-data.json"),
    warnings:     validation.errors,
  };
}

/**
 * Write a parsed backup into the namespaced localStorage keys for a project.
 * Does NOT reload the page — callers should do that if needed.
 */
export function commitProjectBackup(backup: ParsedBackup, projectId: string): void {
  const map: Array<[DataKey, unknown]> = [
    ["rtm-requirements", backup.requirements],
    ["rtm-frameworks",   backup.frameworks],
    ["rtm-epics",        backup.epics],
    ["rtm-user-stories", backup.userStories],
    ["rtm-story-map",    backup.storyMap],
    ["rtm-story-jam",    backup.storyJam],
    ["rtm-vendor-data",  backup.vendorData],
  ];

  for (const [key, value] of map) {
    if (value !== undefined) {
      localStorage.setItem(nsKey(key, projectId), JSON.stringify(value));
    }
  }
}
