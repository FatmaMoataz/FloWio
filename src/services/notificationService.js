import API, { handleError } from "./api"; // استخدام الـ instance الموحد لمنع الـ CORS والـ 401

const notificationService = {
  // Get user notifications
  getUserNotifications: async (userId) => {
    try {
      const response = await API.get(`/api/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await API.patch(`/api/notifications/read/${notificationId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await API.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Create notification
  createNotification: async (notificationData) => {
    try {
      const response = await API.post("/api/notifications", notificationData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default notificationService;