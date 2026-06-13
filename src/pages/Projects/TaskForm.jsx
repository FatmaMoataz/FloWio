import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaFlag,
  FaLayerGroup,
  FaLink,
  FaPaperPlane,
  FaPaperclip,
  FaTasks,
  FaUserCircle,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import { getProject } from "./projectStore";

const columns = [
  { id: "todo", title: "TO-DO" },
  { id: "in-progress", title: "IN-PROGRESS" },
  { id: "in-review", title: "IN-REVIEW" },
  { id: "completed", title: "DONE" },
];

const priorityOptions = [
  { id: "Low", title: "Low" },
  { id: "Medium", title: "Medium" },
  { id: "High", title: "High" },
];

export default function TaskForm() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();

  const project = getProject(projectId);
  const projectName = project?.name || "Project";
  const defaultStatus = searchParams.get("status") || "todo";

  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    title: "",
    notes: "",
    status: defaultStatus,
    priority: "Medium",
    assignee: "",
    due: "",
    pageName: "",
    urlLabel: "",
    taskLink: "",
    fileName: "",
  });

  const canSubmit = useMemo(() => form.title.trim().length > 0, [form.title]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const safeUrl = (url) => {
    if (!url.trim()) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    updateField("fileName", file ? file.name : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const newTask = {
      id: Date.now(),
      name: form.title.trim(),
      notes: form.notes.trim() || "Type here...",
      status: form.status,
      priority: form.priority,
      assignee: form.assignee.trim() || "Sarah",
      due: formatDate(form.due),
      rawDue: form.due,
      pageName: form.pageName.trim() || "General Page",
      fileLabel: form.fileName || "No file",
      fileName: form.fileName,
      urlLabel: form.urlLabel.trim() || "URL label",
      linkUrl: safeUrl(form.taskLink),
    };

    const storageKey = `flowio-tasks-${projectId}`;
    const oldTasks = JSON.parse(localStorage.getItem(storageKey) || "[]");

    localStorage.setItem(storageKey, JSON.stringify([newTask, ...oldTasks]));

    setSaved(true);

    setTimeout(() => {
      navigate(`/projects/${projectId}/kanban`);
    }, 700);
  };

  return (
    <MainLayout>
      <div className="h-full min-h-0 overflow-y-auto text-white">
        <div className="mb-6 flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/kanban`)}
            className="text-white/60 transition hover:text-[#6eb5ff]"
          >
            <FaArrowLeft />
          </button>

          <span className="text-white/45">Projects</span>
          <span className="text-white/30">›</span>

          <h1 className="text-[25px] font-extrabold tracking-[-.4px]">
            Add Task
          </h1>
        </div>

        <div className="mx-auto max-w-[900px] space-y-6 pb-10">
          <form
            onSubmit={handleSubmit}
            className="rounded-[30px] border border-blue-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#0b103f]/95 p-7 shadow-[0_25px_70px_rgba(0,0,0,.35)]"
          >
            <div className="mb-7 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-400/15 text-[#78aaff]">
                <FaTasks />
              </div>

              <div>
                <h2 className="text-[20px] font-extrabold">
                  Task Information
                </h2>
                <p className="mt-1 text-xs text-white/45">
                  Add task details, attachment, link, status and due date for{" "}
                  {projectName}.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <InputField
                label="Task name *"
                value={form.title}
                onChange={(value) => updateField("title", value)}
                placeholder="e.g. Build login screen"
              />

              <div>
                <label className="mb-2 block text-xs font-bold text-white/65">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Write task requirements or notes..."
                  className="h-[120px] w-full resize-none rounded-[18px] border border-blue-300/10 bg-[#070d35]/80 p-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#6eb5ff]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <CustomSelect
                  label="Status"
                  value={form.status}
                  options={columns}
                  onChange={(value) => updateField("status", value)}
                />

                <CustomSelect
                  label="Priority"
                  value={form.priority}
                  options={priorityOptions}
                  onChange={(value) => updateField("priority", value)}
                />

                <InputField
                  label="Assignee"
                  value={form.assignee}
                  onChange={(value) => updateField("assignee", value)}
                  placeholder="Team member name"
                />

                <div>
                  <label className="mb-2 block text-xs font-bold text-white/65">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={form.due}
                    onChange={(e) => updateField("due", e.target.value)}
                    className="h-12 w-full rounded-[16px] border border-blue-300/10 bg-[#070d35]/80 px-4 text-sm text-white outline-none focus:border-[#6eb5ff]/50"
                  />
                </div>

                <InputField
                  label="Page / Screen name"
                  value={form.pageName}
                  onChange={(value) => updateField("pageName", value)}
                  placeholder="e.g. Login Page"
                />

                <InputField
                  label="URL label"
                  value={form.urlLabel}
                  onChange={(value) => updateField("urlLabel", value)}
                  placeholder="e.g. Figma Link"
                />

                <div>
                  <label className="mb-2 block text-xs font-bold text-white/65">
                    Attach file
                  </label>

                  <label className="flex h-12 cursor-pointer items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#070d35]/80 px-4 text-sm text-white/60 transition hover:border-[#6eb5ff]/50 hover:text-white">
                    <FaPaperclip className="text-[#78aaff]" />
                    <span className="truncate">
                      {form.fileName || "Choose file..."}
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <InputField
                  label="Task link"
                  value={form.taskLink}
                  onChange={(value) => updateField("taskLink", value)}
                  placeholder="https://figma.com/..."
                />
              </div>
            </div>

            {saved && (
              <div className="mt-6 flex items-center gap-3 rounded-[18px] border border-emerald-300/10 bg-emerald-400/10 px-4 py-3 text-xs font-bold text-emerald-300">
                <FaCheck />
                Task created successfully. Redirecting to Kanban Board...
              </div>
            )}

            <div className="mt-7 flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/projects/${projectId}/kanban`)}
                className="h-12 flex-1 rounded-[16px] bg-white/10 text-sm font-bold text-white/70 transition hover:bg-white/15"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-12 flex-1 items-center justify-center gap-3 rounded-[16px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm font-bold text-white shadow-[0_0_22px_rgba(95,150,255,.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaPaperPlane />
                Create Task
              </button>
            </div>
          </form>

          <div className="grid grid-cols-4 gap-4">
            <Preview
              icon={<FaLayerGroup />}
              label="Status"
              value={columns.find((c) => c.id === form.status)?.title}
              color="from-[#6eb5ff]/35 to-[#5b7dff]/15"
              iconColor="text-[#78aaff]"
            />
            <Preview
              icon={<FaFlag />}
              label="Priority"
              value={form.priority}
              color="from-[#ffcf5a]/30 to-[#ffcf5a]/10"
              iconColor="text-[#ffcf5a]"
            />
            <Preview
              icon={<FaUserCircle />}
              label="Assignee"
              value={form.assignee || "Unassigned"}
              color="from-[#45e68b]/30 to-[#45e68b]/10"
              iconColor="text-[#45e68b]"
            />
            <Preview
              icon={<FaCalendarAlt />}
              label="Due Date"
              value={formatDate(form.due)}
              color="from-[#ff7aa8]/30 to-[#ff7aa8]/10"
              iconColor="text-[#ff7aa8]"
            />
          </div>

          {form.taskLink && (
            <a
              href={safeUrl(form.taskLink)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[22px] border border-blue-300/10 bg-[#111b63]/80 p-4 text-sm font-bold text-[#78aaff] transition hover:bg-[#172371]"
            >
              <FaLink />
              Open {form.urlLabel || "Task Link"}
            </a>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-white/65">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-[16px] border border-blue-300/10 bg-[#070d35]/80 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#6eb5ff]/50"
      />
    </div>
  );
}

function CustomSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  return (
    <div className="relative z-40">
      <label className="mb-2 block text-xs font-bold text-white/65">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between rounded-[16px] border border-blue-300/10 bg-[#070d35]/80 px-4 text-left text-sm font-bold text-white transition hover:border-[#6eb5ff]/40"
      >
        {selected?.title || value}
        <FaChevronDown
          className={`text-xs text-white/45 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[76px] z-[999] w-full overflow-hidden rounded-[18px] border border-blue-300/10 bg-[#0b1246] p-2 shadow-[0_18px_45px_rgba(0,0,0,.45)]">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={`flex h-10 w-full items-center justify-between rounded-[13px] px-3 text-sm font-bold transition ${
                value === option.id
                  ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              {option.title}
              {value === option.id && <FaCheck className="text-xs" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Preview({ icon, label, value, color, iconColor }) {
  return (
    <div
      className={`rounded-[22px] border border-blue-300/10 bg-gradient-to-br ${color} p-4 shadow-[0_16px_35px_rgba(0,0,0,.22)]`}
    >
      <div className={`mb-3 text-lg ${iconColor}`}>{icon}</div>
      <p className="text-xs text-white/45">{label}</p>
      <h3 className="mt-1 truncate text-sm font-extrabold text-white">
        {value}
      </h3>
    </div>
  );
}