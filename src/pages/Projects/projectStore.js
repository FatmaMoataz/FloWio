const STORAGE_KEY = "flowio-projects";

const PROJECT_COLORS = [
  { name: "amber", hex: "#f59e0b", soft: "rgba(245, 158, 11, 0.14)" },
  { name: "blue", hex: "#60a5fa", soft: "rgba(96, 165, 250, 0.14)" },
  { name: "violet", hex: "#a78bfa", soft: "rgba(167, 139, 250, 0.14)" },
  { name: "cyan", hex: "#22d3ee", soft: "rgba(34, 211, 238, 0.14)" },
  { name: "rose", hex: "#fb7185", soft: "rgba(251, 113, 133, 0.14)" },
  { name: "emerald", hex: "#34d399", soft: "rgba(52, 211, 153, 0.14)" },
];

const STARTER_PROJECTS = [
  {
    id: "website-redesign",
    name: "Website Redesign",
    description: "Website for eng-rep, a modern company experience.",
    dueDate: "2026-09-30",
    tasks: 4,
  },
  {
    id: "mobile-app-development",
    name: "Mobile-App Development",
    description: "Develop a polished mobile application.",
    dueDate: "2026-09-20",
    tasks: 8,
  },
  {
    id: "feedback-campaign",
    name: "Feedback Campaign",
    description: "Prepare and launch the customer feedback campaign.",
    dueDate: "2026-10-10",
    tasks: 3,
  },
  {
    id: "ai-chatbot-integration",
    name: "AI Chatbot Integration",
    description: "Integrate an AI assistant into the support workflow.",
    dueDate: "2026-10-05",
    tasks: 5,
  },
];

const randomProgress = () => Math.floor(Math.random() * 91) + 5;

const createDefaultEpics = (project) => [
  {
    id: `${project.id}-epic-1`,
    name: "User Authentication",
    progress: project.progress,
    stories: [
      {
        id: `${project.id}-story-1`,
        name: "Login Flow",
        subtasks: [
          { id: `${project.id}-subtask-1`, name: "UI integration" },
          { id: `${project.id}-subtask-2`, name: "API integration" },
          { id: `${project.id}-subtask-3`, name: "Form validation" },
        ],
      },
      {
        id: `${project.id}-story-2`,
        name: "Account Recovery",
        subtasks: [
          { id: `${project.id}-subtask-4`, name: "Reset password UI" },
          { id: `${project.id}-subtask-5`, name: "Email verification" },
        ],
      },
    ],
  },
];

const countSubtasks = (epics = []) =>
  epics.reduce(
    (epicTotal, epic) =>
      epicTotal +
      (epic.stories || []).reduce(
        (storyTotal, story) => storyTotal + (story.subtasks || []).length,
        0,
      ),
    0,
  );

const normalizeTaskStatus = (status) => {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  if (["completed", "complete", "done"].includes(normalized)) {
    return "completed";
  }
  if (["todo", "to-do", "pending", "backlog"].includes(normalized)) {
    return "todo";
  }
  return "in-progress";
};

const createAssignedTasks = (project, epics) => {
  if (Array.isArray(project.assignedTasks) && project.assignedTasks.length) {
    return project.assignedTasks.map((task, index) => ({
      ...task,
      id: task.id || `${project.id}-assigned-task-${index}`,
      name: task.name || `Task ${index + 1}`,
      priority: task.priority || "Medium",
      due: task.due || "No due date",
      status: normalizeTaskStatus(task.status),
    }));
  }

  const subtasks = epics.flatMap((epic) =>
    (epic.stories || []).flatMap((story) =>
      (story.subtasks || []).map((subtask) => ({
        id: subtask.id,
        name: subtask.name,
        epicName: epic.name,
        storyName: story.name,
      })),
    ),
  );
  const fallback = [
    "Optimize Web Content",
    "Update Portfolio Case Study",
    "Design new homepage layout",
    "Create wireframes for landing page",
  ].map((name, index) => ({
    id: `${project.id}-assigned-task-${index}`,
    name,
    epicName: "Project Tasks",
    storyName: "Assigned Work",
  }));

  return (subtasks.length ? subtasks : fallback).map((task, index) => ({
    ...task,
    priority: ["Low", "Medium", "High", "High"][index % 4],
    due: ["Sep 15", "Oct 15", "Tomorrow", "Sep 12"][index % 4],
    status: index === 0 || index === 3 ? "completed" : "in-progress",
  }));
};

const withPresentation = (project, index = 0) => {
  const progress = Number.isFinite(Number(project.progress))
    ? Math.max(0, Math.min(100, Number(project.progress)))
    : randomProgress();
  const colorIndex =
    Number.isInteger(project.colorIndex)
      ? project.colorIndex % PROJECT_COLORS.length
      : Math.floor((progress / 101) * PROJECT_COLORS.length + index) %
        PROJECT_COLORS.length;

  const presented = { ...project, progress, colorIndex };
  const epics =
    Array.isArray(project.epics) && project.epics.length
      ? project.epics
      : createDefaultEpics(presented);
  const assignedTasks = createAssignedTasks(presented, epics);

  return {
    ...presented,
    epics,
    assignedTasks,
    tasks: assignedTasks.length || countSubtasks(epics) || Number(project.tasks) || 0,
  };
};

export const getProjectColor = (project) =>
  PROJECT_COLORS[project.colorIndex % PROJECT_COLORS.length] ||
  PROJECT_COLORS[0];

export const loadProjects = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(stored)) {
      const projects = stored.map(withPresentation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return projects;
    }
  } catch {
    // Fall back to starter data if local storage was manually corrupted.
  }

  const starterProjects = STARTER_PROJECTS.map(withPresentation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(starterProjects));
  return starterProjects;
};

export const saveProjects = (projects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const getProject = (projectId) =>
  loadProjects().find((project) => project.id === projectId);

export const updateProjectTaskStatus = (projectId, taskId, status) => {
  const projects = loadProjects();
  let updatedProject = null;
  const updatedProjects = projects.map((project) => {
    if (project.id !== projectId) return project;
    updatedProject = {
      ...project,
      assignedTasks: project.assignedTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    };
    return updatedProject;
  });
  saveProjects(updatedProjects);
  return updatedProject;
};

export const createProject = (project) => {
  const projects = loadProjects();
  const epics = (project.epics || []).map((epic, epicIndex) => ({
    ...epic,
    id: epic.id || `epic-${Date.now()}-${epicIndex}`,
    progress: Number(epic.progress) || 0,
    stories: (epic.stories || []).map((story, storyIndex) => ({
      ...story,
      id: story.id || `story-${Date.now()}-${epicIndex}-${storyIndex}`,
      subtasks: (story.subtasks || []).map((subtask, subtaskIndex) => ({
        ...subtask,
        id:
          subtask.id ||
          `subtask-${Date.now()}-${epicIndex}-${storyIndex}-${subtaskIndex}`,
      })),
    })),
  }));
  const created = withPresentation({
    ...project,
    epics,
    id: `${project.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now()}`,
    progress: randomProgress(),
    tasks: countSubtasks(epics),
  });
  saveProjects([created, ...projects]);
  return created;
};

export const removeProject = (projectId) => {
  const projects = loadProjects().filter((project) => project.id !== projectId);
  saveProjects(projects);
  return projects;
};
