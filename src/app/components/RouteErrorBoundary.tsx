import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Used as the `errorElement` on every route in routes.tsx.
 * Scopes render-time and loader/action errors to the affected page only —
 * the rest of the app (layout, nav) remains usable.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred on this page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = typeof error.data === "string" ? error.data : "The page could not be loaded.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-6">
      <div className="p-3 bg-red-100 rounded-full">
        <AlertTriangle className="size-8 text-red-500" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4 mr-2" />
          Reload
        </Button>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="size-4 mr-2" />
            Back to Requirements
          </Link>
        </Button>
      </div>
    </div>
  );
}
