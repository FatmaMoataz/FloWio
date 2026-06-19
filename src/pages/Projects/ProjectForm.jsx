import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaFolderPlus,
  FaPlus,
  FaTrashAlt,
  FaSpinner,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";
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
    startDate: new Date().toISOString().split('T')[0], // Today's date
    endDate: "", // Due date
    owner: "",
    priority: "Medium",
    epics: [makeEpic()],
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
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
          ? {
              ...epic,
              stories: epic.stories.map((story) =>
                story.tempId === storyTempId ? { ...story, name: value } : story,
              ),
            }
          : epic,
      ),
    }));
  };

  const updateSubtask = (epicTempId, storyTempId, subtaskTempId, value) => {
    setForm((current) => ({
      ...current,
      epics: current.epics.map((epic) =>
        epic.tempId === epicTempId
          ? {
              ...epic,
              stories: epic.stories.map((story) =>
                story.tempId === storyTempId
                  ? {
                      ...story,
                      subtasks: story.subtasks.map((subtask) =>
                        subtask.tempId === subtaskTempId
                          ? { ...subtask, name: value }
                          : subtask,
                      ),
                    }
                  : story,
              ),
            }
          : epic,
      ),
    }));
  };

  const addEpic = () =>
    setForm((current) => ({ ...current, epics: [...current.epics, makeEpic()] }));

  const removeEpic = (epicTempId) =>
    setForm((current) => ({
      ...current,
      epics: current.epics.filter((epic) => epic.tempId !== epicTempId),
    }));

  const addStory = (epicTempId) =>
    setForm((current) => ({
      ...current,
      epics: current.epics.map((epic) =>
        epic.tempId === epicTempId
          ? { ...epic, stories: [...epic.stories, makeStory()] }
          : epic,
      ),
    }));

  const removeStory = (epicTempId, storyTempId) =>
    setForm((current) => ({
      ...current,
      epics: current.epics.map((epic) =>
        epic.tempId === epicTempId
          ? {
              ...epic,
              stories: epic.stories.filter((story) => story.tempId !== storyTempId),
            }
          : epic,
      ),
    }));

  const addSubtask = (epicTempId, storyTempId) =>
    setForm((current) => ({
      ...current,
      epics: current.epics.map((epic) =>
        epic.tempId === epicTempId
          ? {
              ...epic,
              stories: epic.stories.map((story) =>
                story.tempId === storyTempId
                  ? { ...story, subtasks: [...story.subtasks, makeSubtask()] }
                  : story,
              ),
            }
          : epic,
      ),
    }));

  const removeSubtask = (epicTempId, storyTempId, subtaskTempId) =>
    setForm((current) => ({
      ...current,
      epics: current.epics.map((epic) =>
        epic.tempId === epicTempId
          ? {
              ...epic,
              stories: epic.stories.map((story) =>
                story.tempId === storyTempId
                  ? {
                      ...story,
                      subtasks: story.subtasks.filter(
                        (subtask) => subtask.tempId !== subtaskTempId,
                      ),
                    }
                  : story,
              ),
            }
          : epic,
      ),
    }));

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   setError("");

  //   // Clean and validate epics/stories/subtasks
  //   const cleanEpics = form.epics
  //     .filter((epic) => epic.name.trim())
  //     .map((epic) => ({
  //       ...epic,
  //       name: epic.name.trim(),
  //       stories: epic.stories
  //         .filter((story) => story.name.trim())
  //         .map((story) => ({
  //           ...story,
  //           name: story.name.trim(),
  //           subtasks: story.subtasks
  //             .filter((subtask) => subtask.name.trim())
  //             .map((subtask) => ({ ...subtask, name: subtask.name.trim() })),
  //         })),
  //     }));

  //   // Validation
  //   if (!form.name.trim() || !form.description.trim() || !form.endDate) {
  //     setError("Project name, description, and due date are required.");
  //     return;
  //   }
  //   if (!cleanEpics.length) {
  //     setError("Add at least one named epic.");
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);

  //     // Get company ID from localStorage
  //     const user = JSON.parse(localStorage.getItem("user") || "{}");
  //     const companyId = localStorage.getItem("companyId") || user.companyId;

  //     if (!companyId) {
  //       throw new Error("No company selected. Please select a company first.");
  //     }

  //     // Step 1: Create the project
  //     const projectData = {
  //       name: form.name.trim(),
  //       description: form.description.trim(),
  //       companyId: companyId,
  //       status: "active",
  //       startDate: form.startDate,
  //       endDate: form.endDate,
  //     };

  //     console.log("📡 Creating project:", projectData);
  //     const projectResponse = await projectService.createProject(projectData);
      
  //     if (!projectResponse.success) {
  //       throw new Error(projectResponse.message || "Failed to create project");
  //     }

  //     const projectId = projectResponse.data._id;
  //     console.log("✅ Project created:", projectId);

  //     // Step 2: Create epics for the project
  //     const createdEpics = [];
  //     for (const epic of cleanEpics) {
  //       try {
  //         const epicData = {
  //           name: epic.name,
  //           description: `${epic.stories.length} stories planned`,
  //           status: epic.progress >= 100 ? "Done" : epic.progress > 0 ? "In Progress" : "To Do",
  //           companyId: companyId,
  //           projectId: projectId, // Link to project if your schema supports it
  //         };

  //         console.log(`📡 Creating epic: ${epic.name}`);
  //         const epicResponse = await API.post("/api/epics", epicData);
          
  //         if (epicResponse.data.success) {
  //           const epicId = epicResponse.data.data._id;
  //           console.log(`✅ Epic created: ${epicId}`);

  //           // Step 3: Create tasks for each story and subtask
  //           for (const story of epic.stories) {
  //             try {
  //               // Create main story task
  //               const storyTaskData = {
  //                 title: story.name,
  //                 description: `Story in epic: ${epic.name}`,
  //                 status: "To Do",
  //                 priority: form.priority,
  //                 due_date: form.endDate,
  //                 epicId: epicId,
  //                 companyId: companyId,
  //               };

  //               console.log(`📡 Creating story task: ${story.name}`);
  //               const storyResponse = await API.post("/api/tasks", storyTaskData);
                
  //               if (storyResponse.data.success && story.subtasks.length > 0) {
  //                 const parentTaskId = storyResponse.data.data._id;

  //                 // Create subtasks
  //                 for (const subtask of story.subtasks) {
  //                   try {
  //                     const subtaskData = {
  //                       title: subtask.name,
  //                       description: `Subtask of: ${story.name}`,
  //                       status: "To Do",
  //                       priority: "Low",
  //                       due_date: form.endDate,
  //                       epicId: epicId,
  //                       companyId: companyId,
  //                       parentTaskId: parentTaskId, // Link to parent if your schema supports it
  //                     };

  //                     console.log(`📡 Creating subtask: ${subtask.name}`);
  //                     await API.post("/api/tasks", subtaskData);
  //                   } catch (subtaskError) {
  //                     console.error("Failed to create subtask:", subtaskError);
  //                     // Continue with other subtasks even if one fails
  //                   }
  //                 }
  //               }
  //             } catch (storyError) {
  //               console.error("Failed to create story:", storyError);
  //               // Continue with other stories even if one fails
  //             }
  //           }
            
  //           createdEpics.push(epicResponse.data.data);
  //         }
  //       } catch (epicError) {
  //         console.error("Failed to create epic:", epicError);
  //         // Continue with other epics even if one fails
  //       }
  //     }

  //     console.log("✅ All epics, stories, and subtasks created!");
      
  //     // Navigate to the new project
  //     navigate(`/projects/${projectId}`);

  //   } catch (err) {
  //     console.error("❌ Error creating project:", err);
  //     setError(err.message || "Failed to create project. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
// ✅ Replace your entire handleSubmit function in ProjectForm.jsx with this

const handleSubmit = async (event) => {
  event.preventDefault();
  setError("");

  const cleanEpics = form.epics
    .filter((epic) => epic.name.trim())
    .map((epic) => ({
      ...epic,
      name: epic.name.trim(),
      stories: epic.stories
        .filter((story) => story.name.trim())
        .map((story) => ({
          ...story,
          name: story.name.trim(),
          subtasks: story.subtasks
            .filter((subtask) => subtask.name.trim())
            .map((subtask) => ({ ...subtask, name: subtask.name.trim() })),
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

    if (!companyId) {
      throw new Error("No company selected. Please select a company first.");
    }

    // Step 1: Create the project
    const projectData = {
      name: form.name.trim(),
      description: form.description.trim(),
      companyId: companyId,
      status: "active",
      startDate: form.startDate,
      endDate: form.endDate,
    };

    const projectResponse = await projectService.createProject(projectData);
    if (!projectResponse.success) {
      throw new Error(projectResponse.message || "Failed to create project");
    }

    const projectId = projectResponse.data._id;

    // Step 2: Create epics
    for (const epic of cleanEpics) {
      try {
        const epicData = {
          name: epic.name,
          description: `${epic.stories.length} stories planned`,
          // ✅ FIX: correct status mapping
          status: epic.progress >= 100 ? "Done" : epic.progress > 0 ? "In Progress" : "To Do",
          companyId: companyId,
          projectId: projectId, // ✅ FIX: now accepted by backend
        };

        const epicResponse = await API.post("/api/epics", epicData);

        if (epicResponse.data.success) {
          const epicId = epicResponse.data.data._id;

          // Step 3: Create story tasks
          for (const story of epic.stories) {
            try {
              const storyTaskData = {
                title: story.name,
                description: `Story in epic: ${epic.name}`,
                // ✅ FIX: use lowercase-hyphen format to match Kanban columns
                status: "todo",
                priority: form.priority.toLowerCase(),
                deadline: form.endDate,   // ✅ FIX: use "deadline" not "due_date" (check your task schema)
                epicId: epicId,
                projectId: projectId,     // ✅ FIX: link task to project so it appears in kanban
                companyId: companyId,
              };

              // ✅ FIX: use project-scoped route so taskService.getAllTasksByProject finds it
              const storyResponse = await API.post(`/api/projects/${projectId}/tasks`, storyTaskData);

              if (storyResponse.data.success && story.subtasks.length > 0) {
                const parentTaskId = storyResponse.data.data._id;

                for (const subtask of story.subtasks) {
                  try {
                    const subtaskData = {
                      title: subtask.name,
                      description: `Subtask of: ${story.name}`,
                      status: "todo",           // ✅ FIX: consistent casing
                      priority: "low",          // ✅ FIX: lowercase
                      deadline: form.endDate,
                      epicId: epicId,
                      projectId: projectId,     // ✅ FIX: link to project
                      companyId: companyId,
                      parentTaskId: parentTaskId,
                    };
                    await API.post(`/api/projects/${projectId}/tasks`, subtaskData);
                  } catch (subtaskError) {
                    console.error("Failed to create subtask:", subtaskError);
                  }
                }
              }
            } catch (storyError) {
              console.error("Failed to create story:", storyError);
            }
          }
        }
      } catch (epicError) {
        console.error("Failed to create epic:", epicError);
      }
    }

    navigate(`/projects/${projectId}`);
  } catch (err) {
    console.error("Error creating project:", err);
    setError(err.message || "Failed to create project. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <MainLayout title="Add Project">
      <section className="flowio-projects-page flowio-project-form mt-4 h-full overflow-y-auto rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_50%_35%,#0b1058_0%,#070933_55%,#05072d_100%)] p-5 text-white sm:p-7 lg:mt-3">
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <FaArrowLeft className="text-xs" />
          Back to projects
        </button>

        <form onSubmit={handleSubmit} className="mx-auto mt-5 max-w-4xl">
          <div className="flowio-project-info-card rounded-[26px] border border-white/[0.06] bg-[#111846]/80 p-5 shadow-xl sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5f9be8]/15 text-xl text-[#78b5ff]">
                <FaFolderPlus />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Project information</h2>
                <p className="mt-1 text-xs text-white/45">
                  Build the project structure with epics, stories, and subtasks.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-medium text-white/65">Project name *</span>
                <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Customer Portal" className={inputClass} />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-medium text-white/65">Description *</span>
                <textarea name="description" value={form.description} onChange={updateField} rows="3" placeholder="What is this project trying to accomplish?" className={`${inputClass} resize-none`} />
              </label>
              <label>
                <span className="mb-2 block text-xs font-medium text-white/65">Start date *</span>
                <input type="date" name="startDate" value={form.startDate} onChange={updateField} className={inputClass} />
              </label>
              <label>
                <span className="mb-2 block text-xs font-medium text-white/65">Due date *</span>
                <input type="date" name="endDate" value={form.endDate} onChange={updateField} className={inputClass} />
              </label>
              <label>
                <span className="mb-2 block text-xs font-medium text-white/65">Project owner</span>
                <input name="owner" value={form.owner} onChange={updateField} placeholder="Team member name" className={inputClass} />
              </label>
              <label>
                <span className="mb-2 block text-xs font-medium text-white/65">Priority</span>
                <select name="priority" value={form.priority} onChange={updateField} className={inputClass}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {form.epics.map((epic, epicIndex) => (
              <section key={epic.tempId} className="flowio-project-epic-editor rounded-[26px] border border-[#263779]/60 bg-[radial-gradient(ellipse_at_50%_40%,rgba(24,38,91,.9),rgba(10,16,59,.96))] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FaBookOpen className="text-[#70adf7]" />
                    <h3 className="font-semibold">Epic {epicIndex + 1}</h3>
                  </div>
                  {form.epics.length > 1 && (
                    <button type="button" onClick={() => removeEpic(epic.tempId)} className="rounded-lg p-2 text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-300" aria-label="Remove epic">
                      <FaTrashAlt />
                    </button>
                  )}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_150px]">
                  <input value={epic.name} onChange={(event) => updateEpic(epic.tempId, "name", event.target.value)} placeholder="Epic name" className={inputClass} />
                  <label>
                    <span className="sr-only">Epic progress</span>
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
                        {epic.stories.length > 1 && (
                          <button type="button" onClick={() => removeStory(epic.tempId, story.tempId)} className="shrink-0 rounded-lg p-2 text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-300" aria-label="Remove story">
                            <FaTrashAlt />
                          </button>
                        )}
                      </div>

                      <div className="mt-4 space-y-2.5 pl-0 sm:pl-[68px]">
                        {story.subtasks.map((subtask, subtaskIndex) => (
                          <div key={subtask.tempId} className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-[10px] text-white/35">Subtask {subtaskIndex + 1}</span>
                            <input value={subtask.name} onChange={(event) => updateSubtask(epic.tempId, story.tempId, subtask.tempId, event.target.value)} placeholder="Subtask name" className={`${inputClass} py-2.5`} />
                            {story.subtasks.length > 1 && (
                              <button type="button" onClick={() => removeSubtask(epic.tempId, story.tempId, subtask.tempId)} className="shrink-0 rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-rose-300" aria-label="Remove subtask">
                                <FaTrashAlt />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addSubtask(epic.tempId, story.tempId)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#79b4ff] transition hover:bg-blue-400/10">
                          <FaPlus className="text-[9px]" /> Add subtask
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addStory(epic.tempId)} className="flex items-center gap-2 rounded-xl border border-dashed border-[#4960a3]/60 px-4 py-2.5 text-xs text-[#8dbbff] transition hover:bg-blue-400/10">
                    <FaPlus className="text-[9px]" /> Add story
                  </button>
                </div>
              </section>
            ))}
          </div>

          <button type="button" onClick={addEpic} className="flowio-project-add-epic mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#4960a3]/70 bg-[#0c1240]/55 py-4 text-sm text-[#8dbbff] transition hover:bg-blue-400/10">
            <FaPlus /> Add another epic
          </button>

          {error && <p className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</p>}

          <div className="mt-6 flex justify-end gap-3 pb-2">
            <button type="button" onClick={() => navigate("/projects")} className="rounded-xl px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white" disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="rounded-xl bg-[#5f9be8] px-7 py-2.5 text-sm font-semibold shadow-lg transition hover:bg-[#70a9ef] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  Creating...
                </>
              ) : (
                "Create project"
              )}
            </button>
          </div>
        </form>
      </section>
    </MainLayout>
  );
}