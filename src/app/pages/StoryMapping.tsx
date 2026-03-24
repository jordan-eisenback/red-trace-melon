import React, { useMemo, useState } from "react";
import { useEpics } from "../contexts/EpicContext";
import { useRequirements } from "../context/RequirementsContext";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import generateStoryMapFromEpicsAndStories from "../utils/storymapGenerator";
import type { StoryMapOutcome, StoryMapActivity, StoryMapStep } from "../types/storymap";

export default function StoryMapping() {
  const { epics, userStories, storyMap, addOutcome } = useEpics();
  const { requirements } = useRequirements();
  const [selected, setSelected] = useState<{ activity?: StoryMapActivity; step?: StoryMapStep } | null>(null);

  const generated = useMemo(() => generateStoryMapFromEpicsAndStories(epics || [], userStories || []), [epics, userStories]);
  // prefer an existing saved storyMap (if app supports outcome-level maps), otherwise use generated
  const source: StoryMapOutcome[] = (storyMap && (storyMap as any).length) ? (storyMap as StoryMapOutcome[]) : generated;

  function downloadFile(filename: string, content: string, type = 'application/json'){
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function exportJSON(){
    downloadFile('storymap.json', JSON.stringify(source, null, 2), 'application/json');
  }

  function exportCSV(){
    const rows = ['activity,stepId,stepTitle,order'];
    source.forEach(o => o.activities.forEach(a => a.steps.forEach(s => rows.push(`${csvSafe(o.title)}|${csvSafe(a.title)}|${csvSafe(s.id)}|${csvSafe(s.title)}|${s.order||''}`))));
    downloadFile('storymap.csv', rows.join('\n'), 'text/csv');
  }

  function csvSafe(s: any){
    const t = String(s||'');
    if (t.includes(',')||t.includes('\n')||t.includes('"')) return '"'+t.replace(/"/g,'""')+'"';
    return t;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">User Story Mapping</h1>
            <p className="text-sm text-gray-600">Horizontal activities — auto-generated from epics/stories</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportJSON} className="px-3 py-1 bg-white border rounded">Export JSON</button>
            <button onClick={exportCSV} className="px-3 py-1 bg-white border rounded">Export CSV</button>
            <button onClick={() => { const id = `OUT-${Date.now()}`; addOutcome({ id, title: 'New Outcome', description: '', activities: [] }); toast.success('Added outcome'); }} className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2"><Plus className="w-4 h-4" />Outcome</button>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 items-start">
          {source.flatMap(o => o.activities).sort((a,b)=>(a.order||0)-(b.order||0)).map((act) => (
            <div key={act.id} className="min-w-[320px] bg-white rounded shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{act.title}</div>
                  <div className="text-xs text-gray-500">{/* activity description could go here */}</div>
                </div>
                <div className="text-xs text-gray-400">{(act.steps || []).length} steps</div>
              </div>

              <div className="mt-3 space-y-3">
                {(act.steps || []).map((s) => (
                  <div key={s.id} onClick={() => setSelected({ activity: act, step: s })} className="bg-gray-50 p-3 rounded border hover:shadow-sm cursor-pointer">
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="mt-2 text-xs text-gray-500">Order: {s.order || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* detail panel */}
      {selected && (
        <aside className="fixed right-6 top-24 w-96 bg-white rounded shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selected.step?.title}</h3>
              <div className="text-xs text-gray-500">Activity: {selected.activity?.title}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400">✕</button>
          </div>
          <div className="mt-3 text-sm text-gray-700">
            <strong>Details</strong>
            <p className="mt-2">{selected.step?.description || 'No description'}</p>
            {selected.step?.linkedStoryIds && selected.step.linkedStoryIds.length > 0 && (
              <div className="mt-2">
                <strong>Linked:</strong>
                <ul className="list-disc list-inside text-sm">
                  {selected.step.linkedStoryIds.map(id => <li key={id}>{id}</li>)}
                </ul>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}