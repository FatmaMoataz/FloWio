import { useMemo, useRef, useState, useEffect } from "react";
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
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import { getProject, getProjectColor } from "./projectStore";

const priorityStyles = {
  Low: "bg-violet-400 text-white",
  Medium: "bg-emerald-400 text-white",
  High: "bg-rose-400 text-white",
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
  const project = getProject(projectId);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [checked, setChecked] = useState(() => new Set([0, 3]));
  const [message, setMessage] = useState("");
  const [assistantMessage, setAssistantMessage] = useState(
    "Hello! I'm here to assist you.\nNeed help with your tasks?",
  );

  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const tasks = useMemo(() => {
    if (!project) return [];
    const flattened = project.epics.flatMap((epic) =>
      epic.stories.flatMap((story) =>
        story.subtasks.map((subtask) => subtask.name),
      ),
    );
    const fallback = [
      "Optimize Web Content",
      "Update Portfolio Case Study",
      "Design new homepage layout",
      "Create wireframes for landing page",
    ];
    return (flattened.length ? flattened : fallback).map((name, index) => ({
      id: `${project.id}-overview-task-${index}`,
      name,
      priority: ["Low", "Medium", "High", "High"][index % 4],
      due: ["Sep 15", "Oct 15", "Tomorrow", "Sep 12"][index % 4],
    }));
  }, [project]);

  if (!project) {
    return <MainLayout><div className="flex h-full items-center justify-center text-white/60">Project not found.</div></MainLayout>;
  }

  const color = getProjectColor(project);
  const visibleTasks = showAll ? tasks : tasks.slice(0, 4);
  const sendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setAssistantMessage(`I can help you plan "${message.trim()}". Let's break it into clear next steps.`);
    setMessage("");
  };

  return (
    <MainLayout>
      <section className="flowio-projects-page flowio-project-overview h-full min-h-[650px] overflow-y-auto rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_42%,#090c4f_0%,#070933_58%,#05072d_100%)] p-4 text-white sm:p-6 lg:min-h-0">
        <div className="mx-auto grid max-w-6xl gap-7 lg:h-full lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="min-w-0">
            <header className="flex items-center gap-3 text-sm">
              <button type="button" onClick={() => navigate("/projects")} className="rounded-lg p-2 text-white/80 hover:bg-white/10" aria-label="Back to projects">
                <FaArrowLeft />
              </button>
              <button type="button" onClick={() => navigate("/projects")} className="text-white/45 hover:text-white/75">Projects</button>
              <FaChevronRight className="text-[10px] text-white/45" />
              <h1 className="truncate text-lg font-semibold">{project.name}</h1>
            </header>

            <div className="mt-8 pl-2 sm:pl-10">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border" style={{ color: color.hex, background: color.soft, borderColor: `${color.hex}45` }}>
                  <FaFolderOpen />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="mt-1 text-xs text-white/45">{project.description}</p>
                  <div className="mt-3 flex items-end gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-right text-sm font-semibold" style={{ color: color.hex }}>{project.progress}%</div>
                      <div className="flowio-project-progress-track h-2.5 overflow-hidden rounded-full bg-[#18275d]">
                        <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: color.hex }} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[11px] text-white/40">
                      <FaCalendarAlt /> {new Date(`${project.dueDate}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </span>
                    <button type="button" className="rounded-full bg-[#5f9be8] px-5 py-2 text-xs font-medium text-white shadow-[0_8px_20px_rgba(76,146,235,.25)]">
                      + Arrange Meeting
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between">
                <h2 className="text-base font-semibold">Assigned Tasks</h2>
                <button type="button" onClick={() => navigate(`/projects/${project.id}/details`)} className="text-xs text-[#79b4ff] hover:underline">
                  Project hierarchy
                </button>
              </div>

              <div className="flowio-overview-task-panel mt-5 rounded-[28px] border border-white/[0.025] bg-[radial-gradient(ellipse_at_50%_45%,rgba(29,42,91,.88),rgba(14,22,64,.96))] p-5 sm:p-6">
                <div className="space-y-5">
                  {visibleTasks.map((task, index) => {
                    const isChecked = checked.has(index);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() =>
                          setChecked((current) => {
                            const next = new Set(current);
                            if (next.has(index)) next.delete(index);
                            else next.add(index);
                            return next;
                          })
                        }
                        className="flex w-full items-center gap-2 text-left text-xs"
                      >
                        {isChecked ? <FaCheckSquare className="shrink-0 text-[#a9c7ff]" /> : <FaRegSquare className="shrink-0 text-white/75" />}
                        <span className={`shrink-0 rounded-full px-4 py-1 text-[9px] ${priorityStyles[task.priority]}`}>{task.priority} Priority</span>
                        <span className="min-w-0 flex-1 truncate text-white/75">{task.name}</span>
                        <span className="flex shrink-0 items-center gap-2 text-[10px] text-white/55">
                          <span className="h-2.5 w-2.5 rounded-full bg-white/70" />
                          {task.due}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      tasks.length > 4
                        ? setShowAll((current) => !current)
                        : navigate(`/projects/${project.id}/details`)
                    }
                    className="rounded-full bg-[#5f9be8] px-7 py-2 text-[10px] font-medium text-white"
                  >
                    {showAll && tasks.length > 4 ? "Show Less" : "View All"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="flowio-mini-ai relative flex min-h-[520px] flex-col rounded-[28px] border-2 border-[#202468] bg-[radial-gradient(circle_at_50%_30%,#11165b_0%,#080d39_58%,#060a2e_100%)] p-5 shadow-[0_18px_45px_rgba(1,4,27,.22)]">
            <div className="flex items-center gap-3">
              <AssistantAvatar compact />
              <h2 className="text-sm font-semibold">AI Assistant</h2>
              <div ref={menuRef} className="relative ml-auto">
                <button type="button" onClick={() => setMenuOpen((current) => !current)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label="AI assistant options">
                  <FaEllipsisH />
                </button>
                {menuOpen && (
                  <div className="flowio-project-menu absolute right-0 top-9 z-20 w-36 rounded-xl border border-white/10 bg-[#111846] p-1.5 shadow-2xl">
                    <button type="button" onClick={() => navigate(`/projects/${project.id}/assistant`)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/75 hover:bg-white/10">
                      <FaExpand /> Full screen
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-7 flex justify-center"><AssistantAvatar /></div>
            <div className="flowio-ai-message mt-10 whitespace-pre-line rounded-[20px] bg-[#15204d] p-5 text-xs leading-6 text-white/70">{assistantMessage}</div>
            <button type="button" onClick={() => setAssistantMessage("I suggest grouping related subtasks, setting one clear owner, and handling the highest-impact task first.")} className="flowio-ai-action mt-7 flex items-center gap-3 rounded-[17px] border border-white/[0.04] bg-[#15204d] px-4 py-3 text-left text-xs font-medium">
              <FaPlus /> Suggest Tasks Methods
            </button>
            <form onSubmit={sendMessage} className="flowio-ai-input mt-auto flex items-center rounded-[17px] border border-white/[0.05] bg-[#0b123f] px-4 py-3">
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask anything..." className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25" />
              <button type="submit" className="text-[#5f9be8]"><FaPaperPlane /></button>
            </form>
          </aside>
        </div>
      </section>
    </MainLayout>
  );
}
