import { Outlet, Link, useLocation } from "react-router";
import { List, Network, FolderTree, Plus, Map, Layers, Shield, HelpCircle, Info, GitBranch } from "lucide-react";
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

export function RootLayout() {
  const location = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showTooltipsGuide, setShowTooltipsGuide] = useState(false);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem("rtm-has-visited");
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem("rtm-has-visited", "true");
    }
  }, []);

  const navItems = [
    { path: "/", label: "Requirements List", icon: List },
    { path: "/dependencies", label: "Dependencies", icon: Network, tourAttr: "nav-dependencies" },
    { path: "/hierarchy", label: "Hierarchy", icon: FolderTree },
    { path: "/story-mapping", label: "Story Mapping", icon: Map, tourAttr: "nav-stories" },
    { path: "/epics-stories", label: "Epics & Stories", icon: Layers },
    { path: "/frameworks", label: "Frameworks & Controls", icon: Shield, tourAttr: "nav-frameworks" },
    { path: "/workstreams", label: "Workstreams", icon: GitBranch },
    { path: "/help", label: "Help", icon: HelpCircle, tourAttr: "nav-help" },
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
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-tour={item.tourAttr}
                    className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
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