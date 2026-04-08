import { useState, useRef } from "react";
import { Download, Upload, CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Project } from "../contexts/ProjectContext";
import { exportProject, parseProjectBackup, commitProjectBackup, ParsedBackup } from "../utils/projectExport";

// ── Types ──────────────────────────────────────────────────────────────────

type ExportStatus = "idle" | "exporting" | "done" | "error";
type RestoreStatus = "idle" | "parsing" | "confirm" | "restoring" | "done" | "error";

// ── Component ──────────────────────────────────────────────────────────────

export function ProjectDataPanel({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");

  const [restoreStatus, setRestoreStatus]   = useState<RestoreStatus>("idle");
  const [parsedBackup,  setParsedBackup]    = useState<ParsedBackup | null>(null);
  const [restoreError,  setRestoreError]    = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Export ─────────────────────────────────────────────────────────────

  async function handleExport() {
    setExportStatus("exporting");
    try {
      await exportProject(project);
      setExportStatus("done");
      toast.success(`"${project.name}" exported`);
      setTimeout(() => setExportStatus("idle"), 3000);
    } catch (err) {
      setExportStatus("error");
      toast.error("Export failed — " + (err instanceof Error ? err.message : String(err)));
    }
  }

  // ── Restore — step 1: pick file & parse ────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError("");
    setRestoreStatus("parsing");
    setParsedBackup(null);

    try {
      const backup = await parseProjectBackup(file);

      if (backup.warnings.length > 0) {
        backup.warnings.slice(0, 4).forEach(w => toast.warning(w, { duration: 6000 }));
        if (backup.warnings.length > 4) {
          toast.warning(`…and ${backup.warnings.length - 4} more validation issue(s). Those items will be skipped.`, { duration: 6000 });
        }
      }

      setParsedBackup(backup);
      setRestoreStatus("confirm");
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : String(err));
      setRestoreStatus("error");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Restore — step 2: commit ────────────────────────────────────────────

  async function confirmRestore() {
    if (!parsedBackup) return;
    setRestoreStatus("restoring");
    try {
      commitProjectBackup(parsedBackup, project.id);
      setRestoreStatus("done");
      toast.success(`"${project.name}" restored — reloading…`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : String(err));
      setRestoreStatus("error");
    }
  }

  function cancelRestore() {
    setParsedBackup(null);
    setRestoreStatus("idle");
    setRestoreError("");
  }

  // ── Derived display ─────────────────────────────────────────────────────

  const counts = parsedBackup?.manifest?.counts;
  const countSummary = counts
    ? `${counts.requirements ?? "?"} requirements, ${counts.frameworks ?? "?"} frameworks, ${counts.epics ?? "?"} epics`
    : "";

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="border-t border-slate-100 mt-4 pt-3">
      {/* Collapsible toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5" />
          : <ChevronRight className="w-3.5 h-3.5" />}
        Backup &amp; Restore
      </button>

      {expanded && (
        <div className="mt-3 space-y-4">
          {/* ── Export ─────────────────────────────────────────────────── */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700">Export project</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Downloads a ZIP with all JSON data + an Excel file.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exportStatus === "exporting"}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex-shrink-0 ${
                exportStatus === "done"
                  ? "border-green-300 bg-green-50 text-green-700"
                  : exportStatus === "error"
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {exportStatus === "exporting" ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting…</>
              ) : exportStatus === "done" ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Exported</>
              ) : exportStatus === "error" ? (
                <><AlertTriangle className="w-3.5 h-3.5" /> Failed</>
              ) : (
                <><Download className="w-3.5 h-3.5" /> Export</>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* ── Restore ────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700">Restore from backup</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select a ZIP previously exported from this project. All current data
                  for this project will be replaced.
                </p>
                {restoreStatus === "error" && (
                  <p className="text-[11px] text-red-600 mt-1">{restoreError}</p>
                )}
                {restoreStatus === "done" && (
                  <p className="text-[11px] text-green-600 mt-1">Restored — reloading…</p>
                )}
              </div>

              <div className="flex-shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    restoreStatus === "parsing" ||
                    restoreStatus === "restoring" ||
                    restoreStatus === "done"
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  {restoreStatus === "parsing" ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading…</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5" /> Choose ZIP</>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm panel */}
            {restoreStatus === "confirm" && parsedBackup && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-3">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">
                      Replace all data in "{project.name}"?
                    </p>
                    {countSummary && (
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Backup contains: {countSummary}
                      </p>
                    )}
                    {parsedBackup.warnings.length > 0 && (
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        ⚠ {parsedBackup.warnings.length} item(s) failed validation and will be skipped.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={confirmRestore}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={cancelRestore}
                    className="px-3 py-1.5 text-amber-800 hover:bg-amber-100 text-xs font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
