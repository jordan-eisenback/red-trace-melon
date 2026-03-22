import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useRequirements } from "../context/RequirementsContext";
import { useNavigate } from "react-router";

export function DependencyGraph() {
  const { requirements } = useRequirements();
  const navigate = useNavigate();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, { x: number; y: number; level: number }>();

    // Build hierarchy levels
    const getLevelMap = () => {
      const levelMap = new Map<string, number>();
      const visited = new Set<string>();

      const getLevel = (reqId: string): number => {
        if (visited.has(reqId)) return levelMap.get(reqId) || 0;
        visited.add(reqId);

        const req = requirements.find((r) => r.id === reqId);
        if (!req || !req.parent) {
          levelMap.set(reqId, 0);
          return 0;
        }

        const parentLevel = getLevel(req.parent);
        const level = parentLevel + 1;
        levelMap.set(reqId, level);
        return level;
      };

      requirements.forEach((req) => getLevel(req.id));
      return levelMap;
    };

    const levelMap = getLevelMap();
    const levelGroups = new Map<number, string[]>();

    // Group by level
    requirements.forEach((req) => {
      const level = levelMap.get(req.id) || 0;
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(req.id);
    });

    // Position nodes
    const HORIZONTAL_SPACING = 300;
    const VERTICAL_SPACING = 150;

    levelGroups.forEach((ids, level) => {
      ids.forEach((id, index) => {
        const x = level * HORIZONTAL_SPACING;
        const y = index * VERTICAL_SPACING;
        nodeMap.set(id, { x, y, level });
      });
    });

    // Create nodes
    requirements.forEach((req) => {
      const pos = nodeMap.get(req.id) || { x: 0, y: 0, level: 0 };
      
      // Determine node color based on type
      let bgColor = "#f1f5f9"; // default slate-100
      let borderColor = "#cbd5e1"; // slate-300
      
      if (req.type === "Enterprise") {
        bgColor = "#dbeafe"; // blue-100
        borderColor = "#3b82f6"; // blue-500
      } else if (req.type === "Capability") {
        bgColor = "#d1fae5"; // green-100
        borderColor = "#10b981"; // green-500
      } else if (req.type.includes("IGA")) {
        bgColor = "#fce7f3"; // pink-100
        borderColor = "#ec4899"; // pink-500
      } else if (req.type.includes("Non-Functional")) {
        bgColor = "#fef3c7"; // yellow-100
        borderColor = "#f59e0b"; // yellow-500
      } else if (req.type === "Transition") {
        bgColor = "#e9d5ff"; // purple-100
        borderColor = "#a855f7"; // purple-500
      }

      nodes.push({
        id: req.id,
        data: {
          label: (
            <div className="p-2 text-left">
              <div className="text-xs mb-1 opacity-75">{req.id}</div>
              <div className="text-sm line-clamp-2">{req.req}</div>
              <div className="text-xs mt-1 opacity-60">{req.type}</div>
            </div>
          ),
        },
        position: { x: pos.x, y: pos.y },
        style: {
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: "8px",
          padding: "4px",
          width: 250,
          fontSize: "12px",
        },
        type: "default",
      });
    });

    // Create edges
    requirements.forEach((req) => {
      if (req.parent) {
        edges.push({
          id: `${req.parent}-${req.id}`,
          source: req.parent,
          target: req.id,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          style: {
            strokeWidth: 2,
            stroke: "#64748b",
          },
        });
      }
    });

    return { nodes, edges };
  }, [requirements]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      navigate(`/requirements/${node.id}`);
    },
    [navigate]
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h2 className="text-lg text-slate-900 mb-2">Dependency Graph</h2>
        <p className="text-sm text-slate-600">
          Visualizes parent-child relationships between requirements. Click on any node to
          view details.
        </p>
        <div className="mt-3 flex gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100"></div>
            <span className="text-slate-600">Enterprise</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-100"></div>
            <span className="text-slate-600">Capability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-pink-500 bg-pink-100"></div>
            <span className="text-slate-600">IGA Functional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-yellow-500 bg-yellow-100"></div>
            <span className="text-slate-600">Non-Functional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-100"></div>
            <span className="text-slate-600">Transition</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const style = node.style as any;
              return style?.background || "#f1f5f9";
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
