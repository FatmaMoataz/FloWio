import API, { handleError } from "./api";

const invitationService = {
  sendInvitation: async (emailInvited, companyId, role) => {
    try {
      const response = await API.post("/api/invitations", { emailInvited, companyId, role });
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // role is now passed in so it reaches sendInvitation
  sendBulkInvitations: async (emails, companyId, role) => {
    const results = await Promise.allSettled(
      emails.map((email) => invitationService.sendInvitation(email, companyId, role))
    );

    const succeeded = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        succeeded.push(result.value);
      } else {
        failed.push({ email: emails[index], reason: result.reason?.message });
      }
    });

    return { succeeded, failed };
  },

  getMyInvitations: async () => {
    try {
      const response = await API.get("/api/invitations/my");
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default invitationService;