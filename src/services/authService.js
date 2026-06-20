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

  verifyOtp: async (email, otp) => {
    try {
      const response = await API.post("/api/auth/verify-otp", { email, otp });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await API.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default authService;