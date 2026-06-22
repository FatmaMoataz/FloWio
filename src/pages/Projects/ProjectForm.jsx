import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBookOpen, FaFolderPlus, FaPlus, FaTrashAlt, FaSpinner, FaUsers } from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";
import storyService from "../../services/storyService";
import API from "../../services/api";

const makeSubtask = () => ({ tempId: crypto.randomUUID(), name: "" });
const makeStory = () => ({ tempId: crypto.randomUUID(), name: "", assigneeId: "", subtasks: [makeSubtask()] });
const makeEpic = () => ({ tempId: crypto.randomUUID(), name: "", progress: 0, stories: [makeStory()] });

const inputClass = "flowio-project-input w-full rounded-xl border border-white/10 bg-[#090f37] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#6aa8f5]";

export default function ProjectForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "", startDate: new Date().toISOString().split('T')[0], endDate: "", teamId: "", priority: "Medium", epics: [makeEpic()] });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [companyId, setCompanyId] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // ── Resolve companyId once on mount ───────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const storedCompanyId = localStorage.getItem("companyId") || user.companyId;
    setCompanyId(storedCompanyId);
  }, []);

  // ── Load teams for this company ───────────────────────────────────────────
  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        setLoadingTeams(true);
        const res = await API.get(`/api/teams/company/${companyId}`);
        setTeams(res.data?.success ? res.data.data : []);
      } catch (err) {
        console.error("Failed to load teams:", err);
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    })();
  }, [companyId]);

  // ── Load members of the currently selected team ───────────────────────────
  useEffect(() => {
    if (!form.teamId) { setTeamMembers([]); return; }
    (async () => {
      try {
        setLoadingMembers(true);
        const res = await API.get(`/api/teams/${form.teamId}/members`);
        setTeamMembers(res.data?.success ? res.data.data : []);
      } catch (err) {
        console.error("Failed to load team members:", err);
        setTeamMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    })();
  }, [form.teamId]);

  const updateField = (e) => setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const updateTeam = (teamId) => setForm((c) => ({
    ...c,
    teamId,
    // Clear assignees that may no longer be valid for the new team
    epics: c.epics.map((epic) => ({
      ...epic,
      stories: epic.stories.map((s) => ({ ...s, assigneeId: "" })),
    })),
  }));

  const updateEpic = (epicTempId, field, value) => setForm((c) => ({ ...c, epics: c.epics.map((epic) => epic.tempId === epicTempId ? { ...epic, [field]: value } : epic) }));
  const updateStory = (epicTempId, storyTempId, field, value) => setForm((c) => ({ ...c, epics: c.epics.map((epic) => epic.tempId === epicTempId ? { ...epic, stories: epic.stories.map((story) => story.tempId === storyTempId ? { ...story, [field]: value } : story) } : epic) }));
  const updateSubtask = (epicTempId, storyTempId, subtaskTempId, value) => setForm((c) => ({ ...c, epics: c.epics.map((epic) => epic.tempId === epicTempId ? { ...epic, stories: epic.stories.map((story) => story.tempId === storyTempId ? { ...story, subtasks: story.subtasks.map((subtask) => subtask.tempId === subtaskTempId ? { ...subtask, name: value } : subtask) } : story) } : epic) }));
  const addEpic = () => setForm((c) => ({ ...c, epics: [...c.epics, makeEpic()] }));
  const removeEpic = (id) => setForm((c) => ({ ...c, epics: c.epics.filter((e) => e.tempId !== id) }));
  const addStory = (epicId) => setForm((c) => ({ ...c, epics: c.epics.map((e) => e.tempId === epicId ? { ...e, stories: [...e.stories, makeStory()] } : e) }));
  const removeStory = (epicId, storyId) => setForm((c) => ({ ...c, epics: c.epics.map((e) => e.tempId === epicId ? { ...e, stories: e.stories.filter((s) => s.tempId !== storyId) } : e) }));
  const addSubtask = (epicId, storyId) => setForm((c) => ({ ...c, epics: c.epics.map((e) => e.tempId === epicId ? { ...e, stories: e.stories.map((s) => s.tempId === storyId ? { ...s, subtasks: [...s.subtasks, makeSubtask()] } : s) } : e) }));
  const removeSubtask = (epicId, storyId, subtaskId) => setForm((c) => ({ ...c, epics: c.epics.map((e) => e.tempId === epicId ? { ...e, stories: e.stories.map((s) => s.tempId === storyId ? { ...s, subtasks: s.subtasks.filter((st) => st.tempId !== subtaskId) } : s) } : e) }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const cleanEpics = form.epics.filter((e) => e.name.trim()).map((e) => ({
      name: e.name.trim(),
      progress: e.progress || 0,
      stories: e.stories.filter((s) => s.name.trim()).map((s) => ({
        name: s.name.trim(),
        assigneeId: s.assigneeId || null,
        subtasks: s.subtasks.filter((st) => st.name.trim()).map((st) => ({ name: st.name.trim() })),
      })),
    }));
    if (!form.name.trim() || !form.description.trim() || !form.endDate) { setError("Project name, description, and due date are required."); return; }
    if (!cleanEpics.length) { setError("Add at least one named epic."); return; }
    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const resolvedCompanyId = localStorage.getItem("companyId") || user.companyId;
      if (!resolvedCompanyId) throw new Error("No company selected.");
      const projectRes = await projectService.createProject({
        name: form.name.trim(),
        description: form.description.trim(),
        companyId: resolvedCompanyId,
        teamId: form.teamId || undefined,
        status: "active",
        startDate: form.startDate,
        endDate: form.endDate,
      });
      if (!projectRes.success) throw new Error(projectRes.message || "Failed to create project");
      const projectId = projectRes.data._id;
      for (const epic of cleanEpics) {
        try {
          const epicRes = await API.post("/api/epics", { name: epic.name, description: `${epic.stories.length} stories planned`, status: epic.progress >= 100 ? "Done" : epic.progress > 0 ? "In Progress" : "To Do", companyId: resolvedCompanyId, projectId });
          if (!epicRes.data.success) continue;
          const epicId = epicRes.data.data._id;
          for (let i = 0; i < epic.stories.length; i++) {
            const story = epic.stories[i];
            try {
              const storyRes = await storyService.createStory({
                title: story.name,
                description: `Story in epic: ${epic.name}`,
                status: "To Do",
                priority: form.priority,
                epicId, projectId, companyId: resolvedCompanyId,
                assignee: story.assigneeId || undefined,
                dueDate: form.endDate,
                order: i,
              });
              if (!storyRes.success) continue;
              const storyId = storyRes.data._id;
              for (const subtask of story.subtasks) {
                try { await API.post("/api/subtasks", { title: subtask.name, description: `Subtask for story: ${story.name}`, status: "To Do", storyId, companyId: resolvedCompanyId, due_date: form.endDate }); }
                catch (e) { console.error("Subtask creation failed:", e); }
              }
            } catch (e) { console.error("Story creation failed:", e); }
          }
        } catch (e) { console.error("Epic creation failed:", e); }
      }
      navigate(`/projects/${projectId}`);
    } catch (err) { setError(err.message || "Failed to create project."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <MainLayout title="Add Project">
      <section className="flowio-projects-page flowio-project-form mt-4 h-full overflow-y-auto rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(ellipse_at_50%_35%,#0b1058_0%,#070933_55%,#05072d_100%)] p-5 text-white sm:p-7 lg:mt-3">
        <button type="button" onClick={() => navigate("/projects")} className="flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><FaArrowLeft className="text-xs" /> Back to projects</button>
        <form onSubmit={handleSubmit} className="mx-auto mt-5 max-w-4xl">
          <div className="flowio-project-info-card rounded-[26px] border border-white/[0.06] bg-[#111846]/80 p-5 shadow-xl sm:p-8">
            <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5f9be8]/15 text-xl text-[#78b5ff]"><FaFolderPlus /></div><div><h2 className="text-xl font-semibold">Project information</h2><p className="mt-1 text-xs text-white/45">Build with epics, stories, and subtasks.</p></div></div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="mb-2 block text-xs font-medium text-white/65">Project name *</span><input name="name" value={form.name} onChange={updateField} placeholder="e.g. Customer Portal" className={inputClass} /></label>
              <label className="sm:col-span-2"><span className="mb-2 block text-xs font-medium text-white/65">Description *</span><textarea name="description" value={form.description} onChange={updateField} rows="3" placeholder="What is this project trying to accomplish?" className={`${inputClass} resize-none`} /></label>
              <label><span className="mb-2 block text-xs font-medium text-white/65">Start date *</span><input type="date" name="startDate" value={form.startDate} onChange={updateField} className={inputClass} /></label>
              <label><span className="mb-2 block text-xs font-medium text-white/65">Due date *</span><input type="date" name="endDate" value={form.endDate} onChange={updateField} className={inputClass} /></label>
              <label>
                <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/65"><FaUsers className="text-[10px]" /> Team</span>
                <select value={form.teamId} onChange={(e) => updateTeam(e.target.value)} className={inputClass} disabled={loadingTeams}>
                  <option value="">{loadingTeams ? "Loading teams..." : "No team"}</option>
                  {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                {!form.teamId && <p className="mt-1.5 text-[10px] text-white/35">Pick a team to assign stories to its members.</p>}
                {form.teamId && teamMembers.length === 0 && !loadingMembers && <p className="mt-1.5 text-[10px] text-amber-300/70">This team has no members yet — stories will be unassigned.</p>}
              </label>
              <label><span className="mb-2 block text-xs font-medium text-white/65">Priority</span><select name="priority" value={form.priority} onChange={updateField} className={inputClass}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label>
            </div>
          </div>
          <div className="mt-6 space-y-5">
            {form.epics.map((epic, epicIndex) => (
              <section key={epic.tempId} className="flowio-project-epic-editor rounded-[26px] border border-[#263779]/60 bg-[radial-gradient(ellipse_at_50%_40%,rgba(24,38,91,.9),rgba(10,16,59,.96))] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><FaBookOpen className="text-[#70adf7]" /><h3 className="font-semibold">Epic {epicIndex + 1}</h3></div>{form.epics.length > 1 && <button type="button" onClick={() => removeEpic(epic.tempId)} className="rounded-lg p-2 text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-300"><FaTrashAlt /></button>}</div>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_150px]">
                  <input value={epic.name} onChange={(e) => updateEpic(epic.tempId, "name", e.target.value)} placeholder="Epic name" className={inputClass} />
                  <label><span className="sr-only">Epic progress</span><div className="relative"><input type="number" min="0" max="100" value={epic.progress} onChange={(e) => updateEpic(epic.tempId, "progress", e.target.value)} className={`${inputClass} pr-9`} /><span className="absolute right-4 top-3 text-sm text-white/35">%</span></div></label>
                </div>
                <div className="mt-5 space-y-4">
                  {epic.stories.map((story, storyIndex) => (
                    <div key={story.tempId} className="flowio-project-story-editor rounded-2xl border border-[#34458a]/60 bg-[#090f37]/75 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <span className="shrink-0 text-xs font-medium text-[#9bbdff]">Story {storyIndex + 1}</span>
                        <input value={story.name} onChange={(e) => updateStory(epic.tempId, story.tempId, "name", e.target.value)} placeholder="Story name" className={`${inputClass} min-w-0 flex-1`} />
                        {form.teamId && (
                          <select
                            value={story.assigneeId}
                            onChange={(e) => updateStory(epic.tempId, story.tempId, "assigneeId", e.target.value)}
                            disabled={loadingMembers}
                            className={`${inputClass} shrink-0 sm:w-44`}
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map((m) => (
                              <option key={m._id} value={m.userId?._id || m.userId}>{m.userId?.name || "Unknown"}</option>
                            ))}
                          </select>
                        )}
                        {epic.stories.length > 1 && <button type="button" onClick={() => removeStory(epic.tempId, story.tempId)} className="shrink-0 self-start rounded-lg p-2 text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-300 sm:self-center"><FaTrashAlt /></button>}
                      </div>
                      <div className="mt-4 space-y-2.5 pl-0 sm:pl-[68px]">
                        {story.subtasks.map((subtask, subtaskIndex) => (
                          <div key={subtask.tempId} className="flex items-center gap-2"><span className="w-16 shrink-0 text-[10px] text-white/35">Subtask {subtaskIndex + 1}</span><input value={subtask.name} onChange={(e) => updateSubtask(epic.tempId, story.tempId, subtask.tempId, e.target.value)} placeholder="Subtask name" className={`${inputClass} py-2.5`} />{story.subtasks.length > 1 && <button type="button" onClick={() => removeSubtask(epic.tempId, story.tempId, subtask.tempId)} className="shrink-0 rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-rose-300"><FaTrashAlt /></button>}</div>
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
            <button type="submit" className="rounded-xl bg-[#5f9be8] px-7 py-2.5 text-sm font-semibold shadow-lg transition hover:bg-[#70a9ef] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={isSubmitting}>{isSubmitting ? <><FaSpinner className="animate-spin text-xs" /> Creating...</> : "Create project"}</button>
          </div>
        </form>
      </section>
    </MainLayout>
  );
}