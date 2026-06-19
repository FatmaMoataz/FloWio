import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCircle,
  FaClock,
  FaLayerGroup,
  FaSpinner,
  FaExclamationTriangle,
  FaPlus,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";
import taskService from "../../services/taskService";

// ── Column Configuration ──────────────────────────────────────────────────────
const DEFAULT_COLUMNS = [
  { id: "todo", title: "To Do", icon: FaLayerGroup, color: "#5f9be8" },
  { id: "in-progress", title: "In Progress", icon: FaClock, color: "#fab005" },
  { id: "review", title: "In Review", icon: FaCheckCircle, color: "#7c5ce7" },
  { id: "done", title: "Done", icon: FaCheckCircle, color: "#20c997" },
];

const priorityStyles = {
  low: "border-sky-300/30 bg-sky-400/15 text-sky-200",
  medium: "border-amber-300/30 bg-amber-400/15 text-amber-200",
  high: "border-rose-300/30 bg-rose-400/15 text-rose-200",
};

const formatDate = (date) => {
  if (!date) return "No due date";
  try {
    return new Intl.DateTimeFormat("en", { 
      month: "short", 
      day: "numeric" 
    }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
};

export default function ProjectKanban() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch Project and Tasks ────────────────────────────────────────────────
  const fetchKanbanData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Fetching project:", projectId);

      // Fetch project details
      const projectResponse = await projectService.getProjectById(projectId);
      
      if (!projectResponse.success) {
        throw new Error(projectResponse.message || "Failed to load project");
      }

      const projectData = projectResponse.data;
      setProject(projectData);
      console.log("✅ Project loaded:", projectData.name);

      // Fetch tasks for this project using the correct nested route
      console.log("📡 Fetching tasks for project:", projectId);
      const tasksData = await taskService.getAllTasksByProject(projectId);
      
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      console.log(`✅ Loaded ${tasksData?.length || 0} tasks`);

    } catch (err) {
      console.error("❌ Error fetching kanban data:", err);
      setError(err.message || "Failed to load kanban board");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchKanbanData();
    }
  }, [projectId, fetchKanbanData]);

  // ── Get tasks for a specific column/status ─────────────────────────────────
  const getColumnTasks = (status) => {
    return tasks.filter(task => task.status === status);
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout title="Kanban">
        <section className="flowio-projects-page mt-4 flex h-full min-h-[500px] items-center justify-center rounded-[28px] bg-[#090d4b]/70 p-5 sm:p-7 lg:mt-3">
          <div className="text-center">
            <FaSpinner className="mx-auto mb-4 text-3xl text-[#5f9be8] animate-spin" />
            <p className="text-white/60">Loading kanban board...</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <MainLayout title="Kanban">
        <section className="flowio-projects-page mt-4 flex h-full min-h-[500px] items-center justify-center rounded-[28px] bg-[#090d4b]/70 p-5 sm:p-7 lg:mt-3">
          <div className="max-w-md text-center">
            <FaExclamationTriangle className="mx-auto mb-4 text-3xl text-rose-400" />
            <h3 className="text-lg font-semibold text-white/80">Failed to Load Board</h3>
            <p className="mt-2 text-sm text-white/50">{error}</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={fetchKanbanData}
                className="rounded-xl bg-[#5f9be8] px-6 py-2.5 text-sm font-medium transition hover:bg-[#70a9ef]"
              >
                Try Again
              </button>
              <br />
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="text-sm text-white/50 hover:text-white transition"
              >
                Back to Project Details
              </button>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  // ── If no project found ────────────────────────────────────────────────────
  if (!project) {
    return (
      <MainLayout title="Kanban">
        <section className="flowio-projects-page mt-4 flex h-full min-h-[500px] items-center justify-center rounded-[28px] bg-[#090d4b]/70 p-5 sm:p-7 lg:mt-3">
          <div className="text-center text-white/60">
            <p className="text-lg">Project not found</p>
            <button
              onClick={() => navigate("/projects")}
              className="mt-4 text-sm text-[#5f9be8] hover:underline"
            >
              Back to Projects
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  // ── Calculate statistics ──────────────────────────────────────────────────
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <MainLayout title={`${project.name} - Kanban`}>
      <section className="flowio-projects-page flowio-project-kanban mt-4 h-full overflow-y-auto rounded-[28px] bg-[#090d4b]/70 p-5 text-white sm:p-7 lg:mt-3">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => navigate(`/projects/${project._id}`)}
              className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition"
            >
              <FaArrowLeft className="text-xs" />
              Back to project
            </button>
            <h1 className="mt-3 text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-white/50 max-w-lg">{project.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-white/40">Progress</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-[#1a2859]/90 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#5f9be8] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{progress}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">Total Tasks</p>
              <p className="text-lg font-semibold">{totalTasks}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">Completed</p>
              <p className="text-lg font-semibold text-[#20c997]">{completedTasks}</p>
            </div>
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="grid gap-5 lg:grid-cols-4">
          {DEFAULT_COLUMNS.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            const ColumnIcon = column.icon;

            return (
              <div
                key={column.id}
                className="flowio-kanban-column min-h-[430px] rounded-[22px] border border-white/[0.06] bg-[#101746]/75 p-4 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.05]">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <ColumnIcon style={{ color: column.color }} />
                    {column.title}
                  </h2>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/55">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length > 0 ? (
                    columnTasks.map((task) => (
                      <article
                        key={task._id}
                        className="flowio-kanban-card rounded-2xl border border-white/[0.05] bg-[#090f37] p-4 shadow-[0_10px_22px_rgba(1,4,28,.12)] hover:border-white/[0.1] transition cursor-pointer"
                      >
                        {/* Task Title */}
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium leading-5 flex-1">
                            {task.title}
                          </p>
                          <FaCircle
                            className="mt-1 shrink-0 text-[8px]"
                            style={{ color: column.color }}
                          />
                        </div>

                        {/* Task Description Preview */}
                        {task.description && (
                          <p className="mt-2 text-[11px] text-white/40 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Task Metadata */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold tracking-wide capitalize ${
                              priorityStyles[task.priority] || priorityStyles.medium
                            }`}
                          >
                            {task.priority || "Medium"}
                          </span>
                          
                          {task.assignedTo && (
                            <span className="text-[9px] text-white/45 bg-white/5 rounded-full px-2 py-1">
                              {typeof task.assignedTo === 'object' 
                                ? task.assignedTo.name || task.assignedTo.email
                                : 'Assigned'}
                            </span>
                          )}

                          <span className="ml-auto text-[9px] text-white/35">
                            {formatDate(task.deadline)}
                          </span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="flex flex-1 min-h-28 items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 text-center">
                      <div>
                        <p className="text-xs text-white/30">
                          No tasks in {column.title}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </MainLayout>
  );
}