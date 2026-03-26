import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Epic } from "../types/epic";
import { useEpics } from "../contexts/EpicContext";
import { useRequirements } from "../contexts/RequirementsContext";

interface EpicModalProps {
  epic: Epic | null;
  onClose: () => void;
}

export default function EpicModal({ epic, onClose }: EpicModalProps) {
  const { addEpic, updateEpic, epics } = useEpics();
  const { requirements } = useRequirements();
  const isEditing = epic !== null;

  const [formData, setFormData] = useState<Epic>(
    epic || {
      id: "",
      title: "",
      description: "",
      requirements: [],
      owner: "",
      status: "Backlog",
      priority: "Medium",
      notes: "",
    }
  );

  const [selectedReqs, setSelectedReqs] = useState<string[]>(epic?.requirements || []);

  useEffect(() => {
    if (!isEditing) {
      // Generate next epic ID
      const epicNumbers = epics
        .map((e) => {
          const match = e.id.match(/EPIC-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((n) => n > 0);
      const nextNumber = epicNumbers.length > 0 ? Math.max(...epicNumbers) + 1 : 1;
      setFormData((prev) => ({ ...prev, id: `EPIC-${nextNumber}` }));
    }
  }, [isEditing, epics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const epicToSave = { ...formData, requirements: selectedReqs };

    if (isEditing) {
      updateEpic(epic.id, epicToSave);
    } else {
      addEpic(epicToSave);
    }
    onClose();
  };

  const toggleRequirement = (reqId: string) => {
    setSelectedReqs((prev) =>
      prev.includes(reqId) ? prev.filter((id) => id !== reqId) : [...prev, reqId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Epic" : "Create New Epic"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Epic ID</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={isEditing}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Epic["status"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as Epic["priority"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Requirements ({selectedReqs.length} selected)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50">
              <div className="space-y-2">
                {requirements.slice(0, 100).map((req) => (
                  <label key={req.id} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReqs.includes(req.id)}
                      onChange={() => toggleRequirement(req.id)}
                      className="mt-1"
                    />
                    <span className="text-sm">
                      <span className="font-mono text-gray-600">{req.id}</span>
                      <span className="text-gray-900"> - {req.req.substring(0, 80)}...</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? "Update Epic" : "Create Epic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}