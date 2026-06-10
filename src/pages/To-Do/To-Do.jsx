import { useState } from "react";
import { FaSearch, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";

export default function Todo() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Optimize Web Content",
      completed: false,
      priority: "purple",
      dueDate: "Sep 15",
      category: "",
    },
    {
      id: 2,
      title: "Update Portfolio Case Study",
      completed: true,
      priority: "green",
      dueDate: "Sep 15",
      category: "",
    },
    {
      id: 3,
      title: "Design new home page layout",
      completed: false,
      priority: "red",
      dueDate: "Sep 15",
      category: "",
    },
    {
      id: 4,
      title: "Create wireframe for landing page",
      completed: true,
      priority: "red",
      dueDate: "Sep 15",
      category: "",
    },
    {
      id: 5,
      title: "Get some coffee in the lunch break",
      completed: true,
      priority: "gray",
      dueDate: "Today",
      category: "Personal",
    },
  ]);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    priority: "purple",
    dueDate: "",
    category: "",
  });

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        completed: false,
        ...newTask,
      },
    ]);

    setNewTask({
      title: "",
      priority: "purple",
      dueDate: "",
      category: "",
    });

    setIsModalOpen(false);
  };

  const priorityColor = {
    purple: "bg-[#B89BFF]",
    green: "bg-[#57D1A4]",
    red: "bg-[#FF8C8C]",
    gray: "bg-[#56618A]",
  };

  return (
    <MainLayout title="Tasks">
      <div className="h-full overflow-y-auto text-white pr-2">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome, Justin!</h2>

          <p className="mt-2 text-white/60">Here's your to-do list:</p>
        </div>

        {/* Search + Add */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 flex-1 items-center rounded-2xl bg-[#13195D] px-4">
            <FaSearch className="text-white/40" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="ml-3 w-full bg-transparent outline-none placeholder:text-white/40"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 rounded-[32px] bg-[#5089D6] px-6 font-bold transition-colors hover:bg-[#447bc4]"
          >
            + Add Task
          </button>
        </div>

        {/* Task Container */}
        <div className="rounded-[28px] bg-[#11175A]/95 p-5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border-b border-white/10 py-5"
            >
              <div className="flex items-center gap-5">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex h-7 w-7 items-center justify-center rounded border-2 transition ${
                    task.completed
                      ? "border-white bg-transparent"
                      : "border-white/70"
                  }`}
                >
                  {task.completed && <FaCheck className="text-sm" />}
                </button>

                <div
                  className={`h-4 w-4 rounded-full ${
                    priorityColor[task.priority]
                  }`}
                />

                {task.category && (
                  <span className="rounded-full bg-[#5C67A4] px-3 py-1 text-xs">
                    {task.category}
                  </span>
                )}

                <span className="text-xl">{task.title}</span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`h-4 w-4 rounded-full ${
                    priorityColor[task.priority]
                  }`}
                />

                <span className="text-lg text-white/80">{task.dueDate}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] bg-[#11175A] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">Add Task</h3>

                <button onClick={() => setIsModalOpen(false)}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={addTask} className="space-y-4">
                <input
                  placeholder="Task name"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      title: e.target.value,
                    })
                  }
                  className="h-12 w-full rounded-xl bg-[#0D124A] px-4 outline-none"
                />

                <input
                  placeholder="Due date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      dueDate: e.target.value,
                    })
                  }
                  className="h-12 w-full rounded-xl bg-[#0D124A] px-4 outline-none"
                />

                <button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-[#5089D6] font-bold"
                >
                  Create Task
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
