import API, { handleError } from "./api";

const storyService = {
  // Create a new story
  createStory: async (storyData) => {
    try {
      const response = await API.post("/api/stories", storyData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get all stories for a project
  getStoriesByProject: async (projectId) => {
    try {
      const response = await API.get(`/api/stories/project/${projectId}`);
      // Handle both response formats
      if (response.data.success !== undefined) {
        return response.data;
      }
      return { success: true, data: response.data };
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get all stories for an epic
  getStoriesByEpic: async (epicId) => {
    try {
      const response = await API.get(`/api/stories/epic/${epicId}`);
      if (response.data.success !== undefined) {
        return response.data;
      }
      return { success: true, data: response.data };
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get a single story with subtasks
  getStoryById: async (storyId) => {
    try {
      const response = await API.get(`/api/stories/${storyId}`);
      if (response.data.success !== undefined) {
        return response.data;
      }
      return { success: true, data: response.data };
    } catch (error) {
      throw handleError(error);
    }
  },

  // Update a story
  updateStory: async (storyId, storyData) => {
    try {
      const response = await API.put(`/api/stories/${storyId}`, storyData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Delete a story
  deleteStory: async (storyId) => {
    try {
      const response = await API.delete(`/api/stories/${storyId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default storyService;