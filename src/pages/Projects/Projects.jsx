import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArchive,
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

const FILTERS = ["All Projects", "Active", "Completed", "Archived"];
const PROJECT_COLORS = [
  { hex: "#5f9be8", soft: "rgba(95,155,232,0.15)" },
  { hex: "#7c5ce7", soft: "rgba(124,92,231,0.15)" },
  { hex: "#20c997", soft: "rgba(32,201,151,0.15)" },
  { hex: "#f06595", soft: "rgba(240,101,149,0.15)" },
  { hex: "#fab005", soft: "rgba(250,176,5,0.15)" },
];

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

const isDoneStory = (story) => {
  const status = String(story?.status || "").toLowerCase();
  return status === "done" || status === "completed";
};

const calculateProjectProgress = (project, stories = []) => {
  if (!stories.length) return project.status === "completed" ? 100 : 0;
  return Math.round((stories.filter(isDoneStory).length / stories.length) * 100);
};

const getProjectDisplayStatus = (project, progress = Number(project?.progress) || 0) => {
  if (project?.status === "archived" || project?.isArchived) return "archived";
  if (progress >= 100 || project?.status === "completed") return "completed";
  return "active";
};

const getProjectColor = (project, index) => {
  if (!project) return PROJECT_COLORS[0];
  switch (getProjectDisplayStatus(project)) {
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
  return labels[status] || status || "Active";
};

function SubtaskRow({ subtask, accentColor, onToggle }) {
  const isDone = subtask.isCompleted || subtask.status === SUBTASK_STATUS.DONE;
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(subtask._id, !isDone); }}
        className="shrink-0 transition-transform active:scale-90"
      >
        {isDone ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: accentColor }}>
            <FaCheck className="text-[8px] text-white" />
          </span>
        ) : (
          <FaRegCircle className="h-4 w-4 text-white/30" />
        )}
      </button>
      <span className={`text-[11px] leading-4 ${isDone ? "text-white/30 line-through" : "text-white/60"}`}>
        {subtask.title}
      </span>
    </div>
  );
}

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
      if (!storyId) return;
      try {
        setLoading(true);
        const res = await subtaskService.getSubtasksByStory(storyId);
        if (!cancelled) {
          const data = res?.data || res || [];
          setSubtasks(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setSubtasks([]);
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
      prev.map((s) => s._id === subtaskId
        ? { ...s, isCompleted, status: isCompleted ? SUBTASK_STATUS.DONE : SUBTASK_STATUS.TODO }
        : s)
    );
    try {
      await subtaskService.toggleSubtaskComplete(subtaskId, isCompleted);
    } catch {
      setSubtasks((prev) =>
        prev.map((s) => s._id === subtaskId
          ? { ...s, isCompleted: !isCompleted, status: !isCompleted ? SUBTASK_STATUS.DONE : SUBTASK_STATUS.TODO }
          : s)
      );
    }
  };

  const handleAddSubtask = async (e) => {
    e.stopPropagation();
    const title = newTitle.trim();
    if (!title || !storyId || !companyId) return;
    setAdding(true);
    try {
      const res = await subtaskService.createSubtask({ title, storyId, companyId, status: "To Do" });
      if (res?.success && res?.data) {
        setSubtasks((prev) => [...prev, res.data]);
        setNewTitle("");
        setShowInput(false);
      }
    } catch (err) {
      console.error("Failed to add subtask:", err);
    } finally {
      setAdding(false);
    }
  };

  const doneCount = subtasks.filter((s) => s.isCompleted || s.status === SUBTASK_STATUS.DONE).length;

  if (loading) {
    return <div className="flex items-center gap-2 py-2 text-[11px] text-white/30"><FaSpinner className="animate-spin text-[10px]" /> Loading...</div>;
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
            placeholder="Subtask title..."
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white placeholder-white/25 outline-none"
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
          <button type="button" onClick={(e) => { e.stopPropagation(); setShowInput(false); setNewTitle(""); }} className="text-[11px] text-white/30 hover:text-white/60">✕</button>
        </div>
      ) : (
        <button type="button" onClick={(e) => { e.stopPropagation(); setShowInput(true); }} className="mt-2 flex items-center gap-1.5 text-[11px] text-white/30 transition hover:text-white/55">
          <FaPlus className="text-[9px]" /> Add subtask
        </button>
      )}
    </div>
  );
}

function ProjectMenu({ project, onClose, onArchive, onDelete }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const isArchived = getProjectDisplayStatus(project) === "archived";

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [onClose]);

  return (
    <div ref={menuRef} onClick={(e) => e.stopPropagation()} className="flowio-project-menu absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#0f1535] p-1.5 shadow-2xl">
      {[
        { label: "View kanban", icon: FaColumns, onClick: () => { onClose(); navigate(`/projects/${project._id}/kanban`); } },
        { label: "View details", icon: FaEye, onClick: () => { onClose(); navigate(`/projects/${project._id}/details`); } },
        ...(!isArchived
          ? [{ label: "Archive", icon: FaArchive, onClick: () => { onClose(); onArchive(); } }]
          : []),
        { label: "Delete", icon: FaTrashAlt, danger: true, onClick: () => { onClose(); onDelete(); } },
      ].map(({ label, icon: Icon, danger, onClick }) => (
        <button key={label} type="button" onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${danger ? "text-rose-300 hover:bg-rose-500/20 hover:text-rose-200" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
          <Icon className="text-[11px]" /> {label}
        </button>
      ))}
    </div>
  );
}

function DeleteConfirmModal({ project, onCancel, onConfirm, isDeleting }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020414]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#0f1535] p-6 text-white shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-300"><FaExclamationTriangle className="text-lg" /></div>
        <h3 className="mt-4 text-lg font-semibold">Delete Project</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">Are you sure you want to delete <span className="font-medium text-white">"{project?.name}"</span>? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={isDeleting} className="rounded-xl px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold transition hover:bg-rose-500 disabled:opacity-50">
            {isDeleting ? <><FaSpinner className="animate-spin text-xs" /> Deleting...</> : "Delete Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, index, companyId, openMenuId, setOpenMenuId, onArchive, onDelete, onClick }) {
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const color = getProjectColor(project, index);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStoriesLoading(true);
        const res = await storyService.getStoriesByProject(project._id);
        if (!cancelled) {
          const data = res?.data || res || [];
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

  const progress = stories.length === 0
    ? Number(project.progress) || calculateProjectProgress(project)
    : calculateProjectProgress(project, stories);
  const displayStatus = getProjectDisplayStatus(project, progress);

  const firstStoryId = stories[0]?._id;

  return (
    <article
      role="button" tabIndex={0}
      onClick={() => onClick(project._id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(project._id); } }}
      className="flowio-project-card group relative flex flex-col rounded-[22px] border border-[#263774]/35 bg-[radial-gradient(ellipse_at_52%_48%,rgba(27,42,90,.76)_0%,rgba(15,25,65,.94)_58%,rgba(9,17,52,.98)_100%)] p-4 shadow-[0_18px_42px_rgba(1,4,26,.25)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.09] hover:shadow-[0_22px_48px_rgba(1,4,26,.34)] sm:rounded-[26px] sm:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg sm:h-12 sm:w-12 sm:text-xl" style={{ color: color.hex, backgroundColor: color.soft, borderColor: `${color.hex}45` }}>
          <FaFolderOpen />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 onClick={(e) => { e.stopPropagation(); onClick(project._id); }} className="truncate text-left text-[15px] font-semibold transition hover:text-[#82b6ff] cursor-pointer sm:text-[17px]">
              {project.name}
            </h3>
            <div className="relative">
              <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId((c) => c === project._id ? null : project._id); }} className="rounded-lg p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white">
                <FaEllipsisH />
              </button>
              {openMenuId === project._id && <ProjectMenu project={project} onClose={() => setOpenMenuId(null)} onArchive={() => onArchive(project)} onDelete={() => onDelete(project)} />}
            </div>
          </div>
          <p className="mt-2.5 line-clamp-3 text-xs leading-5 text-white/45 sm:line-clamp-2 sm:max-w-[92%]">{project.description || "No description provided"}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-white/40 capitalize">{getStatusLabel(displayStatus)}</span>
          <div className="flex items-center gap-3">
            {storiesLoading ? <FaSpinner className="animate-spin text-[10px] text-white/30" /> : <span className="text-[10px] text-white/35">{stories.length} stories</span>}
            <span className="text-[15px] font-semibold tracking-wide" style={{ color: color.hex }}>{storiesLoading ? "--" : `${progress}%`}</span>
          </div>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[#1a2859]/90">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${storiesLoading ? 0 : progress}%`, backgroundColor: color.hex, boxShadow: `0 0 14px ${color.hex}66` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.035] pt-3.5 text-[11px] text-white/42">
        <span className="flex items-center gap-2"><FaCalendarAlt className="text-[10px]" />{formatDate(project.endDate || project.startDate)}</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.hex }} /><FaTasks className="sr-only" />{stories.length} stories</span>
      </div>

      {firstStoryId && (
        <div className="mt-3 border-t border-white/[0.035] pt-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); setSubtasksOpen((o) => !o); }} className="flex w-full items-center justify-between text-[11px] text-white/35 transition hover:text-white/60">
            <span>Subtasks</span>
            {subtasksOpen ? <FaChevronUp className="text-[9px]" /> : <FaChevronDown className="text-[9px]" />}
          </button>
          {subtasksOpen && <SubtasksPanel storyId={firstStoryId} accentColor={color.hex} companyId={companyId} />}
        </div>
      )}
    </article>
  );
}

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
      const rawProjects = response?.success
        ? response.data || []
        : (() => {
            const data = response?.data || response;
            return Array.isArray(data) ? data : [];
          })();

      const projectsWithProgress = await Promise.all(
        rawProjects.map(async (project) => {
          try {
            const storiesRes = await storyService.getStoriesByProject(project._id || project.id);
            const stories = storiesRes?.data || storiesRes || [];
            return {
              ...project,
              progress: calculateProjectProgress(project, Array.isArray(stories) ? stories : []),
            };
          } catch (err) {
            console.error(`Failed to load stories for project ${project._id || project.id}:`, err);
            return {
              ...project,
              progress: Number.isFinite(Number(project.progress))
                ? Number(project.progress)
                : calculateProjectProgress(project),
            };
          }
        })
      );

      if (response?.success) {
        setProjects(projectsWithProgress);
      } else {
        setProjects(projectsWithProgress);
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

  const handleArchiveProject = async (project) => {
    const projectId = project?._id;
    if (!projectId) return;

    setOpenMenuId(null);
    setProjects((prev) =>
      prev.map((item) =>
        item._id === projectId
          ? { ...item, status: "archived", isArchived: true }
          : item,
      ),
    );

    try {
      await projectService.updateProject(projectId, {
        status: "archived",
        isArchived: true,
      });
      setFilter("Archived");
    } catch (err) {
      setProjects((prev) =>
        prev.map((item) => (item._id === projectId ? project : item)),
      );
      alert(err.message || "Failed to archive project.");
    }
  };

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !query || project.name?.toLowerCase().includes(query) || project.description?.toLowerCase().includes(query);
      let matchesFilter = true;
      const displayStatus = getProjectDisplayStatus(project);
      if (filter === "Active") matchesFilter = displayStatus === "active";
      else if (filter === "Completed") matchesFilter = displayStatus === "completed";
      else if (filter === "Archived") matchesFilter = displayStatus === "archived";
      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  if (loading) {
    return (
      <MainLayout title="Projects" searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search projects...">
        <section className="flowio-projects-page mt-4 flex min-h-[420px] items-center justify-center rounded-[22px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 sm:rounded-[30px] sm:p-7 lg:mt-3 lg:h-full lg:min-h-0">
          <div className="text-center"><FaSpinner className="mx-auto mb-4 animate-spin text-3xl text-[#5f9be8]" /><p className="text-lg font-medium text-white/60">Loading projects...</p></div>
        </section>
      </MainLayout>
    );
  }

  if (error && !projects.length) {
    return (
      <MainLayout title="Projects" searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search projects...">
        <section className="flowio-projects-page mt-4 flex min-h-[420px] items-center justify-center rounded-[22px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 sm:rounded-[30px] sm:p-7 lg:mt-3 lg:h-full lg:min-h-0">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10"><FaExclamationTriangle className="text-2xl text-rose-400" /></div>
            <h3 className="text-lg font-semibold text-white/80">Failed to Load Projects</h3>
            <p className="mt-2 text-sm text-white/50">{error}</p>
            <button onClick={fetchProjects} className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[#5f9be8] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#70a9ef]"><FaSync className="text-xs" /> Try Again</button>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Projects" searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search projects...">
      <section className="flowio-projects-page mt-4 flex min-h-[520px] flex-col overflow-visible rounded-[22px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 text-white sm:rounded-[30px] sm:p-7 lg:mt-3 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-10 sm:overflow-x-auto">
            {FILTERS.map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`relative rounded-xl px-3 py-2 text-left text-sm font-medium transition sm:rounded-none sm:px-0 sm:pb-2 sm:text-base ${filter === item ? "bg-blue-300/10 text-[#a7b8ff] sm:bg-transparent" : "text-white/55 hover:text-white/80"}`}>
                {item}
                {filter === item && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#9fb2ff]" />}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => navigate("/projects/new")} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5f9be8] px-6 py-3 text-sm font-medium shadow-[0_8px_22px_rgba(74,137,230,.22)] transition hover:-translate-y-0.5 hover:bg-[#70a9ef] active:scale-95 sm:w-auto sm:py-2.5">
            <FaPlus className="text-[10px]" /> New Project
          </button>
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-visible pr-0 sm:mt-8 lg:overflow-y-auto lg:pr-1">
          {visibleProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {visibleProjects.map((project, index) => (
                <ProjectCard key={project._id} project={project} index={index} companyId={companyId} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onArchive={handleArchiveProject} onDelete={(p) => setDeleteTarget(p)} onClick={(id) => navigate(`/projects/${id}/details`)} />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 px-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5"><FaFolderOpen className="text-2xl text-white/20" /></div>
              <h3 className="text-lg font-medium text-white/70">{search ? "No matching projects" : filter !== "All Projects" ? `No ${filter.toLowerCase()} projects` : "No projects yet"}</h3>
              <p className="mt-1 max-w-sm text-xs text-white/40">{search ? "Try adjusting your search." : "Create your first project to get started."}</p>
              {!search && filter === "All Projects" && (
                <button onClick={() => navigate("/projects/new")} className="mt-6 flex items-center gap-2 rounded-xl bg-[#5f9be8]/20 px-5 py-2.5 text-sm font-medium text-[#82b6ff] transition hover:bg-[#5f9be8]/30"><FaPlus className="text-[10px]" /> Create Project</button>
              )}
            </div>
          )}
        </div>
      </section>
      {deleteTarget && <DeleteConfirmModal project={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteProject} isDeleting={isDeleting} />}
    </MainLayout>
  );
}
