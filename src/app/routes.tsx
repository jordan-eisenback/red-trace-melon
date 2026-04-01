import { createBrowserRouter } from "react-router";
import { RequirementsList } from "./pages/RequirementsList";
import { RequirementDetail } from "./pages/RequirementDetail";
import { DependencyGraph } from "./pages/DependencyGraph";
import { HierarchyView } from "./pages/HierarchyView";
import StoryMapping from "./pages/StoryMapping";
import EpicsAndStories from "./pages/EpicsAndStories";
import FrameworksAndControls from "./pages/FrameworksAndControls";
import HelpCenter from "./pages/HelpCenter";
import WorkstreamsPage from "./pages/Workstreams";
import VendorScorecard from "./pages/VendorScorecard";
import RequirementCoverage from "./pages/RequirementCoverage";
import VendorSettings from "./pages/VendorSettings";
import AdminPage from "./pages/AdminPage";
import { RootLayout } from "./components/RootLayout";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: RequirementsList, ErrorBoundary: RouteErrorBoundary },
      { path: "requirements/:id", Component: RequirementDetail, ErrorBoundary: RouteErrorBoundary },
      { path: "dependencies", Component: DependencyGraph, ErrorBoundary: RouteErrorBoundary },
      { path: "hierarchy", Component: HierarchyView, ErrorBoundary: RouteErrorBoundary },
      { path: "story-mapping", Component: StoryMapping, ErrorBoundary: RouteErrorBoundary },
      { path: "epics-stories", Component: EpicsAndStories, ErrorBoundary: RouteErrorBoundary },
      { path: "frameworks", Component: FrameworksAndControls, ErrorBoundary: RouteErrorBoundary },
      { path: "workstreams", Component: WorkstreamsPage, ErrorBoundary: RouteErrorBoundary },
      { path: "vendor-scorecard", Component: VendorScorecard, ErrorBoundary: RouteErrorBoundary },
      { path: "requirement-coverage", Component: RequirementCoverage, ErrorBoundary: RouteErrorBoundary },
      { path: "vendor-settings", Component: VendorSettings, ErrorBoundary: RouteErrorBoundary },
      { path: "admin", Component: AdminPage, ErrorBoundary: RouteErrorBoundary },
      { path: "help", Component: HelpCenter, ErrorBoundary: RouteErrorBoundary },
    ],
  },
]);