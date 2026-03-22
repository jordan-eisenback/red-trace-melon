import { useState } from "react";
import { useEpics } from "../contexts/EpicContext";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { Epic, UserStory } from "../types/epic";
import EpicModal from "../components/EpicModal";
import UserStoryModal from "../components/UserStoryModal";

type ViewMode = "epics" | "stories";

export default function EpicsAndStories() {
  const { epics, userStories, deleteEpic, deleteUserStory, getStoriesByEpic } = useEpics();
  const [viewMode, setViewMode] = useState<ViewMode>("epics");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Modal states
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);

  // Filtering
  const filteredEpics = epics.filter((epic) => {
    const matchesSearch =
      epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || epic.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || epic.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredStories = userStories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || story.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || story.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEditEpic = (epic: Epic) => {
    setSelectedEpic(epic);
    setIsEpicModalOpen(true);
  };

  const handleDeleteEpic = (id: string) => {
    if (confirm("Are you sure you want to delete this epic and all its stories?")) {
      deleteEpic(id);
    }
  };

  const handleEditStory = (story: UserStory) => {
    setSelectedStory(story);
    setIsStoryModalOpen(true);
  };

  const handleDeleteStory = (id: string) => {
    if (confirm("Are you sure you want to delete this user story?")) {
      deleteUserStory(id);
    }
  };

  const handleAddEpic = () => {
    setSelectedEpic(null);
    setIsEpicModalOpen(true);
  };

  const handleAddStory = () => {
    setSelectedStory(null);
    setIsStoryModalOpen(true);
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
          <button
            onClick={viewMode === "epics" ? handleAddEpic : handleAddStory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {viewMode === "epics" ? "Epic" : "Story"}
          </button>
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
              return (
                <div
                  key={epic.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-gray-500">{epic.id}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(
                            epic.priority
                          )}`}
                        >
                          {epic.priority}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                            epic.status
                          )}`}
                        >
                          {epic.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{epic.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{epic.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Owner: {epic.owner}</span>
                        <span>•</span>
                        <span>{storyCount} stories</span>
                        <span>•</span>
                        <span>{epic.requirements.length} requirements</span>
                      </div>
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
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                            story.status
                          )}`}
                        >
                          {story.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{story.title}</h3>
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
                        {story.assignee && story.requirements.length > 0 && <span>•</span>}
                        <span>{story.requirements.length} requirements</span>
                      </div>
                      {story.notes && (
                        <p className="text-sm text-gray-500 italic mt-2">Note: {story.notes}</p>
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
    </div>
  );
}
