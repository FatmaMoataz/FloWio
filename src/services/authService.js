import API, { handleError } from "./api";

const authService = {
  forgotPassword: async (email) => {
    try {
      const response = await API.post("/api/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  resetPassword: async (resetToken, newPassword) => {
    try {
      const response = await API.post("/api/auth/reset-password", {
        resetToken,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default authService;