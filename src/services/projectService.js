// import API, { handleError } from "./api";

// const projectService = {
//   // Get all projects for a company
//   getProjectsByCompany: async (companyId) => {
//     try {
//       // Add /api prefix since baseURL doesn't include it
//       const response = await API.get(`/api/projects/company/${companyId}`);
//       return response.data;
//     } catch (error) {
//       throw handleError(error);
//     }
//   },

//   // Get single project by ID
//   getProjectById: async (projectId) => {
//     try {
//       const response = await API.get(`/api/projects/${projectId}`);
//       return response.data;
//     } catch (error) {
//       throw handleError(error);
//     }
//   },

//   // Create new project
//   createProject: async (projectData) => {
//     try {
//       const response = await API.post("/api/projects", projectData);
//       return response.data;
//     } catch (error) {
//       throw handleError(error);
//     }
//   },

//   // Update project
//   updateProject: async (projectId, projectData) => {
//     try {
//       const response = await API.put(`/api/projects/${projectId}`, projectData);
//       return response.data;
//     } catch (error) {
//       throw handleError(error);
//     }
//   },

//   // Delete project
//   deleteProject: async (projectId) => {
//     try {
//       const response = await API.delete(`/api/projects/${projectId}`);
//       return response.data;
//     } catch (error) {
//       throw handleError(error);
//     }
//   },
// };

// export default projectService;
import API, { handleError } from "./api";

const projectService = {
  // Get all projects for a company
  getProjectsByCompany: async (companyId) => {
    try {
      const response = await API.get(`/api/projects/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get single project by ID
  getProjectById: async (projectId) => {
    try {
      const response = await API.get(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await API.post("/api/projects", projectData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    try {
      const response = await API.put(`/api/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      const response = await API.delete(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default projectService;