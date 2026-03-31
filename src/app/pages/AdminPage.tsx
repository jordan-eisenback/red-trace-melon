import { useState, useRef } from "react";
import {
  Eye,
  EyeOff,
  RotateCcw,
  List,
  Network,
  FolderTree,
  Map,
  Layers,
  Shield,
  GitBranch,
  Star,
  Target,
  Settings,
  HelpCircle,
  AlertTriangle,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  CheckCircle2,
} from "lucide-react";
import JSZip from "jszip";
import { useAdmin, VisibilityKey } from "../contexts/AdminContext";
import { useRequirements } from "../contexts/RequirementsContext";
import { useEpics } from "../contexts/EpicContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { useVendor } from "../contexts/VendorContext";
import { exportToExcel } from "../utils/excelExport";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

// ---------------------------------------------------------------------------
// Data Management — Export All + Restore
// ---------------------------------------------------------------------------

interface RestorePayload {
  requirements?: unknown;
  frameworks?: unknown;
  epics?: unknown;
  userStories?: unknown;
  storyMap?: unknown;
  storyJam?: unknown;
  vendorData?: unknown;
  workstreams?: unknown;
}

function DataManagementSection() {
  const { requirements } = useRequirements();
  const { epics, userStories, storyMap, storyJam } = useEpics();
  const { frameworks } = useFrameworks();
  const { data: vendorData } = useVendor();

  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done' | 'error'>('idle');
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'validating' | 'confirm' | 'restoring' | 'done' | 'error'>('idle');
  const [restorePayload, setRestorePayload] = useState<RestorePayload | null>(null);
  const [restoreError, setRestoreError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Export ──────────────────────────────────────────────────────────────

  async function handleExportAll() {
    setExportStatus('exporting');
    try {
      const zip = new JSZip();
      const ts = new Date().toISOString().replace(/[:.]/g, '-');

      // JSON data files
      zip.file('requirements.json', JSON.stringify(requirements, null, 2));
      zip.file('frameworks.json', JSON.stringify(frameworks, null, 2));
      zip.file('epics.json', JSON.stringify(epics, null, 2));
      zip.file('user-stories.json', JSON.stringify(userStories, null, 2));
      zip.file('story-map.json', JSON.stringify(storyMap, null, 2));
      zip.file('story-jam.json', JSON.stringify(storyJam, null, 2));
      zip.file('vendor-data.json', JSON.stringify(vendorData, null, 2));

      // Manifest for restore validation
      zip.file('manifest.json', JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        counts: {
          requirements: requirements.length,
          frameworks: frameworks.length,
          epics: epics.length,
          userStories: userStories.length,
        },
      }, null, 2));

      // Excel export
      const xlsxDataUrl = await exportToExcel({ requirements, frameworks, epics, userStories });
      const base64 = xlsxDataUrl.split(',')[1];
      zip.file('rtm-export.xlsx', base64, { base64: true });

      // Download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rtm-backup-${ts}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (_err) {
      setExportStatus('error');
    }
  }

  // ── Restore ─────────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreError('');
    setRestoreStatus('validating');

    try {
      const zip = await JSZip.loadAsync(file);

      async function readJson(name: string): Promise<unknown> {
        const f = zip.file(name);
        if (!f) return undefined;
        return JSON.parse(await f.async('string'));
      }

      const manifest = await readJson('manifest.json') as { version?: number } | undefined;
      if (!manifest || manifest.version !== 1) {
        throw new Error('File does not appear to be a valid RTM backup (missing or incompatible manifest).');
      }

      const payload: RestorePayload = {
        requirements:  await readJson('requirements.json'),
        frameworks:    await readJson('frameworks.json'),
        epics:         await readJson('epics.json'),
        userStories:   await readJson('user-stories.json'),
        storyMap:      await readJson('story-map.json'),
        storyJam:      await readJson('story-jam.json'),
        vendorData:    await readJson('vendor-data.json'),
      };

      setRestorePayload(payload);
      setRestoreStatus('confirm');
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : String(err));
      setRestoreStatus('error');
    }

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function confirmRestore() {
    if (!restorePayload) return;
    setRestoreStatus('restoring');
    try {
      // Push to disk via save-all endpoint (dev only — no-op in prod)
      if (!import.meta.env.PROD) {
        await fetch('/api/save-all', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(restorePayload),
        });
      }
      // Repopulate localStorage keys so contexts pick up the new data on reload
      const map: Record<string, unknown> = {
        'rtm-requirements': restorePayload.requirements,
        'rtm-frameworks':   restorePayload.frameworks,
        'rtm-epics':        restorePayload.epics,
        'rtm-user-stories': restorePayload.userStories,
        'rtm-story-map':    restorePayload.storyMap,
        'rtm-story-jam':    restorePayload.storyJam,
        'rtm-vendor-data':  restorePayload.vendorData,
      };
      for (const [key, value] of Object.entries(map)) {
        if (value !== undefined) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
      setRestoreStatus('done');
      // Reload the page so all contexts re-initialise from the restored localStorage
      setTimeout(() => window.location.reload(), 1200);
    } catch (_err) {
      setRestoreError('Restore failed. Your data has not been changed.');
      setRestoreStatus('error');
    }
  }

  const manifestCounts = restorePayload
    ? `${Array.isArray(restorePayload.requirements) ? restorePayload.requirements.length : '?'} requirements, ${Array.isArray(restorePayload.frameworks) ? restorePayload.frameworks.length : '?'} frameworks, ${Array.isArray(restorePayload.epics) ? restorePayload.epics.length : '?'} epics`
    : '';

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Data Management</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Export all data as a ZIP archive for safekeeping, or restore from a previous export.
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Export */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Export All Data</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Downloads a ZIP containing all data as JSON files plus an Excel export.
              Use this as a backup in case your laptop is lost or browser storage is cleared.
            </p>
          </div>
          <Button
            onClick={handleExportAll}
            disabled={exportStatus === 'exporting'}
            variant={exportStatus === 'done' ? 'outline' : 'default'}
            size="sm"
            className="shrink-0"
          >
            {exportStatus === 'exporting' ? (
              'Exporting…'
            ) : exportStatus === 'done' ? (
              <><CheckCircle2 className="size-3.5 mr-1.5 text-green-600" />Exported</>
            ) : exportStatus === 'error' ? (
              'Export failed — retry'
            ) : (
              <><Download className="size-3.5 mr-1.5" />Export All</>
            )}
          </Button>
        </div>

        <Separator />

        {/* Restore */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Restore from Backup</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Select a ZIP file previously exported from this tool. All current data will be
              replaced after confirmation.
            </p>
            {restoreStatus === 'error' && (
              <p className="text-xs text-red-600 mt-1">{restoreError}</p>
            )}
            {restoreStatus === 'done' && (
              <p className="text-xs text-green-600 mt-1">Restored successfully — reloading…</p>
            )}
          </div>
          <div className="shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={restoreStatus === 'validating' || restoreStatus === 'restoring' || restoreStatus === 'done'}
              variant="outline"
              size="sm"
            >
              {restoreStatus === 'validating' ? (
                'Validating…'
              ) : restoreStatus === 'restoring' ? (
                'Restoring…'
              ) : (
                <><Upload className="size-3.5 mr-1.5" />Restore…</>
              )}
            </Button>
          </div>
        </div>

        {/* Restore confirmation dialog */}
        {restoreStatus === 'confirm' && restorePayload && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Replace all current data?</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  The backup contains: <strong>{manifestCounts}</strong>.
                  This will overwrite everything currently in the app and reload the page.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={confirmRestore}>
                Yes, restore
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRestoreStatus('idle');
                  setRestorePayload(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section config
// ---------------------------------------------------------------------------

interface VisibilityItem {
  key: VisibilityKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** If true, hiding this may make some routes unreachable */
  protected?: boolean;
}

const PAGE_ITEMS: VisibilityItem[] = [
  {
    key: "page:requirements",
    label: "Requirements List",
    description: "Main RTM table — home page",
    icon: List,
    protected: true,
  },
  {
    key: "page:dependencies",
    label: "Dependencies",
    description: "Bidirectional dependency graph between requirements",
    icon: Network,
  },
  {
    key: "page:hierarchy",
    label: "Hierarchy",
    description: "Tree-based requirement hierarchy view",
    icon: FolderTree,
  },
  {
    key: "page:story-mapping",
    label: "Story Mapping",
    description: "User story map — outcomes, activities, and steps",
    icon: Map,
  },
  {
    key: "page:epics-stories",
    label: "Epics & Stories",
    description: "Epic and user story management board",
    icon: Layers,
  },
  {
    key: "page:frameworks",
    label: "Frameworks & Controls",
    description: "Compliance frameworks, controls, and gap analysis",
    icon: Shield,
  },
  {
    key: "page:workstreams",
    label: "Workstreams",
    description: "Workstream planning and requirement grouping",
    icon: GitBranch,
  },
  {
    key: "page:vendor-scorecard",
    label: "Vendor Scorecard",
    description: "Score vendors against evaluation criteria",
    icon: Star,
  },
  {
    key: "page:requirement-coverage",
    label: "Req. Coverage",
    description: "Map requirements to vendor evaluation criteria",
    icon: Target,
  },
  {
    key: "page:vendor-settings",
    label: "Vendor Settings",
    description: "Vendors, evaluators, criteria profiles, and weighting",
    icon: Settings,
  },
  {
    key: "page:help",
    label: "Help Center",
    description: "Documentation and keyboard shortcuts reference",
    icon: HelpCircle,
  },
];

const FEATURE_ITEMS: VisibilityItem[] = [
  {
    key: "feature:epics",
    label: "Epics",
    description: "Epic cards and assignment in the Epics & Stories page",
    icon: Layers,
  },
  {
    key: "feature:frameworks",
    label: "Compliance Frameworks",
    description: "Framework panels in Frameworks & Controls",
    icon: Shield,
  },
  {
    key: "feature:workstreams",
    label: "Workstream Assignments",
    description: "Workstream column in Requirements List",
    icon: GitBranch,
  },
  {
    key: "feature:vendor-integration",
    label: "Vendor Integration",
    description: "Vendor coverage section in Requirement Detail",
    icon: Star,
  },
  {
    key: "feature:gap-analysis",
    label: "Gap Analysis Panel",
    description: "Coverage gap sidebar in Frameworks & Controls",
    icon: AlertTriangle,
  },
  {
    key: "feature:story-jam",
    label: "Story Jam Board",
    description: "Free-form story board tab inside Epics & Stories",
    icon: LayoutGrid,
  },
  {
    key: "feature:dependency-graph",
    label: "Dependency Graph",
    description: "Dependency visualisation panel in Requirement Detail",
    icon: Network,
  },
  {
    key: "feature:hierarchy",
    label: "Hierarchy View",
    description: "Hierarchy tree panel in Requirement Detail",
    icon: FolderTree,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  description: string;
  category: "page" | "feature";
  items: VisibilityItem[];
}

function VisibilitySection({ title, description, category, items }: SectionProps) {
  const { isVisible, toggle, showAll, hideAll } = useAdmin();
  const [expanded, setExpanded] = useState(true);

  const visibleCount = items.filter((i) => isVisible(i.key)).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Badge variant={visibleCount === items.length ? "default" : "secondary"}>
            {visibleCount}/{items.length} visible
          </Badge>
          {expanded ? (
            <ChevronDown className="size-4 text-gray-400" />
          ) : (
            <ChevronRight className="size-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <>
          {/* Bulk actions */}
          <div className="px-5 pb-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => showAll(category)}>
              <Eye className="size-3.5 mr-1.5" /> Show all
            </Button>
            <Button variant="outline" size="sm" onClick={() => hideAll(category)}>
              <EyeOff className="size-3.5 mr-1.5" /> Hide all
            </Button>
          </div>

          <Separator />

          {/* Item rows */}
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const Icon = item.icon;
              const visible = isVisible(item.key);
              return (
                <li key={item.key} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className={`p-2 rounded-lg ${
                      visible ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          visible ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.protected && (
                        <Badge variant="outline" className="text-xs">
                          protected
                        </Badge>
                      )}
                      {!visible && (
                        <Badge variant="secondary" className="text-xs">
                          hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                  </div>
                  <Switch
                    checked={visible}
                    onCheckedChange={() => toggle(item.key)}
                    aria-label={`Toggle visibility of ${item.label}`}
                    disabled={item.protected && visible}
                    title={
                      item.protected && visible
                        ? "The Requirements List is the app home page and cannot be hidden"
                        : undefined
                    }
                    className={item.protected && visible ? "cursor-not-allowed opacity-50" : ""}
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const { resetAll, visibility } = useAdmin();

  const hiddenCount = Object.values(visibility).filter((v) => !v).length;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Control which pages and features are visible in the navigation and throughout the app.
            Changes are saved automatically to your browser.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hiddenCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              {hiddenCount} hidden
            </Badge>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="size-3.5 mr-1.5" />
                Reset all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset visibility settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will make all pages and features visible again. Your requirements,
                  frameworks, epics, and vendor data will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAll}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Warning banner when items are hidden */}
      {hiddenCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{hiddenCount} item{hiddenCount !== 1 ? "s are" : " is"} currently hidden.</strong>{" "}
            Hidden pages are removed from the navigation bar but their routes remain accessible by
            direct URL.
          </p>
        </div>
      )}

      {/* Data Management — export + restore */}
      <DataManagementSection />

      {/* Pages section */}
      <VisibilitySection
        title="Pages"
        description="Control which pages appear in the top navigation bar."
        category="page"
        items={PAGE_ITEMS}
      />

      {/* Features section */}
      <VisibilitySection
        title="Features & Panels"
        description="Control which feature sections are rendered within pages."
        category="feature"
        items={FEATURE_ITEMS}
      />

      {/* Info footer */}
      <p className="text-xs text-gray-400 pb-4">
        Settings are stored in <code className="font-mono">localStorage</code> under{" "}
        <code className="font-mono">rtm-admin-visibility</code> and persist across sessions in this
        browser.
      </p>
    </div>
  );
}
