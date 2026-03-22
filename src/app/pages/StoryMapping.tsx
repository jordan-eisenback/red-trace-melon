import { useState } from "react";
import { useEpics } from "../contexts/EpicContext";
import { useRequirements } from "../context/RequirementsContext";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

export default function StoryMapping() {
  const { epics, userStories } = useEpics();
  const { requirements } = useRequirements();
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(
    new Set(epics.map((e) => e.id))
  );

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) => {
      const next = new Set(prev);
      if (next.has(epicId)) {
        next.delete(epicId);
      } else {
        next.add(epicId);
      }
      return next;
    });
  };

  const getRequirementTitle = (reqId: string): string => {
    const req = requirements.find((r) => r.id === reqId);
    return req ? `${req.id}: ${req.req.substring(0, 60)}...` : reqId;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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
            <h1 className="text-2xl font-semibold text-gray-900">User Story Mapping</h1>
            <p className="text-sm text-gray-600 mt-1">
              Visual board showing epics and their user stories
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Export Map
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Epic
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Epics</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">{epics.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Stories</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">{userStories.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Story Points</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">
              {userStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">
              {userStories.filter((s) => s.status === "Done").length}
            </div>
          </div>
        </div>
      </div>

      {/* Story Map */}
      <div className="p-6">
        <div className="space-y-4">
          {epics.map((epic) => {
            const stories = userStories.filter((s) => s.epicId === epic.id);
            const isExpanded = expandedEpics.has(epic.id);

            return (
              <div key={epic.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Epic Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleEpic(epic.id)}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-1 text-gray-400 hover:text-gray-600">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
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
                          <h3 className="font-semibold text-gray-900 mt-1">{epic.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{epic.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Owner: {epic.owner}</span>
                            <span>•</span>
                            <span>{stories.length} stories</span>
                            <span>•</span>
                            <span>
                              {stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0)} points
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Requirements */}
                      {epic.requirements.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            Satisfies Requirements:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {epic.requirements.slice(0, 5).map((reqId) => (
                              <span
                                key={reqId}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                                title={getRequirementTitle(reqId)}
                              >
                                {reqId}
                              </span>
                            ))}
                            {epic.requirements.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{epic.requirements.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Stories */}
                {isExpanded && stories.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stories.map((story) => (
                        <div
                          key={story.id}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-mono text-xs text-gray-500">{story.id}</span>
                            {story.storyPoints && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                {story.storyPoints} pts
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-sm text-gray-900 mb-2">
                            {story.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {story.description}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
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
                          {story.acceptanceCriteria.length > 0 && (
                            <div className="border-t border-gray-200 pt-2">
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                Acceptance Criteria ({story.acceptanceCriteria.length})
                              </div>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {story.acceptanceCriteria.slice(0, 2).map((ac, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-gray-400 mt-0.5">•</span>
                                    <span className="line-clamp-1">{ac}</span>
                                  </li>
                                ))}
                                {story.acceptanceCriteria.length > 2 && (
                                  <li className="text-gray-400 italic">
                                    +{story.acceptanceCriteria.length - 2} more...
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && stories.length === 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-8 text-center">
                    <p className="text-sm text-gray-500">No user stories yet</p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Add Story
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}