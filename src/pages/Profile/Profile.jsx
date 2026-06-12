import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { jwtDecode } from "jwt-decode"; 

import {
  FaLaptopCode,
  FaRobot,
  FaPalette,
  FaProjectDiagram,
  FaVideo,
  FaComments,
  FaEnvelope,
  FaCheckCircle,
  FaTasks,
  FaEllipsisV,
  FaPlus,
  FaChartLine,
  FaClock,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";

export default function Profile() {
  const [userData, setUserData] = useState({ 
    name: "Loading...", 
    email: "...", 
    avatar: "" 
  });
  
  // دمج المشاريع الحقيقية في الـ State بدل من البيانات الثابتة
  const [realProjects, setRealProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // الـ State الجديدة لجلب عدد المهام الحقيقية ديناميكياً من الـ API
  const [taskCount, setTaskCount] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // دالة لتحديد الأيقونة والألوان ديناميكياً بناءً على اسم المشروع الحقيقي
  const getProjectStyle = (title = "") => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("web") || lowerTitle.includes("design")) {
      return { icon: <FaPalette />, color: "from-[#f6c14f] to-[#ff9f43]" };
    }
    if (lowerTitle.includes("ai") || lowerTitle.includes("bot") || lowerTitle.includes("model")) {
      return { icon: <FaRobot />, color: "from-[#ff5ea8] to-[#ff3d7f]" };
    }
    if (lowerTitle.includes("code") || lowerTitle.includes("app") || lowerTitle.includes("dev")) {
      return { icon: <FaLaptopCode />, color: "from-[#8f7cff] to-[#5b7dff]" };
    }
    return { icon: <FaProjectDiagram />, color: "from-[#5fffd0] to-[#35b7ff]" };
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        let companyId = decoded.companyId || decoded.company || localStorage.getItem("companyId");
        if (!companyId && decoded.role === "system-admin") {
          companyId = "66391d5bb96fa3ef34a8145b"; 
          localStorage.setItem("companyId", companyId);
        }

        // 1. استخراج الإيميل بشكل آمن
        const userEmail = decoded.email || "";

        // 2. معالجة اسم احتياطي من الإيميل وتجميله (Nour.Ahmed -> Nour Ahmed)
        const fallbackName = userEmail
          ? userEmail
              .split("@")[0]
              .replace(/[._-]/g, " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : "User";

        // 3. تحديث الـ State بالاسم المعالج
        setUserData({
          name: decoded.name || decoded.username || fallbackName,
          email: userEmail || "No Email Provided",
          avatar: decoded.picture || decoded.avatar || decoded.imageUrl || "" 
        });

        // جلب المشاريع الحقيقية المرتبطة بالشركة لعرضها في البروفايل
        const fetchProfileProjects = async () => {
          try {
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
              const fetched = resData.data || (Array.isArray(resData) ? resData : resData.projects || []);
              // عرض أول مشروعين فقط ليناسب تصميم الصفحة المتناسق
              setRealProjects(fetched.slice(0, 2));
            }
          } catch (err) {
            console.error("Error fetching projects for profile:", err);
          } finally {
            setLoadingProjects(false);
          }
        };

        // جلب المهام الحقيقية الموكلة للمستخدم لحساب عددها ديناميكياً
        const fetchProfileTasks = async () => {
          try {
            const response = await fetch(`https://flowio-backend.vercel.app/api/tasks/my-tasks`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
                "Authorization": `Bearer ${token}`
              },
            });
            if (response.ok) {
              const resData = await response.json();
              const fetchedTasks = resData.data || (Array.isArray(resData) ? resData : resData.tasks || []);
              setTaskCount(fetchedTasks.length);
            }
          } catch (err) {
            console.error("Error fetching tasks count for profile:", err);
            setTaskCount(0);
          } finally {
            setLoadingTasks(false);
          }
        };

        fetchProfileProjects();
        fetchProfileTasks();

      } catch (error) {
        console.error("Error decoding token in profile:", error);
        setUserData({ 
          name: "Guest User", 
          email: "guest@workspace.com", 
          avatar: "" 
        });
        setLoadingProjects(false);
        setLoadingTasks(false);
      }
    }
  }, []);

  // بيانات الأنشطة والفرق (مؤقتة لحين ربطها بالـ API)
  const acts = [
    ["Meeting With Sarah", "MEETING", <FaVideo />, "from-[#ff5ea8] to-[#ff3d7f]"],
    ["Client Meeting Q1", "MEETING", <FaComments />, "from-[#5fffd0] to-[#35b7ff]"],
    ["Sarah Sent You A Message", "CHAT MESSAGE", <FaEnvelope />, "from-[#ffb86b] to-[#ff7b54]"],
    ["Meeting 1 Completed", "SUMMARY GENERATED", <FaCheckCircle />, "from-[#d8deea] to-[#9ca8bd]"],
    ["Task Completed", "DONE", <FaTasks />, "from-[#ffd166] to-[#ffb703]"],
  ];

  const teams = [
    {
      name: "Fintio Project Team",
      members: ["Ahmed Mohamed", "Sarah"],
    },
    {
      name: "Design Team",
      members: ["Aya", "Laila Omar"],
    },
  ];

  const card =
    "relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 shadow-[0_22px_55px_rgba(0,0,0,.30)]";

  return (
    <MainLayout title="Profile">
      <div className="grid min-h-0 grid-cols-1 gap-5 text-white lg:h-full lg:grid-cols-[1fr_300px] lg:gap-6">
        <div className="grid min-h-0 grid-rows-[280px_1fr] gap-6 overflow-hidden">
          
          {/* PROJECTS SECTION */}
          <div className={`${card} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-bold">Projects In Progress</h3>
              <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
                {loadingProjects ? "..." : `${realProjects.length} Active`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:h-[calc(100%-38px)]">
              {loadingProjects ? (
                <div className="col-span-2 flex items-center justify-center text-sm text-cyan-400 animate-pulse">
                  Loading active workspace projects...
                </div>
              ) : realProjects.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[24px] text-white/40 text-xs p-4 text-center">
                  <p className="mb-2">No active projects found for this company.</p>
                  <Link to="/projects" className="text-cyan-400 hover:underline">+ Create Project</Link>
                </div>
              ) : (
                realProjects.map((project) => {
                  const projectTitle = project.name || project.title || "Untitled Project";
                  const progressValue = project.progress !== undefined ? project.progress : 0;
                  const style = getProjectStyle(projectTitle);

                  return (
                    <Link
                      to="/projects"
                      key={project._id || project.id}
                      className="group flex flex-col justify-between rounded-[24px] border border-white/5 bg-[#10184c]/90 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[#151f62] hover:shadow-[0_0_25px_rgba(95,150,255,.22)]"
                    >
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-[14px] bg-gradient-to-b ${style.color}`}>
                            {style.icon}
                          </div>
                          <span className="text-[13px] font-extrabold">
                            {progressValue}%
                          </span>
                        </div>
                        <h4 className="text-[15px] font-bold truncate capitalize">{projectTitle}</h4>
                        <p className="mt-2 text-[11px] leading-relaxed text-white/55 line-clamp-2">
                          {project.description || "Project management and team collaboration workflow."}
                        </p>
                      </div>

                      <div>
                        <div className="mt-4 h-[7px] rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${style.color}`}
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                        <div className="mt-3 flex justify-between text-[10px] text-white/50">
                          <span>Recent Updates</span>
                          <span>Active</span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className={`${card} min-h-0 p-5`}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[17px] font-bold">Recent Activity</h3>
              <Link
                to="/recent-activity"
                className="flex items-center gap-2 text-[11px] font-semibold text-cyan-300 transition hover:text-cyan-100"
              >
                See All <FaArrowRight />
              </Link>
            </div>

            <div className="h-[calc(100%-42px)] overflow-y-auto pr-2">
              {acts.map((a) => (
                <div
                  key={a[0]}
                  className="mb-3 grid min-h-[56px] grid-cols-[42px_1fr_auto] items-center gap-4 rounded-[20px] bg-[#10184c]/50 px-3 py-2 transition-all duration-300 hover:-translate-y-1 hover:bg-[#151f62]"
                >
                  <div className={`flex h-[38px] w-[38px] items-center justify-center rounded-full bg-gradient-to-b ${a[3]} text-[13px] shadow-[0_0_16px_rgba(255,255,255,.10)]`}>
                    {a[2]}
                  </div>

                  <div>
                    <h4 className="text-[12px] font-bold">{a[0]}</h4>
                    <p className="mt-1 flex items-center gap-2 text-[10px] text-white/45">
                      <FaClock /> 25/6/2023
                    </p>
                  </div>

                  <Link
                    to="/recent-activity"
                    className="flex h-7 items-center justify-center rounded-full bg-blue-400/15 px-3 text-[9px] font-bold text-[#78aaff] transition hover:bg-blue-400/25"
                  >
                    {a[1]}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className={`${card} flex min-h-0 flex-col p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[16px] font-bold">Your Profile</h3>
            <button className="text-white/45 transition hover:text-white">
              <FaEllipsisV />
            </button>
          </div>

          <div className="mx-auto flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#6eb5ff] to-[#5b7dff] p-[3px] shadow-[0_0_25px_rgba(95,150,255,.35)]">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.name}
                className="h-full w-full rounded-full object-cover"
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#10184c] text-[26px] font-black uppercase text-cyan-300">
                {userData.name.charAt(0)}
              </div>
            )}
          </div>

          <h2 className="mt-3 text-center text-[20px] font-extrabold capitalize">
            {userData.name}
          </h2>

          <p className="mb-5 text-center text-[12px] text-white/50 break-all">
            {userData.email}
          </p>

          <div className="mb-5 grid grid-cols-3 gap-2">
            {[
              [<FaChartLine />, "80%", "Progress"],
              [<FaTasks />, loadingTasks ? "..." : `${taskCount}`, "Tasks"],
              [<FaUsers />, "2", "Teams"],
            ].map((item) => (
              <div
                key={item[2]}
                className="rounded-[16px] bg-[#10184c]/70 p-3 text-center"
              >
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/15 text-[#78aaff]">
                  {item[0]}
                </div>
                <h4 className="text-[13px] font-bold">{item[1]}</h4>
                <p className="mt-1 text-[9px] text-white/40">{item[2]}</p>
              </div>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {teams.map((team) => (
              <div key={team.name} className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-bold">{team.name}</span>
                  <Link
                    to="/teams"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[9px] text-white/70 hover:text-white"
                  >
                    <FaPlus />
                  </Link>
                </div>

                <div className="space-y-3">
                  {team.members.map((member, index) => (
                    <Link
                      to="/chat"
                      key={member}
                      className="flex items-center justify-between rounded-[18px] bg-[#10184c]/60 p-3 transition hover:bg-[#151f62]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://i.pravatar.cc/80?img=${index + 20}`}
                          alt={member}
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
                        />
                        <span className="text-[12px] font-medium text-white">
                          {member}
                        </span>
                      </div>

                      {index === 1 && (
                        <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[9px] font-bold text-[#73a8ff]">
                          online
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/teams"
            className="mt-4 flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#69b5ff] to-[#6178ff] text-[13px] font-bold shadow-[0_0_18px_rgba(95,150,255,.35)] transition hover:brightness-110"
          >
            See All
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}