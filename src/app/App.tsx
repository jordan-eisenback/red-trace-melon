import { RouterProvider } from "react-router";
import { router } from "./routes";
import { RequirementsProvider } from "./contexts/RequirementsContext";
import { EpicProvider } from "./contexts/EpicContext";
import { FrameworkProvider } from "./contexts/FrameworkContext";
import { VendorProvider } from "./contexts/VendorContext";
import { AdminProvider } from "./contexts/AdminContext";

export default function App() {
  return (
    <AdminProvider>
      <RequirementsProvider>
        <EpicProvider>
          <FrameworkProvider>
            <VendorProvider>
              <RouterProvider router={router} />
            </VendorProvider>
          </FrameworkProvider>
        </EpicProvider>
      </RequirementsProvider>
    </AdminProvider>
  );
}