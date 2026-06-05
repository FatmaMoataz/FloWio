import { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import notificationService from "../../services/notificationService";

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

// خريطة لتحديد الأيقونات والألوان بناءً على الـ type القادم من الـ API أو الـ localStorage
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

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  
  // States جديدة عشان نخلي الـ KPIs ديناميكية بالكامل
  const [projectStats, setProjectStats] = useState({ total: 0, active: 0 });
  const [loadingProjects, setLoadingProjects] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        setLoadingNotif(true);
        const decoded = jwtDecode(token);
        const realUserId = decoded._id;
        
        let companyId = decoded.companyId || decoded.company || localStorage.getItem("companyId");
        if (!companyId && decoded.role === "system-admin") {
          companyId = "66391d5bb96fa3ef34a8145b";
          localStorage.setItem("companyId", companyId);
        }

        // 1. جلب الإشعارات من السيرفر والـ LocalStorage
        if (realUserId) {
          try {
            const data = await notificationService.getUserNotifications(realUserId);
            const serverNotifs = data.notifications || [];
            const localData = localStorage.getItem("local_notifications");
            const localNotifs = localData ? JSON.parse(localData) : [];
            const allNotifs = [...localNotifs, ...serverNotifs];

            const transformed = allNotifs
              .map((notif) => {
                const safeType = (notif.type || "system").toLowerCase();
                return {
                  id: notif._id || notif.id,
                  title: notif.title || "No Title",
                  desc: notif.message || notif.desc || "",
                  style: typeStyle[safeType] || typeStyle.system,
                  time: notif.createdAt
                    ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

        // 2. جلب المشاريع الحقيقية لحساب العدد الفعلي ديناميكياً
        if (companyId) {
          try {
            setLoadingProjects(true);
            const response = await fetch(`https://flowio-backend.vercel.app/api/projects/company/${companyId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
                "Authorization": `Bearer ${token}`
              },
            });
            
            if (response.ok) {
              const resData = await response.json();
              const fetchedProjects = resData.data || (Array.isArray(resData) ? resData : resData.projects || []);
              
              // حساب المشاريع النشطة (اللي الـ progress بتاعها أقل من 100% أو حالتها active)
              const activeCount = fetchedProjects.filter(p => (p.progress !== undefined ? p.progress < 100 : true)).length;
              
              setProjectStats({
                total: fetchedProjects.length,
                active: activeCount
              });
            }
          } catch (err) {
            console.error("Error fetching projects for KPI:", err);
          } finally {
            setLoadingProjects(false);
          }
        }

      } catch (error) {
        console.error("Dashboard init error:", error);
        setLoadingNotif(false);
        setLoadingProjects(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const employees = [
    {
      name: "Justin Lipshutz",
      role: "Project Manager",
      percent: 100,
      img: "https://i.pravatar.cc/60?img=12",
    },
    {
      name: "Danielle Lipsham",
      role: "UI Designer",
      percent: 70,
      img: "https://i.pravatar.cc/60?img=32",
    },
    {
      name: "Noah Bernstein",
      role: "Frontend Developer",
      percent: 65,
      img: "https://i.pravatar.cc/60?img=15",
    },
    {
      name: "Ahmed Mohamed",
      role: "Backend Developer",
      percent: 88,
      img: "https://i.pravatar.cc/60?img=22",
    },
  ];

  const bars = [
    ["Task 1", 100],
    ["Task 2", 70],
    ["Task 3", 92],
    ["Task 4", 38],
  ];

  const cardClass =
    "relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-[#16206d]/95 to-[#0d1448]/95 p-6 shadow-[0_22px_55px_rgba(0,0,0,.30)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(95,150,255,.20)]";

  // تجميع الـ KPIs وربط حقل الـ Projects بالـ state الديناميكية الجديدة
  const kpiItems = [
    { icon: <FaProjectDiagram />, label: "Projects", value: loadingProjects ? "..." : String(projectStats.total), sub: `${projectStats.active} active` },
    { icon: <FaTasks />, label: "Tasks", value: "84", sub: "18 pending" }, // يمكن ربطها لاحقاً بنفس طريقة المشاريع
    { icon: <FaCalendarAlt />, label: "Meetings", value: "18", sub: "3 today" },
    { icon: <FaUsers />, label: "Teams", value: "4", sub: "26 members" },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="grid h-full min-h-0 grid-rows-[82px_1fr] gap-6 text-white">
        {/* KPI CARDS */}
        <div className="grid grid-cols-4 gap-5">
          {kpiItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-[24px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 px-5 shadow-[0_16px_35px_rgba(0,0,0,.24)] transition hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(95,150,255,.18)]"
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
        <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-6">
          {/* PROJECT PROGRESS */}
          <div className={cardClass}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-bold">Project Progress</h3>
              <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
                This Month
              </span>
            </div>

            <div className="grid h-[calc(100%-44px)] grid-cols-[190px_1fr] items-center gap-7">
              <div className="relative mx-auto h-[175px] w-[175px] rounded-full bg-[conic-gradient(#7b5dff_0deg_180deg,#07103a_180deg_186deg,#59d3ff_186deg_258deg,#07103a_258deg_264deg,#d86bff_264deg_360deg)] shadow-[0_0_38px_rgba(120,90,255,.30)]">
                <div className="absolute inset-[25px] rounded-full bg-[#0b123f]" />

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[34px] font-extrabold">50%</span>
                  <span className="text-[11px] text-white/65">Completed</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ["Done", "50%", "#7b5dff"],
                  ["In Progress", "30%", "#d86bff"],
                  ["To Do", "20%", "#59d3ff"],
                ].map(([label, value, color]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-white/70">{label}</span>
                      </div>
                      <b>{value}</b>
                    </div>

                    <div className="h-[6px] rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
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

            <div className="relative mx-auto h-[205px] w-[88%]">
              {[30, 68, 106, 144].map((top) => (
                <div
                  key={top}
                  style={{ top }}
                  className="absolute left-0 right-0 h-px bg-white/10"
                />
              ))}

              <div className="absolute inset-0 flex items-end justify-around pb-6">
                {bars.map(([name, value]) => (
                  <div key={name} className="flex flex-col items-center">
                    <div className="relative flex h-[135px] w-[38px] items-end rounded-[14px] bg-white/10 p-[4px]">
                      <div
                        style={{ height: `${value}%` }}
                        className="w-full rounded-[10px] bg-gradient-to-t from-[#6eb5ff] to-[#5b7dff] shadow-[0_0_20px_rgba(95,150,255,.35)]"
                      />
                    </div>

                    <span className="mt-2 text-[10px] text-white/75">
                      {name}
                    </span>

                    <span className="mt-1 text-[9px] text-[#78aaff]">
                      {value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TEAM DISCIPLINE */}
          <div className={`${cardClass} flex flex-col`}>
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <h3 className="text-[17px] font-bold">Team Discipline</h3>

              <Link
                to="/teams"
                className="flex items-center gap-2 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100"
              >
                View Team <FaArrowRight />
              </Link>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              {employees.map((emp) => (
                <div
                  key={emp.name}
                  className="rounded-[20px] bg-[#10184c]/60 p-4 transition hover:bg-[#151f62]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.img}
                        alt={emp.name}
                        className="h-[42px] w-[42px] rounded-full object-cover ring-2 ring-white/15"
                      />

                      <div>
                        <p className="text-[13px] font-bold">{emp.name}</p>
                        <p className="mt-1 text-[10px] text-white/45">
                          {emp.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-[12px] font-bold text-[#78aaff]">
                      {emp.percent}%
                    </span>
                  </div>

                  <div className="h-[7px] rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff]"
                      style={{ width: `${emp.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC NOTIFICATIONS */}
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
                <div className="text-center text-xs text-white/35 py-8">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-xs text-white/25 py-8">
                  No notifications found.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-[20px] bg-[#10184c]/60 p-4 transition hover:bg-[#151f62]"
                  >
                    <div
                      className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.style.color}`}
                    >
                      {item.style.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-[13px] font-bold truncate">{item.title}</h4>
                      <p className="mt-1 text-[11px] leading-relaxed text-white/55 line-clamp-2">
                        {item.desc}
                      </p>
                    </div>

                    <span className="text-[10px] text-white/35 whitespace-nowrap">{item.time}</span>
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