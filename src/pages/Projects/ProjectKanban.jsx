import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChevronDown,
  FaEdit,
  FaEllipsisH,
  FaExternalLinkAlt,
  FaLink,
  FaPaperclip,
  FaPlus,
  FaSearch,
  FaTrash,
  FaUserCircle,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaSync,
  FaListUl,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import projectService from "../../services/projectService";
import storyService from "../../services/storyService";
import subtaskService from "../../services/subtaskService";
import API from "../../services/api";

const COLUMNS = [
  { id: "To Do", title: "TO-DO", color: "#6eb5ff" },
  { id: "In Progress", title: "IN-PROGRESS", color: "#ffcf5a" },
  { id: "Review", title: "IN-REVIEW", color: "#c084fc" },
  { id: "Done", title: "DONE", color: "#45e68b" },
];

const priorityStyles = {
  Low: "bg-violet-400/15 text-violet-300",
  Medium: "bg-blue-400/15 text-[#78aaff]",
  High: "bg-rose-400/15 text-rose-300",
  Urgent: "bg-red-500/20 text-red-300",
};

const formatDate = (date) => {
  if (!date) return "No date";
  try {
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
};

// ── Subtask Item ───────────────────────────────────────────────────────────────
function SubtaskItem({ subtask, storyId, onUpdate }) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    setToggling(true);
    try {
      const newCompleted = !subtask.isCompleted;
      await subtaskService.toggleSubtaskComplete(subtask._id, newCompleted);
      onUpdate(storyId);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    } finally {
      setToggling(false);
    }
  };

  const isDone = subtask.isCompleted || subtask.status === "Done";

  return (
    <div className="flex items-center gap-2 py-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className="shrink-0"
      >
        {toggling ? (
          <FaSpinner className="h-3 w-3 animate-spin text-white/30" />
        ) : isDone ? (
          <FaCheck className="h-3 w-3 text-emerald-400" />
        ) : (
          <div className="h-3 w-3 rounded-full border border-white/20" />
        )}
      </button>
      <span className={`text-[10px] ${isDone ? "text-white/30 line-through" : "text-white/60"}`}>
        {subtask.title}
      </span>
    </div>
  );
}

// ── Subtask List ───────────────────────────────────────────────────────────────
function SubtaskList({ storyId, companyId }) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchSubtasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await subtaskService.getSubtasksByStory(storyId);
      setSubtasks(res.data || []);
    } catch (err) {
      console.error("Failed to load subtasks:", err);
      setSubtasks([]);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    fetchSubtasks();
  }, [fetchSubtasks]);

  const handleAdd = async (e) => {
    e.stopPropagation();
    const title = newTitle.trim();
    if (!title) return;

    setAdding(true);
    try {
      const res = await subtaskService.createSubtask({
        title,
        storyId,
        companyId,
        status: "To Do",
      });
      if (res.success) {
        setSubtasks((prev) => [...prev, res.data]);
        setNewTitle("");
        setShowInput(false);
      }
    } catch (err) {
      console.error("Failed to add subtask:", err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-2 text-[10px] text-white/30">
        <FaSpinner className="inline animate-spin mr-2" />
        Loading subtasks...
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-white/5 pt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-white/30 uppercase tracking-wider">Subtasks</span>
        <span className="text-[9px] text-white/30">
          {subtasks.filter((s) => s.isCompleted).length}/{subtasks.length}
        </span>
      </div>

      {subtasks.map((subtask) => (
        <SubtaskItem
          key={subtask._id}
          subtask={subtask}
          storyId={storyId}
          onUpdate={fetchSubtasks}
        />
      ))}

      {showInput ? (
        <div className="mt-2 flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd(e);
              if (e.key === "Escape") { setShowInput(false); setNewTitle(""); }
            }}
            placeholder="Subtask title..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="rounded-lg bg-blue-500/20 px-2 py-1 text-[10px] text-blue-300 disabled:opacity-50"
          >
            {adding ? <FaSpinner className="animate-spin" /> : "Add"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowInput(true); }}
          className="mt-2 flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60"
        >
          <FaPlus className="text-[8px]" /> Add subtask
        </button>
      )}
    </div>
  );
}

// ── Story Card ─────────────────────────────────────────────────────────────────
function StoryCard({ story, onStatusChange, onDelete, companyId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const priority = story.priority || "Medium";

  return (
    <article className="group relative overflow-visible rounded-[24px] border border-blue-300/10 bg-[#0b1246]/90 p-4 shadow-[0_18px_40px_rgba(0,0,0,.22)] transition hover:bg-[#10195a] hover:shadow-[0_20px_50px_rgba(110,181,255,.18)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-[13px] font-bold">{story.title}</h3>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
        >
          <FaEllipsisH />
        </button>

        {menuOpen && (
          <div
            className="absolute right-3 top-10 z-[99999] w-44 overflow-hidden rounded-2xl border border-[#3148b8] bg-[#192672] p-2 shadow-[0_25px_60px_rgba(0,0,0,.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => { setMenuOpen(false); setShowSubtasks(!showSubtasks); }}
              className="flex h-10 w-full items-center gap-3 rounded-[13px] px-3 text-xs font-bold text-white/75 transition hover:bg-[#24358f] hover:text-white"
            >
              <FaListUl className="text-[#78aaff]" />
              {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
            </button>

            <button
              type="button"
              onClick={() => { setMenuOpen(false); onDelete(story._id); }}
              className="flex h-10 w-full items-center gap-3 rounded-[13px] px-3 text-xs font-bold text-[#ff6b8a] transition hover:bg-red-400/10"
            >
              <FaTrash />
              Delete Story
            </button>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] text-white/55">
        {story.tags?.map((tag, i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-full bg-pink-400/10 px-2 py-1 text-pink-300">
            <FaPaperclip />
            {tag}
          </span>
        ))}
      </div>

      {/* Description */}
      {story.description && (
        <p className="mb-4 text-[10px] leading-5 text-white/45">
          <span className="block text-white/65">Description:</span>
          {story.description}
        </p>
      )}

      {/* Priority & Status */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className={`rounded-full px-3 py-1 text-[9px] font-bold ${priorityStyles[priority] || priorityStyles.Medium}`}>
          {priority}
        </span>

        <StatusDropdown
          storyId={story._id}
          value={story.status}
          options={COLUMNS}
          open={statusOpen}
          setOpen={setStatusOpen}
          onChange={(newStatus) => onStatusChange(story._id, newStatus)}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2 text-[10px] text-white/60">
          <FaUserCircle className="text-[#ffcf5a]" />
          {story.assignee?.name || "Unassigned"}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-white/60">
          <FaCalendarAlt />
          {formatDate(story.dueDate)}
        </div>
      </div>

      {/* Subtasks */}
      {showSubtasks && (
        <SubtaskList storyId={story._id} companyId={story.companyId} />
      )}
    </article>
  );
}

// ── Status Dropdown ────────────────────────────────────────────────────────────
function StatusDropdown({ storyId, value, options, open, setOpen, onChange }) {
  const selected = options.find((option) => option.id === value);

  return (
    <div className={`relative ${open ? "z-[99999]" : "z-20"}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex h-7 min-w-[112px] items-center justify-between gap-2 rounded-full border border-[#2c3d9f] bg-[#141d66] px-3 text-[9px] font-bold text-[#9ec9ff] transition hover:bg-[#1b277d]"
      >
        {selected?.title || value}
        <FaChevronDown className={`text-[8px] text-white/55 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 z-[99999] w-44 overflow-hidden rounded-2xl border border-[#3148b8] bg-[#192672] p-2 shadow-[0_25px_60px_rgba(0,0,0,.85)]"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={`flex h-10 w-full items-center justify-between rounded-[13px] px-3 text-[10px] font-bold transition ${
                value === option.id
                  ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white"
                  : "text-white/75 hover:bg-[#24358f] hover:text-white"
              }`}
            >
              {option.title}
              {value === option.id && <FaCheck className="text-[9px]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteConfirmModal({ storyTitle, onCancel, onConfirm, isDeleting }) {
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[28px] border border-red-300/10 bg-gradient-to-br from-[#151e66] to-[#070d35] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,.65)]">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/15 text-red-300">
          <FaTrash />
        </div>
        <h3 className="text-xl font-extrabold">Delete Story?</h3>
        <p className="mt-2 text-sm leading-6 text-white/50">
          Are you sure you want to delete "{storyTitle}"? This will also remove all its subtasks.
        </p>
        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 flex-1 rounded-[16px] bg-white/10 text-sm font-bold text-white/70 transition hover:bg-white/15 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-11 flex-1 rounded-[16px] bg-gradient-to-r from-[#ff5d73] to-[#ff7aa8] text-sm font-bold text-white shadow-[0_0_22px_rgba(255,93,115,.35)] transition hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <FaSpinner className="animate-spin" /> Deleting...
              </>
            ) : (
              "Delete Story"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Kanban Component ──────────────────────────────────────────────────────
export default function ProjectKanban() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteStoryId, setDeleteStoryId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  // Fetch project and stories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get company ID
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const compId = localStorage.getItem("companyId") || user.companyId;
      setCompanyId(compId);

      // Fetch project
      const projectRes = await projectService.getProjectById(projectId);
      const projectData = projectRes.success ? projectRes.data : projectRes;
      setProject(projectData);

      // Fetch stories
      const storiesRes = await storyService.getStoriesByProject(projectId);
      const storiesData = storiesRes.data || storiesRes || [];
      setStories(Array.isArray(storiesData) ? storiesData : []);
    } catch (err) {
      console.error("Error loading kanban:", err);
      setError(err.message || "Failed to load kanban board");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId, fetchData]);

  // Filter stories by search
  const filteredStories = useMemo(() => {
    if (!search.trim()) return stories;
    const query = search.toLowerCase();
    return stories.filter(
      (story) =>
        story.title?.toLowerCase().includes(query) ||
        story.description?.toLowerCase().includes(query) ||
        story.priority?.toLowerCase().includes(query) ||
        story.status?.toLowerCase().includes(query)
    );
  }, [stories, search]);

  // Change story status
  const handleStatusChange = async (storyId, newStatus) => {
    // Optimistic update
    setStories((prev) =>
      prev.map((s) => (s._id === storyId ? { ...s, status: newStatus } : s))
    );

    try {
      await storyService.updateStory(storyId, { status: newStatus });
    } catch (err) {
      console.error("Failed to update story status:", err);
      // Revert on failure
      fetchData();
    }
  };

  // Delete story
  const handleDeleteStory = async () => {
    if (!deleteStoryId) return;
    try {
      setIsDeleting(true);
      await storyService.deleteStory(deleteStoryId);
      setStories((prev) => prev.filter((s) => s._id !== deleteStoryId));
      setDeleteStoryId(null);
    } catch (err) {
      console.error("Failed to delete story:", err);
      alert("Failed to delete story. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const boardTitle = project?.name || "Kanban Board";
  const deleteStoryTitle = stories.find((s) => s._id === deleteStoryId)?.title || "";

  // Loading State
  if (loading) {
    return (
      <MainLayout>
        <section className="flex h-full min-h-[600px] items-center justify-center">
          <div className="text-center">
            <FaSpinner className="mx-auto mb-4 animate-spin text-3xl text-[#5f9be8]" />
            <p className="text-white/60">Loading kanban board...</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <MainLayout>
        <section className="flex h-full min-h-[600px] items-center justify-center">
          <div className="max-w-md text-center">
            <FaExclamationTriangle className="mx-auto mb-4 text-3xl text-rose-400" />
            <h3 className="text-lg font-semibold text-white/80">Failed to Load Board</h3>
            <p className="mt-2 text-sm text-white/50">{error}</p>
            <button
              onClick={fetchData}
              className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[#5f9be8] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#70a9ef]"
            >
              <FaSync className="text-xs" /> Try Again
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden pb-20 pr-2 text-white">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => navigate(`/projects/${projectId}`)}
                className="text-white/60 transition hover:text-[#6eb5ff]"
              >
                <FaArrowLeft />
              </button>

              <span className="text-white/45">Projects</span>
              <span className="text-white/30">›</span>

              <h1 className="text-[22px] font-extrabold tracking-[-.3px]">
                {boardTitle} Kanban Board
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-[285px] items-center gap-3 rounded-[17px] border border-blue-300/10 bg-[#141d66]/90 px-4 shadow-[0_12px_26px_rgba(0,0,0,.18)]">
                <FaSearch className="text-sm text-white/45" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>{stories.length} stories</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/stories/new`)}
            className="group flex h-12 items-center gap-3 rounded-full bg-gradient-to-r from-[#6eb5ff] via-[#7aa8ff] to-[#5b7dff] px-7 text-sm font-bold shadow-[0_0_30px_rgba(95,150,255,.35)] transition-all duration-300 hover:scale-105"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-all group-hover:rotate-90">
              <FaPlus />
            </span>
            Add Story
          </button>
        </div>

        {/* Kanban Columns */}
        <div className="grid min-h-max grid-cols-4 gap-5 overflow-visible">
          {COLUMNS.map((column) => {
            const columnStories = filteredStories.filter(
              (story) => story.status === column.id
            );

            return (
              <div
                key={column.id}
                className="relative flex h-[720px] flex-col overflow-visible rounded-[28px] border border-blue-300/10 bg-gradient-to-b from-[#151e66]/95 to-[#0a0f3d]/95 p-4 shadow-[0_24px_55px_rgba(0,0,0,.28)]"
              >
                <div className="mb-4 flex shrink-0 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h2 className="text-[13px] font-bold text-white/80">
                      {column.title}
                    </h2>
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-[10px] bg-[#0b1246] px-2 text-xs font-bold">
                      {columnStories.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${projectId}/stories/new?status=${encodeURIComponent(column.id)}`)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/45 transition hover:bg-blue-400/15 hover:text-[#78aaff]"
                  >
                    <FaPlus />
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto overflow-x-visible pr-2 pb-6">
                  {columnStories.map((story) => (
                    <StoryCard
                      key={story._id}
                      story={story}
                      companyId={companyId}
                      onStatusChange={handleStatusChange}
                      onDelete={(id) => setDeleteStoryId(id)}
                    />
                  ))}

                  {!columnStories.length && (
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${projectId}/stories/new?status=${encodeURIComponent(column.id)}`)}
                      className="flex min-h-[130px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-blue-300/15 bg-[#0b1246]/40 text-center text-xs text-white/35 transition hover:border-blue-300/35 hover:bg-[#111b63]/75 hover:text-white/70"
                    >
                      <FaPlus className="mb-3 text-lg" />
                      Add Story
                    </button>
                  )}
                </div>

                {columnStories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${projectId}/stories/new?status=${encodeURIComponent(column.id)}`)}
                    className="mt-4 flex h-10 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[#0b1246]/70 text-xs font-bold text-white/70 transition hover:bg-blue-400/15 hover:text-[#78aaff]"
                  >
                    <FaPlus />
                    Add Story
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteStoryId && (
          <DeleteConfirmModal
            storyTitle={deleteStoryTitle}
            onCancel={() => setDeleteStoryId(null)}
            onConfirm={handleDeleteStory}
            isDeleting={isDeleting}
          />
        )}
      </section>
    </MainLayout>
  );
}