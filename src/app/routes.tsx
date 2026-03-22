import { createBrowserRouter } from "react-router";
import { RequirementsList } from "./pages/RequirementsList";
import { RequirementDetail } from "./pages/RequirementDetail";
import { DependencyGraph } from "./pages/DependencyGraph";
import { HierarchyView } from "./pages/HierarchyView";
import StoryMapping from "./pages/StoryMapping";
import EpicsAndStories from "./pages/EpicsAndStories";
import FrameworksAndControls from "./pages/FrameworksAndControls";
import HelpCenter from "./pages/HelpCenter";
import { RootLayout } from "./components/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: RequirementsList },
      { path: "requirements/:id", Component: RequirementDetail },
      { path: "dependencies", Component: DependencyGraph },
      { path: "hierarchy", Component: HierarchyView },
      { path: "story-mapping", Component: StoryMapping },
      { path: "epics-stories", Component: EpicsAndStories },
      { path: "frameworks", Component: FrameworksAndControls },
      { path: "help", Component: HelpCenter },
    ],
  },
]);