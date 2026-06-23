import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const chatService = {
  /**
   * Send a message and receive the AI reply.
   * POST /api/chat/message
   * Returns: { sessionId, reply: { text, role, createdAt, isError } }
   */
  sendMessage: async (projectId, message) => {
    const response = await axios.post(
      `${API_BASE}/api/chat/message`,
      { projectId, message },
      { withCredentials: true }
    );
    return response.data;
  },

  /**
   * Load previous messages for this (user, project) session.
   * GET /api/chat/history/:projectId
   * Returns: { sessionId, messages: [{ role, text, createdAt, isError }] }
   */
  getHistory: async (projectId) => {
    const response = await axios.get(
      `${API_BASE}/api/chat/history/${projectId}`,
      { withCredentials: true }
    );
    return response.data;
  },
};

export default chatService;