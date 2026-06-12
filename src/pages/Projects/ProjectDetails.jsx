import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaChevronDown,
  FaChevronRight,
  FaColumns,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import { getProject, getProjectColor } from "./projectStore";

export default function ProjectDetails() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = getProject(projectId);
  const [expandedStories, setExpandedStories] = useState(
    () =>
      new Set(
        (project?.epics || []).flatMap((epic) =>
          (epic.stories || []).map((story) => story.id),
        ),
      ),
  );

  if (!project) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center text-white/60">
          Project not found.
        </div>
      </MainLayout>
    );
  }

  const color = getProjectColor(project);
  const toggleStory = (storyId) => {
    setExpandedStories((current) => {
      const next = new Set(current);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  };

  return (
    <MainLayout>
      <section className="flowio-projects-page flowio-project-details flex h-full min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_50%_40%,#090c4f_0%,#070933_56%,#05072d_100%)] p-4 text-white shadow-[inset_0_0_70px_rgba(5,8,54,.55)] sm:p-6 lg:min-h-0">
        <header className="flex items-center justify-between gap-4 px-1 pb-5">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => navigate(`/projects/${project.id}`)}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Back to projects"
            >
              <FaArrowLeft />
            </button>
            <button
              type="button"
              onClick={() => navigate(`/projects/${project.id}`)}
              className="max-w-48 truncate text-white/45 transition hover:text-white/75"
            >
              {project.name}
            </button>
            <FaChevronRight className="text-[10px] text-white/45" />
            <h1 className="font-semibold text-white">Project details</h1>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}/kanban`)}
            className="hidden items-center gap-2 rounded-xl bg-[#5f9be8]/15 px-4 py-2 text-xs text-[#8dc1ff] transition hover:bg-[#5f9be8]/25 sm:flex"
          >
            <FaColumns />
            View kanban
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto pr-1">
          {project.epics.map((epic, epicIndex) => (
            <article
              key={epic.id}
              className="flowio-project-epic-card flex min-h-[300px] flex-col rounded-[30px] border border-[#1d2d7b]/45 bg-[radial-gradient(ellipse_at_50%_42%,#061164_0%,#070933_34%,#070933_76%,#090c4f_100%)] p-6 shadow-[0_20px_46px_rgba(1,4,28,.24),inset_0_1px_0_rgba(255,255,255,.025)] sm:min-h-[322px] sm:p-8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <h2 className="text-[15px] font-semibold">{epic.name}</h2>
                  <span className="flowio-project-epic-badge rounded-full border border-white/[0.04] bg-[#1a235e] px-5 py-1.5 text-[10px] text-white/55">
                    Epic
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: color.hex }}>
                  {epic.progress}%
                </span>
              </div>

              <div className="flowio-project-progress-track mt-5 h-2.5 overflow-hidden rounded-full bg-[#18275d]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${epic.progress}%`,
                    backgroundColor: color.hex,
                    boxShadow: `0 0 14px ${color.hex}55`,
                  }}
                />
              </div>

              <div className="mt-5 flex-1 space-y-4">
                {epic.stories.map((story) => {
                  const expanded = expandedStories.has(story.id);
                  return (
                    <div
                      key={story.id}
                      className="flowio-project-story-card min-h-[86px] rounded-[18px] border border-[#34458a]/70 bg-[#090e3d]/65 px-5 py-4"
                    >
                      <button
                        type="button"
                        onClick={() => toggleStory(story.id)}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        {expanded ? (
                          <FaChevronDown className="text-xs text-white/85" />
                        ) : (
                          <FaChevronRight className="text-xs text-white/85" />
                        )}
                        <span className="text-xs font-medium">{story.name}</span>
                        <span className="rounded-full border border-[#5666a5]/60 px-3 py-0.5 text-[8px] text-white/55">
                          story
                        </span>
                        <span className="ml-auto text-[9px] text-white/30">
                          {story.subtasks.length} subtasks
                        </span>
                      </button>

                      {expanded && (
                        <div className="mt-3 flex flex-wrap gap-3 pl-6">
                          {story.subtasks.length ? (
                            story.subtasks.map((subtask) => (
                              <span
                                key={subtask.id}
                                className="flowio-project-subtask-pill rounded-full border border-[#40529a]/55 bg-[#151d59] px-4 py-2 text-[9px] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,.025)]"
                              >
                                {subtask.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-white/35">
                              No subtasks added.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!epic.stories.length && (
                  <p className="rounded-2xl border border-dashed border-white/10 p-4 text-xs text-white/35">
                    This epic has no stories yet.
                  </p>
                )}
              </div>

              <p className="mt-4 text-right text-[9px] text-white/25">
                Epic {epicIndex + 1} of {project.epics.length}
              </p>
            </article>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
