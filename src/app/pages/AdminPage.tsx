import { useState } from "react";
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
} from "lucide-react";
import { useAdmin, VisibilityKey } from "../contexts/AdminContext";
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
