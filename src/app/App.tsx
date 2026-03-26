import { RouterProvider } from "react-router";
import { router } from "./routes";
import { RequirementsProvider } from "./contexts/RequirementsContext";
import { EpicProvider } from "./contexts/EpicContext";
import { FrameworkProvider } from "./contexts/FrameworkContext";
import { VendorProvider } from "./contexts/VendorContext";

export default function App() {
  return (
    <RequirementsProvider>
      <EpicProvider>
        <FrameworkProvider>
          <VendorProvider>
            <RouterProvider router={router} />
          </VendorProvider>
        </FrameworkProvider>
      </EpicProvider>
    </RequirementsProvider>
  );
}