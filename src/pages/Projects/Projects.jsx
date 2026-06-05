import { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { jwtDecode } from "jwt-decode";
import { FaLaptopCode, FaRobot, FaPalette, FaProjectDiagram } from "react-icons/fa";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دالة لتحديد الأيقونة ديناميكياً بناءً على اسم المشروع
  const getProjectIcon = (title = "") => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("web") || lowerTitle.includes("design")) return <FaPalette />;
    if (lowerTitle.includes("ai") || lowerTitle.includes("bot") || lowerTitle.includes("model")) return <FaRobot />;
    if (lowerTitle.includes("code") || lowerTitle.includes("app") || lowerTitle.includes("dev")) return <FaLaptopCode />;
    return <FaProjectDiagram />;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found, please login first.");
        }

        // 1. فك تشفير الـ Token لسحب بيانات المستخدم
        const decoded = jwtDecode(token);
        
        // 2. محاولة جلب الـ companyId من التوكن أو الـ localStorage
        let companyId = decoded.companyId || decoded.company || localStorage.getItem("companyId");

        // 3. حل استثنائي للأدمن (Fallback) عشان الحساب ميفصلش لو الـ companyId بـ null
        if (!companyId && decoded.role === "system-admin") {
          console.warn("System-admin detected without companyId. Using a test company ID fallback.");
          // حطي هنا أي ID حقيقي لشركة عندك في الداتا بيز عشان التست يشتغل صح
          companyId = "66391d5bb96fa3ef34a8145b"; 
        }

        if (!companyId) {
          throw new Error("Company ID could not be retrieved from login session.");
        }

        // 4. طلب الداتا من الـ Route المتاح في الباك إند
        const response = await fetch(`https://flowio-backend.vercel.app/api/projects/company/${companyId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,         // عشان الـ auth middleware في الباك إند
            "Authorization": `Bearer ${token}` // تأمين إضافي للـ CORS
          },
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} - Failed to fetch projects`);
        }

        const resData = await response.json();
        
        // التعامل المرن مع شكل الـ Array الراجعة
        const fetchedProjects = Array.isArray(resData) ? resData : resData.projects || [];
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <MainLayout title="Projects">
      {/* LOADING STATE */}
      {loading && (
        <div className="flex h-64 items-center justify-center text-xl text-cyan-400 font-bold">
          <span className="animate-pulse">Loading Flowio Projects... 🚀</span>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="flex h-64 flex-col items-center justify-center text-red-400">
          <p className="text-lg font-bold">Something went wrong:</p>
          <p className="text-sm text-white/70 bg-red-500/10 px-4 py-2 rounded-xl mt-2 border border-red-500/20">
            {error}
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex h-64 items-center justify-center text-white/50 bg-[#111b63]/40 rounded-[24px] border border-white/5">
          No projects found for this company. Create one to get started!
        </div>
      )}

      {/* DATA LIST STATE */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
          {projects.map((project) => {
            const progressValue = project.progress !== undefined ? project.progress : 0;
            const progressString = `${progressValue}%`;
            const projectTitle = project.name || project.title || "Untitled Project";

            return (
              <div 
                key={project._id || project.id} 
                className="rounded-[24px] bg-[#111b63]/95 p-6 shadow-lg border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#f6c14f] to-[#ff9f43] text-xl shadow-[0_4px_15px_rgba(246,193,79,0.2)]">
                  {getProjectIcon(projectTitle)}
                </div>

                <h3 className="text-xl font-bold capitalize truncate">{projectTitle}</h3>
                
                <p className="my-3 text-sm text-white/60 line-clamp-2 min-h-[40px]">
                  {project.description || "Project management and team collaboration workflow."}
                </p>

                <div className="mt-4">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500" 
                      style={{ width: progressString }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/70 font-medium">{progressString} completed</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}