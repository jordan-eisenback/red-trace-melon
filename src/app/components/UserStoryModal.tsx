import { useState, useEffect } from "react";
import { X, Plus, Trash2, Pencil, Check } from "lucide-react";
import { UserStory } from "../types/epic";
import { useEpics } from "../contexts/EpicContext";
import { useRequirements } from "../contexts/RequirementsContext";

interface UserStoryModalProps {
  story: UserStory | null;
  onClose: () => void;
}

export default function UserStoryModal({ story, onClose }: UserStoryModalProps) {
  const { addUserStory, updateUserStory, epics, userStories } = useEpics();
  const { requirements } = useRequirements();
  const isEditing = story !== null;

  const [formData, setFormData] = useState<UserStory>(
    story || {
      id: "",
      epicId: "",
      title: "",
      description: "",
      acceptanceCriteria: [],
      requirements: [],
      priority: "Medium",
      status: "Backlog",
      storyPoints: undefined,
      assignee: "",
      notes: "",
    }
  );

  const [selectedReqs, setSelectedReqs] = useState<string[]>(story?.requirements || []);
  const [newAC, setNewAC] = useState("");
  const [editingACIndex, setEditingACIndex] = useState<number | null>(null);
  const [editingACValue, setEditingACValue] = useState("");

  useEffect(() => {
    if (!isEditing) {
      // Generate next user story ID
      const storyNumbers = userStories
        .map((s) => {
          const match = s.id.match(/US-(\d+)\.(\d+)/);
          return match ? parseFloat(`${match[1]}.${match[2]}`) : 0;
        })
        .filter((n) => n > 0);
      const nextNumber = storyNumbers.length > 0 ? Math.max(...storyNumbers) + 0.1 : 1.1;
      const [major, minor] = nextNumber.toString().split(".");
      setFormData((prev) => ({
        ...prev,
        id: `US-${major}.${parseInt(minor || "1") + 1}`,
      }));
    }
  }, [isEditing, userStories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storyToSave = { ...formData, requirements: selectedReqs };

    if (isEditing) {
      updateUserStory(story.id, storyToSave);
    } else {
      addUserStory(storyToSave);
    }
    onClose();
  };

  const toggleRequirement = (reqId: string) => {
    setSelectedReqs((prev) =>
      prev.includes(reqId) ? prev.filter((id) => id !== reqId) : [...prev, reqId]
    );
  };

  const addAcceptanceCriteria = () => {
    if (newAC.trim()) {
      setFormData({
        ...formData,
        acceptanceCriteria: [...formData.acceptanceCriteria, newAC.trim()],
      });
      setNewAC("");
    }
  };

  const removeAcceptanceCriteria = (index: number) => {
    setFormData({
      ...formData,
      acceptanceCriteria: formData.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  const startEditingAC = (index: number) => {
    setEditingACIndex(index);
    setEditingACValue(formData.acceptanceCriteria[index]);
  };

  const saveEditingAC = () => {
    if (editingACIndex === null) return;
    const updated = [...formData.acceptanceCriteria];
    updated[editingACIndex] = editingACValue.trim() || updated[editingACIndex];
    setFormData({ ...formData, acceptanceCriteria: updated });
    setEditingACIndex(null);
    setEditingACValue("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit User Story" : "Create New User Story"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Story ID</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Epic *</label>
              <select
                value={formData.epicId}
                onChange={(e) => setFormData({ ...formData, epicId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Epic...</option>
                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.id} - {epic.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="As a [role], I can [action]..."
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acceptance Criteria ({formData.acceptanceCriteria.length})
            </label>
            <div className="space-y-2">
              {formData.acceptanceCriteria.map((ac, index) => (
                <div key={index} className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600 mt-1 w-4 shrink-0">{index + 1}.</span>
                  {editingACIndex === index ? (
                    <>
                      <input
                        autoFocus
                        value={editingACValue}
                        onChange={(e) => setEditingACValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveEditingAC(); } if (e.key === "Escape") setEditingACIndex(null); }}
                        className="flex-1 px-2 py-0.5 border border-blue-400 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button type="button" onClick={saveEditingAC} className="text-green-600 hover:text-green-700 mt-0.5" title="Save">
                        <Check className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-900">{ac}</span>
                      <button type="button" onClick={() => startEditingAC(index)} className="text-gray-400 hover:text-blue-600 mt-0.5" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAcceptanceCriteria(index)}
                    className="text-red-600 hover:text-red-700 mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newAC}
                onChange={(e) => setNewAC(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAcceptanceCriteria();
                  }
                }}
                placeholder="Add acceptance criteria..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addAcceptanceCriteria}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as UserStory["priority"],
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as UserStory["status"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
              <input
                type="number"
                value={formData.storyPoints || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    storyPoints: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {isEditing ? "Update Story" : "Create Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}