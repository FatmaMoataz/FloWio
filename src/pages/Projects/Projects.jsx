import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaColumns,
  FaEllipsisH,
  FaEye,
  FaFolderOpen,
  FaPlus,
  FaTasks,
  FaTrashAlt,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import {
  getProjectColor,
  loadProjects,
  removeProject,
} from "./projectStore";

const FILTERS = ["All Projects", "Active", "Completed"];

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );

function ProjectMenu({ project, onClose, onDelete }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [onClose]);

  const actions = [
    {
      label: "View kanban",
      icon: FaColumns,
      onClick: () => navigate(`/projects/${project.id}/kanban`),
    },
    {
      label: "View details",
      icon: FaEye,
      onClick: () => navigate(`/projects/${project.id}/details`),
    },
    {
      label: "Delete",
      icon: FaTrashAlt,
      danger: true,
      onClick: onDelete,
    },
  ];

  return (
    <div
      ref={menuRef}
      onClick={(event) => event.stopPropagation()}
      className="flowio-project-menu absolute right-0 top-8 z-30 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#111846] p-1.5 shadow-2xl"
    >
      {actions.map(({ label, icon: Icon, danger, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition ${
            danger
              ? "text-rose-300 hover:bg-rose-500/10"
              : "text-white/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon className="text-[11px]" />
          {label}
        </button>
      ))}
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(loadProjects);
  const [filter, setFilter] = useState("All Projects");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);
      const matchesFilter =
        filter === "All Projects" ||
        (filter === "Active" && project.progress < 100) ||
        (filter === "Completed" && project.progress === 100);
      return matchesSearch && matchesFilter;
    });
  }, [filter, projects, search]);

  const confirmDelete = () => {
    setProjects(removeProject(pendingDelete.id));
    setPendingDelete(null);
    setOpenMenu(null);
  };

  return (
    <MainLayout
      title="Projects"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search projects..."
    >
      <section className="flowio-projects-page flowio-project-list mt-4 flex h-full min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_48%_44%,#090c4f_0%,#070933_42%,#061164_74%,#090c4f_100%)] p-4 text-white shadow-[inset_0_0_70px_rgba(5,8,54,.58),0_18px_50px_rgba(1,3,28,.2)] sm:p-7 lg:mt-3 lg:min-h-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-6 overflow-x-auto sm:gap-10">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`relative whitespace-nowrap pb-2 text-sm transition sm:text-base ${
                  filter === item
                    ? "text-[#a7b8ff]"
                    : "text-white/55 hover:text-white/80"
                }`}
              >
                {item}
                {filter === item && (
                  <span className="absolute inset-x-0 bottom-0 h-px bg-[#9fb2ff]" />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/projects/new")}
            className="flex items-center justify-center gap-2 rounded-full bg-[#5f9be8] px-6 py-2.5 text-sm font-medium shadow-[0_8px_22px_rgba(74,137,230,.22)] transition hover:-translate-y-0.5 hover:bg-[#70a9ef]"
          >
            <FaPlus className="text-[10px]" />
            Add Project
          </button>
        </div>

        <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1">
          {visibleProjects.length ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {visibleProjects.map((project) => {
                const color = getProjectColor(project);
                return (
                  <article
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        navigate(`/projects/${project.id}`);
                      }
                    }}
                    className="flowio-project-card group relative flex min-h-[200px] flex-col justify-between overflow-visible rounded-[26px] border border-[#263774]/35 bg-[radial-gradient(ellipse_at_52%_48%,rgba(27,42,90,.76)_0%,rgba(15,25,65,.94)_58%,rgba(9,17,52,.98)_100%)] p-6 shadow-[0_18px_42px_rgba(1,4,26,.25),inset_0_1px_0_rgba(255,255,255,.025)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.09] hover:shadow-[0_22px_48px_rgba(1,4,26,.34),inset_0_1px_0_rgba(255,255,255,.04)] sm:min-h-[210px] sm:p-7"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xl shadow-[inset_0_0_18px_rgba(255,255,255,.025)]"
                        style={{
                          color: color.hex,
                          backgroundColor: color.soft,
                          borderColor: `${color.hex}45`,
                        }}
                      >
                        <FaFolderOpen />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/projects/${project.id}`);
                            }}
                            className="truncate text-left text-[17px] font-semibold tracking-[-0.01em] transition hover:text-[#82b6ff]"
                          >
                            {project.name}
                          </button>
                          <div className="relative">
                            <button
                              type="button"
                              aria-label={`Open actions for ${project.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenu((current) =>
                                  current === project.id ? null : project.id,
                                );
                              }}
                              className="rounded-lg p-1 text-white/45 transition hover:bg-white/10 hover:text-white"
                            >
                              <FaEllipsisH />
                            </button>
                            {openMenu === project.id && (
                              <ProjectMenu
                                project={project}
                                onClose={() => setOpenMenu(null)}
                                onDelete={() => setPendingDelete(project)}
                              />
                            )}
                          </div>
                        </div>
                        <p className="mt-2.5 line-clamp-2 max-w-[92%] text-xs leading-5 text-white/45">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div
                        className="text-right text-[15px] font-semibold tracking-wide"
                        style={{ color: color.hex }}
                      >
                        {project.progress}%
                      </div>
                      <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#1a2859]/90 shadow-[inset_0_1px_3px_rgba(1,4,25,.45)]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${project.progress}%`,
                            backgroundColor: color.hex,
                            boxShadow: `0 0 14px ${color.hex}66`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.035] pt-3.5 text-[11px] text-white/42">
                      <span className="flex items-center gap-2">
                        <FaCalendarAlt />
                        {formatDate(project.dueDate)}
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: color.hex }}
                        />
                        <FaTasks className="sr-only" />
                        {project.tasks} tasks
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 text-center">
              <FaFolderOpen className="mb-3 text-3xl text-white/20" />
              <p className="font-medium text-white/70">No projects found</p>
              <p className="mt-1 text-xs text-white/40">
                Try another filter or create a new project.
              </p>
            </div>
          )}
        </div>
      </section>

      {pendingDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020414]/75 p-4 backdrop-blur-sm">
          <div className="flowio-project-dialog w-full max-w-sm rounded-[24px] border border-white/10 bg-[#111846] p-6 text-white shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
              <FaTrashAlt />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Delete project?</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">
              “{pendingDelete.name}” will be permanently removed. This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-xl px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold transition hover:bg-rose-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
