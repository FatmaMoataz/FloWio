import API, { handleError } from "./api";

const companyService = {
  getMyCompany: async () => {
    try {
      const response = await API.get("/api/companies/me");
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  updateMyCompany: async (companyData) => {
    try {
      const response = await API.put("/api/companies/me", companyData);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default companyService;