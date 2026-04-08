import { useState, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FolderOpen,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useProject, Project } from "../contexts/ProjectContext";
import { useRequirements } from "../contexts/RequirementsContext";
import { useEpics } from "../contexts/EpicContext";
import { useFrameworks } from "../contexts/FrameworkContext";
import { ProjectDataPanel } from "../components/ProjectDataPanel";

// ── Color palette (mirrors ProjectContext / ProjectSwitcher) ───────────────
const COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ── Stats bar per project card ─────────────────────────────────────────────
function ProjectStats({ projectId }: { projectId: string }) {
  // We can't call context hooks conditionally, so stats are read for the
  // active project. For non-active projects we show a static placeholder.
  const { activeProjectId } = useProject();
  const { requirements } = useRequirements();
  const { epics } = useEpics();
  const { frameworks } = useFrameworks();

  if (projectId !== activeProjectId) {
    return (
      <p className="text-xs text-slate-400 mt-1">Switch to this project to see stats</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <Layers className="w-3.5 h-3.5" />
        {requirements.length} requirement{requirements.length !== 1 ? "s" : ""}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <FolderOpen className="w-3.5 h-3.5" />
        {epics.length} epic{epics.length !== 1 ? "s" : ""}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <Check className="w-3.5 h-3.5" />
        {frameworks.length} framework{frameworks.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

// ── Inline edit form ───────────────────────────────────────────────────────
function EditForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project;
  onSave: (patch: { name: string; description: string; color: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [color, setColor] = useState(project.color);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), description: description.trim(), color });
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
        <input
          ref={inputRef}
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={80}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={200}
          placeholder="Optional description"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-all"
              style={{
                backgroundColor: c,
                outline: color === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!name.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 text-sm rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </form>
  );
}

// ── New project inline form ─────────────────────────────────────────────────
function NewProjectForm({ onDone }: { onDone: () => void }) {
  const { createProject, setActiveProject } = useProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const p = createProject(name.trim(), { description: description.trim(), color });
    setActiveProject(p.id);
    toast.success(`Project "${p.name}" created`);
    onDone();
  };

  return (
    <div className="bg-white rounded-xl border-2 border-blue-300 border-dashed shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">New project</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Zero Trust Network Access"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={80}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full transition-all"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Create
          </button>
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 text-sm rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Project card ───────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const { activeProjectId, setActiveProject, updateProject, deleteProject, projects } = useProject();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isActive = project.id === activeProjectId;

  const handleSave = (patch: { name: string; description: string; color: string }) => {
    updateProject(project.id, patch);
    setEditing(false);
    toast.success("Project updated");
  };

  const handleDelete = () => {
    deleteProject(project.id);
    toast.success(`"${project.name}" deleted`);
    setConfirmingDelete(false);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all ${
        isActive ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {/* Color bar */}
      <div
        className="h-1.5 rounded-t-xl"
        style={{ backgroundColor: project.color }}
      />

      <div className="p-5">
        {editing ? (
          <EditForm
            project={project}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: project.color }}
                />
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {project.name}
                </h3>
                {isActive && (
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded uppercase tracking-wide flex-shrink-0">
                    Active
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isActive && (
                  <button
                    onClick={() => {
                      setActiveProject(project.id);
                      toast.success(`Switched to "${project.name}"`);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Switch
                  </button>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Edit project"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {projects.length > 1 && (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {project.description && (
              <p className="text-sm text-slate-500 mt-1.5 ml-5">{project.description}</p>
            )}

            <div className="ml-5">
              <ProjectStats projectId={project.id} />
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-3 ml-5">
              <Clock className="w-3 h-3" />
              Created {formatDate(project.createdAt)}
              {project.updatedAt !== project.createdAt && (
                <> · updated {formatDate(project.updatedAt)}</>
              )}
            </div>

            <ProjectDataPanel project={project} />
          </>
        )}

        {/* Delete confirm inline */}
        {confirmingDelete && !editing && (
          <div className="mt-4 pt-4 border-t border-red-100 bg-red-50 -mx-5 -mb-5 px-5 pb-5 rounded-b-xl">
            <p className="text-sm text-red-700 font-medium mb-1">Delete "{project.name}"?</p>
            <p className="text-xs text-red-600 mb-3">All project data will be permanently removed.</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="px-3 py-1.5 text-slate-600 text-sm rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { projects } = useProject();
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage projects — each project has its own isolated set of requirements, epics, and frameworks.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New project
        </button>
      </div>

      {/* Project grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(p => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {showNew && (
          <NewProjectForm onDone={() => setShowNew(false)} />
        )}
      </div>

      {/* Empty state (shouldn't normally happen — always ≥1 project) */}
      {projects.length === 0 && !showNew && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500">No projects yet.</p>
          <button
            onClick={() => setShowNew(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Create your first project
          </button>
        </div>
      )}
    </div>
  );
}
