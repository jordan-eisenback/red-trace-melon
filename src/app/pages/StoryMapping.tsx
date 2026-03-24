import React from "react";
import { useEpics } from "../contexts/EpicContext";
import { useRequirements } from "../context/RequirementsContext";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function StoryMapping() {
  const { epics, userStories, storyMap, addOutcome } = useEpics();
  const { requirements } = useRequirements();

  const mapSource = (storyMap && storyMap.length) ? storyMap : epics.map((e) => ({ id: e.id, title: e.title, description: e.description, activities: [] } as any));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">User Story Mapping</h1>
            <p className="text-sm text-gray-600">Outcomes → activities → steps (horizontal)</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border rounded">Export</button>
            <button onClick={() => { const id = `OUT-${Date.now()}`; addOutcome({ id, title: 'New Outcome', description: '', activities: [] }); toast.success('Added outcome'); }} className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2"><Plus className="w-4 h-4" />Outcome</button>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 items-start">
          {mapSource.map((outcome: any) => (
            <div key={outcome.id} className="min-w-[320px] bg-white rounded shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{outcome.title}</div>
                  <div className="text-xs text-gray-500">{outcome.description}</div>
                </div>
                <div className="text-xs text-gray-400">{(outcome.activities || []).length} activities</div>
              </div>

              <div className="mt-3 space-y-3">
                {(outcome.activities || []).map((act: any) => (
                  <div key={act.id} className="bg-gray-50 p-3 rounded border">
                    <div className="text-sm font-medium">{act.title}</div>
                    <div className="mt-2 space-y-2">
                      {(act.steps || []).map((s: any) => (
                        <div key={s.id} className="bg-white p-2 rounded border">{s.title}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}