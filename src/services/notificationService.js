import axios from "axios";

const BACKEND_URL = "https://flowio-backend.vercel.app";

// Create axios instance with base URL
const API = axios.create({
  baseURL: BACKEND_URL,
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handler utility
const handleError = (error) => {
  if (!error.response) {
    return {
      message: "Network error. Please check your connection.",
      status: "network_error",
    };
  }

  const { status, data } = error.response;

  if (status === 400) {
    return {
      message: data.message || "Invalid request.",
      status: "validation_error",
    };
  }

  if (status === 401) {
    return {
      message: data.message || "Unauthorized. Please login again.",
      status: "auth_error",
    };
  }

  if (status === 404) {
    return {
      message: data.message || "Notifications not found.",
      status: "not_found_error",
    };
  }

  if (status === 500) {
    return {
      message: "Server error. Please try again later.",
      status: "server_error",
    };
  }

  return {
    message: data.message || "Something went wrong. Please try again.",
    status: "unknown_error",
  };
};

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
      const response = await API.patch(
        `/api/notifications/read/${notificationId}`
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await API.delete(
        `/api/notifications/${notificationId}`
      );
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
