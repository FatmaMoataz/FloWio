import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCircle,
  FaClock,
  FaLayerGroup,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import { getProject, getProjectColor } from "./projectStore";

const COLUMNS = [
  { id: "todo", title: "To do", icon: FaLayerGroup },
  { id: "in-progress", title: "In progress", icon: FaClock },
  { id: "completed", title: "Completed", icon: FaCheckCircle },
];

const priorityStyles = {
  Low: "bg-violet-400/15 text-violet-300",
  Medium: "bg-emerald-400/15 text-emerald-300",
  High: "bg-rose-400/15 text-rose-300",
};

export default function ProjectKanban() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = getProject(projectId);

  if (!project) {
    return (
      <MainLayout title="Kanban">
        <div className="flex h-full items-center justify-center text-white/60">
          Project not found.
        </div>
      </MainLayout>
    );
  }

  const color = getProjectColor(project);
  const tasks = project.assignedTasks || [];

  return (
    <MainLayout title={`${project.name} Kanban`}>
      <section className="flowio-projects-page flowio-project-kanban mt-4 h-full overflow-y-auto rounded-[28px] bg-[#090d4b]/70 p-5 text-white sm:p-7 lg:mt-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}`)}
            className="flex items-center gap-2 text-sm text-white/55 hover:text-white"
          >
            <FaArrowLeft className="text-xs" />
            Back to project
          </button>
          <p className="text-xs text-white/40">
            {tasks.length} assigned {tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter(
              (task) => (task.status || "in-progress") === column.id,
            );
            const ColumnIcon = column.icon;

            return (
              <div
                key={column.id}
                className="flowio-kanban-column min-h-[430px] rounded-[22px] border border-white/[0.06] bg-[#101746]/75 p-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <ColumnIcon style={{ color: color.hex }} />
                    {column.title}
                  </h2>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/55">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      className="flowio-kanban-card rounded-2xl border border-white/[0.05] bg-[#090f37] p-4 shadow-[0_10px_22px_rgba(1,4,28,.12)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium leading-5">
                          {task.name}
                        </p>
                        <FaCircle
                          className="mt-1 shrink-0 text-[8px]"
                          style={{ color: color.hex }}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[9px] ${
                            priorityStyles[task.priority] ||
                            priorityStyles.Medium
                          }`}
                        >
                          {task.priority || "Medium"} Priority
                        </span>
                        <span className="ml-auto text-[9px] text-white/35">
                          {task.due || "No due date"}
                        </span>
                      </div>

                      {(task.epicName || task.storyName) && (
                        <p className="mt-3 truncate border-t border-white/[0.04] pt-3 text-[9px] text-white/30">
                          {[task.epicName, task.storyName]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      )}
                    </article>
                  ))}

                  {!columnTasks.length && (
                    <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 text-center text-xs text-white/30">
                      No assigned tasks in {column.title.toLowerCase()}.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </MainLayout>
  );
}
