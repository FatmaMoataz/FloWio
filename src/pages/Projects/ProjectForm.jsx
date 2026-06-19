import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaBookOpen, FaFolderPlus, FaPlus, FaTrashAlt, FaSpinner,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";
import storyService from "../../services/storyService";
import API from "../../services/api";

const makeSubtask = () => ({ tempId: crypto.randomUUID(), name: "" });
const makeStory = () => ({
  tempId: crypto.randomUUID(),
  name: "",
  subtasks: [makeSubtask()],
});
const makeEpic = () => ({
  tempId: crypto.randomUUID(),
  name: "",
  progress: 0,
  stories: [makeStory()],
});

const inputClass =
  "flowio-project-input w-full rounded-xl border border-white/10 bg-[#090f37] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#6aa8f5]";

export default function ProjectForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    owner: "",
    priority: "Medium",
    epics: [makeEpic()],
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State update functions (unchanged)
  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };
  const updateEpic = (epicTempId, field, value) => {
    setForm((current) => ({
      ...current,
      epics: current.epics.map((epic) =>
        epic.tempId === epicTempId ? { ...epic, [field]: value } : epic,
      ),
    }));
  };
  const updateStory = (epicTempId, storyTempId, value) => {
    setForm((current) => ({
      ...current,
      epics: current.epics.map((epic) =>
        epic.tempId === epicTempId
          ? { ...epic, stories: epic.stories.map((story) =>
              story.tempId === storyTempId ? { ...story, name: value } : story
            )}
          : epic,
      ),
    }));
  };
  const updateSubtask = (epicTempId, storyTempId, subtaskTempId, value) => {
    setForm((current) => ({
      ...current,
      epics: current.epics.map((epic) =>
        epic.tempId === epicTempId
          ? { ...epic, stories: epic.stories.map((story) =>
              story.tempId === storyTempId
                ? { ...story, subtasks: story.subtasks.map((subtask) =>
                    subtask.tempId === subtaskTempId ? { ...subtask, name: value } : subtask
                  )}
                : story
            )}
          : epic,
      ),
    }));
  };
  const addEpic = () => setForm((current) => ({ ...current, epics: [...current.epics, makeEpic()] }));
  const removeEpic = (epicTempId) => setForm((current) => ({ ...current, epics: current.epics.filter((epic) => epic.tempId !== epicTempId) }));
  const addStory = (epicTempId) => setForm((current) => ({
    ...current,
    epics: current.epics.map((epic) => epic.tempId === epicTempId ? { ...epic, stories: [...epic.stories, makeStory()] } : epic),
  }));
  const removeStory = (epicTempId, storyTempId) => setForm((current) => ({
    ...current,
    epics: current.epics.map((epic) => epic.tempId === epicTempId
      ? { ...epic, stories: epic.stories.filter((story) => story.tempId !== storyTempId) }
      : epic),
  }));
  const addSubtask = (epicTempId, storyTempId) => setForm((current) => ({
    ...current,
    epics: current.epics.map((epic) => epic.tempId === epicTempId
      ? { ...epic, stories: epic.stories.map((story) => story.tempId === storyTempId
          ? { ...story, subtasks: [...story.subtasks, makeSubtask()] }
          : story)}
      : epic),
  }));
  const removeSubtask = (epicTempId, storyTempId, subtaskTempId) => setForm((current) => ({
    ...current,
    epics: current.epics.map((epic) => epic.tempId === epicTempId
      ? { ...epic, stories: epic.stories.map((story) => story.tempId === storyTempId
          ? { ...story, subtasks: story.subtasks.filter((subtask) => subtask.tempId !== subtaskTempId) }
          : story)}
      : epic),
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanEpics = form.epics
      .filter((epic) => epic.name.trim())
      .map((epic) => ({
        name: epic.name.trim(),
        progress: epic.progress || 0,
        stories: epic.stories
          .filter((story) => story.name.trim())
          .map((story) => ({
            name: story.name.trim(),
            subtasks: story.subtasks
              .filter((subtask) => subtask.name.trim())
              .map((subtask) => ({ name: subtask.name.trim() })),
          })),
      }));

    if (!form.name.trim() || !form.description.trim() || !form.endDate) {
      setError("Project name, description, and due date are required.");
      return;
    }
    if (!cleanEpics.length) {
      setError("Add at least one named epic.");
      return;
    }

    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const companyId = localStorage.getItem("companyId") || user.companyId;
      if (!companyId) throw new Error("No company selected.");

      // 1. Create Project
      const projectResponse = await projectService.createProject({
        name: form.name.trim(),
        description: form.description.trim(),
        companyId,
        status: "active",
        startDate: form.startDate,
        endDate: form.endDate,
      });
      if (!projectResponse.success) throw new Error(projectResponse.message || "Failed to create project");
      const projectId = projectResponse.data._id;

      // 2. Create Epics & Stories & Subtasks
      for (const epic of cleanEpics) {
        try {
          const epicResponse = await API.post("/api/epics", {
            name: epic.name,
            description: `${epic.stories.length} stories planned`,
            status: epic.progress >= 100 ? "Done" : epic.progress > 0 ? "In Progress" : "To Do",
            companyId,
            projectId,
          });
          if (!epicResponse.data.success) continue;
          const epicId = epicResponse.data.data._id;

          // Create Stories
          for (let i = 0; i < epic.stories.length; i++) {
            const story = epic.stories[i];
            try {
              const storyResponse = await storyService.createStory({
                title: story.name,
                description: `Story in epic: ${epic.name}`,
                status: "To Do",
                priority: form.priority,
                epicId,
                projectId,
                companyId,
                dueDate: form.endDate,
                order: i,
              });
              if (!storyResponse.success) continue;
              const storyId = storyResponse.data._id;

              // Create Subtasks (linked to story)
              for (const subtask of story.subtasks) {
                try {
                  await API.post("/api/subtasks", {
                    title: subtask.name,
                    description: `Subtask for story: ${story.name}`,
                    status: "To Do",
                    storyId,
                    companyId,
                    due_date: form.endDate,
                  });
                } catch (e) { console.error("Subtask creation failed:", e); }
              }
            } catch (e) { console.error("Story creation failed:", e); }
          }
        } catch (e) { console.error("Epic creation failed:", e); }
      }

      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to create project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Add Project">
      <section className="flowio-projects-page flowio-project-form mt-4 h-full overflow-y-auto rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_50%_35%,#0b1058_0%,#070933_55%,#05072d_100%)] p-5 text-white sm:p-7 lg:mt-3">
        <button type="button" onClick={() => navigate("/projects")} className="flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
          <FaArrowLeft className="text-xs" /> Back to projects
        </button>

        <form onSubmit={handleSubmit} className="mx-auto mt-5 max-w-4xl">
          <div className="flowio-project-info-card rounded-[26px] border border-white/[0.06] bg-[#111846]/80 p-5 shadow-xl sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5f9be8]/15 text-xl text-[#78b5ff]"><FaFolderPlus /></div>
              <div>
                <h2 className="text-xl font-semibold">Project information</h2>
                <p className="mt-1 text-xs text-white/45">Build with epics, stories, and subtasks.</p>
              </div>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="mb-2 block text-xs font-medium text-white/65">Project name *</span>
                <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Customer Portal" className={inputClass} />
              </label>
              <label className="sm:col-span-2"><span className="mb-2 block text-xs font-medium text-white/65">Description *</span>
                <textarea name="description" value={form.description} onChange={updateField} rows="3" placeholder="What is this project trying to accomplish?" className={`${inputClass} resize-none`} />
              </label>
              <label><span className="mb-2 block text-xs font-medium text-white/65">Start date *</span>
                <input type="date" name="startDate" value={form.startDate} onChange={updateField} className={inputClass} />
              </label>
              <label><span className="mb-2 block text-xs font-medium text-white/65">Due date *</span>
                <input type="date" name="endDate" value={form.endDate} onChange={updateField} className={inputClass} />
              </label>
              <label><span className="mb-2 block text-xs font-medium text-white/65">Project owner</span>
                <input name="owner" value={form.owner} onChange={updateField} placeholder="Team member name" className={inputClass} />
              </label>
              <label><span className="mb-2 block text-xs font-medium text-white/65">Priority</span>
                <select name="priority" value={form.priority} onChange={updateField} className={inputClass}>
                  <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {form.epics.map((epic, epicIndex) => (
              <section key={epic.tempId} className="flowio-project-epic-editor rounded-[26px] border border-[#263779]/60 bg-[radial-gradient(ellipse_at_50%_40%,rgba(24,38,91,.9),rgba(10,16,59,.96))] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><FaBookOpen className="text-[#70adf7]" /><h3 className="font-semibold">Epic {epicIndex + 1}</h3></div>
                  {form.epics.length > 1 && <button type="button" onClick={() => removeEpic(epic.tempId)} className="rounded-lg p-2 text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-300"><FaTrashAlt /></button>}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_150px]">
                  <input value={epic.name} onChange={(event) => updateEpic(epic.tempId, "name", event.target.value)} placeholder="Epic name" className={inputClass} />
                  <label><span className="sr-only">Epic progress</span>
                    <div className="relative">
                      <input type="number" min="0" max="100" value={epic.progress} onChange={(event) => updateEpic(epic.tempId, "progress", event.target.value)} className={`${inputClass} pr-9`} />
                      <span className="absolute right-4 top-3 text-sm text-white/35">%</span>
                    </div>
                  </label>
                </div>
                <div className="mt-5 space-y-4">
                  {epic.stories.map((story, storyIndex) => (
                    <div key={story.tempId} className="flowio-project-story-editor rounded-2xl border border-[#34458a]/60 bg-[#090f37]/75 p-4">
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 text-xs font-medium text-[#9bbdff]">Story {storyIndex + 1}</span>
                        <input value={story.name} onChange={(event) => updateStory(epic.tempId, story.tempId, event.target.value)} placeholder="Story name" className={inputClass} />
                        {epic.stories.length > 1 && <button type="button" onClick={() => removeStory(epic.tempId, story.tempId)} className="shrink-0 rounded-lg p-2 text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-300"><FaTrashAlt /></button>}
                      </div>
                      <div className="mt-4 space-y-2.5 pl-0 sm:pl-[68px]">
                        {story.subtasks.map((subtask, subtaskIndex) => (
                          <div key={subtask.tempId} className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-[10px] text-white/35">Subtask {subtaskIndex + 1}</span>
                            <input value={subtask.name} onChange={(event) => updateSubtask(epic.tempId, story.tempId, subtask.tempId, event.target.value)} placeholder="Subtask name" className={`${inputClass} py-2.5`} />
                            {story.subtasks.length > 1 && <button type="button" onClick={() => removeSubtask(epic.tempId, story.tempId, subtask.tempId)} className="shrink-0 rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-rose-300"><FaTrashAlt /></button>}
                          </div>
                        ))}
                        <button type="button" onClick={() => addSubtask(epic.tempId, story.tempId)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#79b4ff] transition hover:bg-blue-400/10"><FaPlus className="text-[9px]" /> Add subtask</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addStory(epic.tempId)} className="flex items-center gap-2 rounded-xl border border-dashed border-[#4960a3]/60 px-4 py-2.5 text-xs text-[#8dbbff] transition hover:bg-blue-400/10"><FaPlus className="text-[9px]" /> Add story</button>
                </div>
              </section>
            ))}
          </div>

          <button type="button" onClick={addEpic} className="flowio-project-add-epic mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#4960a3]/70 bg-[#0c1240]/55 py-4 text-sm text-[#8dbbff] transition hover:bg-blue-400/10"><FaPlus /> Add another epic</button>
          {error && <p className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</p>}

          <div className="mt-6 flex justify-end gap-3 pb-2">
            <button type="button" onClick={() => navigate("/projects")} className="rounded-xl px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="rounded-xl bg-[#5f9be8] px-7 py-2.5 text-sm font-semibold shadow-lg transition hover:bg-[#70a9ef] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? <><FaSpinner className="animate-spin text-xs" /> Creating...</> : "Create project"}
            </button>
          </div>
        </form>
      </section>
    </MainLayout>
  );
}