import { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import notificationService from "../../services/notificationService";
import API from "../../services/api";

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
} from "react-icons/fa";

const typeStyle = {
  system: { icon: <FaBell />, color: "bg-cyan-400/20 text-cyan-300" },
  welcome: { icon: <FaRocket />, color: "bg-emerald-400/20 text-[#5fffd0] shadow-[0_0_15px_rgba(95,255,208,0.2)]" },
  task_assigned: { icon: <FaTasks />, color: "bg-purple-400/20 text-purple-300" },
  task_updated: { icon: <FaTasks />, color: "bg-purple-400/20 text-purple-300" },
  comment: { icon: <FaCheckCircle />, color: "bg-emerald-400/20 text-emerald-300" },
  like: { icon: <FaUsers />, color: "bg-cyan-400/20 text-cyan-300" },
  mention: { icon: <FaUsers />, color: "bg-purple-400/20 text-purple-300" },
  polls: { icon: <FaProjectDiagram />, color: "bg-emerald-400/20 text-emerald-300" },
};

// Map your exact backend status values → done / in-progress / todo
const isDone = (s) => ["done", "completed"].includes((s || "").toLowerCase());
const isInProgress = (s) => ["in-progress", "in_progress", "inprogress", "doing", "review"].includes((s || "").toLowerCase());

// Convert status → a 0-100 progress number for the bar chart
const statusToProgress = (s) => {
  if (isDone(s)) return 100;
  if (isInProgress(s)) return 50;
  return 0;
};

// Capitalize the first letter of every word
const capitalizeWords = (str = "") =>
  str
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

// Formats role strings: "project-manager" → "Project Manager"
const formatRole = (role) => {
  if (!role) return "Team Member";
  return role
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Extract every assignee id from a task
const extractAssigneeIds = (task) => {
  const field = task.assignedTo ?? task.assignee ?? task.assigned_to;
  if (!field) return [];

  const items = Array.isArray(field) ? field : [field];

  return items
    .map((item) => {
      if (!item) return null;
      if (typeof item === "object") return String(item._id || item.id || "");
      return String(item);
    })
    .filter(Boolean);
};

// Pull a populated assignee object (name/role) if available
const extractAssigneeDetails = (task) => {
  const field = task.assignedTo ?? task.assignee ?? task.assigned_to;
  if (!field) return [];

  const items = Array.isArray(field) ? field : [field];

  return items
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: String(item._id || item.id || ""),
      name: item.name,
      role: item.specialization || item.role || item.role_in_team,
    }))
    .filter((d) => d.id);
};

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(true);

  const [projectStats, setProjectStats] = useState({ total: 0, active: 0 });
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [teamStats, setTeamStats] = useState({ total: 0, membersCount: 0 });
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [taskStats, setTaskStats] = useState({ total: 0, pending: 0 });
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [meetingStats, setMeetingStats] = useState({ total: 0, today: 0 });
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  const [taskBarData, setTaskBarData] = useState([
    ["Task 1", 0], ["Task 2", 0], ["Task 3", 0], ["Task 4", 0],
  ]);

  const [projectProgressStats, setProjectProgressStats] = useState({
    donePercent: 50,
    inProgressPercent: 30,
    toDoPercent: 20,
  });

  const [teamDiscipline, setTeamDiscipline] = useState([]);
  const [loadingDiscipline, setLoadingDiscipline] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        const decoded = jwtDecode(token);
        const realUserId = decoded._id;
        let companyId = decoded.companyId || decoded.company || (decoded.user && decoded.user.companyId) || localStorage.getItem("companyId");

        if (!companyId && decoded.role === "system-admin") {
          companyId = "66391d5bb96fa3ef34a8145b";
          localStorage.setItem("companyId", companyId);
        }

        const headers = {
          "Content-Type": "application/json",
          "x-auth-token": token,
          "Authorization": `Bearer ${token}`,
        };

        // Store all data we collect
        let fetchedProjects = [];
        let allTasks = [];
        let teamMembersMap = new Map();

        // 1. Fetch Projects
        if (companyId) {
          setLoadingProjects(true);
          try {
            const response = await fetch(`https://flowio-backend.vercel.app/api/projects/company/${companyId}`, {
              method: "GET",
              headers,
            });

            if (response.ok) {
              const resData = await response.json();
              fetchedProjects = resData.data || (Array.isArray(resData) ? resData : resData.projects || []);
              const activeCount = fetchedProjects.filter((p) => (p.progress !== undefined ? p.progress < 100 : true)).length;
              setProjectStats({ total: fetchedProjects.length, active: activeCount });
            }
          } catch (err) {
            console.error("Error fetching projects:", err);
          } finally {
            setLoadingProjects(false);
          }
        }

        // 2. Fetch Meetings
        if (companyId && fetchedProjects.length > 0) {
          setLoadingMeetings(true);
          try {
            let allMeetings = [];
            await Promise.all(
              fetchedProjects.map(async (project) => {
                const pId = project._id || project.id;
                try {
                  const meetingsResp = await fetch(`https://flowio-backend.vercel.app/api/meetings/project/${pId}`, { method: "GET", headers });
                  if (meetingsResp.ok) {
                    const mData = await meetingsResp.json();
                    allMeetings = [...allMeetings, ...(mData.data || (Array.isArray(mData) ? mData : []))];
                  }
                } catch (err) {
                  console.error(`Error fetching meetings for project ${pId}:`, err);
                }
              })
            );
            const todayStr = new Date().toISOString().split("T")[0];
            const meetingsToday = allMeetings.filter((m) => m.date && m.date.startsWith(todayStr)).length;
            setMeetingStats({ total: allMeetings.length, today: meetingsToday });
          } catch (err) {
            console.error("Error fetching meetings:", err);
          } finally {
            setLoadingMeetings(false);
          }
        }

        // 3. Fetch Tasks (both personal and project tasks)
        setLoadingTasks(true);
        try {
          // Fetch personal tasks
          const myTasksResp = await API.get("/api/tasks/my-tasks");
          const myTasks = myTasksResp.data?.data || [];
          
          // Fetch project tasks
          let projectTasks = [];
          if (companyId && fetchedProjects.length > 0) {
            await Promise.all(
              fetchedProjects.map(async (project) => {
                const pId = project._id || project.id;
                try {
                  const tResp = await fetch(`https://flowio-backend.vercel.app/api/projects/${pId}/tasks`, { method: "GET", headers });
                  if (tResp.ok) {
                    const tData = await tResp.json();
                    projectTasks = [...projectTasks, ...(tData.data || [])];
                  }
                } catch (e) {
                  console.error(`Error fetching tasks for project ${pId}:`, e);
                }
              })
            );
          }

          // Deduplicate tasks
          const seen = new Set();
          allTasks = [...myTasks, ...projectTasks].filter((t) => {
            const id = t._id || t.id;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });

          const totalCount = allTasks.length;
          const pendingCount = allTasks.filter((t) => !isDone(t.status)).length;
          setTaskStats({ total: totalCount, pending: pendingCount });

          // Donut chart percentages
          if (totalCount > 0) {
            const doneCount = allTasks.filter((t) => isDone(t.status)).length;
            const inProgressCount = allTasks.filter((t) => isInProgress(t.status)).length;
            const toDoCount = totalCount - doneCount - inProgressCount;
            setProjectProgressStats({
              donePercent: Math.round((doneCount / totalCount) * 100),
              inProgressPercent: Math.round((inProgressCount / totalCount) * 100),
              toDoPercent: Math.round((toDoCount / totalCount) * 100),
            });
          }

          // Bar chart data
          const chartTasks = allTasks.slice(0, 4);
          const chartData = chartTasks.map((t) => {
            const label = (t.title || "Task").length > 8
              ? t.title.substring(0, 8) + ".."
              : t.title;
            return [label, statusToProgress(t.status)];
          });
          while (chartData.length < 4) chartData.push([`Task ${chartData.length + 1}`, 0]);
          setTaskBarData(chartData);

        } catch (err) {
          console.error("Error fetching tasks:", err);
          setTaskStats({ total: 0, pending: 0 });
        } finally {
          setLoadingTasks(false);
        }

        // 4. Fetch Teams and Members, then calculate discipline using allTasks
        if (companyId) {
          setLoadingTeams(true);
          setLoadingDiscipline(true);
          try {
            // Fetch teams
            const teamsResponse = await API.get(`/api/teams/company/${companyId}`);
            const fetchedTeams = teamsResponse.data?.data || (Array.isArray(teamsResponse.data) ? teamsResponse.data : []);
            
            // Map to store member data
            const memberMap = new Map();

            if (fetchedTeams.length > 0) {
              // Fetch members for each team
              await Promise.all(
                fetchedTeams.map(async (team) => {
                  const teamId = team._id || team.id;
                  if (!teamId) return;
                  try {
                    const membersResp = await API.get(`/api/teams/${teamId}/members`);
                    const membersArray = membersResp.data?.data || (Array.isArray(membersResp.data) ? membersResp.data : []);
                    
                    membersArray.forEach((member) => {
                      let userId = null;
                      let userName = "Unknown";
                      let userRole = "Team Member";
                      
                      // Handle populated userId object
                      if (member.userId && typeof member.userId === "object") {
                        userId = member.userId._id || member.userId.id;
                        userName = member.userId.name || userName;
                        userRole = member.userId.specialization || member.userId.role || member.role_in_team || userRole;
                      } else if (member.userId) {
                        userId = member.userId;
                      } else {
                        userId = member._id || member.id;
                      }
                      
                      if (userId) {
                        userId = String(userId);
                        if (!memberMap.has(userId)) {
                          memberMap.set(userId, {
                            id: userId,
                            name: userName,
                            role: userRole,
                            total: 0,
                            done: 0,
                          });
                        } else {
                          const existing = memberMap.get(userId);
                          if (existing.name === "Unknown" && userName !== "Unknown") existing.name = userName;
                          if ((existing.role === "Team Member" || existing.role === "member") && userRole) existing.role = userRole;
                        }
                      }
                    });
                  } catch (memberErr) {
                    console.error(`Error fetching members for team ${teamId}:`, memberErr);
                  }
                })
              );
              setTeamStats({ total: fetchedTeams.length, membersCount: memberMap.size });
            } else {
              setTeamStats({ total: 0, membersCount: 0 });
            }

            // Calculate task completion for each member using the tasks we already fetched
            console.log("Calculating discipline with tasks:", allTasks.length);
            console.log("Member map size:", memberMap.size);
            
            allTasks.forEach((task) => {
              const assigneeIds = extractAssigneeIds(task);
              console.log(`Task "${task.title}" assignees:`, assigneeIds);
              
              if (assigneeIds.length === 0) return;

              const assigneeDetails = extractAssigneeDetails(task);
              const detailsById = new Map(assigneeDetails.map(d => [d.id, d]));

              assigneeIds.forEach((assigneeId) => {
                // Add member if not already in map
                if (!memberMap.has(assigneeId)) {
                  const details = detailsById.get(assigneeId);
                  memberMap.set(assigneeId, {
                    id: assigneeId,
                    name: details?.name || "Unknown",
                    role: details?.role || "Team Member",
                    total: 0,
                    done: 0,
                  });
                }
                
                const entry = memberMap.get(assigneeId);
                entry.total += 1;
                if (isDone(task.status)) {
                  entry.done += 1;
                }
              });
            });

            // Log the results for debugging
            console.log("Member map after tasks:");
            memberMap.forEach((member, id) => {
              console.log(`${member.name}: ${member.done}/${member.total} tasks (${member.total > 0 ? Math.round((member.done / member.total) * 100) : 0}%)`);
            });

            // Format discipline list
            const disciplineList = Array.from(memberMap.values())
              .map((member) => ({
                name: capitalizeWords(member.name),
                role: formatRole(member.role),
                percent: member.total > 0 ? Math.round((member.done / member.total) * 100) : 0,
                taskCount: member.total,
                doneCount: member.done,
                hasTasks: member.total > 0,
              }))
              .sort((a, b) => (b.hasTasks - a.hasTasks) || b.percent - a.percent || a.name.localeCompare(b.name))
              .slice(0, 6);

            console.log("Final discipline list:", disciplineList);
            setTeamDiscipline(disciplineList);

          } catch (err) {
            console.error("Error fetching teams:", err);
          } finally {
            setLoadingTeams(false);
            setLoadingDiscipline(false);
          }
        } else {
          setLoadingDiscipline(false);
        }

        // 5. Fetch Notifications
        if (realUserId) {
          setLoadingNotif(true);
          try {
            const data = await notificationService.getUserNotifications(realUserId);
            const serverNotifs = data?.data || [];
            const localData = localStorage.getItem("local_notifications");
            const localNotifs = localData ? JSON.parse(localData) : [];
            const allNotifs = [...localNotifs, ...serverNotifs];

            const transformed = allNotifs
              .map((notif) => {
                const safeType = (notif.type || "system").toLowerCase();
                const currentStyle = typeStyle[safeType] || typeStyle.system;
                return {
                  id: notif._id || notif.id,
                  title: notif.title || "No Title",
                  desc: notif.message || notif.desc || "",
                  style: currentStyle,
                  time: notif.createdAt
                    ? new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Just Now",
                  rawCreatedAt: notif.createdAt,
                };
              })
              .sort((a, b) => new Date(b.rawCreatedAt) - new Date(a.rawCreatedAt))
              .slice(0, 4);

            setNotifications(transformed);
          } catch (err) {
            console.error("Error fetching notifications:", err);
          } finally {
            setLoadingNotif(false);
          }
        }

      } catch (error) {
        console.error("Dashboard init error:", error);
        setLoadingNotif(false);
        setLoadingProjects(false);
        setLoadingTeams(false);
        setLoadingTasks(false);
        setLoadingMeetings(false);
        setLoadingDiscipline(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const cardClass =
    "relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-[#16206d]/95 to-[#0d1448]/95 p-5 xl:p-6 shadow-[0_22px_55px_rgba(0,0,0,.30)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(95,150,255,.20)]";

  const kpiItems = [
    { icon: <FaProjectDiagram />, label: "Projects", value: loadingProjects ? "..." : String(projectStats.total), sub: `${projectStats.active} active` },
    { icon: <FaTasks />, label: "Tasks", value: loadingTasks ? "..." : String(taskStats.total), sub: `${taskStats.pending} pending` },
    { icon: <FaCalendarAlt />, label: "Meetings", value: loadingMeetings ? "..." : String(meetingStats.total), sub: `${meetingStats.today} today` },
    { icon: <FaUsers />, label: "Teams", value: loadingTeams ? "..." : String(teamStats.total), sub: `${teamStats.membersCount} members` },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="grid min-h-0 gap-5 text-white lg:h-full lg:grid-rows-[clamp(78px,10vh,92px)_minmax(0,1fr)] xl:gap-6">
        {/* KPI CARDS */}
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

        {/* MAIN GRID */}
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
              <div className="relative mx-auto h-[150px] w-[150px] rounded-full bg-[conic-gradient(#7b5dff_0deg_180deg,#07103a_180deg_186deg,#59d3ff_186deg_258deg,#07103a_258deg_264deg,#d86bff_264deg_360deg)] shadow-[0_0_38px_rgba(120,90,255,.30)] lg:h-[175px] lg:w-[175px]">
                <div className="absolute inset-[25px] rounded-full bg-[#0b123f]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[30px] font-extrabold lg:text-[34px]">{projectProgressStats.donePercent}%</span>
                  <span className="text-[11px] text-white/65">Completed</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ["Done", `${projectProgressStats.donePercent}%`, "#7b5dff"],
                  ["In Progress", `${projectProgressStats.inProgressPercent}%`, "#d86bff"],
                  ["To Do", `${projectProgressStats.toDoPercent}%`, "#59d3ff"],
                ].map(([label, value, color]) => (
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

          {/* TASKS PROGRESS */}
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
                    <span className="mt-2 max-w-[50px] truncate text-center text-[10px] text-white/75">
                      {name}
                    </span>
                    <span className="mt-1 text-[9px] text-[#78aaff]">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TEAM DISCIPLINE */}
          <div className={`${cardClass} flex flex-col`}>
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <h3 className="text-[17px] font-bold">Team Discipline</h3>
              <Link to="/teams" className="flex items-center gap-2 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100">
                View Team <FaArrowRight />
              </Link>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              {loadingDiscipline ? (
                <div className="py-8 text-center text-xs text-white/35">Loading team progress...</div>
              ) : teamDiscipline.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/25">No team members found.</div>
              ) : (
                teamDiscipline.map((emp) => (
                  <div key={emp.name} className="rounded-[20px] bg-[#10184c]/60 p-4 transition hover:bg-[#151f62]">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-b from-[#6eb5ff] to-[#5b7dff] text-[14px] font-bold uppercase text-white ring-2 ring-white/15">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold">{emp.name}</p>
                          <p className="mt-1 text-[10px] text-white/45">{emp.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] font-bold text-[#78aaff]">
                          {emp.hasTasks ? `${emp.percent}%` : "—"}
                        </span>
                        {emp.hasTasks && (
                          <p className="mt-0.5 text-[9px] text-white/35">
                            {emp.doneCount}/{emp.taskCount} tasks
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[7px] rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] transition-all duration-500"
                        style={{ width: `${emp.percent}%` }}
                      />
                    </div>
                    {!emp.hasTasks && (
                      <p className="mt-2 text-[9px] text-white/30">No tasks assigned yet</p>
                    )}
                  </div>
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
              <Link to="/notifications" className="flex items-center gap-2 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100">
                View All <FaArrowRight />
              </Link>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              {loadingNotif ? (
                <div className="py-8 text-center text-xs text-white/35">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/25">No notifications found.</div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 rounded-[20px] bg-[#10184c]/60 p-4 transition hover:bg-[#151f62]">
                      <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.style?.color}`}>
                        {item.style?.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-[13px] font-bold">{item.title}</h4>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/55">{item.desc}</p>
                      </div>
                      <span className="whitespace-nowrap text-[10px] text-white/35">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}