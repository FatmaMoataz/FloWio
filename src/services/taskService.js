import API, { handleError } from "./api";

const taskService = {

  // ── Personal tasks (no projectId) ────────────────────────────────────────────
  createPersonalTask: async (taskData) => {
    try {
      const response = await API.post(`/api/tasks`, taskData);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getMyTasks: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status)   params.append("status",   filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await API.get(`/api/tasks/my-tasks${query}`);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // ── Project-scoped tasks ──────────────────────────────────────────────────────
  createTask: async (projectId, taskData) => {
    try {
      const response = await API.post(`/api/projects/${projectId}/tasks`, taskData);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getAllTasksByProject: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status)     params.append("status",     filters.status);
      if (filters.priority)   params.append("priority",   filters.priority);
      if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await API.get(`/api/projects/${projectId}/tasks${query}`);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // ── Shared ────────────────────────────────────────────────────────────────────
  getTaskById: async (taskId) => {
    try {
      const response = await API.get(`/api/tasks/${taskId}`);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const response = await API.put(`/api/tasks/${taskId}`, updates);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  assignTask: async (taskId, assignedTo) => {
    try {
      const response = await API.put(`/api/tasks/${taskId}/assign`, { assignedTo });
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  linkTaskToEpic: async (taskId, epicId) => {
    try {
      const response = await API.put(`/api/tasks/${taskId}/epic`, { epicId });
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await API.delete(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default taskService;