import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  "/": "Requirements",
  "/dependencies": "Dependencies",
  "/hierarchy": "Hierarchy",
  "/story-mapping": "Story Mapping",
  "/epics-stories": "Epics & Stories",
  "/frameworks": "Frameworks & Controls",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", path: "/" },
  ];

  // Build breadcrumb trail
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Check if it's a known route
    if (routeLabels[currentPath]) {
      breadcrumbs.push({
        label: routeLabels[currentPath],
        path: currentPath,
      });
    } else if (segment.startsWith("RBAC-") || segment.startsWith("EPIC-") || segment.startsWith("STORY-")) {
      // It's an ID
      breadcrumbs.push({
        label: segment,
        path: currentPath,
      });
    }
  });

  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      {breadcrumbs.slice(1).map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {index === breadcrumbs.length - 2 ? (
            <span className="font-medium text-gray-900">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-gray-900 transition-colors hover:underline"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
