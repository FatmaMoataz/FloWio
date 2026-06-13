import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChevronDown,
  FaEdit,
  FaEllipsisH,
  FaExternalLinkAlt,
  FaLink,
  FaPaperclip,
  FaPlus,
  FaSearch,
  FaTrash,
  FaUserCircle,
  FaCheck,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import { getProject } from "./projectStore";

const COLUMNS = [
  { id: "todo", title: "TO-DO" },
  { id: "in-progress", title: "IN-PROGRESS" },
  { id: "in-review", title: "IN-REVIEW" },
  { id: "completed", title: "DONE" },
];

const fallbackTasks = [
  {
    id: 1,
    name: "API integration",
    status: "in-progress",
    notes: "Connect backend API with frontend services.",
    due: "Oct 15",
    assignee: "Sarah",
    priority: "Medium",
    fileLabel: "General Page",
    urlLabel: "URL label",
    linkUrl: "",
    pageName: "General Page",
  },
  {
    id: 2,
    name: "Form validation",
    status: "in-progress",
    notes: "Add validation to all required fields.",
    due: "Tomorrow",
    assignee: "Sarah",
    priority: "High",
    fileLabel: "General Page",
    urlLabel: "URL label",
    linkUrl: "",
    pageName: "Project Form",
  },
  {
    id: 3,
    name: "UI integration",
    status: "completed",
    notes: "Polish UI cards and connect navigation.",
    due: "Sep 15",
    assignee: "Sarah",
    priority: "Low",
    fileLabel: "General Page",
    urlLabel: "URL label",
    linkUrl: "",
    pageName: "Dashboard",
  },
];

const priorityStyles = {
  Low: "bg-violet-400/15 text-violet-300",
  Medium: "bg-blue-400/15 text-[#78aaff]",
  High: "bg-rose-400/15 text-rose-300",
};

export default function ProjectKanban() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = getProject(projectId);

  const storageKey = `flowio-tasks-${projectId}`;
  const savedTasks = JSON.parse(localStorage.getItem(storageKey) || "[]");

  const baseTasks = project?.assignedTasks?.length
    ? project.assignedTasks.map((task) => ({
        ...task,
        notes: task.notes || "Type here...",
        assignee: task.assignee || "Sarah",
        status: task.status || "todo",
        due: task.due || "20 Sep",
        priority: task.priority || "Medium",
        fileLabel: task.fileLabel || task.pageName || "General Page",
        urlLabel: task.urlLabel || task.linkTitle || "URL label",
        linkUrl: task.linkUrl || "",
        pageName: task.pageName || "General Page",
      }))
    : fallbackTasks;

  const [tasks, setTasks] = useState([...savedTasks, ...baseTasks]);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);

  const boardTitle = project?.name || "Website Redesign";

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      `${task.name} ${task.notes} ${task.assignee} ${task.pageName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [tasks, search]);

  const updateStorage = (updatedTasks) => {
    const onlyLocalTasks = updatedTasks.filter((task) => task.id > 100000);
    localStorage.setItem(storageKey, JSON.stringify(onlyLocalTasks));
  };

  const moveTask = (taskId, newStatus) => {
    setTasks((prev) => {
      const updated = prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      updateStorage(updated);
      return updated;
    });
    setOpenStatusId(null);
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => {
      const updated = prev.filter((task) => task.id !== taskId);
      updateStorage(updated);
      return updated;
    });
    setOpenMenuId(null);
  };

  const openTaskPage = (status = "todo") => {
    navigate(`/projects/${projectId}/tasks/new?status=${status}`);
  };

  const openLink = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <MainLayout>
      <section className="h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden pb-20 pr-2 text-white">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() =>
                  project ? navigate(`/projects/${project.id}`) : navigate("/projects")
                }
                className="text-white/60 transition hover:text-[#6eb5ff]"
              >
                <FaArrowLeft />
              </button>

              <span className="text-white/45">Projects</span>
              <span className="text-white/30">›</span>

              <h1 className="text-[22px] font-extrabold tracking-[-.3px]">
                {boardTitle} Kanban Board
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-[285px] items-center gap-3 rounded-[17px] border border-blue-300/10 bg-[#141d66]/90 px-4 shadow-[0_12px_26px_rgba(0,0,0,.18)]">
                <FaSearch className="text-sm text-white/45" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search board..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                />
              </div>

              <div className="flex -space-x-2">
                {["FM", "SR", "AK", "MA"].map((name, index) => (
                  <div
                    key={name}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0b1039] text-[10px] font-bold ${
                      index === 0
                        ? "bg-[#ffcf5a] text-[#111]"
                        : index === 1
                        ? "bg-[#78aaff]"
                        : index === 2
                        ? "bg-[#45e68b] text-[#062d1a]"
                        : "bg-[#ff7aa8]"
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openTaskPage("todo")}
            className="group flex h-12 items-center gap-3 rounded-full bg-gradient-to-r from-[#6eb5ff] via-[#7aa8ff] to-[#5b7dff] px-7 text-sm font-bold shadow-[0_0_30px_rgba(95,150,255,.35)] transition-all duration-300 hover:scale-105"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-all group-hover:rotate-90">
              <FaPlus />
            </span>
            Add Task
          </button>
        </div>

        <div className="grid min-h-max grid-cols-4 gap-5 overflow-visible">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.status === column.id
            );

            return (
              <div
                key={column.id}
                className="relative flex h-[720px] flex-col overflow-visible rounded-[28px] border border-blue-300/10 bg-gradient-to-b from-[#151e66]/95 to-[#0a0f3d]/95 p-4 shadow-[0_24px_55px_rgba(0,0,0,.28)]"
              >
                <div className="mb-4 flex shrink-0 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[13px] font-bold text-white/80">
                      {column.title}
                    </h2>

                    <span className="flex h-7 min-w-7 items-center justify-center rounded-[10px] bg-[#0b1246] px-2 text-xs font-bold">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTaskPage(column.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/45 transition hover:bg-blue-400/15 hover:text-[#78aaff]"
                  >
                    <FaPlus />
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto overflow-x-visible pr-2 pb-6">
                  {columnTasks.map((task) => {
                    const isMenuOpen = openMenuId === task.id;
                    const isStatusOpen = openStatusId === task.id;

                    return (
                      <article
                        key={task.id}
                        className={`group relative overflow-visible rounded-[24px] ${
                          isMenuOpen || isStatusOpen ? "z-[9999]" : "z-0"
                        } border border-blue-300/10 bg-[#0b1246]/90 p-4 shadow-[0_18px_40px_rgba(0,0,0,.22)] transition hover:bg-[#10195a] hover:shadow-[0_20px_50px_rgba(110,181,255,.18)]`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h3 className="line-clamp-2 text-[13px] font-bold">
                            {task.name}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(isMenuOpen ? null : task.id)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                          >
                            <FaEllipsisH />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-3 top-10 z-[99999] w-44 overflow-hidden rounded-2xl border border-[#3148b8] bg-[#192672] p-2 shadow-[0_25px_60px_rgba(0,0,0,.85)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openTaskPage(task.status);
                                }}
                                className="flex h-10 w-full items-center gap-3 rounded-[13px] px-3 text-xs font-bold text-white/75 transition hover:bg-[#24358f] hover:text-white"
                              >
                                <FaEdit className="text-[#78aaff]" />
                                Edit Task
                              </button>

                              <button
                                type="button"
                                onClick={() => openLink(task.linkUrl)}
                                disabled={!task.linkUrl}
                                className="flex h-10 w-full items-center gap-3 rounded-[13px] px-3 text-xs font-bold text-white/75 transition hover:bg-[#24358f] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <FaExternalLinkAlt className="text-[#45e68b]" />
                                Open Link
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteTask(task.id)}
                                className="flex h-10 w-full items-center gap-3 rounded-[13px] px-3 text-xs font-bold text-[#ff6b8a] transition hover:bg-red-400/10"
                              >
                                <FaTrash />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] text-white/55">
                          <span className="flex items-center gap-1.5 rounded-full bg-pink-400/10 px-2 py-1 text-pink-300">
                            <FaPaperclip />
                            {task.fileName ||
                              task.fileLabel ||
                              task.pageName ||
                              "File"}
                          </span>

                          {task.linkUrl ? (
                            <a
                              href={task.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-full bg-blue-400/10 px-2 py-1 text-[#78aaff] transition hover:bg-blue-400/20 hover:text-white"
                            >
                              <FaLink />
                              {task.urlLabel || task.linkTitle || "Open Link"}
                            </a>
                          ) : (
                            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-white/35">
                              <FaLink />
                              {task.urlLabel || "URL label"}
                            </span>
                          )}
                        </div>

                        <p className="mb-4 text-[10px] leading-5 text-white/45">
                          <span className="block text-white/65">Notes:</span>
                          {task.notes}
                        </p>

                        <div className="mb-4 flex items-center justify-between gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[9px] font-bold ${
                              priorityStyles[task.priority] ||
                              priorityStyles.Medium
                            }`}
                          >
                            {task.priority || "Medium"}
                          </span>

                          <StatusDropdown
                            taskId={task.id}
                            value={task.status}
                            options={COLUMNS}
                            openStatusId={openStatusId}
                            setOpenStatusId={setOpenStatusId}
                            onChange={(value) => moveTask(task.id, value)}
                          />
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="flex items-center gap-2 text-[10px] text-white/60">
                            <FaUserCircle className="text-[#ffcf5a]" />
                            {task.assignee}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-white/60">
                            <FaCalendarAlt />
                            {task.due}
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {!columnTasks.length && (
                    <button
                      type="button"
                      onClick={() => openTaskPage(column.id)}
                      className="flex min-h-[130px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-blue-300/15 bg-[#0b1246]/40 text-center text-xs text-white/35 transition hover:border-blue-300/35 hover:bg-[#111b63]/75 hover:text-white/70"
                    >
                      <FaPlus className="mb-3 text-lg" />
                      Create
                    </button>
                  )}
                </div>

                {columnTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openTaskPage(column.id)}
                    className="mt-4 flex h-10 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[#0b1246]/70 text-xs font-bold text-white/70 transition hover:bg-blue-400/15 hover:text-[#78aaff]"
                  >
                    <FaPlus />
                    Create
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </MainLayout>
  );
}

function StatusDropdown({
  taskId,
  value,
  options,
  openStatusId,
  setOpenStatusId,
  onChange,
}) {
  const open = openStatusId === taskId;
  const selected = options.find((option) => option.id === value);

  return (
    <div className={`relative ${open ? "z-[99999]" : "z-20"}`}>
      <button
        type="button"
        onClick={() => setOpenStatusId(open ? null : taskId)}
        className="flex h-7 min-w-[112px] items-center justify-between gap-2 rounded-full border border-[#2c3d9f] bg-[#141d66] px-3 text-[9px] font-bold text-[#9ec9ff] transition hover:bg-[#1b277d]"
      >
        {selected?.title || value}

        <FaChevronDown
          className={`text-[8px] text-white/55 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-[99999] w-44 overflow-hidden rounded-2xl border border-[#3148b8] bg-[#192672] p-2 shadow-[0_25px_60px_rgba(0,0,0,.85)]">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpenStatusId(null);
              }}
              className={`flex h-10 w-full items-center justify-between rounded-[13px] px-3 text-[10px] font-bold transition ${
                value === option.id
                  ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white"
                  : "text-white/75 hover:bg-[#24358f] hover:text-white"
              }`}
            >
              {option.title}
              {value === option.id && <FaCheck className="text-[9px]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}