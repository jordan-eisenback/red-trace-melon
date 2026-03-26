import { RouterProvider } from "react-router";
import { router } from "./routes";
import { RequirementsProvider } from "./contexts/RequirementsContext";
import { EpicProvider } from "./contexts/EpicContext";
import { FrameworkProvider } from "./contexts/FrameworkContext";

export default function App() {
  return (
    <RequirementsProvider>
      <EpicProvider>
        <FrameworkProvider>
          <RouterProvider router={router} />
        </FrameworkProvider>
      </EpicProvider>
    </RequirementsProvider>
  );
}