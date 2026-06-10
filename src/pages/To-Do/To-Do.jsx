import { useMemo, useState } from "react";
import {
  FaCheck,
  FaClipboardCheck,
  FaPlus,
  FaRegCircle,
  FaTrash,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";

export default function ToDo() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.completed) ||
        (filter === "completed" && task.completed);
      const matchesSearch = !query || task.title.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search, tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;

  const addTask = (event) => {
    event.preventDefault();
    const title = newTask.trim();

    if (!title) return;

    setTasks((currentTasks) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        title,
        completed: false,
      },
      ...currentTasks,
    ]);
    setNewTask("");
  };

  const toggleTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
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
        <section className="rounded-[22px] border border-blue-300/10 bg-[#10184c]/75 p-4 shadow-[0_16px_40px_rgba(1,4,25,.24)] sm:rounded-[28px] sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/55">Keep your day organized</p>
              <p className="mt-2 font-semibold text-[#7db6ff]">
                {completedCount} of {tasks.length} tasks completed
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-300/15 text-xl text-[#7db6ff]">
              <FaClipboardCheck />
            </div>
          </div>

          <form
            onSubmit={addTask}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="What needs to be done?"
              aria-label="New task"
              className="h-12 min-w-0 flex-1 rounded-[20px] border border-[#5089D6]/70 bg-[#080d31] px-5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#64CFFF]"
            />
            <button
              type="submit"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[24px] bg-[#5089D6] px-6 font-bold text-white transition-colors hover:bg-[#447bc4] sm:w-auto"
            >
              <FaPlus />
              Add Task
            </button>
          </form>
        </section>

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

        <section className="space-y-3">
          {visibleTasks.map((task) => (
            <article
              key={task.id}
              className="flex items-center gap-3 rounded-[18px] border border-white/5 bg-[#10184c]/70 p-3 transition hover:border-blue-300/20 hover:bg-[#121c58] sm:gap-4 sm:rounded-[20px] sm:p-4"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-label={
                  task.completed ? "Mark task as active" : "Complete task"
                }
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                  task.completed
                    ? "border-[#5fffd0]/40 bg-[#5fffd0]/15 text-[#5fffd0]"
                    : "border-white/15 text-white/35 hover:border-[#7db6ff]/60 hover:text-[#7db6ff]"
                }`}
              >
                {task.completed ? <FaCheck /> : <FaRegCircle />}
              </button>

              <p
                className={`min-w-0 flex-1 break-words ${
                  task.completed
                    ? "text-white/35 line-through"
                    : "text-white/85"
                }`}
              >
                {task.title}
              </p>

              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete ${task.title}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/30 transition hover:bg-red-400/10 hover:text-red-300"
              >
                <FaTrash />
              </button>
            </article>
          ))}

          {visibleTasks.length === 0 && (
            <div className="rounded-[22px] border border-dashed border-blue-300/15 bg-white/[0.025] px-4 py-12 text-center sm:rounded-[28px] sm:py-16">
              <FaClipboardCheck className="mx-auto mb-3 text-4xl text-[#5089D6]/75" />
              <p className="font-bold text-white/70">No tasks here yet</p>
              <p className="mt-2 text-sm text-white/35">{emptyMessage}</p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
