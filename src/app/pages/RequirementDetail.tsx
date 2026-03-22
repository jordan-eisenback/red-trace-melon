import { useParams, Link, useNavigate } from "react-router";
import { useRequirements } from "../context/RequirementsContext";
import { ArrowLeft, Edit, Trash2, Network, Users } from "lucide-react";
import { useState } from "react";
import { RequirementFormDialog } from "../components/RequirementFormDialog";

export function RequirementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequirement, getChildren, getParent, deleteRequirement } = useRequirements();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const requirement = id ? getRequirement(id) : undefined;
  const children = id ? getChildren(id) : [];
  const parent = id ? getParent(id) : undefined;

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
    if (confirm(`Are you sure you want to delete requirement ${requirement.id}?`)) {
      deleteRequirement(requirement.id);
      navigate("/");
    }
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
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

      <RequirementFormDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        requirement={requirement}
      />
    </div>
  );
}
