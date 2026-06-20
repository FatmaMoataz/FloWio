import { useState, useEffect, useRef } from "react";
import MainLayout from "../../layout/MainLayout";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import notificationService from "../../services/notificationService";
import API from "../../services/api";
import storyService from "../../services/storyService";

import {
  FaProjectDiagram,
  FaTasks,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaBell,
  FaArrowRight,
  FaChartBar,
  FaRocket,
  FaChevronDown,
  FaChevronUp,
  FaCircle,
  FaClock,
} from "react-icons/fa";

// ── Constants ──────────────────────────────────────────────────────────────────

const typeStyle = {
  system:       { icon: <FaBell />,         color: "bg-cyan-400/20 text-cyan-300" },
  welcome:      { icon: <FaRocket />,        color: "bg-emerald-400/20 text-[#5fffd0]" },
  task_assigned:{ icon: <FaTasks />,         color: "bg-purple-400/20 text-purple-300" },
  task_updated: { icon: <FaTasks />,         color: "bg-purple-400/20 text-purple-300" },
  comment:      { icon: <FaCheckCircle />,   color: "bg-emerald-400/20 text-emerald-300" },
  like:         { icon: <FaUsers />,         color: "bg-cyan-400/20 text-cyan-300" },
  mention:      { icon: <FaUsers />,         color: "bg-purple-400/20 text-purple-300" },
  polls:        { icon: <FaProjectDiagram />,color: "bg-emerald-400/20 text-emerald-300" },
};

const STATUS = {
  isDone:       (s) => ["done", "completed"].includes((s || "").toLowerCase()),
  isInProgress: (s) => ["in-progress", "in_progress", "inprogress", "doing", "review"].includes((s || "").toLowerCase()),
  isTodo:       (s) => {
    const v = (s || "").toLowerCase();
    return !["done","completed","in-progress","in_progress","inprogress","doing","review"].includes(v);
  },
};

const PROJECT_STATUS_COLORS = {
  done: "#865dff",
  inProgress: "#d86bff",
  todo: "#59d3ff",
  gap: "#07103a",
};

const statusToProgress = (s) => {
  if (STATUS.isDone(s)) return 100;
  if (STATUS.isInProgress(s)) return 50;
  return 0;
};

const isDoneStory = (story) => {
  const status = String(story?.status || "").toLowerCase();
  return status === "done" || status === "completed";
};

const calculateProjectProgress = (project, stories = []) => {
  if (!stories.length) return project.status === "completed" ? 100 : 0;
  return Math.round((stories.filter(isDoneStory).length / stories.length) * 100);
};

const getProjectDisplayStatus = (project) => {
  const progress = Number(project?.progress) || 0;
  if (project?.status === "archived" || project?.isArchived) return "archived";
  if (progress >= 100 || project?.status === "completed") return "completed";
  if (progress > 0 || STATUS.isInProgress(project?.status)) return "in-progress";
  return "todo";
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// ── Helpers ────────────────────────────────────────────────────────────────────

const capitalizeWords = (str = "") =>
  str.trim().split(/\s+/).map((w) => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w).join(" ");

const formatRole = (role) => {
  if (!role) return "Team Member";
  return role.split(/[-_\s]+/).filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

/** Extracts all assignee IDs from a task's assignedTo/assignee/assigned_to field */
const extractAssigneeIds = (task) => {
  const field = task.assignedTo ?? task.assignee ?? task.assigned_to;
  if (!field) return [];
  return (Array.isArray(field) ? field : [field])
    .map((item) => {
      if (!item) return null;
      if (typeof item === "object") return String(item._id || item.id || "");
      return String(item);
    })
    .filter(Boolean);
};

const extractStoryAssigneeIds = (story) => {
  const field = story.assignee ?? story.assigneeId ?? story.assignedTo ?? story.assigned_to;
  if (!field) return [];
  return (Array.isArray(field) ? field : [field])
    .map((item) => {
      if (!item) return null;
      if (typeof item === "object") return String(item._id || item.id || "");
      return String(item);
    })
    .filter(Boolean);
};

const normalizeStoryForDiscipline = (story, project) => ({
  ...story,
  title: story.title || story.name || "Untitled story",
  dueDate: story.dueDate || story.due_date || project?.endDate,
  priority: story.priority || project?.priority,
});

/** Returns a display label + color class for a task status */
const statusBadge = (s) => {
  if (STATUS.isDone(s))       return { label: "Done",        cls: "bg-emerald-400/20 text-emerald-300" };
  if (STATUS.isInProgress(s)) return { label: "In Progress", cls: "bg-blue-400/20 text-blue-300" };
  return                             { label: "To Do",        cls: "bg-white/10 text-white/50" };
};

const priorityBadge = (p) => {
  const v = (p || "").toLowerCase();
  if (v === "high")   return { label: "High",   cls: "text-red-400" };
  if (v === "medium") return { label: "Med",    cls: "text-amber-400" };
  if (v === "low")    return { label: "Low",    cls: "text-emerald-400" };
  return null;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Collapsible card showing one team member and their to-do tasks */
function MemberTaskCard({ person }) {
  const [open, setOpen] = useState(false);

  const todoTasks = (person.tasks || [])
    .filter((t) => STATUS.isTodo(t.status))
    .sort((a, b) => (PRIORITY_ORDER[a.priority?.toLowerCase()] ?? 99) - (PRIORITY_ORDER[b.priority?.toLowerCase()] ?? 99));

  const inProgressTasks = (person.tasks || [])
    .filter((t) => STATUS.isInProgress(t.status));

  const doneTasks = (person.tasks || [])
    .filter((t) => STATUS.isDone(t.status));

  const { percent, totalTasks, doneCount } = person;

  return (
    <div className="rounded-[20px] bg-[#10184c]/60 transition hover:bg-[#151f62]">
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {/* Avatar */}
        {/* <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#6eb5ff] to-[#5b7dff] text-[14px] font-bold uppercase text-white ring-2 ring-white/15">
          {person.name.charAt(0)}
        </div> */}
        {/* Avatar */}
{person.avatar ? (
  <img
    src={person.avatar}
    alt={person.name}
    className="h-[42px] w-[42px] shrink-0 rounded-full object-cover ring-2 ring-white/15"
  />
) : (
  <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#6eb5ff] to-[#5b7dff] text-[14px] font-bold uppercase text-white ring-2 ring-white/15">
    {person.name.charAt(0)}
  </div>
)}

        {/* Name + role */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-tight">{person.name}</p>
          <p className="mt-0.5 text-[10px] text-white/45">{person.role}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          {person.hasTasks ? (
            <div className="text-right">
              <span className="text-[12px] font-bold text-[#78aaff]">{percent}%</span>
              <p className="text-[9px] text-white/35">{doneCount}/{totalTasks} done</p>
            </div>
          ) : (
            <span className="text-[11px] text-white/25">No stories</span>
          )}

          {/* Task count badges */}
          {todoTasks.length > 0 && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
              {todoTasks.length} to‑do
            </span>
          )}
          {inProgressTasks.length > 0 && (
            <span className="rounded-full bg-blue-400/20 px-2 py-0.5 text-[10px] text-blue-300">
              {inProgressTasks.length} active
            </span>
          )}

          {/* Chevron */}
          {person.hasTasks ? (
            open ? (
              <FaChevronUp className="shrink-0 text-[10px] text-white/30" />
            ) : (
              <FaChevronDown className="shrink-0 text-[10px] text-white/30" />
            )
          ) : null}
        </div>
      </button>

      {/* Progress bar */}
      <div className="mx-4 mb-3 h-[5px] rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Expanded task list */}
      {open && person.hasTasks && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3">
          {/* To-Do section */}
          {todoTasks.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                <FaCircle className="text-[7px] text-white/20" /> To Do
              </p>
              <div className="space-y-1.5">
                {todoTasks.map((task) => (
                  <TaskRow key={task._id || task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* In Progress section */}
          {inProgressTasks.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400/60">
                <FaClock className="text-[7px]" /> In Progress
              </p>
              <div className="space-y-1.5">
                {inProgressTasks.map((task) => (
                  <TaskRow key={task._id || task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Done section (collapsed summary) */}
          {doneTasks.length > 0 && (
            <p className="text-[10px] text-white/25">
              + {doneTasks.length} completed stor{doneTasks.length > 1 ? "ies" : "y"}
            </p>
          )}

          {/* No to-do or in-progress */}
          {todoTasks.length === 0 && inProgressTasks.length === 0 && (
            <p className="text-[11px] text-white/30">All stories completed</p>
          )}
        </div>
      )}
    </div>
  );
}

/** Single task row inside the expanded member card */
function TaskRow({ task }) {
  const sb = statusBadge(task.status);
  const pb = priorityBadge(task.priority);

  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-white/5 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-white/85">
          {task.title || "Untitled story"}
        </p>
        {task.dueDate && (
          <p className="text-[10px] text-white/30">
            Due {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
          </p>
        )}
      </div>
      {pb && (
        <span className={`shrink-0 text-[10px] font-bold ${pb.cls}`}>{pb.label}</span>
      )}
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${sb.cls}`}>
        {sb.label}
      </span>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [notifications,         setNotifications]         = useState([]);
  const [loadingNotif,          setLoadingNotif]          = useState(true);
  const [projectStats,          setProjectStats]          = useState({ total: 0, active: 0 });
  const [loadingProjects,       setLoadingProjects]       = useState(true);
  const [teamStats,             setTeamStats]             = useState({ total: 0, membersCount: 0 });
  const [loadingTeams,          setLoadingTeams]          = useState(true);
  const [taskStats,             setTaskStats]             = useState({ total: 0, pending: 0 });
  const [loadingTasks,          setLoadingTasks]          = useState(true);
  const [meetingStats,          setMeetingStats]          = useState({ total: 0, today: 0 });
  const [loadingMeetings,       setLoadingMeetings]       = useState(true);
  const [taskBarData,           setTaskBarData]           = useState([["Task 1",0],["Task 2",0],["Task 3",0],["Task 4",0]]);
  const [projectProgressStats,  setProjectProgressStats]  = useState({ donePercent: 0, inProgressPercent: 0, toDoPercent: 100 });
  const [teamDiscipline,        setTeamDiscipline]        = useState([]);
  const [loadingDiscipline,     setLoadingDiscipline]     = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const run = async () => {
      try {
        const decoded    = jwtDecode(token);
        const realUserId = decoded._id;
        let companyId    = decoded.companyId || decoded.company ||
                           (decoded.user && decoded.user.companyId) ||
                           localStorage.getItem("companyId");

        if (!companyId && decoded.role === "system-admin") {
          companyId = "66391d5bb96fa3ef34a8145b";
          localStorage.setItem("companyId", companyId);
        }

        const headers = {
          "Content-Type":  "application/json",
          "x-auth-token":  token,
          "Authorization": `Bearer ${token}`,
        };

        // ── 1. Projects ──────────────────────────────────────────────────────
        let fetchedProjects = [];
        let allProjectStories = [];
        if (companyId) {
          setLoadingProjects(true);
          try {
            const r = await fetch(
              `https://flowio-backend.vercel.app/api/projects/company/${companyId}`,
              { method: "GET", headers }
            );
            if (r.ok) {
              const d = await r.json();
              fetchedProjects = d.data || (Array.isArray(d) ? d : d.projects || []);

              fetchedProjects = await Promise.all(
                fetchedProjects.map(async (project) => {
                  try {
                    const storiesRes = await storyService.getStoriesByProject(project._id || project.id);
                    const stories = storiesRes?.data || storiesRes || [];
                    const projectStories = Array.isArray(stories) ? stories : [];
                    allProjectStories = [
                      ...allProjectStories,
                      ...projectStories.map((story) => normalizeStoryForDiscipline(story, project)),
                    ];
                    return {
                      ...project,
                      progress: calculateProjectProgress(project, projectStories),
                    };
                  } catch (err) {
                    console.error(`Stories fetch error for dashboard project ${project._id || project.id}:`, err);
                    return {
                      ...project,
                      progress: Number.isFinite(Number(project.progress))
                        ? Number(project.progress)
                        : calculateProjectProgress(project),
                    };
                  }
                })
              );

              const active = fetchedProjects.filter((p) => getProjectDisplayStatus(p) === "in-progress" || getProjectDisplayStatus(p) === "todo").length;
              const chartProjects = fetchedProjects.filter((p) => getProjectDisplayStatus(p) !== "archived");
              const totalChartProjects = chartProjects.length;
              if (totalChartProjects > 0) {
                const done = chartProjects.filter((p) => getProjectDisplayStatus(p) === "completed").length;
                const inProgress = chartProjects.filter((p) => getProjectDisplayStatus(p) === "in-progress").length;
                const todo = totalChartProjects - done - inProgress;
                setProjectProgressStats({
                  donePercent: Math.round((done / totalChartProjects) * 100),
                  inProgressPercent: Math.round((inProgress / totalChartProjects) * 100),
                  toDoPercent: Math.round((todo / totalChartProjects) * 100),
                });
              } else {
                setProjectProgressStats({ donePercent: 0, inProgressPercent: 0, toDoPercent: 0 });
              }

              setProjectStats({ total: fetchedProjects.length, active });
            }
          } catch (e) { console.error("Projects fetch error:", e); }
          finally { setLoadingProjects(false); }
        }

        // ── 2. Meetings ──────────────────────────────────────────────────────
        if (companyId && fetchedProjects.length > 0) {
          setLoadingMeetings(true);
          try {
            let allMeetings = [];
            await Promise.all(
              fetchedProjects.map(async (project) => {
                const pId = project._id || project.id;
                try {
                  const r = await fetch(
                    `https://flowio-backend.vercel.app/api/meetings/project/${pId}`,
                    { method: "GET", headers }
                  );
                  if (r.ok) {
                    const d = await r.json();
                    allMeetings = [...allMeetings, ...(d.data || (Array.isArray(d) ? d : []))];
                  }
                } catch (e) { /* silent */ }
              })
            );
            const todayStr = new Date().toISOString().split("T")[0];
            setMeetingStats({
              total: allMeetings.length,
              today: allMeetings.filter((m) => m.date?.startsWith(todayStr)).length,
            });
          } catch (e) { console.error("Meetings fetch error:", e); }
          finally { setLoadingMeetings(false); }
        } else {
          setLoadingMeetings(false);
        }

        // ── 3. Tasks (global stats + chart) ─────────────────────────────────
        //
        // We collect ALL tasks from every project in one deduplicated array.
        // This same array is later used to match assignee IDs against personMap.
        //
        setLoadingTasks(true);
        let allTasks = [];
        try {
          // My tasks first (always available)
          const myResp = await API.get("/api/tasks/my-tasks");
          const myTasks = myResp.data?.data || [];

          // Project-level tasks
          let projectTasks = [];
          if (companyId && fetchedProjects.length > 0) {
            await Promise.all(
              fetchedProjects.map(async (project) => {
                const pId = project._id || project.id;
                try {
                  const r = await fetch(
                    `https://flowio-backend.vercel.app/api/projects/${pId}/tasks`,
                    { method: "GET", headers }
                  );
                  if (r.ok) {
                    const d = await r.json();
                    projectTasks = [...projectTasks, ...(d.data || [])];
                  }
                } catch (e) { /* silent */ }
              })
            );
          }

          // Deduplicate by _id / id
          const seen = new Set();
          allTasks = [...myTasks, ...projectTasks].filter((t) => {
            const id = t._id || t.id;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });

          // KPI
          const total   = allTasks.length;
          const pending = allTasks.filter((t) => !STATUS.isDone(t.status)).length;
          setTaskStats({ total, pending });

          // Bar chart (first 4 tasks)
          const chart = allTasks.slice(0, 4).map((t) => {
            const label = (t.title || "Task").length > 8
              ? t.title.substring(0, 8) + ".."
              : t.title;
            return [label, statusToProgress(t.status)];
          });
          while (chart.length < 4) chart.push([`Task ${chart.length + 1}`, 0]);
          setTaskBarData(chart);

        } catch (e) {
          console.error("Tasks fetch error:", e);
          setTaskStats({ total: 0, pending: 0 });
        } finally {
          setLoadingTasks(false);
        }

        // ── 4. Teams + per-member task discipline ────────────────────────────
        //
        // Strategy:
        //   a) Fetch all teams → collect unique members into personMap
        //      (keyed by userId string)
        //   b) For each task in allTasks, call extractAssigneeIds() which
        //      handles both populated objects { _id, name, ... } and raw strings.
        //      Match those IDs against personMap and bucket the task onto the person.
        //   c) Build the discipline list from personMap.
        //
        // We do NOT rely on a /api/tasks/user/:id endpoint because that route
        // does not exist in the current backend.
        //
        if (companyId) {
          setLoadingTeams(true);
          setLoadingDiscipline(true);
          try {
            const teamsResp = await API.get(`/api/teams/company/${companyId}`);
            const fetchedTeams = teamsResp.data?.data ||
              (Array.isArray(teamsResp.data) ? teamsResp.data : []);

            // personMap: userId (string) → { id, name, role, tasks[] }
            const personMap = new Map();

            if (fetchedTeams.length > 0) {
              // a) Collect members
              await Promise.all(
                fetchedTeams.map(async (team) => {
                  const teamId = team._id || team.id;
                  if (!teamId) return;
                  try {
                    const r = await API.get(`/api/teams/${teamId}/members`);
                    const members = r.data?.data || (Array.isArray(r.data) ? r.data : []);

                    members.forEach((member) => {
                      // teamMember.service populates userId with { name, email, specialization }
                      let userId   = null;
                      let userName = "Unknown";
                      let userRole = "Team Member";
                      let userAvatar = null;

                      if (member.userId && typeof member.userId === "object") {
                        userId   = String(member.userId._id || member.userId.id || "");
                        userName = member.userId.name || "Unknown";
                        // specialization > role_in_team > role
                        userRole = member.userId.specialization ||
                                   member.role_in_team ||
                                   member.userId.role ||
                                   "Team Member";
                        userAvatar = member.userId.avatar || null;

                      } else if (member.userId) {
                        userId = String(member.userId);
                      } else if (member._id || member.id) {
                        userId   = String(member._id || member.id);
                        userName = member.name || "Unknown";
                        userRole = member.role_in_team || member.role || "Team Member";
                      }

                      if (!userId) return;

                      if (!personMap.has(userId)) {
                        personMap.set(userId, { id: userId, name: userName, role: userRole, tasks: [], avatar: userAvatar });
                      } else {
                        // Enrich existing entry if we now have better data
                        const existing = personMap.get(userId);
                        if (existing.name === "Unknown" && userName !== "Unknown") existing.name = userName;
                        if ((existing.role === "Team Member" || existing.role === "member") &&
                            userRole && userRole !== "Team Member") {
                          existing.role = userRole;
                        }
                      }
                    });
                  } catch (e) {
                    console.error(`Members fetch error for team ${teamId}:`, e);
                  }
                })
              );

              setTeamStats({ total: fetchedTeams.length, membersCount: personMap.size });

              // b) Distribute tasks to their assignees
              //    extractAssigneeIds handles both { _id } objects and raw ID strings
              allProjectStories.forEach((story) => {
                const ids = extractStoryAssigneeIds(story);
                ids.forEach((id) => {
                  // Some tasks may be assigned to users not on any team we fetched —
                  // we still track them so their to-do list is correct.
                  if (!personMap.has(id)) {
                    // Try to pull name/role from the populated assignedTo field
                    const field = story.assignee ?? story.assigneeId ?? story.assignedTo ?? story.assigned_to;
                    const items = Array.isArray(field) ? field : [field];
                    const match = items.find(
                      (item) => item && typeof item === "object" &&
                                String(item._id || item.id || "") === id
                    );
                    personMap.set(id, {
                      id,
                      name: match?.name || "Unknown",
                      role: match?.specialization || match?.role || "Team Member",
                      tasks: [],
                    });
                  }
                  personMap.get(id).tasks.push(story);
                });
              });

              // c) Build discipline list
              const disciplineList = Array.from(personMap.values())
                .map((person) => {
                  const total     = person.tasks.length;
                  const doneCount = person.tasks.filter((t) => STATUS.isDone(t.status)).length;
                  const percent   = total > 0 ? Math.round((doneCount / total) * 100) : 0;
                  return {
                    id:        person.id,
                    name:      capitalizeWords(person.name),
                    role:      formatRole(person.role),
                    percent,
                    totalTasks: total,
                    doneCount,
                    hasTasks:  total > 0,
                    tasks:     person.tasks, // full task objects for the to-do list
                    avatar:    person.avatar || null,
                  };
                })
                .sort((a, b) => {
                  if (a.hasTasks !== b.hasTasks) return b.hasTasks - a.hasTasks;
                  if (a.percent  !== b.percent)  return b.percent  - a.percent;
                  return a.name.localeCompare(b.name);
                });

              setTeamDiscipline(disciplineList);

            } else {
              setTeamStats({ total: 0, membersCount: 0 });
              setTeamDiscipline([]);
            }

          } catch (e) {
            console.error("Teams fetch error:", e);
          } finally {
            setLoadingTeams(false);
            setLoadingDiscipline(false);
          }
        } else {
          setLoadingDiscipline(false);
        }

        // ── 5. Notifications ─────────────────────────────────────────────────
        if (realUserId) {
          setLoadingNotif(true);
          try {
            const data        = await notificationService.getUserNotifications(realUserId);
            const serverNotifs = data?.data || [];
            const localData   = localStorage.getItem("local_notifications");
            const localNotifs  = localData ? JSON.parse(localData) : [];

            const transformed = [...localNotifs, ...serverNotifs]
              .map((n) => {
                const safeType   = (n.type || "system").toLowerCase();
                const style      = typeStyle[safeType] || typeStyle.system;
                return {
                  id:           n._id || n.id,
                  title:        n.title || "No Title",
                  desc:         n.message || n.desc || "",
                  style,
                  time:         n.createdAt
                    ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Just Now",
                  rawCreatedAt: n.createdAt,
                };
              })
              .sort((a, b) => new Date(b.rawCreatedAt) - new Date(a.rawCreatedAt))
              .slice(0, 4);

            setNotifications(transformed);
          } catch (e) {
            console.error("Notifications fetch error:", e);
          } finally {
            setLoadingNotif(false);
          }
        }

      } catch (err) {
        console.error("Dashboard init error:", err);
        setLoadingNotif(false);
        setLoadingProjects(false);
        setLoadingTeams(false);
        setLoadingTasks(false);
        setLoadingMeetings(false);
        setLoadingDiscipline(false);
      }
    };

    run();
  }, [token]);

  // ── Shared card styles ─────────────────────────────────────────────────────
  const cardClass =
    "relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-[#16206d]/95 to-[#0d1448]/95 p-5 xl:p-6 shadow-[0_22px_55px_rgba(0,0,0,.30)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(95,150,255,.20)]";

  const kpiItems = [
    { icon: <FaProjectDiagram />, label: "Projects",     value: loadingProjects ? "…" : String(projectStats.total),    sub: `${projectStats.active} active` },
    { icon: <FaTasks />,          label: "Tasks",        value: loadingTasks    ? "…" : String(taskStats.total),       sub: `${taskStats.pending} pending` },
    { icon: <FaCalendarAlt />,    label: "Meetings",     value: loadingMeetings ? "…" : String(meetingStats.total),    sub: `${meetingStats.today} today` },
    { icon: <FaUsers />,          label: "Team Members", value: loadingTeams    ? "…" : String(teamStats.membersCount),sub: `${teamStats.total} teams` },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  const projectProgressItems = [
    ["Done", `${projectProgressStats.donePercent}%`, PROJECT_STATUS_COLORS.done],
    ["In Progress", `${projectProgressStats.inProgressPercent}%`, PROJECT_STATUS_COLORS.inProgress],
    ["To Do", `${projectProgressStats.toDoPercent}%`, PROJECT_STATUS_COLORS.todo],
  ];

  return (
    <MainLayout title="Dashboard" showSearch={false}>
      <div className="grid min-h-0 gap-5 text-white lg:h-full lg:grid-rows-[clamp(78px,10vh,92px)_minmax(0,1fr)] xl:gap-6">

        {/* ── KPI CARDS ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {kpiItems.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[86px] items-center gap-4 rounded-[20px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 px-4 shadow-[0_16px_35px_rgba(0,0,0,.24)] transition hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(95,150,255,.18)] sm:rounded-[24px] sm:px-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.35)]">
                {item.icon}
              </div>
              <div>
                <p className="text-[11px] text-white/45">{item.label}</p>
                <h3 className="text-[20px] font-extrabold">{item.value}</h3>
                <p className="text-[10px] text-[#78aaff]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ──────────────────────────────────────────────────────── */}
        <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-2 lg:grid-rows-[minmax(250px,0.95fr)_minmax(250px,1fr)] xl:gap-6">

          {/* PROJECT PROGRESS */}
          <div className={cardClass}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-bold">Project Progress</h3>
              <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
                This Month
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center lg:h-[calc(100%-44px)] lg:grid-cols-[190px_1fr] lg:gap-7">
              {/* Donut */}
              <div className="relative mx-auto h-[150px] w-[150px] rounded-full shadow-[0_0_38px_rgba(69,230,139,.20)] lg:h-[175px] lg:w-[175px]"
                style={{
                  "--done": `${projectProgressStats.donePercent * 3.6}deg`,
                  "--inp":  `${projectProgressStats.inProgressPercent * 3.6}deg`,
                  background: `conic-gradient(
                    ${PROJECT_STATUS_COLORS.done} 0deg var(--done),
                    ${PROJECT_STATUS_COLORS.gap} var(--done) calc(var(--done) + 6deg),
                    ${PROJECT_STATUS_COLORS.inProgress} calc(var(--done) + 6deg) calc(var(--done) + 6deg + var(--inp)),
                    ${PROJECT_STATUS_COLORS.gap} calc(var(--done) + 6deg + var(--inp)) calc(var(--done) + 12deg + var(--inp)),
                    ${PROJECT_STATUS_COLORS.todo} calc(var(--done) + 12deg + var(--inp)) 360deg
                  )`,
                }}
              >
                <div className="absolute inset-[25px] rounded-full bg-[#0b123f]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[30px] font-extrabold lg:text-[34px]">
                    {projectProgressStats.donePercent}%
                  </span>
                  <span className="text-[11px] text-white/65">Completed</span>
                </div>
              </div>

              {/* Bars */}
              <div className="space-y-4">
                {projectProgressItems.map(([label, value, color]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-[12px]">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-white/70">{label}</span>
                      </div>
                      <b>{value}</b>
                    </div>
                    <div className="h-[6px] rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: value, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TASKS BAR CHART */}
          <div className={cardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[17px] font-bold">Tasks Progress</h3>
              <FaChartBar className="text-[#78aaff]" />
            </div>

            <div className="relative mx-auto h-[180px] w-full max-w-[620px] sm:w-[88%] lg:h-[clamp(156px,20vh,205px)]">
              {["18%", "42%", "66%", "90%"].map((top) => (
                <div key={top} style={{ top }} className="absolute left-0 right-0 h-px bg-white/10" />
              ))}
              <div className="absolute inset-0 flex items-end justify-around pb-6">
                {taskBarData.map(([name, value]) => (
                  <div key={name} className="flex min-w-0 flex-col items-center">
                    <div className="relative flex h-[clamp(98px,13vh,135px)] w-[clamp(30px,3.4vw,38px)] items-end rounded-[14px] bg-white/10 p-[4px]">
                      <div
                        style={{ height: `${value}%` }}
                        className="w-full rounded-[10px] bg-gradient-to-t from-[#6eb5ff] to-[#5b7dff] shadow-[0_0_20px_rgba(95,150,255,.35)] transition-all duration-500"
                      />
                    </div>
                    <span className="mt-2 max-w-[50px] truncate text-center text-[10px] text-white/75">{name}</span>
                    <span className="mt-1 text-[9px] text-[#78aaff]">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TEAM DISCIPLINE — collapsible per-member to-do lists */}
          <div className={`${cardClass} flex flex-col`}>
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold">Team Discipline</h3>
                <p className="mt-0.5 text-[11px] text-white/35">Click a member to see project stories</p>
              </div>
              <Link
                to="/teams"
                className="flex items-center gap-2 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100"
              >
                View Team <FaArrowRight />
              </Link>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {loadingDiscipline ? (
                <div className="py-8 text-center text-xs text-white/35">Loading team progress…</div>
              ) : teamDiscipline.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/25">No team members found.</div>
              ) : (
                teamDiscipline.map((person, idx) => (
                  <MemberTaskCard key={`${person.id || person.name}-${idx}`} person={person} />
                ))
              )}
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className={`${cardClass} flex flex-col`}>
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-400/15 text-[#78aaff]">
                  <FaBell />
                </span>
                <h3 className="text-[17px] font-bold">Notifications</h3>
              </div>
              <Link
                to="/notifications"
                className="flex items-center gap-2 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100"
              >
                View All <FaArrowRight />
              </Link>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              {loadingNotif ? (
                <div className="py-8 text-center text-xs text-white/35">Loading notifications…</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/25">No notifications found.</div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-[20px] bg-[#10184c]/60 p-4 transition hover:bg-[#151f62]"
                  >
                    <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.style?.color}`}>
                      {item.style?.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-[13px] font-bold">{item.title}</h4>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/55">{item.desc}</p>
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-white/35">{item.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
