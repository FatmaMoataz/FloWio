import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckSquare,
  FaChevronRight,
  FaEllipsisH,
  FaExpand,
  FaFolderOpen,
  FaPaperPlane,
  FaPlus,
  FaRegSquare,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";
import storyService from "../../services/storyService";
import API from "../../services/api";

const priorityStyles = {
  low: "border-sky-300/30 bg-sky-400/15 text-sky-200",
  medium: "border-amber-300/30 bg-amber-400/15 text-amber-200",
  high: "border-rose-300/30 bg-rose-400/15 text-rose-200",
};

const formatDate = (date) => {
  if (!date) return "No date";
  try {
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
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

function AssistantAvatar({ compact = false }) {
  return (
    <div
      className={`flowio-ai-avatar relative flex items-center justify-center rounded-[42%] border border-cyan-100/50 bg-[radial-gradient(circle_at_32%_22%,#8bc7ff_0%,#4a91f7_28%,#55dbea_67%,#86f6e7_100%)] shadow-[0_20px_38px_rgba(44,206,255,.22),inset_0_2px_8px_rgba(255,255,255,.5)] ${
        compact ? "h-9 w-9" : "h-28 w-28"
      }`}
    >
      <span className={`${compact ? "h-2 w-1" : "h-6 w-2.5"} rounded-full bg-white shadow-[0_0_9px_white]`} />
      <span className={`${compact ? "ml-2 h-2 w-1" : "ml-5 h-6 w-2.5"} rounded-full bg-white shadow-[0_0_9px_white]`} />
    </div>
  );
}

export default function ProjectOverview() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [stories, setStories] = useState([]);
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState("");
  const [assistantMessage, setAssistantMessage] = useState(
    "Hello! I'm here to assist you.\nNeed help with your stories?",
  );
  const [storyUpdating, setStoryUpdating] = useState(null);
  
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  // Fetch project, stories, and epics
  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project
      const projectResponse = await projectService.getProjectById(projectId);
      let projectData = null;

      if (projectResponse.success && projectResponse.data) {
        projectData = projectResponse.data;
      } else if (projectResponse.data) {
        projectData = projectResponse.data;
      }

      if (!projectData) {
        throw new Error("Project not found");
      }

      setProject(projectData);

      // Fetch stories for this project
      try {
        const storiesResponse = await storyService.getStoriesByProject(projectId);
        const storiesData = storiesResponse.data || storiesResponse || [];
        setStories(Array.isArray(storiesData) ? storiesData : []);
      } catch (storyErr) {
        console.log("Could not load stories:", storyErr.message);
        setStories([]);
      }

      // Fetch epics
      try {
        const epicsResponse = await API.get(`/api/epics?projectId=${projectId}`);
        const epicsData = epicsResponse.data?.data || [];
        setEpics(Array.isArray(epicsData) ? epicsData : []);
      } catch (epicErr) {
        console.log("Could not load epics:", epicErr.message);
        setEpics([]);
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, fetchProjectData]);

  // Calculate progress based on STORIES (not tasks)
  const calculateProgress = () => {
    if (stories.length === 0) return 0;
    const doneStories = stories.filter(s => s.status === "Done").length;
    return Math.round((doneStories / stories.length) * 100);
  };

  // Toggle story status
  const toggleStory = async (story) => {
    try {
      setStoryUpdating(story._id);
      
      const newStatus = story.status === "Done" ? "In Progress" : "Done";
      const response = await storyService.updateStory(story._id, { status: newStatus });
      
      if (response.success) {
        setStories(prev => prev.map(s => 
          s._id === story._id ? { ...s, status: newStatus } : s
        ));
      }
    } catch (err) {
      console.error("Error updating story:", err);
    } finally {
      setStoryUpdating(null);
    }
  };

  // Send AI message
  const sendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    
    if (userMessage.toLowerCase().includes("story") || userMessage.toLowerCase().includes("epic")) {
      setAssistantMessage(
        `Here's how to manage your stories:\n\n` +
        `1. Each epic contains multiple stories\n` +
        `2. Stories track the actual work items\n` +
        `3. Subtasks break stories into smaller steps\n\n` +
        `Your progress is calculated from story completion!`
      );
    } else {
      setAssistantMessage(
        `I can help you with "${userMessage}".\n\n` +
        `Try asking about:\n` +
        `• Story management\n` +
        `• Epic organization\n` +
        `• Progress tracking`
      );
    }
    
    setMessage("");
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <section className="flowio-projects-page mt-4 flex h-full min-h-[650px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_42%,#090c4f_0%,#070933_58%,#05072d_100%)] p-4 sm:p-6">
          <div className="text-center">
            <FaSpinner className="mx-auto mb-4 text-3xl text-[#5f9be8] animate-spin" />
            <p className="text-white/60">Loading project...</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <section className="flowio-projects-page mt-4 flex h-full min-h-[650px] items-center justify-center rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_42%,#090c4f_0%,#070933_58%,#05072d_100%)] p-4 sm:p-6">
          <div className="max-w-md text-center">
            <FaExclamationTriangle className="mx-auto mb-4 text-3xl text-rose-400" />
            <h3 className="text-lg font-semibold text-white/80">Failed to Load Project</h3>
            <p className="mt-2 text-sm text-white/50">{error}</p>
            <button
              onClick={fetchProjectData}
              className="mt-4 rounded-xl bg-[#5f9be8] px-6 py-2.5 text-sm font-medium transition hover:bg-[#70a9ef]"
            >
              Try Again
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center text-white/60">
          Project not found.
        </div>
      </MainLayout>
    );
  }

  const progress = calculateProgress();
  const color = { hex: getStatusColor(project.status), soft: "rgba(95,155,232,0.15)" };
  const visibleStories = showAll ? stories : stories.slice(0, 4);

  return (
    <MainLayout>
      <section className="flowio-projects-page flowio-project-overview h-full min-h-[650px] overflow-y-auto rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_42%,#090c4f_0%,#070933_58%,#05072d_100%)] p-4 text-white sm:p-6 lg:min-h-0">
        <div className="mx-auto grid max-w-6xl gap-7 lg:h-full lg:grid-cols-[minmax(0,1fr)_310px]">
          {/* Main Content */}
          <div className="min-w-0">
            <header className="flex items-center gap-3 text-sm">
              <button 
                type="button" 
                onClick={() => navigate("/projects")} 
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 transition" 
                aria-label="Back to projects"
              >
                <FaArrowLeft />
              </button>
              <button 
                type="button" 
                onClick={() => navigate("/projects")} 
                className="text-white/45 hover:text-white/75"
              >
                Projects
              </button>
              <FaChevronRight className="text-[10px] text-white/45" />
              <h1 className="truncate text-lg font-semibold">{project.name}</h1>
            </header>

            <div className="mt-8 pl-2 sm:pl-10">
              {/* Project Info Card */}
              <div className="flex items-start gap-4">
                <div 
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border" 
                  style={{ color: color.hex, background: color.soft, borderColor: `${color.hex}45` }}
                >
                  <FaFolderOpen />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="mt-1 text-xs text-white/45">{project.description || "No description"}</p>
                  
                  {/* Progress Bar - Based on Stories */}
                  <div className="mt-3 flex items-end gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex justify-between items-center">
                        <span className="text-xs text-white/40">
                          {stories.length} stories • {epics.length} epics
                        </span>
                        <span className="text-sm font-semibold" style={{ color: color.hex }}>
                          {progress}%
                        </span>
                      </div>
                      <div className="flowio-project-progress-track h-2.5 overflow-hidden rounded-full bg-[#18275d]">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%`, background: color.hex }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Date and Actions */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[11px] text-white/40">
                      <FaCalendarAlt /> 
                      {project.endDate ? formatDate(project.endDate) : "No due date"}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => navigate(`/projects/${projectId}/kanban`)}
                      className="rounded-full bg-[#5f9be8] px-5 py-2 text-xs font-medium text-white shadow-[0_8px_20px_rgba(76,146,235,.25)] hover:bg-[#70a9ef] transition"
                    >
                      View Kanban
                    </button>
                  </div>
                </div>
              </div>

              {/* Stories Section */}
              <div className="mt-7 flex items-center justify-between">
                <h2 className="text-base font-semibold">
                  Stories ({stories.length})
                </h2>
                <button 
                  type="button" 
                  onClick={() => navigate(`/projects/${projectId}/details`)} 
                  className="text-xs text-[#79b4ff] hover:underline"
                >
                  Project details
                </button>
              </div>

              {/* Stories Panel */}
              <div className="flowio-overview-story-panel mt-5 rounded-[28px] border border-white/[0.025] bg-[radial-gradient(ellipse_at_50%_45%,rgba(29,42,91,.88),rgba(14,22,64,.96))] p-5 sm:p-6">
                {stories.length > 0 ? (
                  <>
                    <div className="space-y-5">
                      {visibleStories.map((story) => {
                        const isChecked = story.status === "Done";
                        const isUpdating = storyUpdating === story._id;
                        
                        return (
                          <button
                            key={story._id}
                            type="button"
                            onClick={() => toggleStory(story)}
                            disabled={isUpdating}
                            className="flex w-full items-center gap-2 text-left text-xs disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <FaSpinner className="shrink-0 animate-spin text-[#a9c7ff]" />
                            ) : isChecked ? (
                              <FaCheckSquare className="shrink-0 text-[#a9c7ff]" />
                            ) : (
                              <FaRegSquare className="shrink-0 text-white/75" />
                            )}
                            <span className={`shrink-0 rounded-full border px-4 py-1 text-[10px] font-semibold tracking-wide capitalize ${
                              priorityStyles[story.priority?.toLowerCase()] || priorityStyles.medium
                            }`}>
                              {story.priority || "Medium"}
                            </span>
                            <span className={`min-w-0 flex-1 truncate ${isChecked ? 'text-white/40 line-through' : 'text-white/75'}`}>
                              {story.title}
                            </span>
                            <span className="flex shrink-0 items-center gap-2 text-[10px] text-white/55">
                              <span className={`h-2.5 w-2.5 rounded-full ${
                                story.status === "Done" ? "bg-emerald-400" :
                                story.status === "In Progress" ? "bg-amber-400" :
                                "bg-white/40"
                              }`} />
                              {story.status || "To Do"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex justify-end">
                      {stories.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setShowAll((current) => !current)}
                          className="rounded-full bg-[#5f9be8] px-7 py-2 text-[10px] font-medium text-white hover:bg-[#70a9ef] transition"
                        >
                          {showAll ? "Show Less" : `View All (${stories.length})`}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-40 items-center justify-center text-center">
                    <div>
                      <p className="text-sm text-white/40">No stories yet</p>
                      <p className="mt-1 text-xs text-white/25">Stories track your project's work items</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <aside className="flowio-mini-ai relative flex min-h-[520px] flex-col rounded-[28px] border-2 border-[#202468] bg-[radial-gradient(circle_at_50%_30%,#11165b_0%,#080d39_58%,#060a2e_100%)] p-5 shadow-[0_18px_45px_rgba(1,4,27,.22)]">
            <div className="flex items-center gap-3">
              <AssistantAvatar compact />
              <h2 className="text-sm font-semibold">AI Assistant</h2>
              <div ref={menuRef} className="relative ml-auto">
                <button 
                  type="button" 
                  onClick={() => setMenuOpen((current) => !current)} 
                  className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white transition" 
                  aria-label="AI assistant options"
                >
                  <FaEllipsisH />
                </button>
                {menuOpen && (
                  <div className="flowio-project-menu absolute right-0 top-9 z-20 w-36 rounded-xl border border-white/10 bg-[#111846] p-1.5 shadow-2xl">
                    <button 
                      type="button" 
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(`/projects/${projectId}/assistant`);
                      }} 
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/75 hover:bg-white/10 transition"
                    >
                      <FaExpand /> Full screen
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-7 flex justify-center">
              <AssistantAvatar />
            </div>
            
            <div className="flowio-ai-message mt-10 whitespace-pre-line rounded-[20px] bg-[#15204d] p-5 text-xs leading-6 text-white/70 max-h-48 overflow-y-auto">
              {assistantMessage}
            </div>
            
            <button 
              type="button" 
              onClick={() => setAssistantMessage(
                "Story Management Tips:\n\n" +
                "1. Group stories under epics\n" +
                "2. Break stories into subtasks\n" +
                "3. Track progress with statuses\n" +
                "4. Update story status regularly\n\n" +
                `Current progress: ${progress}% complete`
              )} 
              className="flowio-ai-action mt-7 flex items-center gap-3 rounded-[17px] border border-white/[0.04] bg-[#15204d] px-4 py-3 text-left text-xs font-medium hover:bg-[#1a2557] transition"
            >
              <FaPlus /> Story Tips
            </button>
            
            <form onSubmit={sendMessage} className="flowio-ai-input mt-auto flex items-center rounded-[17px] border border-white/[0.05] bg-[#0b123f] px-4 py-3">
              <input 
                value={message} 
                onChange={(event) => setMessage(event.target.value)} 
                placeholder="Ask about stories..." 
                className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25" 
              />
              <button type="submit" className="text-[#5f9be8] hover:text-[#70a9ef] transition">
                <FaPaperPlane />
              </button>
            </form>
          </aside>
        </div>
      </section>
    </MainLayout>
  );
}