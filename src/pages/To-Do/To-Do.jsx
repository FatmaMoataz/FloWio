import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaClipboardCheck,
  FaExclamationCircle,
  FaFlag,
  FaPlus,
  FaRegCircle,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import taskService from "../../services/taskService";

const STATUS = {
  todo: "todo",
  inProgress: "in-progress",
  review: "review",
  done: "done",
};
const PRIORITY = { low: "low", medium: "medium", high: "high" };

const PRIORITY_COLORS = {
  high: "flowio-priority-high text-rose-200 border-rose-300/30 bg-rose-400/15",
  medium:
    "flowio-priority-medium text-amber-200 border-amber-300/30 bg-amber-400/15",
  low: "flowio-priority-low text-sky-200 border-sky-300/30 bg-sky-400/15",
};

const isCompleted = (task) => task.status === STATUS.done;

function PriorityBadge({ priority }) {
  return (
    <span
      className={`flowio-priority-badge shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_COLORS[priority] ?? ""}`}
    >
      {priority}
    </span>
  );
}

export default function ToDo() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState(PRIORITY.medium);
  const [deadline, setDeadline] = useState("");

  // ── Fetch personal tasks on mount & refresh ──────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getMyTasks();
      setTasks(data ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Derived list ─────────────────────────────────────────────────────────────
  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchFilter =
        filter === "all" ||
        (filter === "active" && !isCompleted(task)) ||
        (filter === "completed" && isCompleted(task));
      const matchSearch = !q || task.title.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [tasks, filter, search]);

  const completedCount = tasks.filter(isCompleted).length;

  // ── Add task → POST /api/tasks ───────────────────────────────────────────────
  const addTask = async (event) => {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;

    setSaving(true);
    setError(null);
    try {
      const created = await taskService.createPersonalTask({
        title,
        priority,
        deadline: deadline || undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setNewTask("");
      setPriority(PRIORITY.medium);
      setDeadline("");
    } catch (err) {
      setError(err.message ?? "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle done/todo → PUT /api/tasks/:id ────────────────────────────────────
  const toggleTask = async (task) => {
    const nextStatus = isCompleted(task) ? STATUS.todo : STATUS.done;
    // optimistic
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t)),
    );
    try {
      const updated = await taskService.updateTask(task._id, {
        status: nextStatus,
      });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
    } catch (err) {
      // revert
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id ? { ...t, status: task.status } : t,
        ),
      );
      setError(err.message ?? "Failed to update task.");
    }
  };

  // ── Delete → DELETE /api/tasks/:id ───────────────────────────────────────────
  const deleteTask = async (task) => {
    setTasks((prev) => prev.filter((t) => t._id !== task._id)); // optimistic
    try {
      await taskService.deleteTask(task._id);
    } catch (err) {
      setTasks((prev) => [task, ...prev]); // revert
      setError(err.message ?? "Failed to delete task.");
    }
  };

  const emptyMessage = search.trim()
    ? "No tasks match your search."
    : filter === "all"
      ? "Add a task above to start planning your work."
      : `No ${filter} tasks here.`;

  return (
    <MainLayout
      title="To-Do List"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search tasks..."
    >
      <div className="h-full overflow-y-auto pb-6 text-white lg:pr-2">
        {/* ── Header card ───────────────────────────────────────────────────── */}
        <section className="rounded-[22px] border border-blue-300/10 bg-[#10184c]/75 p-4 shadow-[0_16px_40px_rgba(1,4,25,.24)] sm:rounded-[28px] sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/55">Keep your day organized</p>
              <p className="mt-2 font-semibold text-[#7db6ff]">
                {loading ? (
                  <span className="inline-flex items-center gap-1.5 text-white/40">
                    <FaSpinner className="animate-spin text-xs" /> Loading…
                  </span>
                ) : (
                  `${completedCount} of ${tasks.length} tasks completed`
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-300/15 text-xl text-[#7db6ff]">
              <FaClipboardCheck />
            </div>
          </div>

          {/* ── Input row — same as original ──────────────────────────────── */}
          <form
            onSubmit={addTask}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              aria-label="New task"
              disabled={saving}
              className="h-12 min-w-0 flex-1 rounded-[20px] border border-[#5089D6]/70 bg-[#080d31] px-5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#64CFFF] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={saving || !newTask.trim()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[24px] bg-[#5089D6] px-6 font-bold text-white transition-colors hover:bg-[#447bc4] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              Add Task
            </button>
          </form>

          {/* ── Priority + deadline ───────────────────────────────────────── */}
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FaFlag className="text-xs text-white/30" />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#080d31] px-3 py-1.5 text-xs text-white/60 outline-none focus:border-[#64CFFF]"
              >
                {Object.values(PRIORITY).map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              aria-label="Deadline"
              className="rounded-xl border border-white/10 bg-[#080d31] px-3 py-1.5 text-xs text-white/60 outline-none focus:border-[#64CFFF]"
            />
          </div>
        </section>

        {/* ── Error banner ──────────────────────────────────────────────────── */}
        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            <FaExclamationCircle className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs text-red-300/60 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Filter tabs ───────────────────────────────────────────────────── */}
        <div className="my-5 flex gap-2 overflow-x-auto pb-1 sm:my-6">
          {["all", "active", "completed"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`shrink-0 rounded-[14px] px-5 py-3 text-sm font-semibold capitalize transition ${
                filter === item
                  ? "bg-blue-300/15 text-[#7db6ff]"
                  : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* ── Task list ─────────────────────────────────────────────────────── */}
        <section className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[62px] animate-pulse rounded-[20px] bg-[#10184c]/50"
              />
            ))
          ) : (
            <>
              {visibleTasks.map((task) => {
                const done = isCompleted(task);
                const deadlineStr = task.deadline
                  ? new Date(task.deadline).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : null;
                const overdue =
                  task.deadline &&
                  !done &&
                  new Date(task.deadline) < new Date();

                return (
                  <article
                    key={task._id}
                    className="flex items-center gap-3 rounded-[18px] border border-white/5 bg-[#10184c]/70 p-3 transition hover:border-blue-300/20 hover:bg-[#121c58] sm:gap-4 sm:rounded-[20px] sm:p-4"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(task)}
                      aria-label={
                        done ? "Mark task as active" : "Complete task"
                      }
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                        done
                          ? "border-[#5fffd0]/40 bg-[#5fffd0]/15 text-[#5fffd0]"
                          : "border-white/15 text-white/35 hover:border-[#7db6ff]/60 hover:text-[#7db6ff]"
                      }`}
                    >
                      {done ? <FaCheck /> : <FaRegCircle />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words ${done ? "text-white/35 line-through" : "text-white/85"}`}
                      >
                        {task.title}
                      </p>
                      {(task.priority || deadlineStr) && (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {task.priority && (
                            <PriorityBadge priority={task.priority} />
                          )}
                          {deadlineStr && (
                            <span
                              className={`text-[11px] ${overdue ? "text-red-400" : "text-white/35"}`}
                            >
                              {overdue ? "⚠ " : ""}Due {deadlineStr}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteTask(task)}
                      aria-label={`Delete ${task.title}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/30 transition hover:bg-red-400/10 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </article>
                );
              })}

              {visibleTasks.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-blue-300/15 bg-white/[0.025] px-4 py-12 text-center sm:rounded-[28px] sm:py-16">
                  <FaClipboardCheck className="mx-auto mb-3 text-4xl text-[#5089D6]/75" />
                  <p className="font-bold text-white/70">No tasks here yet</p>
                  <p className="mt-2 text-sm text-white/35">{emptyMessage}</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
