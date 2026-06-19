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
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";

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
      year: "numeric"
    }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
};

// const getProjectProgress = (project) => {
//   if (!project) return 0;
  
//   switch (project.status) {
//     case "completed":
//       return 100;
//     case "archived":
//       return 0;
//     case "active":
//     default:
//       if (project.startDate && project.endDate) {
//         const start = new Date(project.startDate).getTime();
//         const end = new Date(project.endDate).getTime();
//         const now = Date.now();
        
//         if (now >= end) return 100;
//         if (now <= start) return 0;
        
//         const total = end - start;
//         const elapsed = now - start;
//         return Math.min(Math.round((elapsed / total) * 100), 99);
//       }
//       return 0;
//   }
// };

// const getProjectColor = (project, index) => {
//   if (!project) return PROJECT_COLORS[0];
  
//   switch (project.status) {
//     case "completed":
//       return PROJECT_COLORS[2];
//     case "archived":
//       return { hex: "#868e96", soft: "rgba(134,142,150,0.15)" };
//     case "active":
//     default:
//       return PROJECT_COLORS[index % PROJECT_COLORS.length];
//   }
// };

// ✅ Replace getProjectProgress and getProjectColor in Projects.jsx with these:

const getProjectProgress = (project) => {
  if (!project) return 0;

  // Archived projects always show 0%, completed always show 100%
  if (project.status === "archived") return 0;
  if (project.status === "completed") return 100;

  // ✅ FIX: use real task-based progress from backend if available
  if (typeof project.progress === "number") {
    return project.progress;
  }

  // Fallback for projects without task data yet
  return 0;
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
  const labels = {
    active: "Active",
    completed: "Completed",
    archived: "Archived"
  };
  return labels[status] || status;
};

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
      onClick: () => {
        onClose();
        navigate(`/projects/${project._id}/kanban`);
      },
    },
    {
      label: "View details",
      icon: FaEye,
      onClick: () => {
        onClose();
        navigate(`/projects/${project._id}`);
      },
    },
    {
      label: "Delete",
      icon: FaTrashAlt,
      danger: true,
      onClick: () => {
        onClose();
        onDelete();
      },
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
          Are you sure you want to delete <span className="font-medium text-white">"{project.name}"</span>? 
          This action cannot be undone and all associated data will be permanently removed.
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
            className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold transition hover:bg-rose-500 disabled:opacity-50 flex items-center gap-2"
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

// ── Main Projects Component ────────────────────────────────────────────────────
export default function Projects() {
  const navigate = useNavigate();
  
  // State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All Projects");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get company ID from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const storedCompanyId = localStorage.getItem("companyId") || user.companyId;

      console.log("🔍 Debug Info:", {
        user,
        storedCompanyId,
        allLocalStorage: { ...localStorage }
      });

      if (!storedCompanyId) {
        throw new Error("No company selected. Please select a company first.");
      }

      setCompanyId(storedCompanyId);

      console.log("📡 Fetching projects for company:", storedCompanyId);
      const response = await projectService.getProjectsByCompany(storedCompanyId);
      console.log("✅ API Response:", response);

      if (response.success) {
        setProjects(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch projects");
      }
    } catch (err) {
      console.error("❌ Full Error:", err);
      console.error("Error Details:", {
        message: err.message,
        status: err.status,
        response: err.response?.data,
        config: err.config
      });
      setError(err.message || "Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Delete Handler ─────────────────────────────────────────────────────────
  const handleDeleteProject = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      
      await projectService.deleteProject(deleteTarget._id);
      
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error deleting project:", err);
      alert(err.message || "Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // ── Filter & Search Logic ──────────────────────────────────────────────────
  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    
    return projects.filter((project) => {
      const matchesSearch = !query || 
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);

      const progress = getProjectProgress(project);
      const matchesFilter = 
        filter === "All Projects" ||
        (filter === "Active" && project.status === "active" && progress < 100) ||
        (filter === "Completed" && (project.status === "completed" || progress === 100));

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout
        title="Projects"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects..."
      >
        <section className="flowio-projects-page mt-4 flex h-full min-h-[620px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 sm:p-7 lg:mt-3 lg:min-h-0">
          <div className="text-center">
            <FaSpinner className="mx-auto mb-4 text-3xl text-[#5f9be8] animate-spin" />
            <p className="text-lg font-medium text-white/60">Loading projects...</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error && !projects.length) {
    return (
      <MainLayout
        title="Projects"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects..."
      >
        <section className="flowio-projects-page mt-4 flex h-full min-h-[620px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 sm:p-7 lg:mt-3 lg:min-h-0">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
              <FaExclamationTriangle className="text-2xl text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-white/80">Failed to Load Projects</h3>
            <p className="mt-2 text-sm text-white/50">{error}</p>
            <div className="mt-4 text-xs text-white/30">
              <p>Company ID: {companyId || "Not found"}</p>
              <p>Token: {localStorage.getItem("token") ? "Present ✅" : "Missing ❌"}</p>
            </div>
            <button
              onClick={fetchProjects}
              className="mt-6 rounded-xl bg-[#5f9be8] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#70a9ef] active:scale-95 flex items-center gap-2 mx-auto"
            >
              <FaSync className="text-xs" />
              Try Again
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <MainLayout
      title="Projects"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search projects..."
    >
      <section className="flowio-projects-page mt-4 flex h-full min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 text-white shadow-[inset_0_0_70px_rgba(5,8,54,.58),0_18px_50px_rgba(1,3,28,.2)] sm:p-7 lg:mt-3 lg:min-h-0">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter Tabs */}
          <div className="flex gap-6 overflow-x-auto sm:gap-10">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`relative whitespace-nowrap pb-2 text-sm font-medium transition sm:text-base ${
                  filter === item
                    ? "text-[#a7b8ff]"
                    : "text-white/55 hover:text-white/80"
                }`}
              >
                {item}
                {filter === item && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#9fb2ff]" />
                )}
              </button>
            ))}
          </div>

          {/* Add Project Button */}
          <button
            type="button"
            onClick={() => navigate("/projects/new")}
            className="flex items-center justify-center gap-2 rounded-full bg-[#5f9be8] px-6 py-2.5 text-sm font-medium shadow-[0_8px_22px_rgba(74,137,230,.22)] transition hover:-translate-y-0.5 hover:bg-[#70a9ef] active:scale-95"
          >
            <FaPlus className="text-[10px]" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {visibleProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {visibleProjects.map((project, index) => {
                const color = getProjectColor(project, index);
                const progress = getProjectProgress(project);

                return (
                  <article
                    key={project._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleProjectClick(project._id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleProjectClick(project._id);
                      }
                    }}
                    className="flowio-project-card group relative flex min-h-[200px] flex-col justify-between rounded-[26px] border border-[#263774]/35 bg-[radial-gradient(ellipse_at_52%_48%,rgba(27,42,90,.76)_0%,rgba(15,25,65,.94)_58%,rgba(9,17,52,.98)_100%)] p-6 shadow-[0_18px_42px_rgba(1,4,26,.25),inset_0_1px_0_rgba(255,255,255,.025)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.09] hover:shadow-[0_22px_48px_rgba(1,4,26,.34),inset_0_1px_0_rgba(255,255,255,.04)] sm:min-h-[210px] sm:p-7"
                  >
                    {/* Project Header */}
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xl shadow-[inset_0_0_18px_rgba(255,255,255,.025)]"
                        style={{
                          color: color.hex,
                          backgroundColor: color.soft,
                          borderColor: `${color.hex}45`,
                        }}
                      >
                        <FaFolderOpen />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3
                            onClick={(event) => {
                              event.stopPropagation();
                              handleProjectClick(project._id);
                            }}
                            className="truncate text-left text-[17px] font-semibold tracking-[-0.01em] transition hover:text-[#82b6ff] cursor-pointer"
                          >
                            {project.name}
                          </h3>
                          
                          {/* Actions Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              aria-label={`Open actions for ${project.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuId((current) =>
                                  current === project._id ? null : project._id
                                );
                              }}
                              className="rounded-lg p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white"
                            >
                              <FaEllipsisH />
                            </button>
                            
                            {openMenuId === project._id && (
                              <ProjectMenu
                                project={project}
                                onClose={() => setOpenMenuId(null)}
                                onDelete={() => setDeleteTarget(project)}
                              />
                            )}
                          </div>
                        </div>
                        
                        <p className="mt-2.5 line-clamp-2 max-w-[92%] text-xs leading-5 text-white/45">
                          {project.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-white/40 capitalize">
                          {getStatusLabel(project.status)}
                        </span>
                        <span
                          className="text-[15px] font-semibold tracking-wide"
                          style={{ color: color.hex }}
                        >
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#1a2859]/90 shadow-[inset_0_1px_3px_rgba(1,4,25,.45)]">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${progress}%`,
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
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: color.hex }}
                        />
                        <FaTasks className="sr-only" />
                        {project.taskCount || 0} tasks
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 text-center px-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <FaFolderOpen className="text-2xl text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white/70">
                {search ? "No matching projects" : "No projects yet"}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-white/40">
                {search
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first project to get started with your workflow."}
              </p>
              {!search && (
                <button
                  onClick={() => navigate("/projects/new")}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-[#5f9be8]/20 px-5 py-2.5 text-sm font-medium text-[#82b6ff] transition hover:bg-[#5f9be8]/30"
                >
                  <FaPlus className="text-[10px]" />
                  Create Project
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          project={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteProject}
          isDeleting={isDeleting}
        />
      )}
    </MainLayout>
  );
}