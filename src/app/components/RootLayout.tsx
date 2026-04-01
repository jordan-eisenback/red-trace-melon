import { Outlet, Link, useLocation } from "react-router";
import { List, Network, FolderTree, Plus, Map, Layers, Shield, HelpCircle, GitBranch, Star, Target, Settings, SlidersHorizontal, Save, CloudOff } from "lucide-react";
import { useState, useEffect } from "react";
import { RequirementFormDialog } from "./RequirementFormDialog";
import { ToastProvider } from "./Toast";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { Breadcrumbs } from "./Breadcrumbs";
import { WelcomeModal } from "./WelcomeModal";
import { ProductTour } from "./ProductTour";
import { TooltipsGuide } from "./TooltipsGuide";
import { toast } from "sonner";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAdmin, VisibilityKey } from "../contexts/AdminContext";
import { useRequirements } from "../contexts/RequirementsContext";
import { useEpics } from "../contexts/EpicContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { useVendor } from "../contexts/VendorContext";
import { useAutoSave } from "../hooks/useAutoSave";

/** Returns a human-readable relative time string like "2 min ago" or "just now". */
function formatRelative(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function RootLayout() {
  const location = useLocation();
  const { isVisible } = useAdmin();
  const { requirements } = useRequirements();
  const { epics, userStories, storyMap, storyJam } = useEpics();
  const { frameworks } = useFrameworks();
  const { data: vendorData } = useVendor();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showTooltipsGuide, setShowTooltipsGuide] = useState(false);

  const { status: saveStatus, lastSavedAt, saveNow } = useAutoSave({
    intervalMs: 5 * 60 * 1000,
    getPayload: () => ({ requirements, epics, userStories, storyMap, storyJam, frameworks, vendorData }),
  });

  // Ticker so the "Saved N min ago" label refreshes every 30 s
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem("rtm-has-visited");
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem("rtm-has-visited", "true");
    }
  }, []);

  const navItems: { path: string; label: string; icon: React.ComponentType<{ className?: string }>; tourAttr?: string; visKey: VisibilityKey }[] = [
    { path: "/", label: "Requirements List", icon: List, visKey: "page:requirements" },
    { path: "/dependencies", label: "Dependencies", icon: Network, tourAttr: "nav-dependencies", visKey: "page:dependencies" },
    { path: "/hierarchy", label: "Hierarchy", icon: FolderTree, visKey: "page:hierarchy" },
    { path: "/story-mapping", label: "Story Mapping", icon: Map, tourAttr: "nav-stories", visKey: "page:story-mapping" },
    { path: "/epics-stories", label: "Epics & Stories", icon: Layers, visKey: "page:epics-stories" },
    { path: "/frameworks", label: "Frameworks & Controls", icon: Shield, tourAttr: "nav-frameworks", visKey: "page:frameworks" },
    { path: "/workstreams", label: "Workstreams", icon: GitBranch, visKey: "page:workstreams" },
    { path: "/vendor-scorecard", label: "Vendor Scorecard", icon: Star, visKey: "page:vendor-scorecard" },
    { path: "/requirement-coverage", label: "Req. Coverage", icon: Target, visKey: "page:requirement-coverage" },
    { path: "/vendor-settings", label: "Vendor Settings", icon: Settings, visKey: "page:vendor-settings" },
    { path: "/help", label: "Help", icon: HelpCircle, tourAttr: "nav-help", visKey: "page:help" },
  ];

  const handleNewRequirement = () => {
    setShowCreateDialog(true);
    toast.success("Opening new requirement form");
  };

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl text-slate-900">Requirements Traceability Matrix</h1>
              <div className="flex items-center gap-2">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => {
                        toast.info(
                          <div className="space-y-2">
                            <div className="font-semibold mb-2">Keyboard Shortcuts</div>
                            <div className="space-y-1 text-sm">
                              <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl+N</kbd> New Requirement</div>
                              <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">G</kbd> then <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">R/D/H/F</kbd> Quick Navigation</div>
                              <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">?</kbd> Show Help</div>
                            </div>
                          </div>,
                          { duration: 8000 }
                        );
                      }}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Keyboard shortcuts"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
                      sideOffset={5}
                    >
                      Keyboard Shortcuts (?)
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
                
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={handleNewRequirement}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Requirement</span>
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
                      sideOffset={5}
                    >
                      Create new requirement (Ctrl+N)
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </div>
          </div>
        </header>

        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 items-center">
              {navItems.filter((item) => isVisible(item.visKey)).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-tour={item.tourAttr}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin link — always visible, separated by a faint divider */}
              <div className="ml-auto pl-2 border-l border-slate-200 flex items-center gap-1">
                {/* Last saved indicator — only shown in dev (auto-save is a no-op in prod) */}
                {!import.meta.env.PROD && (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => saveNow()}
                        className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
                          saveStatus === 'saving' ? 'text-blue-500' :
                          saveStatus === 'error'  ? 'text-red-500 hover:bg-red-50' :
                          saveStatus === 'saved'  ? 'text-green-600 hover:bg-green-50' :
                          'text-slate-400 hover:bg-slate-100'
                        }`}
                        aria-label="Save now"
                      >
                        {saveStatus === 'error' ? (
                          <CloudOff className="w-3.5 h-3.5" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden lg:inline">
                          {saveStatus === 'saving' ? 'Saving…' :
                           saveStatus === 'error'  ? 'Save failed' :
                           lastSavedAt            ? `Saved ${formatRelative(lastSavedAt)}` :
                           'Not saved yet'}
                        </span>
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
                        sideOffset={5}
                      >
                        {saveStatus === 'error'
                          ? 'Could not save to disk — click to retry'
                          : lastSavedAt
                          ? `Last saved at ${lastSavedAt.toLocaleTimeString()} — click to save now`
                          : 'Click to save all data to disk'}
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                )}

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Link
                      to="/admin"
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === "/admin"
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                      aria-label="Admin settings"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span className="hidden lg:inline">Admin</span>
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
                      sideOffset={5}
                    >
                      Admin — show/hide pages &amp; features
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs />
          <Outlet />
        </main>

        <RequirementFormDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
        
        <KeyboardShortcuts onNewRequirement={handleNewRequirement} />
        <ToastProvider />
        <WelcomeModal
          open={showWelcome}
          onClose={() => setShowWelcome(false)}
          onStartTour={() => {
            setShowWelcome(false);
            setShowTour(true);
          }}
        />
        <ProductTour
          active={showTour}
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
        <TooltipsGuide
          open={showTooltipsGuide}
          onClose={() => setShowTooltipsGuide(false)}
        />
      </div>
    </Tooltip.Provider>
  );
}