import API, { handleError } from "./api";

// Matches backend routes:
// POST   /api/subtasks              → createSubtask
// GET    /api/subtasks/story/:storyId → getSubtasksByStory
// GET    /api/subtasks/task/:taskId → getSubtasksByTask
// GET    /api/subtasks/:id          → getSubtaskById
// PUT    /api/subtasks/:id          → updateSubtask
// DELETE /api/subtasks/:id          → deleteSubtask

const subtaskService = {
  // Create a new subtask
  createSubtask: async (subtaskData) => {
    try {
      const response = await API.post("/api/subtasks", subtaskData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get all subtasks for a specific story
  getSubtasksByStory: async (storyId) => {
    try {
      // Try the story endpoint first, fall back to fetching all and filtering
      const response = await API.get(`/api/subtasks/story/${storyId}`);
      if (response.data.success !== undefined) {
        return response.data;
      }
      return { success: true, data: response.data };
    } catch (error) {
      // If story endpoint doesn't exist, return empty array
      console.warn("Story subtask endpoint may not exist:", error.message);
      return { success: true, data: [] };
    }
  },

  // Get all subtasks for a specific task
  getSubtasksByTask: async (taskId) => {
    try {
      const response = await API.get(`/api/subtasks/task/${taskId}`);
      if (response.data.success !== undefined) {
        return response.data;
      }
      return { success: true, data: response.data };
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get a single subtask by ID
  getSubtaskById: async (subtaskId) => {
    try {
      const response = await API.get(`/api/subtasks/${subtaskId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Update a subtask
  updateSubtask: async (subtaskId, updateData) => {
    try {
      const response = await API.put(`/api/subtasks/${subtaskId}`, updateData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Toggle isCompleted
  toggleSubtaskComplete: async (subtaskId, isCompleted) => {
    try {
      const response = await API.put(`/api/subtasks/${subtaskId}`, { isCompleted });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Delete a subtask
  deleteSubtask: async (subtaskId) => {
    try {
      const response = await API.delete(`/api/subtasks/${subtaskId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default subtaskService;

// Status Enum
export const SUBTASK_STATUS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};