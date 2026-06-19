import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaChevronDown,
  FaChevronRight,
  FaColumns,
  FaSpinner,
  FaExclamationTriangle,
  FaBookOpen,
  FaTasks,
  FaCalendarAlt,
  FaUsers,
  FaPlus,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";
import taskService from "../../services/taskService";
import API from "../../services/api";

const formatDate = (date) => {
  if (!date) return "Not set";
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

const getStatusColor = (status) => {
  const colors = {
    active: "#5f9be8",
    completed: "#20c997",
    archived: "#868e96",
  };
  return colors[status] || "#5f9be8";
};

const getStatusBadge = (status) => {
  const badges = {
    active: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    completed: "bg-green-500/20 text-green-300 border-green-400/30",
    archived: "bg-gray-500/20 text-gray-300 border-gray-400/30",
  };
  return badges[status] || badges.active;
};

const getEpicStatusBadge = (status) => {
  const badges = {
    "To Do": "bg-sky-500/20 text-sky-300 border-sky-400/30",
    "In Progress": "bg-amber-500/20 text-amber-300 border-amber-400/30",
    Done: "bg-green-500/20 text-green-300 border-green-400/30",
  };
  return badges[status] || badges["To Do"];
};

export default function ProjectDetails() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [epics, setEpics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEpics, setExpandedEpics] = useState(new Set());

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!projectId) {
        throw new Error("No project ID provided");
      }

      // ── 1. Fetch project ───────────────────────────────────────────────────
      const projectResponse = await projectService.getProjectById(projectId);
      let projectData = null;

      if (projectResponse.success && projectResponse.data) {
        projectData = projectResponse.data;
      } else if (projectResponse.data) {
        projectData = projectResponse.data;
      } else if (projectResponse._id) {
        projectData = projectResponse;
      }

      if (!projectData) {
        throw new Error("Project data not found in response");
      }

      setProject(projectData);

      // ── 2. Fetch epics filtered by projectId ───────────────────────────────
      try {
        const epicsResponse = await API.get(`/api/epics?projectId=${projectId}`);

        let epicsData = [];
        if (epicsResponse.data?.success && Array.isArray(epicsResponse.data.data)) {
          epicsData = epicsResponse.data.data;
        } else if (Array.isArray(epicsResponse.data)) {
          epicsData = epicsResponse.data;
        }

        setEpics(epicsData);

        if (epicsData.length > 0) {
          setExpandedEpics(new Set(epicsData.map((e) => e._id)));
        }
      } catch (epicErr) {
        console.error("Could not load epics:", epicErr);
        setEpics([]);
      }

      // ── 3. Fetch tasks for this project ────────────────────────────────────
      try {
        const tasksData = await taskService.getAllTasksByProject(projectId);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (taskErr) {
        console.error("Could not load tasks:", taskErr);
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError(err.message || "Failed to load project details");
    } finally {
      // ── This MUST run so the spinner stops ────────────────────────────────
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, fetchProjectDetails]);

  const toggleEpic = (epicId) => {
    setExpandedEpics((current) => {
      const next = new Set(current);
      if (next.has(epicId)) {
        next.delete(epicId);
      } else {
        next.add(epicId);
      }
      return next;
    });
  };

  const getEpicTasks = (epicId) => {
    return tasks.filter((task) => {
      if (!task.epicId) return false;
      if (typeof task.epicId === "object" && task.epicId) {
        return task.epicId._id === epicId || String(task.epicId) === epicId;
      }
      return String(task.epicId) === epicId;
    });
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const doneTasks = tasks.filter((t) => t.status === "done").length;
    return Math.round((doneTasks / tasks.length) * 100);
  };

  if (loading) {
    return (
      <MainLayout>
        <section className="flowio-projects-page mt-4 flex h-full min-h-[500px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_50%_40%,#090c4f_0%,#070933_56%,#05072d_100%)] p-4 sm:p-6">
          <div className="text-center">
            <FaSpinner className="mx-auto mb-4 text-3xl text-[#5f9be8] animate-spin" />
            <p className="text-white/60">Loading project details...</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <section className="flowio-projects-page mt-4 flex h-full min-h-[500px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_50%_40%,#090c4f_0%,#070933_56%,#05072d_100%)] p-4 sm:p-6">
          <div className="max-w-md text-center">
            <FaExclamationTriangle className="mx-auto mb-4 text-3xl text-rose-400" />
            <h3 className="text-lg font-semibold text-white/80">Failed to Load</h3>
            <p className="mt-2 text-sm text-white/50">{error}</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={fetchProjectDetails}
                className="rounded-xl bg-[#5f9be8] px-6 py-2.5 text-sm font-medium transition hover:bg-[#70a9ef]"
              >
                Try Again
              </button>
              <br />
              <button
                onClick={() => navigate("/projects")}
                className="text-sm text-white/50 hover:text-white transition"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <section className="flowio-projects-page mt-4 flex h-full min-h-[500px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_50%_40%,#090c4f_0%,#070933_56%,#05072d_100%)] p-4 sm:p-6">
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

  const progress = calculateProgress();
  const color = { hex: getStatusColor(project.status) };

  return (
    <MainLayout>
      <section className="flowio-projects-page flowio-project-details flex h-full min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_50%_40%,#090c4f_0%,#070933_56%,#05072d_100%)] p-4 text-white shadow-[inset_0_0_70px_rgba(5,8,54,.55)] sm:p-6 lg:min-h-0">
        <header className="flex items-center justify-between gap-4 px-1 pb-5 border-b border-white/[0.05]">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <FaArrowLeft />
            </button>
            <span className="font-semibold text-white truncate">{project.name}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/kanban`)}
            className="hidden items-center gap-2 rounded-xl bg-[#5f9be8]/15 px-4 py-2 text-xs text-[#8dc1ff] transition hover:bg-[#5f9be8]/25 sm:flex"
          >
            <FaColumns />
            View kanban
          </button>
        </header>

        <div className="mt-6 rounded-[24px] border border-white/[0.06] bg-[#111846]/60 p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-bold">{project.name}</h2>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold capitalize ${getStatusBadge(project.status)}`}>
                  {project.status || "active"}
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
                {project.description || "No description provided"}
              </p>
            </div>

            <div className="flex items-center gap-6 sm:text-right">
              <div>
                <p className="text-xs text-white/40">Progress</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2.5 w-32 rounded-full bg-[#1a2859]/90 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: color.hex,
                        boxShadow: `0 0 14px ${color.hex}55`,
                      }}
                    />
                  </div>
                  <span className="text-lg font-bold" style={{ color: color.hex }}>
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-[#5f9be8] text-sm" />
              <div>
                <p className="text-[10px] text-white/40">Start Date</p>
                <p className="text-xs font-medium">{formatDate(project.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-[#fab005] text-sm" />
              <div>
                <p className="text-[10px] text-white/40">End Date</p>
                <p className="text-xs font-medium">{formatDate(project.endDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaTasks className="text-[#20c997] text-sm" />
              <div>
                <p className="text-[10px] text-white/40">Total Tasks</p>
                <p className="text-xs font-medium">{tasks.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaBookOpen className="text-[#7c5ce7] text-sm" />
              <div>
                <p className="text-[10px] text-white/40">Epics</p>
                <p className="text-xs font-medium">{epics.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Epics & Tasks</h3>
            <span className="text-xs text-white/40">{epics.length} epics, {tasks.length} tasks</span>
          </div>

          {epics.length > 0 ? (
            epics.map((epic, epicIndex) => {
              const epicTasks = getEpicTasks(epic._id);
              const epicProgress =
                epicTasks.length > 0
                  ? Math.round(
                      (epicTasks.filter((t) => t.status === "done").length /
                        epicTasks.length) *
                        100
                    )
                  : 0;

              return (
                <article
                  key={epic._id}
                  className="flowio-project-epic-card flex min-h-[300px] flex-col rounded-[30px] border border-[#1d2d7b]/45 bg-[radial-gradient(ellipse_at_50%_42%,#061164_0%,#070933_34%,#070933_76%,#090c4f_100%)] p-6 shadow-[0_20px_46px_rgba(1,4,28,.24),inset_0_1px_0_rgba(255,255,255,.025)] sm:min-h-[322px] sm:p-8"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-5">
                      <h2 className="text-[15px] font-semibold">{epic.name}</h2>
                      <span className={`rounded-full border px-4 py-1.5 text-[10px] font-medium ${getEpicStatusBadge(epic.status)}`}>
                        {epic.status || "To Do"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/40">{epicTasks.length} tasks</span>
                      <span className="text-sm font-semibold" style={{ color: color.hex }}>
                        {epicProgress}%
                      </span>
                    </div>
                  </div>

                  <div className="flowio-project-progress-track mt-5 h-2.5 overflow-hidden rounded-full bg-[#18275d]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${epicProgress}%`,
                        backgroundColor: color.hex,
                        boxShadow: `0 0 14px ${color.hex}55`,
                      }}
                    />
                  </div>

                  {epic.description && (
                    <p className="mt-4 text-xs text-white/45">{epic.description}</p>
                  )}

                  <div className="mt-5 flex-1 space-y-3">
                    {epicTasks.length > 0 ? (
                      epicTasks.map((task) => (
                        <div
                          key={task._id}
                          className="flowio-project-story-card min-h-[86px] rounded-[18px] border border-[#34458a]/70 bg-[#090e3d]/65 px-5 py-4 hover:border-[#4a5eb8]/70 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <FaTasks className="text-xs text-[#5f9be8]" />
                              <div>
                                <p className="text-xs font-medium">{task.title}</p>
                                {task.description && (
                                  <p className="mt-1 text-[10px] text-white/40 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`rounded-full border px-2 py-0.5 text-[8px] font-medium capitalize ${
                                task.status === "done"
                                  ? "text-green-300 border-green-400/30 bg-green-500/10"
                                  : task.status === "in-progress"
                                  ? "text-amber-300 border-amber-400/30 bg-amber-500/10"
                                  : "text-sky-300 border-sky-400/30 bg-sky-500/10"
                              }`}>
                                {task.status || "todo"}
                              </span>
                              <span className={`rounded-full border px-2 py-0.5 text-[8px] font-medium capitalize ${
                                task.priority === "high"
                                  ? "text-rose-300 border-rose-400/30 bg-rose-500/10"
                                  : task.priority === "medium"
                                  ? "text-amber-300 border-amber-400/30 bg-amber-500/10"
                                  : "text-sky-300 border-sky-400/30 bg-sky-500/10"
                              }`}>
                                {task.priority || "medium"}
                              </span>
                              {task.assignedTo && (
                                <div className="flex items-center gap-1 text-[9px] text-white/35">
                                  <FaUsers className="text-[8px]" />
                                  {typeof task.assignedTo === "object"
                                    ? task.assignedTo.name?.split(" ")[0] || "User"
                                    : "User"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
                        <FaTasks className="mb-2 text-lg text-white/20" />
                        <p className="text-xs text-white/35">No tasks assigned to this epic yet.</p>
                        <button
                          onClick={() => navigate(`/projects/${projectId}/kanban`)}
                          className="mt-2 flex items-center gap-1 text-[10px] text-[#5f9be8] hover:text-[#70a9ef] transition"
                        >
                          <FaPlus className="text-[8px]" />
                          Go to Kanban Board
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-right text-[9px] text-white/25">
                    Epic {epicIndex + 1} of {epics.length}
                  </p>
                </article>
              );
            })
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-[24px] border border-dashed border-white/10 text-center">
              <div>
                <FaBookOpen className="mx-auto mb-3 text-3xl text-white/20" />
                <p className="text-sm text-white/50">No epics created yet</p>
                <p className="mt-1 text-xs text-white/30">
                  Epics help you organize tasks into larger bodies of work.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}