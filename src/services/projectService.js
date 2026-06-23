import API, { handleError } from "./api";

const projectService = {
  getProjectsByCompany: async (companyId) => {
    try {
      const response = await API.get(`/api/projects/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getProjectsByTeam: async (teamId) => {
    try {
      const response = await API.get(`/api/projects/team/${teamId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getProjectById: async (projectId) => {
    try {
      const response = await API.get(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await API.post("/api/projects", projectData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      const response = await API.put(`/api/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // ✅ NEW: Archive a project using the dedicated archive endpoint
  archiveProject: async (projectId) => {
    try {
      const response = await API.post(`/api/archive/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // ✅ NEW: Restore (unarchive) a project
  restoreProject: async (projectId) => {
    try {
      const response = await API.delete(`/api/archive/${projectId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // ✅ NEW: Get all archived items for a company
  getArchivedByCompany: async (companyId) => {
    try {
      const response = await API.get(`/api/archive/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  deleteProject: async (projectId) => {
    try {
      const response = await API.delete(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  updateProjectStatusFromStories: async (projectId) => {
    try {
      const response = await API.put(`/api/projects/${projectId}/update-status`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default projectService;