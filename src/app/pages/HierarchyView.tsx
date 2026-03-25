import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useRequirements } from "../context/RequirementsContext";
import { ChevronRight, ChevronDown, FileText } from "lucide-react";
import { Requirement } from "../types/requirement";

interface TreeNodeProps {
  requirement: Requirement;
  children: Requirement[];
  level: number;
  forceExpanded?: boolean;
}

function TreeNode({ requirement, children, level, forceExpanded }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const expanded = forceExpanded !== undefined ? forceExpanded : isExpanded;

  const hasChildren = children.length > 0;
  const indent = level * 24;

  return (
    <div>
      <div
        className="flex items-start gap-2 py-2 px-3 hover:bg-slate-50 rounded-lg transition-colors group"
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <FileText className="w-3 h-3" />
          )}
        </button>

        <Link
          to={`/requirements/${requirement.id}`}
          className="flex-1 min-w-0 text-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              {requirement.id}
            </code>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {requirement.type}
            </span>
            {hasChildren && (
              <span className="text-xs text-slate-500">({children.length})</span>
            )}
          </div>
          <p className="text-slate-900 line-clamp-2">{requirement.req}</p>
        </Link>
      </div>

      {hasChildren && expanded && (
        <div>
          {children.map((child) => (
            <TreeNodeContainer key={child.id} requirement={child} level={level + 1} forceExpanded={forceExpanded} />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeNodeContainer({
  requirement,
  level,
  forceExpanded,
}: {
  requirement: Requirement;
  level: number;
  forceExpanded?: boolean;
}) {
  const { getChildren } = useRequirements();
  const children = getChildren(requirement.id);

  return <TreeNode requirement={requirement} children={children} level={level} forceExpanded={forceExpanded} />;
}

export function HierarchyView() {
  const { requirements } = useRequirements();
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  const rootRequirements = useMemo(() => {
    return requirements.filter((req) => !req.parent || req.parent === "None");
  }, [requirements]);

  const typeGroups = useMemo(() => {
    const groups = new Map<string, Requirement[]>();
    rootRequirements.forEach((req) => {
      if (!groups.has(req.type)) {
        groups.set(req.type, []);
      }
      groups.get(req.type)!.push(req);
    });
    return groups;
  }, [rootRequirements]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg text-slate-900 mb-1">Hierarchy View</h2>
            <p className="text-sm text-slate-600">
              Requirements organized by parent-child relationships
            </p>
          </div>
          <button
            onClick={() => setExpandAll(prev => prev === true ? false : true)}
            className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            {expandAll === true ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from(typeGroups.entries()).map(([type, reqs]) => (
          <div
            key={type}
            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm text-slate-900">{type}</h3>
                <span className="text-xs text-slate-500">
                  {reqs.length} root requirement{reqs.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="p-2">
              {reqs.map((req) => (
                <TreeNodeContainer key={req.id} requirement={req} level={0} forceExpanded={expandAll} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {rootRequirements.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No root requirements found</p>
        </div>
      )}
    </div>
  );
}
