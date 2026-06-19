import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaColumns,
  FaEllipsisH,
  FaEye,
  FaFolderOpen,
  FaPlus,
  FaTasks,
  FaTrashAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaSync,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaRegCircle,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";
import storyService from "../../services/storyService";
import subtaskService, { SUBTASK_STATUS } from "../../services/subtaskService";

// ── Constants ──────────────────────────────────────────────────────────────────
const FILTERS = ["All Projects", "Active", "Completed"];
const PROJECT_COLORS = [
  { hex: "#5f9be8", soft: "rgba(95,155,232,0.15)" },
  { hex: "#7c5ce7", soft: "rgba(124,92,231,0.15)" },
  { hex: "#20c997", soft: "rgba(32,201,151,0.15)" },
  { hex: "#f06595", soft: "rgba(240,101,149,0.15)" },
  { hex: "#fab005", soft: "rgba(250,176,5,0.15)" },
];

// ── Helper Functions ───────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "No date";
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
};

const getProjectColor = (project, index) => {
  if (!project) return PROJECT_COLORS[0];
  switch (project.status) {
    case "completed":
      return PROJECT_COLORS[2];
    case "archived":
      return { hex: "#868e96", soft: "rgba(134,142,150,0.15)" };
    case "active":
    default:
      return PROJECT_COLORS[index % PROJECT_COLORS.length];
  }
};

const getStatusLabel = (status) => {
  const labels = { active: "Active", completed: "Completed", archived: "Archived" };
  return labels[status] || status;
};

// ── Subtask Row ────────────────────────────────────────────────────────────────
function SubtaskRow({ subtask, accentColor, onToggle }) {
  const isDone = subtask.isCompleted || subtask.status === SUBTASK_STATUS.DONE;

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(subtask._id, !isDone);
        }}
        className="shrink-0 transition-transform active:scale-90"
        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
      >
        {isDone ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: accentColor }}>
            <FaCheck className="text-[8px] text-white" />
          </span>
        ) : (
          <FaRegCircle className="h-4 w-4 text-white/30" />
        )}
      </button>
      <span className={`text-[11px] leading-4 transition-colors ${isDone ? "text-white/30 line-through" : "text-white/60"}`}>
        {subtask.title}
      </span>
    </div>
  );
}

// ── Subtasks Panel ─────────────────────────────────────────────────────────────
function SubtasksPanel({ storyId, accentColor, companyId }) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await subtaskService.getSubtasksByStory(storyId);
        if (!cancelled) setSubtasks(res.data || []);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [storyId]);

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  const handleToggle = async (subtaskId, isCompleted) => {
    setSubtasks((prev) =>
      prev.map((s) =>
        s._id === subtaskId
          ? { ...s, isCompleted, status: isCompleted ? SUBTASK_STATUS.DONE : SUBTASK_STATUS.TODO }
          : s
      )
    );
    try {
      await subtaskService.toggleSubtaskComplete(subtaskId, isCompleted);
    } catch {
      setSubtasks((prev) =>
        prev.map((s) =>
          s._id === subtaskId
            ? { ...s, isCompleted: !isCompleted, status: !isCompleted ? SUBTASK_STATUS.DONE : SUBTASK_STATUS.TODO }
            : s
        )
      );
    }
  };

  const handleAddSubtask = async (e) => {
    e.stopPropagation();
    const title = newTitle.trim();
    if (!title || !storyId || !companyId) return;

    setAdding(true);
    try {
      const res = await subtaskService.createSubtask({ title, storyId, companyId });
      setSubtasks((prev) => [...prev, res.data]);
      setNewTitle("");
      setShowInput(false);
    } catch (err) {
      console.error("Failed to add subtask:", err);
    } finally {
      setAdding(false);
    }
  };

  const doneCount = subtasks.filter((s) => s.isCompleted || s.status === SUBTASK_STATUS.DONE).length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-[11px] text-white/30">
        <FaSpinner className="animate-spin text-[10px]" />
        Loading subtasks…
      </div>
    );
  }

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      {subtasks.length > 0 && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Subtasks</span>
          <span className="text-[10px] text-white/30">{doneCount}/{subtasks.length}</span>
        </div>
      )}

      <div className="space-y-0.5">
        {subtasks.map((subtask) => (
          <SubtaskRow key={subtask._id} subtask={subtask} accentColor={accentColor} onToggle={handleToggle} />
        ))}
      </div>

      {showInput ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask(e);
              if (e.key === "Escape") { setShowInput(false); setNewTitle(""); }
            }}
            placeholder="Subtask title…"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white placeholder-white/25 outline-none focus:border-white/20"
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            disabled={adding || !newTitle.trim()}
            className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition disabled:opacity-40"
            style={{ backgroundColor: `${accentColor}33`, color: accentColor }}
          >
            {adding ? <FaSpinner className="animate-spin text-[10px]" /> : "Add"}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowInput(false); setNewTitle(""); }}
            className="text-[11px] text-white/30 hover:text-white/60"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowInput(true); }}
          className="mt-2 flex items-center gap-1.5 text-[11px] text-white/30 transition hover:text-white/55"
        >
          <FaPlus className="text-[9px]" />
          Add subtask
        </button>
      )}
    </div>
  );
}

// ── Project Menu Component ─────────────────────────────────────────────────────
function ProjectMenu({ project, onClose, onDelete }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [onClose]);

  const actions = [
    {
      label: "View kanban",
      icon: FaColumns,
      onClick: () => { onClose(); navigate(`/projects/${project._id}/kanban`); },
    },
    {
      label: "View details",
      icon: FaEye,
      onClick: () => { onClose(); navigate(`/projects/${project._id}`); },
    },
    {
      label: "Delete",
      icon: FaTrashAlt,
      danger: true,
      onClick: () => { onClose(); onDelete(); },
    },
  ];

  return (
    <div
      ref={menuRef}
      onClick={(event) => event.stopPropagation()}
      className="flowio-project-menu absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#0f1535] p-1.5 shadow-2xl backdrop-blur-sm"
    >
      {actions.map(({ label, icon: Icon, danger, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
            danger
              ? "text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
              : "text-white/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon className="text-[11px]" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteConfirmModal({ project, onCancel, onConfirm, isDeleting }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020414]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#0f1535] p-6 text-white shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
          <FaExclamationTriangle className="text-lg" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Delete Project</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Are you sure you want to delete{" "}
          <span className="font-medium text-white">"{project.name}"</span>? This
          action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold transition hover:bg-rose-500 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project Card ───────────────────────────────────────────────────────────────
function ProjectCard({ project, index, companyId, openMenuId, setOpenMenuId, onDelete, onClick }) {
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const color = getProjectColor(project, index);

  // Fetch stories for progress calculation
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStoriesLoading(true);
        const res = await storyService.getStoriesByProject(project._id);
        if (!cancelled) {
          const data = res.data || res || [];
          setStories(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setStories([]);
      } finally {
        if (!cancelled) setStoriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [project._id]);

  // Calculate progress from STORIES
  const progress = stories.length === 0 ? 0 : Math.round(
    (stories.filter(s => s.status === "Done").length / stories.length) * 100
  );

  // Get first story ID for subtasks panel
  const firstStoryId = stories[0]?._id;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(project._id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(project._id);
        }
      }}
      className="flowio-project-card group relative flex flex-col rounded-[26px] border border-[#263774]/35 bg-[radial-gradient(ellipse_at_52%_48%,rgba(27,42,90,.76)_0%,rgba(15,25,65,.94)_58%,rgba(9,17,52,.98)_100%)] p-6 shadow-[0_18px_42px_rgba(1,4,26,.25),inset_0_1px_0_rgba(255,255,255,.025)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.09] hover:shadow-[0_22px_48px_rgba(1,4,26,.34),inset_0_1px_0_rgba(255,255,255,.04)] sm:p-7"
    >
      {/* Project Header */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xl shadow-[inset_0_0_18px_rgba(255,255,255,.025)]"
          style={{ color: color.hex, backgroundColor: color.soft, borderColor: `${color.hex}45` }}
        >
          <FaFolderOpen />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              onClick={(event) => { event.stopPropagation(); onClick(project._id); }}
              className="truncate text-left text-[17px] font-semibold tracking-[-0.01em] transition hover:text-[#82b6ff] cursor-pointer"
            >
              {project.name}
            </h3>

            <div className="relative">
              <button
                type="button"
                aria-label={`Open actions for ${project.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenuId((current) => current === project._id ? null : project._id);
                }}
                className="rounded-lg p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <FaEllipsisH />
              </button>

              {openMenuId === project._id && (
                <ProjectMenu project={project} onClose={() => setOpenMenuId(null)} onDelete={() => onDelete(project)} />
              )}
            </div>
          </div>

          <p className="mt-2.5 line-clamp-2 max-w-[92%] text-xs leading-5 text-white/45">
            {project.description || "No description provided"}
          </p>
        </div>
      </div>

      {/* Progress Bar - Based on Stories */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-white/40 capitalize">{getStatusLabel(project.status)}</span>
          <div className="flex items-center gap-3">
            {storiesLoading ? (
              <FaSpinner className="animate-spin text-[10px] text-white/30" />
            ) : (
              <span className="text-[10px] text-white/35">{stories.length} stories</span>
            )}
            <span className="text-[15px] font-semibold tracking-wide" style={{ color: color.hex }}>
              {storiesLoading ? "--" : `${progress}%`}
            </span>
          </div>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[#1a2859]/90 shadow-[inset_0_1px_3px_rgba(1,4,25,.45)]">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${storiesLoading ? 0 : progress}%`,
              backgroundColor: color.hex,
              boxShadow: `0 0 14px ${color.hex}66`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.035] pt-3.5 text-[11px] text-white/42">
        <span className="flex items-center gap-2">
          <FaCalendarAlt className="text-[10px]" />
          {formatDate(project.startDate)}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.hex }} />
          <FaTasks className="sr-only" />
          {stories.length} stories
        </span>
      </div>

      {/* Subtasks Toggle */}
      {firstStoryId && (
        <div className="mt-3 border-t border-white/[0.035] pt-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSubtasksOpen((o) => !o); }}
            className="flex w-full items-center justify-between text-[11px] text-white/35 transition hover:text-white/60"
          >
            <span>Subtasks</span>
            {subtasksOpen ? <FaChevronUp className="text-[9px]" /> : <FaChevronDown className="text-[9px]" />}
          </button>

          {subtasksOpen && (
            <SubtasksPanel storyId={firstStoryId} accentColor={color.hex} companyId={companyId} />
          )}
        </div>
      )}
    </article>
  );
}

// ── Main Projects Component ────────────────────────────────────────────────────
export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All Projects");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const storedCompanyId = localStorage.getItem("companyId") || user.companyId;
      if (!storedCompanyId) throw new Error("No company selected.");
      setCompanyId(storedCompanyId);
      const response = await projectService.getProjectsByCompany(storedCompanyId);
      if (response.success) {
        setProjects(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await projectService.deleteProject(deleteTarget._id);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
      setOpenMenuId(null);
    } catch (err) {
      alert(err.message || "Failed to delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);
      const matchesFilter =
        filter === "All Projects" ||
        (filter === "Active" && project.status === "active") ||
        (filter === "Completed" && project.status === "completed");
      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  if (loading) {
    return (
      <MainLayout title="Projects" searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search projects...">
        <section className="flowio-projects-page mt-4 flex h-full min-h-[620px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 sm:p-7 lg:mt-3 lg:min-h-0">
          <div className="text-center">
            <FaSpinner className="mx-auto mb-4 animate-spin text-3xl text-[#5f9be8]" />
            <p className="text-lg font-medium text-white/60">Loading projects...</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (error && !projects.length) {
    return (
      <MainLayout title="Projects" searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search projects...">
        <section className="flowio-projects-page mt-4 flex h-full min-h-[620px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 sm:p-7 lg:mt-3 lg:min-h-0">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
              <FaExclamationTriangle className="text-2xl text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-white/80">Failed to Load Projects</h3>
            <p className="mt-2 text-sm text-white/50">{error}</p>
            <button onClick={fetchProjects} className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[#5f9be8] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#70a9ef] active:scale-95">
              <FaSync className="text-xs" /> Try Again
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Projects" searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search projects...">
      <section className="flowio-projects-page mt-4 flex h-full min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 text-white shadow-[inset_0_0_70px_rgba(5,8,54,.58),0_18px_50px_rgba(1,3,28,.2)] sm:p-7 lg:mt-3 lg:min-h-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-6 overflow-x-auto sm:gap-10">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`relative whitespace-nowrap pb-2 text-sm font-medium transition sm:text-base ${filter === item ? "text-[#a7b8ff]" : "text-white/55 hover:text-white/80"}`}
              >
                {item}
                {filter === item && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#9fb2ff]" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate("/projects/new")}
            className="flex items-center justify-center gap-2 rounded-full bg-[#5f9be8] px-6 py-2.5 text-sm font-medium shadow-[0_8px_22px_rgba(74,137,230,.22)] transition hover:-translate-y-0.5 hover:bg-[#70a9ef] active:scale-95"
          >
            <FaPlus className="text-[10px]" /> New Project
          </button>
        </div>

        <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {visibleProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {visibleProjects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  companyId={companyId}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onDelete={(p) => setDeleteTarget(p)}
                  onClick={(id) => navigate(`/projects/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 px-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <FaFolderOpen className="text-2xl text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white/70">{search ? "No matching projects" : "No projects yet"}</h3>
              <p className="mt-1 max-w-sm text-xs text-white/40">
                {search ? "Try adjusting your search." : "Create your first project to get started."}
              </p>
              {!search && (
                <button onClick={() => navigate("/projects/new")} className="mt-6 flex items-center gap-2 rounded-xl bg-[#5f9be8]/20 px-5 py-2.5 text-sm font-medium text-[#82b6ff] transition hover:bg-[#5f9be8]/30">
                  <FaPlus className="text-[10px]" /> Create Project
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      {deleteTarget && <DeleteConfirmModal project={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteProject} isDeleting={isDeleting} />}
    </MainLayout>
  );
}