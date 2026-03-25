import { useState } from "react";
import { Link } from "react-router";
import { useEpics } from "../contexts/EpicContext";
import { useRequirements } from "../context/RequirementsContext";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, Filter, Map } from "lucide-react";
import { Epic, UserStory } from "../types/epic";
import EpicModal from "../components/EpicModal";
import UserStoryModal from "../components/UserStoryModal";
import { ConfirmDialog } from "../components/ConfirmDialog";

type ViewMode = "epics" | "stories";

export default function EpicsAndStories() {
  const { epics, userStories, deleteEpic, deleteUserStory, getStoriesByEpic, updateUserStory, addDetailToStory, removeDetailFromStory, storyMap } = useEpics();
  const { getRequirement } = useRequirements();

  // Build a flat stepId → { outcomeTitle, activityTitle, stepTitle } lookup for back-links
  const stepLookup = (() => {
    const map: Record<string, { outcomeTitle: string; activityTitle: string; stepTitle: string }> = {};
    for (const outcome of storyMap) {
      for (const activity of outcome.activities ?? []) {
        for (const step of activity.steps ?? []) {
          map[step.id] = {
            outcomeTitle: outcome.title,
            activityTitle: activity.title,
            stepTitle: step.title,
          };
        }
      }
    }
    return map;
  })();
  const [viewMode, setViewMode] = useState<ViewMode>("epics");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Modal states
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'epic' | 'story'; id: string; label: string } | null>(null);

  // Filtering
  const filteredEpics = epics.filter((epic) => {
    const matchesSearch =
      epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.description.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = true; // status filtering not used for organizing work
    const matchesPriority = priorityFilter === "all" || epic.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredStories = userStories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = true; // status filtering not used for organizing work
    const matchesPriority = priorityFilter === "all" || story.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEditEpic = (epic: Epic) => {
    setSelectedEpic(epic);
    setIsEpicModalOpen(true);
  };

  const handleDeleteEpic = (id: string) => {
    const epic = epics.find(e => e.id === id);
    setDeleteConfirm({ type: 'epic', id, label: epic?.title ?? id });
  };

  const handleEditStory = (story: UserStory) => {
    setSelectedStory(story);
    setIsStoryModalOpen(true);
  };

  const handleDeleteStory = (id: string) => {
    const story = userStories.find(s => s.id === id);
    setDeleteConfirm({ type: 'story', id, label: story?.title ?? id });
  };

  const handleAddEpic = () => {
    setSelectedEpic(null);
    setIsEpicModalOpen(true);
  };

  const handleAddStory = () => {
    setSelectedStory(null);
    setIsStoryModalOpen(true);
  };

  // expand/collapse state for epics
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [dragOverEpicId, setDragOverEpicId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});

  const toggleStoryExpanded = (id: string) => {
    setExpandedStories((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  // Inline edit state for story titles
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState<string>("");

  const startEditingTitle = (storyId: string, currentTitle: string) => {
    setEditingStoryId(storyId);
    setEditingTitleValue(currentTitle);
  };

  const cancelEditingTitle = () => {
    setEditingStoryId(null);
    setEditingTitleValue("");
  };

  const saveEditingTitle = (storyId: string) => {
    const story = userStories.find((s) => s.id === storyId);
    if (!story) return;
    updateUserStory(storyId, { ...story, title: editingTitleValue });
    setEditingStoryId(null);
    setEditingTitleValue("");
    toast.success('Title updated');
  };

  const toggleEpicExpanded = (id: string) => {
    setExpandedEpics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Drag and drop handlers
  const onDragStart = (e: React.DragEvent, storyId: string) => {
    try {
      e.dataTransfer.setData("text/plain", storyId);
      e.dataTransfer.effectAllowed = "move";
    } catch (err) {
      // some browsers may restrict setData in certain contexts; swallow
    }
  };

  const onEpicDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onEpicDragEnter = (e: React.DragEvent, epicId: string) => {
    e.preventDefault();
    setDragOverEpicId(epicId);
  };

  const onEpicDragLeave = (e: React.DragEvent, epicId: string) => {
    e.preventDefault();
    setDragOverEpicId((cur) => (cur === epicId ? null : cur));
  };

  const onEpicDrop = (e: React.DragEvent, targetEpicId: string) => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData("text/plain");
    if (!storyId) return;
    const story = userStories.find((s) => s.id === storyId);
    if (!story) return;
    if (story.epicId === targetEpicId) return; // no-op
    updateUserStory(storyId, { ...story, epicId: targetEpicId });
    setDragOverEpicId(null);
    toast.success(`${story.id} moved to ${targetEpicId}`);
  };

  const onDragEnd = () => {
    setDragOverEpicId(null);
  };

  // Accept a requirement drop onto a story to create a StoryDetail linked to that requirement
  const onStoryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onStoryDrop = (e: React.DragEvent, storyId: string) => {
    e.preventDefault();
    const reqId = e.dataTransfer.getData('text/requirement-id');
    if (!reqId) return;
    const req = getRequirement(reqId);
    const detailId = `d-${Date.now()}`;
    const title = req ? (req.req.length > 120 ? req.req.slice(0, 120) + '…' : req.req) : reqId;
    const detail = { id: detailId, title, description: '', requirementId: reqId };
    addDetailToStory(storyId, detail);
    toast.success(`Linked requirement ${reqId} to ${storyId}`);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/save-epics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epics, userStories, storyMap }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        toast.success('Saved epics & stories to disk');
      } else {
        toast.error('Save failed: ' + (json?.error || res.statusText));
      }
    } catch (err: any) {
      toast.error('Save failed: ' + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Done":
        return "bg-green-100 text-green-800";
      case "In Progress":
      case "Testing":
        return "bg-blue-100 text-blue-800";
      case "Blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Epics & User Stories</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage epics, stories, and acceptance criteria
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm ${
                isSaving ? 'opacity-60 cursor-wait' : ''
              }`}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>

            <button
              onClick={viewMode === "epics" ? handleAddEpic : handleAddStory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {viewMode === "epics" ? "Epic" : "Story"}
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("epics")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "epics"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Epics ({epics.length})
          </button>
          <button
            onClick={() => setViewMode("stories")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "stories"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            User Stories ({userStories.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${viewMode}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Backlog">Backlog</option>
              <option value="In Progress">In Progress</option>
              <option value="Testing">Testing</option>
              <option value="Done">Done</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "epics" ? (
          <div className="space-y-4">
            {filteredEpics.map((epic) => {
              const storyCount = getStoriesByEpic(epic.id).length;
              const isExpanded = !!expandedEpics[epic.id];
              const stories = getStoriesByEpic(epic.id);
              return (
                <div
                  key={epic.id}
                  className={
                    `bg-white rounded-lg border p-6 transition-shadow ${
                      dragOverEpicId === epic.id
                        ? 'border-blue-300 ring-2 ring-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:shadow-md'
                    }`
                  }
                  onDragOver={onEpicDragOver}
                  onDrop={(e) => onEpicDrop(e, epic.id)}
                  onDragEnter={(e) => onEpicDragEnter(e, epic.id)}
                  onDragLeave={(e) => onEpicDragLeave(e, epic.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => toggleEpicExpanded(epic.id)}
                          className="text-sm text-gray-400 hover:text-gray-600 mr-2"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "▾" : "▸"}
                        </button>
                        <span className="font-mono text-sm text-gray-500">{epic.id}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(
                            epic.priority
                          )}`}
                        >
                          {epic.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{epic.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{epic.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Owner: {epic.owner}</span>
                        <span>•</span>
                        <span>{storyCount} stories</span>
                      </div>
                      {epic.requirements.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {epic.requirements.map((reqId) => (
                            <Link
                              key={reqId}
                              to={`/requirements/${reqId}`}
                              className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                              title={getRequirement(reqId)?.req}
                            >
                              {reqId}
                            </Link>
                          ))}
                        </div>
                      )}
                      {epic.notes && (
                        <p className="text-sm text-gray-500 italic mt-2">Note: {epic.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditEpic(epic)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEpic(epic.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded list of stories (animated) */}
                  <div
                    className={`mt-4 space-y-3 overflow-hidden transition-all duration-200 ease-in-out ${
                      isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {stories.length === 0 && (
                      <div className="text-sm text-gray-500">No stories in this epic</div>
                    )}
                    {stories.map((story) => {
                        const isStoryExpanded = !!expandedStories[story.id];
                        return (
                          <div key={story.id} className="space-y-2">
                            <div
                              draggable
                              onDragStart={(e) => onDragStart(e, story.id)}
                              onDragEnd={onDragEnd}
                              role="button"
                              aria-grabbed={false}
                              title={`Drag ${story.id} to another epic`}
                              className="p-3 border border-gray-100 rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-grab"
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleStoryExpanded(story.id)}
                                  className="text-sm text-gray-400 hover:text-gray-600"
                                  aria-expanded={isStoryExpanded}
                                >
                                  {isStoryExpanded ? '▾' : '▸'}
                                </button>
                                <div>
                                  <div className="text-sm text-gray-500">{story.id}</div>
                                  {editingStoryId === story.id ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={editingTitleValue}
                                        onChange={(e) => setEditingTitleValue(e.target.value)}
                                        className="px-2 py-1 border rounded-lg text-sm w-80"
                                      />
                                      <button
                                        onClick={() => saveEditingTitle(story.id)}
                                        className="px-2 py-1 bg-blue-600 text-white rounded"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={cancelEditingTitle}
                                        className="px-2 py-1 bg-gray-100 rounded"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      className="font-medium text-gray-900 break-words whitespace-normal max-w-[48rem]"
                                            onDoubleClick={() => startEditingTitle(story.id, story.title)}
                                      title="Double-click to edit"
                                    >
                                      {story.title}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* status hidden for organizing view */}
                            </div>

                            <div
                              onDragOver={onStoryDragOver}
                              onDrop={(e) => onStoryDrop(e, story.id)}
                              className={`pl-4 overflow-hidden transition-all duration-200 ease-in-out ${
                                isStoryExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                              }`}
                            >
                                {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                  <div className="text-sm text-gray-700 mb-2">
                                    <div className="font-medium text-gray-800">Acceptance Criteria</div>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                      {story.acceptanceCriteria.map((ac, idx) => (
                                        <li key={idx}>{ac}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {story.requirements && story.requirements.length > 0 && (
                                  <div className="text-sm text-gray-700 mb-2">
                                    <div className="font-medium text-gray-800 mb-1">Requirements</div>
                                    <div className="flex flex-wrap gap-1">
                                      {story.requirements.map((reqId) => (
                                        <Link
                                          key={reqId}
                                          to={`/requirements/${reqId}`}
                                          className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                                          title={getRequirement(reqId)?.req}
                                        >
                                          {reqId}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {story.notes && (
                                  <div className="text-sm italic text-gray-600">Note: {story.notes}</div>
                                )}
                                {/* Story Map back-links */}
                                {(story.linkedStepIds ?? []).length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium text-gray-800 mb-1 flex items-center gap-1">
                                      <Map className="w-3.5 h-3.5 text-violet-500" />
                                      Story Map Steps
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {(story.linkedStepIds ?? []).map((sid) => {
                                        const info = stepLookup[sid];
                                        return (
                                          <a
                                            key={sid}
                                            href="/story-mapping"
                                            title={info ? `${info.outcomeTitle} › ${info.activityTitle} › ${info.stepTitle}` : sid}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full hover:bg-violet-200 transition-colors"
                                          >
                                            <Map className="w-3 h-3" />
                                            {info ? info.stepTitle : sid}
                                          </a>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                {/* Story details (activities/steps) */}
                                {story.details && story.details.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium text-gray-800 mb-1">Details / Activities</div>
                                    <ul className="space-y-2">
                                      {story.details.map((d) => (
                                        <li key={d.id} className="flex items-start justify-between bg-gray-50 p-2 rounded">
                                          <div className="text-sm text-gray-700">
                                            <div className="font-medium">{d.title}</div>
                                            {d.requirementId && (
                                              <div className="text-xs text-gray-500">Linked: {d.requirementId}</div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => removeDetailFromStory(story.id, d.id)}
                                              className="text-sm text-red-600 hover:underline"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                          </div>
                        );
                      })}
                    </div>
                </div>
              );
            })}
            {filteredEpics.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No epics found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStories.map((story) => {
              const epic = epics.find((e) => e.id === story.epicId);
              return (
                <div
                  key={story.id}
                  onDragOver={onStoryDragOver}
                  onDrop={(e) => onStoryDrop(e, story.id)}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-gray-500">{story.id}</span>
                        {story.storyPoints && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                            {story.storyPoints} pts
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(
                            story.priority
                          )}`}
                        >
                          {story.priority}
                        </span>
                        {/* status hidden for organizing view */}
                      </div>
                      {editingStoryId === story.id ? (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            value={editingTitleValue}
                            onChange={(e) => setEditingTitleValue(e.target.value)}
                            className="px-2 py-1 border rounded-lg text-sm w-80"
                          />
                          <button
                            onClick={() => saveEditingTitle(story.id)}
                            className="px-2 py-1 bg-blue-600 text-white rounded"
                          >
                            Save
                          </button>
                          <button onClick={cancelEditingTitle} className="px-2 py-1 bg-gray-100 rounded">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <h3
                          className="text-lg font-semibold text-gray-900 mb-2 break-words whitespace-normal"
                          onDoubleClick={() => startEditingTitle(story.id, story.title)}
                          title="Double-click to edit"
                        >
                          {story.title}
                        </h3>
                      )}
                      <p className="text-sm text-gray-600 mb-3">{story.description}</p>
                      {epic && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">Epic: </span>
                          <span className="text-sm text-blue-600 font-medium">
                            {epic.id} - {epic.title}
                          </span>
                        </div>
                      )}
                      {story.acceptanceCriteria.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            Acceptance Criteria:
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {story.acceptanceCriteria.map((ac, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">•</span>
                                <span>{ac}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {story.assignee && <span>Assignee: {story.assignee}</span>}
                      </div>
                      {story.requirements.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-700 mb-1">Requirements</div>
                          <div className="flex flex-wrap gap-1">
                            {story.requirements.map((reqId) => (
                              <Link
                                key={reqId}
                                to={`/requirements/${reqId}`}
                                className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                                title={getRequirement(reqId)?.req}
                              >
                                {reqId}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {story.notes && (
                        <p className="text-sm text-gray-500 italic mt-2">Note: {story.notes}</p>
                      )}
                      {(story.linkedStepIds ?? []).length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Map className="w-3.5 h-3.5 text-violet-500" />
                            Story Map Steps
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(story.linkedStepIds ?? []).map((sid) => {
                              const info = stepLookup[sid];
                              return (
                                <a
                                  key={sid}
                                  href="/story-mapping"
                                  title={info ? `${info.outcomeTitle} › ${info.activityTitle} › ${info.stepTitle}` : sid}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full hover:bg-violet-200 transition-colors"
                                >
                                  <Map className="w-3 h-3" />
                                  {info ? info.stepTitle : sid}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditStory(story)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStory(story.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredStories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No user stories found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isEpicModalOpen && (
        <EpicModal epic={selectedEpic} onClose={() => setIsEpicModalOpen(false)} />
      )}
      {isStoryModalOpen && (
        <UserStoryModal story={selectedStory} onClose={() => setIsStoryModalOpen(false)} />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title={deleteConfirm?.type === 'epic' ? 'Delete Epic' : 'Delete User Story'}
        description={
          deleteConfirm?.type === 'epic'
            ? `Are you sure you want to delete "${deleteConfirm.label}" and all its stories? This action cannot be undone.`
            : `Are you sure you want to delete "${deleteConfirm?.label}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleteConfirm) return;
          if (deleteConfirm.type === 'epic') deleteEpic(deleteConfirm.id);
          else deleteUserStory(deleteConfirm.id);
          setDeleteConfirm(null);
        }}
        variant="danger"
      />
    </div>
  );
}
