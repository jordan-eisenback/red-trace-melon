import { useParams, Link, useNavigate } from "react-router";
import { useRequirements } from "../context/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { useEpics } from "../contexts/EpicContext";
import { ArrowLeft, Edit, Trash2, Network, Users, Shield, BookOpen, Map, GitBranch } from "lucide-react";
import { useState } from "react";
import { RequirementFormDialog } from "../components/RequirementFormDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function RequirementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequirement, getChildren, getParent, deleteRequirement } = useRequirements();
  const { frameworks } = useFrameworks();
  const { epics, userStories, storyMap } = useEpics();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const requirement = id ? getRequirement(id) : undefined;
  const children = id ? getChildren(id) : [];
  const parent = id ? getParent(id) : undefined;

  // Cross-link lookups
  const linkedControls = id
    ? frameworks.flatMap((f) =>
        f.controls
          .filter((c) => c.requirements.includes(id))
          .map((c) => ({ framework: f, control: c }))
      )
    : [];

  const linkedEpics = id
    ? epics.filter((e) => e.requirements.includes(id))
    : [];

  const linkedStories = id
    ? userStories.filter((s) => s.requirements.includes(id))
    : [];

  const linkedSteps = id
    ? storyMap.flatMap((outcome) =>
        outcome.activities.flatMap((activity) =>
          activity.steps
            .filter((step) => step.requirementId === id)
            .map((step) => ({ outcome, activity, step }))
        )
      )
    : [];

  if (!requirement) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Requirement not found</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Go back to list
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteRequirement(requirement.id);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <code className="text-sm bg-slate-100 px-3 py-1.5 rounded text-slate-700">
                {requirement.id}
              </code>
              <span className="ml-3 inline-flex items-center px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {requirement.type}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-500 mb-2">Requirement</h3>
            <p className="text-slate-900">{requirement.req}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-slate-500 mb-2">Owner</h3>
              <p className="text-slate-900">{requirement.owner}</p>
            </div>

            <div>
              <h3 className="text-sm text-slate-500 mb-2">Parent</h3>
              {parent ? (
                <Link
                  to={`/requirements/${parent.id}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Network className="w-4 h-4" />
                  {parent.id}
                </Link>
              ) : (
                <p className="text-slate-400">None</p>
              )}
            </div>
          </div>

          {requirement.outcome && (
            <div>
              <h3 className="text-sm text-slate-500 mb-2">Outcome</h3>
              <p className="text-slate-900">{requirement.outcome}</p>
            </div>
          )}

          {requirement.notes && (
            <div>
              <h3 className="text-sm text-slate-500 mb-2">Notes</h3>
              <p className="text-slate-900">{requirement.notes}</p>
            </div>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Child Requirements ({children.length})
          </h3>
          <div className="space-y-3">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/requirements/${child.id}`}
                className="block p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {child.id}
                      </code>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {child.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 line-clamp-2">{child.req}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Traceability cross-links ─────────────────────────────────── */}
      {(linkedControls.length > 0 || linkedEpics.length > 0 || linkedStories.length > 0 || linkedSteps.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-600" />
            Traceability
          </h3>

          {/* Framework Controls */}
          {linkedControls.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                Framework Controls ({linkedControls.length})
              </h4>
              <div className="space-y-2">
                {linkedControls.map(({ framework, control }) => (
                  <Link
                    key={control.id}
                    to="/frameworks"
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{control.controlId}</span>
                    <span className="text-sm text-slate-900 flex-1 line-clamp-1">{control.title}</span>
                    <span className="text-xs text-slate-500 shrink-0">{framework.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Epics */}
          {linkedEpics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-green-600" />
                Epics ({linkedEpics.length})
              </h4>
              <div className="space-y-2">
                {linkedEpics.map((epic) => (
                  <Link
                    key={epic.id}
                    to="/epics"
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <span className="font-mono text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{epic.id}</span>
                    <span className="text-sm text-slate-900 flex-1 line-clamp-1">{epic.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${epic.priority === 'High' ? 'bg-orange-100 text-orange-700' : epic.priority === 'Low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{epic.priority}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User Stories */}
          {linkedStories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-violet-600" />
                User Stories ({linkedStories.length})
              </h4>
              <div className="space-y-2">
                {linkedStories.map((story) => (
                  <Link
                    key={story.id}
                    to="/epics"
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors"
                  >
                    <span className="font-mono text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">{story.id}</span>
                    <span className="text-sm text-slate-900 flex-1 line-clamp-1">{story.title}</span>
                    <span className="text-xs text-slate-500 shrink-0">{story.epicId}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Story Map Steps */}
          {linkedSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Map className="w-4 h-4 text-amber-600" />
                Story Map Steps ({linkedSteps.length})
              </h4>
              <div className="space-y-2">
                {linkedSteps.map(({ outcome, activity, step }) => (
                  <Link
                    key={step.id}
                    to="/story-mapping"
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <span className="text-sm text-slate-900 flex-1 line-clamp-1">{step.title}</span>
                    <span className="text-xs text-slate-500 shrink-0 hidden sm:block">
                      {outcome.title} › {activity.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <RequirementFormDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        requirement={requirement}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Requirement"
        description={`Are you sure you want to delete requirement ${requirement.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}
