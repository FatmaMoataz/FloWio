import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCircle, FaPlus } from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import { getProject, getProjectColor } from "./projectStore";

const COLUMNS = [
  { title: "To do", cards: ["Define requirements", "Prepare project assets"] },
  { title: "In progress", cards: ["Build primary workflow"] },
  { title: "Completed", cards: ["Project kickoff"] },
];

export default function ProjectKanban() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = getProject(projectId);

  if (!project) {
    return <MainLayout title="Kanban"><div className="flex h-full items-center justify-center text-white/60">Project not found.</div></MainLayout>;
  }

  const color = getProjectColor(project);
  return (
    <MainLayout title={`${project.name} Kanban`}>
      <section className="flowio-projects-page flowio-project-kanban mt-4 h-full overflow-y-auto rounded-[28px] bg-[#090d4b]/70 p-5 text-white sm:p-7 lg:mt-3">
        <button onClick={() => navigate("/projects")} className="flex items-center gap-2 text-sm text-white/55 hover:text-white">
          <FaArrowLeft className="text-xs" /> Back to projects
        </button>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {COLUMNS.map((column, columnIndex) => (
            <div key={column.title} className="flowio-kanban-column rounded-[22px] border border-white/[0.06] bg-[#101746]/75 p-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <FaCircle className="text-[8px]" style={{ color: color.hex }} />
                  {column.title}
                </h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/55">{column.cards.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {column.cards.map((card, cardIndex) => (
                  <div key={card} className="flowio-kanban-card rounded-2xl border border-white/[0.05] bg-[#090f37] p-4">
                    <p className="text-sm font-medium">{card}</p>
                    <div className="mt-4 flex items-center justify-between text-[10px] text-white/35">
                      <span>Task {columnIndex + 1}.{cardIndex + 1}</span>
                      <span className="h-2 w-2 rounded-full" style={{ background: color.hex }} />
                    </div>
                  </div>
                ))}
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-xs text-white/40 transition hover:border-white/20 hover:text-white/70">
                  <FaPlus className="text-[9px]" /> Add task
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
