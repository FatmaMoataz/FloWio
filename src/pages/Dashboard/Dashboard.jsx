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
const isDone       = (s) => ["done", "completed"].includes((s || "").toLowerCase());
const isInProgress = (s) => ["in-progress", "in_progress", "inprogress", "doing", "review"].includes((s || "").toLowerCase());

// Convert status → a 0-100 progress number for the bar chart
const statusToProgress = (s) => {
  if (isDone(s))       return 100;
  if (isInProgress(s)) return 50;
  return 0; // todo
};

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  
  const [projectStats, setProjectStats] = useState({ total: 0, active: 0 });
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [teamStats, setTeamStats] = useState({ total: 0, membersCount: 0 });
  const [loadingTeams, setLoadingTeams] = useState(true);

  // ── Task state — now includes personal tasks too ──────────────────────────────
  const [taskStats, setTaskStats] = useState({ total: 0, pending: 0 });
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [meetingStats, setMeetingStats] = useState({ total: 0, today: 0 });
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  // Bar chart: up to 4 tasks with real progress derived from status
  const [taskBarData, setTaskBarData] = useState([
    ["Task 1", 0], ["Task 2", 0], ["Task 3", 0], ["Task 4", 0],
  ]);

  const [projectProgressStats, setProjectProgressStats] = useState({
    donePercent: 50,
    inProgressPercent: 30,
    toDoPercent: 20,
  });

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

        // 1. Notifications
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

        // 2. Projects / Meetings (unchanged)
        if (companyId) {
          setLoadingProjects(true);
          setLoadingMeetings(true);
          try {
            const response = await fetch(`https://flowio-backend.vercel.app/api/projects/company/${companyId}`, {
              method: "GET",
              headers,
            });

            if (response.ok) {
              const resData = await response.json();
              const fetchedProjects = resData.data || (Array.isArray(resData) ? resData : resData.projects || []);
              const activeCount = fetchedProjects.filter((p) => (p.progress !== undefined ? p.progress < 100 : true)).length;
              setProjectStats({ total: fetchedProjects.length, active: activeCount });

              let allMeetings = [];
              if (fetchedProjects.length > 0) {
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
              }

              const todayStr = new Date().toISOString().split("T")[0];
              const meetingsToday = allMeetings.filter((m) => m.date && m.date.startsWith(todayStr)).length;
              setMeetingStats({ total: allMeetings.length, today: meetingsToday });
            }
          } catch (err) {
            console.error("Error fetching projects/meetings:", err);
          } finally {
            setLoadingProjects(false);
            setLoadingMeetings(false);
          }
        }

        // ── 3. TASKS — personal (my-tasks) + project tasks, merged ──────────────
        setLoadingTasks(true);
        try {
          // Always fetch personal tasks assigned to the logged-in user
          const myTasksResp = await API.get("/api/tasks/my-tasks");
          const myTasks = myTasksResp.data?.data || [];

          // Also fetch project tasks if the user belongs to a company
          let projectTasks = [];
          if (companyId) {
            try {
              const projResp = await fetch(`https://flowio-backend.vercel.app/api/projects/company/${companyId}`, { method: "GET", headers });
              if (projResp.ok) {
                const projData = await projResp.json();
                const projects = projData.data || (Array.isArray(projData) ? projData : projData.projects || []);
                await Promise.all(
                  projects.map(async (project) => {
                    const pId = project._id || project.id;
                    try {
                      const tResp = await fetch(`https://flowio-backend.vercel.app/api/projects/${pId}/tasks`, { method: "GET", headers });
                      if (tResp.ok) {
                        const tData = await tResp.json();
                        projectTasks = [...projectTasks, ...(tData.data || [])];
                      }
                    } catch (e) { /* skip */ }
                  })
                );
              }
            } catch (e) { /* skip project tasks if fetch fails */ }
          }

          // Deduplicate by _id (a task may appear in both lists)
          const seen = new Set();
          const allTasks = [...myTasks, ...projectTasks].filter((t) => {
            const id = t._id || t.id;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });

          const totalCount  = allTasks.length;
          const pendingCount = allTasks.filter((t) => !isDone(t.status)).length;
          setTaskStats({ total: totalCount, pending: pendingCount });

          // Donut chart percentages
          if (totalCount > 0) {
            const doneCount       = allTasks.filter((t) => isDone(t.status)).length;
            const inProgressCount = allTasks.filter((t) => isInProgress(t.status)).length;
            const toDoCount       = totalCount - doneCount - inProgressCount;
            setProjectProgressStats({
              donePercent:       Math.round((doneCount       / totalCount) * 100),
              inProgressPercent: Math.round((inProgressCount / totalCount) * 100),
              toDoPercent:       Math.round((toDoCount       / totalCount) * 100),
            });
          }

          // Bar chart — pick the 4 most recent tasks, derive progress from status
          const chartTasks = allTasks.slice(0, 4);
          const chartData  = chartTasks.map((t) => {
            const label = (t.title || "Task").length > 8
              ? t.title.substring(0, 8) + ".."
              : t.title;
            return [label, statusToProgress(t.status)];
          });
          // Pad to always show 4 bars
          while (chartData.length < 4) chartData.push([`Task ${chartData.length + 1}`, 0]);
          setTaskBarData(chartData);

        } catch (err) {
          console.error("Error fetching tasks for dashboard:", err);
          setTaskStats({ total: 0, pending: 0 });
          setTaskBarData([["Task 1", 0], ["Task 2", 0], ["Task 3", 0], ["Task 4", 0]]);
        } finally {
          setLoadingTasks(false);
        }

        // 4. Teams (unchanged)
        if (companyId) {
          setLoadingTeams(true);
          try {
            const response = await fetch(`https://flowio-backend.vercel.app/api/teams/company/${companyId}`, { method: "GET", headers });
            if (response.ok) {
              const resData = await response.json();
              const fetchedTeams = resData.data || (Array.isArray(resData) ? resData : resData.teams || []);
              const allMembersIds = new Set();

              if (fetchedTeams.length > 0) {
                await Promise.all(
                  fetchedTeams.map(async (team) => {
                    const teamId = team._id || team.id;
                    if (!teamId) return;
                    try {
                      const membersResp = await fetch(`https://flowio-backend.vercel.app/api/teams/${teamId}/members`, { method: "GET", headers });
                      if (membersResp.ok) {
                        const membersData = await membersResp.json();
                        const membersArray = membersData.data || (Array.isArray(membersData) ? membersData : []);
                        membersArray.forEach((m) => {
                          let uId = null;
                          if (m.userId && typeof m.userId === "object") uId = m.userId._id || m.userId.id;
                          else if (m.userId) uId = m.userId;
                          else uId = m._id || m.id;
                          if (uId) allMembersIds.add(String(uId));
                        });
                      }
                    } catch (memberErr) {
                      console.error(`Error fetching members for team ${teamId}:`, memberErr);
                    }
                  })
                );
                setTeamStats({ total: fetchedTeams.length, membersCount: allMembersIds.size });
              } else {
                setTeamStats({ total: 0, membersCount: 1 });
              }
            }
          } catch (err) {
            console.error("Error fetching teams:", err);
          } finally {
            setLoadingTeams(false);
          }
        }

      } catch (error) {
        console.error("Dashboard init error:", error);
        setLoadingNotif(false);
        setLoadingProjects(false);
        setLoadingTeams(false);
        setLoadingTasks(false);
        setLoadingMeetings(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const employees = [
    { name: "Justin Lipshutz",    role: "Project Manager",     percent: 100, img: "https://i.pravatar.cc/60?img=12" },
    { name: "Danielle Lipsham",   role: "UI Designer",          percent: 70,  img: "https://i.pravatar.cc/60?img=32" },
    { name: "Noah Bernstein",     role: "Frontend Developer",   percent: 65,  img: "https://i.pravatar.cc/60?img=15" },
    { name: "Ahmed Mohamed",      role: "Backend Developer",    percent: 88,  img: "https://i.pravatar.cc/60?img=22" },
  ];

  const cardClass =
    "relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-[#16206d]/95 to-[#0d1448]/95 p-5 xl:p-6 shadow-[0_22px_55px_rgba(0,0,0,.30)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(95,150,255,.20)]";

  const kpiItems = [
    { icon: <FaProjectDiagram />, label: "Projects",  value: loadingProjects ? "..." : String(projectStats.total),  sub: `${projectStats.active} active` },
    { icon: <FaTasks />,          label: "Tasks",     value: loadingTasks    ? "..." : String(taskStats.total),     sub: `${taskStats.pending} pending` },
    { icon: <FaCalendarAlt />,    label: "Meetings",  value: loadingMeetings ? "..." : String(meetingStats.total),  sub: `${meetingStats.today} today` },
    { icon: <FaUsers />,          label: "Teams",     value: loadingTeams    ? "..." : String(teamStats.total),     sub: `${teamStats.membersCount} members` },
  ];

  const doneDeg       = (projectProgressStats.donePercent / 100) * 360;
  const inProgressDeg = doneDeg + (projectProgressStats.inProgressPercent / 100) * 360;

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
                  <span className="text-[30px] font-extrabold lg:text-[34px]">50%</span>
                  <span className="text-[11px] text-white/65">Completed</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ["Done",        `${projectProgressStats.donePercent}%`,       "#7b5dff"],
                  ["In Progress", `${projectProgressStats.inProgressPercent}%`, "#d86bff"],
                  ["To Do",       `${projectProgressStats.toDoPercent}%`,       "#59d3ff"],
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
              {employees.map((emp) => (
                <div key={emp.name} className="rounded-[20px] bg-[#10184c]/60 p-4 transition hover:bg-[#151f62]">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={emp.img} alt={emp.name} className="h-[42px] w-[42px] rounded-full object-cover ring-2 ring-white/15" />
                      <div>
                        <p className="text-[13px] font-bold">{emp.name}</p>
                        <p className="mt-1 text-[10px] text-white/45">{emp.role}</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-[#78aaff]">{emp.percent}%</span>
                  </div>
                  <div className="h-[7px] rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff]" style={{ width: `${emp.percent}%` }} />
                  </div>
                </div>
              ))}
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