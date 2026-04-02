import { useParams, Link, useNavigate } from "react-router";
import { useRequirements } from "../contexts/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { useEpics } from "../contexts/EpicContext";
import { useVendor } from "../contexts/VendorContext";
import { useAdmin } from "../contexts/AdminContext";
import { ArrowLeft, Edit, Trash2, Network, Users, Shield, BookOpen, Map, GitBranch, Star, Link2Off } from "lucide-react";
import { useState, useMemo } from "react";
import { RequirementFormDialog } from "../components/RequirementFormDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Tip } from "../components/Tip";
import { PriorityBadge, StatusBadge } from "./RequirementsList";

export function RequirementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequirement, getChildren, getParent, deleteRequirement } = useRequirements();
  const { frameworks } = useFrameworks();
  const { epics, userStories, storyMap } = useEpics();
  const { data: vendorData, getCriteriaForRequirement, getActiveCriteriaProfile } = useVendor();
  const { isVisible } = useAdmin();
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

  // Vendor coverage data — memoized to avoid recomputing on every render
  const activeCriteriaProfile = useMemo(
    () => getActiveCriteriaProfile(),
     
    [getActiveCriteriaProfile]
  );
  const linkedVendorCriteria = useMemo(
    () => (id ? getCriteriaForRequirement(id) : []),
    [id, getCriteriaForRequirement]
  );

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
          <Tip label="Edit this requirement" side="bottom">
            <button
              onClick={() => setShowEditDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </Tip>
          <Tip label="Permanently delete this requirement" side="bottom">
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </Tip>
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

            <div>
              <h3 className="text-sm text-slate-500 mb-2">Priority</h3>
              <PriorityBadge priority={requirement.priority} />
            </div>

            <div>
              <h3 className="text-sm text-slate-500 mb-2">Status</h3>
              <StatusBadge status={requirement.status} />
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
          {linkedControls.length > 0 && isVisible("feature:frameworks") && (
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
          {linkedEpics.length > 0 && isVisible("feature:epics") && (
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
          {linkedStories.length > 0 && isVisible("feature:epics") && (
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
          {linkedSteps.length > 0 && isVisible("feature:story-jam") && (
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

          {/* Vendor Coverage */}
          {isVisible("feature:vendor-integration") && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-indigo-500" />
              Vendor Coverage ({linkedVendorCriteria.length} criteria linked)
            </h4>
            {!activeCriteriaProfile ? (
              <div className="flex items-center gap-3 p-3 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                <Link2Off className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm text-slate-500">
                  No criteria profile is active.{" "}
                  <Link to="/vendor-settings" className="text-indigo-600 hover:underline">
                    Configure one in Vendor Settings →
                  </Link>
                </p>
              </div>
            ) : linkedVendorCriteria.length === 0 ? (
              <div className="flex items-center gap-3 p-3 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                <Link2Off className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm text-slate-500">
                  No vendor criteria linked.{" "}
                  <Link
                    to="/requirement-coverage"
                    className="text-indigo-600 hover:underline"
                  >
                    Map a criterion →
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Criteria chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {linkedVendorCriteria.map(({ criterion, subCriterionId, subCriterionName }) => (
                    <span
                      key={subCriterionId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200"
                      title={`${criterion.category} › ${subCriterionName}`}
                    >
                      {subCriterionName}
                    </span>
                  ))}
                </div>
                {/* Per-vendor scores — derived from raw sub-criterion scores only,
                    not category-level aggregation, so the % reflects criteria
                    actually linked to this requirement. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {vendorData.vendors.map((vendor) => {
                    const scaleMax =
                      vendorData.weightingProfiles.find((p) => p.id === vendorData.activeProfileId)
                        ?.scaleConfig.type === "1-5" ? 5
                        : vendorData.weightingProfiles.find((p) => p.id === vendorData.activeProfileId)
                          ?.scaleConfig.type === "1-10" ? 10
                        : vendorData.weightingProfiles.find((p) => p.id === vendorData.activeProfileId)
                          ?.scaleConfig.type === "0-3" ? 3
                        : 5;

                    const subScores: number[] = [];
                    linkedVendorCriteria.forEach(({ criterion, subCriterionId }) => {
                      const scoresForSub = vendorData.scores.filter(
                        (s) =>
                          s.vendorId === vendor.id &&
                          s.criterionId === criterion.id &&
                          s.subCriterionId === subCriterionId
                      );
                      if (scoresForSub.length > 0) {
                        const avg =
                          scoresForSub.reduce((acc, s) => acc + s.score, 0) / scoresForSub.length;
                        subScores.push(avg);
                      }
                    });

                    const pct =
                      subScores.length > 0
                        ? Math.round(
                            (subScores.reduce((a, b) => a + b, 0) / subScores.length / scaleMax) * 100
                          )
                        : null;
                    return (
                      <div
                        key={vendor.id}
                        className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{vendor.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{vendor.type}</p>
                        </div>
                        {pct === null ? (
                          <span className="text-xs text-slate-300 shrink-0">No scores</span>
                        ) : (
                          <span
                            className={`text-sm font-semibold shrink-0 ml-2 ${
                              pct >= 70 ? "text-emerald-600" :
                              pct >= 40 ? "text-amber-600" : "text-red-500"
                            }`}
                          >
                            {pct}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Link
                  to="/requirement-coverage"
                  className="text-xs text-indigo-600 hover:underline inline-block mt-1"
                >
                  Manage coverage →
                </Link>
              </div>
            )}
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
