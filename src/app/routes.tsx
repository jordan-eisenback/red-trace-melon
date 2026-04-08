import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { RequirementsList } from "./pages/RequirementsList";
import { RequirementDetail } from "./pages/RequirementDetail";
import { HierarchyView } from "./pages/HierarchyView";
import EpicsAndStories from "./pages/EpicsAndStories";
import FrameworksAndControls from "./pages/FrameworksAndControls";
import HelpCenter from "./pages/HelpCenter";
import WorkstreamsPage from "./pages/Workstreams";
import RequirementCoverage from "./pages/RequirementCoverage";
import VendorSettings from "./pages/VendorSettings";
import AdminPage from "./pages/AdminPage";
import ProjectsPage from "./pages/ProjectsPage";
import { RootLayout } from "./components/RootLayout";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Heavy pages — lazy-loaded so ReactFlow / Recharts / ExcelJS are excluded
// from the initial bundle and only fetched when the user navigates to them.
const DependencyGraph = React.lazy(() =>
  import('./pages/DependencyGraph').then((m) => ({ default: m.DependencyGraph }))
);
const StoryMapping    = React.lazy(() => import('./pages/StoryMapping'));
const VendorScorecard = React.lazy(() => import('./pages/VendorScorecard'));
const StoryJam        = React.lazy(() => import('./pages/StoryJam'));

const Fallback = <LoadingSpinner />;

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: RequirementsList, ErrorBoundary: RouteErrorBoundary },
      { path: "requirements/:id", Component: RequirementDetail, ErrorBoundary: RouteErrorBoundary },
      {
        path: "dependencies",
        element: <Suspense fallback={Fallback}><DependencyGraph /></Suspense>,
        ErrorBoundary: RouteErrorBoundary,
      },
      { path: "hierarchy", Component: HierarchyView, ErrorBoundary: RouteErrorBoundary },
      {
        path: "story-mapping",
        element: <Suspense fallback={Fallback}><StoryMapping /></Suspense>,
        ErrorBoundary: RouteErrorBoundary,
      },
      { path: "epics-stories", Component: EpicsAndStories, ErrorBoundary: RouteErrorBoundary },
      { path: "frameworks", Component: FrameworksAndControls, ErrorBoundary: RouteErrorBoundary },
      { path: "workstreams", Component: WorkstreamsPage, ErrorBoundary: RouteErrorBoundary },
      {
        path: "vendor-scorecard",
        element: <Suspense fallback={Fallback}><VendorScorecard /></Suspense>,
        ErrorBoundary: RouteErrorBoundary,
      },
      { path: "requirement-coverage", Component: RequirementCoverage, ErrorBoundary: RouteErrorBoundary },
      { path: "vendor-settings", Component: VendorSettings, ErrorBoundary: RouteErrorBoundary },
      { path: "admin", Component: AdminPage, ErrorBoundary: RouteErrorBoundary },
      { path: "projects", Component: ProjectsPage, ErrorBoundary: RouteErrorBoundary },
      { path: "help", Component: HelpCenter, ErrorBoundary: RouteErrorBoundary },
      {
        path: "story-jam",
        element: <Suspense fallback={Fallback}><StoryJam /></Suspense>,
        ErrorBoundary: RouteErrorBoundary,
      },
    ],
  },
]);
