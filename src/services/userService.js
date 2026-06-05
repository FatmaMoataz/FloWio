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
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    return {
      message: data.message || "Unauthorized. Please login again.",
      status: "auth_error",
    };
  }

  if (status === 404) {
    return {
      message: data.message || "User not found.",
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

const userService = {
  // Get current logged-in user's profile
  getCurrentUser: async () => {
    try {
      const response = await API.get("/api/users/me");
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get any user's public profile
  getUserById: async (userId) => {
    try {
      const response = await API.get(`/api/users/${userId}`);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Update current user's profile
  updateProfile: async (profileData) => {
    try {
      const response = await API.put("/api/users/me", profileData);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await API.put("/api/users/me/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default userService;
