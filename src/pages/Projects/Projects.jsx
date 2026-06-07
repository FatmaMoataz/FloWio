import { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { jwtDecode } from "jwt-decode";
import {
  FaLaptopCode,
  FaRobot,
  FaPalette,
  FaProjectDiagram,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const tabs = [
    { key: "all", label: "All Projects" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  const cardAccents = [
    {
      icon: "text-[#ffa723] bg-[#ffa723]/10 ring-[#ffa723]/25",
      bar: "bg-[#ffa723]",
      dot: "bg-[#ffa723]",
      text: "#ffa723",
    },
    {
      icon: "text-[#58a1ff] bg-[#58a1ff]/10 ring-[#58a1ff]/25",
      bar: "bg-[#4f8dff]",
      dot: "bg-[#58a1ff]",
      text: "#58a1ff",
    },
    {
      icon: "text-[#a47cff] bg-[#a47cff]/10 ring-[#a47cff]/25",
      bar: "bg-[#a47cff]",
      dot: "bg-[#a47cff]",
      text: "#a47cff",
    },
    {
      icon: "text-[#24d7ea] bg-[#24d7ea]/10 ring-[#24d7ea]/25",
      bar: "bg-[#24d7ea]",
      dot: "bg-[#24d7ea]",
      text: "#24d7ea",
    },
  ];

  // Determine project card icon dynamically based on title keywords
  const getProjectIcon = (title = "") => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("web") || lowerTitle.includes("design"))
      return <FaPalette />;
    if (
      lowerTitle.includes("ai") ||
      lowerTitle.includes("bot") ||
      lowerTitle.includes("model")
    )
      return <FaRobot />;
    if (
      lowerTitle.includes("code") ||
      lowerTitle.includes("app") ||
      lowerTitle.includes("dev")
    )
      return <FaLaptopCode />;
    return <FaProjectDiagram />;
  };

  // Safely extract token and verified target companyId from active session
  const getCompanySession = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found, please login first.");

    const decoded = jwtDecode(token);
    let companyId =
      decoded.companyId || decoded.company || localStorage.getItem("companyId");

    // Dynamic Admin Fallback:
    // If system-admin lacks a dedicated companyId, it safely uses a reliable active corporate ID
    // Replace the string value below with a valid company _id copy from your MongoDB cluster if necessary
    if (!companyId && decoded.role === "system-admin") {
      companyId = "66391d5bb96fa3ef34a8145b";
    }

    if (!companyId) {
      throw new Error("Company ID could not be retrieved from login session.");
    }

    return { token, companyId };
  };

  // 1. Fetch current projects linked to company context
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const { token, companyId } = getCompanySession();

        const response = await fetch(
          `https://flowio-backend.vercel.app/api/projects/company/${companyId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status} - Failed to fetch projects`,
          );
        }

        const resData = await response.json();

        // Match with backend controller structure response: res.status(200).json({ success: true, data: projects })
        const fetchedProjects =
          resData.data ||
          (Array.isArray(resData) ? resData : resData.projects || []);
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

  // 2. Form submission payload to create a persistent new project record
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newProject.name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const { token, companyId } = getCompanySession();

      const projectData = {
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        companyId: companyId,
      };

      const response = await fetch(
        "https://flowio-backend.vercel.app/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(projectData),
        },
      );

      const resData = await response.json();

      if (!response.ok) {
        if (resData.errors && Array.isArray(resData.errors)) {
          throw new Error(resData.errors.join(" | "));
        }
        throw new Error(resData.message || `Server error: ${response.status}`);
      }

      // Extract newly created document safely from payload structure
      const createdProject = resData.data || resData.project || resData;

      // Unshift item instantly to the existing list state
      setProjects((prev) => [createdProject, ...prev]);
      setNewProject({ name: "", description: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating project:", err);
      setFormError(
        err.message || "Something went wrong while creating the project.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout title="Projects">
      {/* HEADER SECTION WITH CREATE BUTTON */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Company Workspace</h2>
          <p className="text-xs text-white/50 mt-1">
            Manage and track your operational pipeline
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-indigo-500/30 active:translate-y-0"
        >
          <FaPlus className="text-xs" /> Create New Project
        </button>
      </div>

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
        <div className="flex h-64 flex-col items-center justify-center text-white/50 bg-[#111b63]/40 rounded-[24px] border border-white/5 p-6 text-center">
          <p className="mb-4">
            No projects found for this company. Create one to get started!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white border border-white/10 hover:bg-white/20 transition"
          >
            + Add First Project
          </button>
        </div>
      )}

      {/* DATA LIST STATE */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
          {projects.map((project) => {
            const progressValue =
              project.progress !== undefined ? project.progress : 0;
            const progressString = `${progressValue}%`;
            const projectTitle =
              project.name || project.title || "Untitled Project";

            return (
              <div
                key={project._id || project.id}
                className="rounded-[24px] bg-[#111b63]/95 p-6 shadow-lg border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#f6c14f] to-[#ff9f43] text-xl shadow-[0_4px_15px_rgba(246,193,79,0.2)]">
                  {getProjectIcon(projectTitle)}
                </div>

                <h3 className="text-xl font-bold capitalize truncate">
                  {projectTitle}
                </h3>

                <p className="my-3 text-sm text-white/60 line-clamp-2 min-h-[40px]">
                  {project.description ||
                    "Project management and team collaboration workflow."}
                </p>

                <div className="mt-4">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
                      style={{ width: progressString }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/70 font-medium">
                    {progressString} completed
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL COMPONENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#16206d] to-[#0d1448] p-6 shadow-2xl text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                Create New Project
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
                className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              {formError && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., E-Commerce Platform, AI Analytics Bot"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0a0f35] px-4 py-3 text-sm text-white placeholder-white/35 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the scope, goals, or core structure of the project..."
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0a0f35] px-4 py-3 text-sm text-white placeholder-white/35 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none"
                  disabled={submitting}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError(null);
                  }}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50 transition"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
