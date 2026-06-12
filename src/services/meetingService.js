import API, { handleError } from "./api";

const meetingService = {
  // Create a new meeting for a project
  createMeeting: async (projectId, title, description = "", attendees = []) => {
    try {
      const response = await API.post("/api/meetings", {
        projectId,
        title,
        description,
        attendees,
      });
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get all meetings for a project
  getMeetingsByProject: async (projectId) => {
    try {
      const response = await API.get(`/api/meetings/project/${projectId}`);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get a single meeting
  getMeetingById: async (meetingId) => {
    try {
      const response = await API.get(`/api/meetings/${meetingId}`);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Start a meeting (sets status=live, startedAt=now)
  startMeeting: async (meetingId) => {
    try {
      const response = await API.patch(`/api/meetings/${meetingId}/start`, {});
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // End a meeting
  endMeeting: async (meetingId) => {
    try {
      const response = await API.patch(`/api/meetings/${meetingId}/end`, {});
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Update a meeting
  updateMeeting: async (meetingId, data) => {
    try {
      const response = await API.put(`/api/meetings/${meetingId}`, data);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Delete a meeting
  deleteMeeting: async (meetingId) => {
    try {
      const response = await API.delete(`/api/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get AI-generated meeting log (transcript, summary, extracted tasks)
  getMeetingLog: async (meetingId) => {
    try {
      const response = await API.get(`/api/meetings/${meetingId}/log`);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Upload audio for AI processing (multipart/form-data)
  processAudio: async (meetingId, audioFile) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      const response = await API.post(`/api/meetings/${meetingId}/process-audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default meetingService;