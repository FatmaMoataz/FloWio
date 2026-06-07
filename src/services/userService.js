import API, { handleError } from "./api"; // استيراد الـ instance الموحد والأخطاء

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

  // Search user by email
  searchUserByEmail: async (email) => {
    try {
      const response = await API.get(`/api/users/search?email=${encodeURIComponent(email)}`);
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