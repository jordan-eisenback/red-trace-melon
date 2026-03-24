import React, { useRef, useState, useEffect } from 'react';
import { useEpics } from '../contexts/EpicContext';
import { Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
// Note: uuid is optional; if not available, we use timestamp-based ids.
const makeId = (prefix = 'n') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

// Minimal freeform board (no external deps). Nodes are absolute-positioned divs; edges are SVG lines.
export default function StoryJam() {
  const { storyJam, addJamNode, updateJamNodePosition, addJamEdge, removeJamEdge, updateJamNode } = useEpics();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);

  // dragging state
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      updateJamNodePosition(dragging.id, dragging.origX + dx, dragging.origY + dy);
    };
    const onMouseUp = () => setDragging(null);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, updateJamNodePosition]);

  const handleAddSticky = () => {
    const id = makeId('n');
    addJamNode({ id, x: 40 + Math.random() * 200, y: 40 + Math.random() * 200, title: 'New Note', type: 'sticky' });
  };

  const startDrag = (e: React.MouseEvent, nodeId: string) => {
    const node = storyJam.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDragging({ id: nodeId, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y });
  };

  const handleDoubleClick = (nodeId: string) => {
    const node = storyJam.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const title = prompt('Edit node title', node.title);
    if (title !== null) updateJamNode({ ...node, title });
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLinkMode) return;
    if (!linkSource) {
      setLinkSource(nodeId);
      return;
    }
    if (linkSource === nodeId) {
      setLinkSource(null);
      return;
    }
    const edgeId = `e-${Date.now()}`;
    addJamEdge({ id: edgeId, source: linkSource, target: nodeId });
    setLinkSource(null);
  };

  const removeEdge = (edgeId: string) => {
    removeJamEdge(edgeId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Story Jam</h1>
          <p className="text-sm text-gray-600">Freeform mapping board — drag notes, link nodes, and save.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAddSticky} className="px-3 py-2 bg-white border rounded">Add Note</button>
          <button onClick={() => setIsLinkMode((s) => !s)} className={`px-3 py-2 border rounded ${isLinkMode ? 'bg-blue-600 text-white' : 'bg-white'}`}>
            <LinkIcon className="inline-block mr-2" /> Link
          </button>
        </div>
      </div>

      <div ref={boardRef} className="relative h-[72vh] bg-white m-6 border border-gray-200 overflow-hidden">
        {/* svg edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {storyJam.edges.map((edge) => {
            const s = storyJam.nodes.find((n) => n.id === edge.source);
            const t = storyJam.nodes.find((n) => n.id === edge.target);
            if (!s || !t) return null;
            const x1 = s.x + (s.width || 140) / 2;
            const y1 = s.y + (s.height || 60) / 2;
            const x2 = t.x + (t.width || 140) / 2;
            const y2 = t.y + (t.height || 60) / 2;
            return (
              <g key={edge.id}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#93c5fd" strokeWidth={2} />
                <circle cx={x2} cy={y2} r={6} fill="#60a5fa" />
                <foreignObject x={(x1 + x2) / 2 - 30} y={(y1 + y2) / 2 - 12} width={60} height={24}>
                  <div className="flex items-center justify-center">
                    <button onClick={() => removeEdge(edge.id)} className="text-xs text-red-600">Remove</button>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* nodes */}
        {storyJam.nodes.map((node) => (
          <div
            key={node.id}
            onMouseDown={(e) => startDrag(e, node.id)}
            onDoubleClick={() => handleDoubleClick(node.id)}
            onClick={(e) => handleNodeClick(node.id, e)}
            style={{ left: node.x, top: node.y, position: 'absolute', width: node.width || 140, height: node.height || 60 }}
            className={`p-3 rounded shadow cursor-grab ${node.type === 'sticky' ? 'bg-yellow-100' : 'bg-white'} border border-gray-200`}
          >
            <div className="text-sm font-medium">{node.title}</div>
            {node.requirementId && <div className="text-xs text-gray-500">Req: {node.requirementId}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
