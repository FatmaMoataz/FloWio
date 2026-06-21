import API, { handleError } from "./api";

const invitationService = {
  sendInvitation: async (emailInvited, companyId) => {
    try {
      const response = await API.post("/api/invitations", { emailInvited, companyId });
      return response.data.data; // real invitation doc, with its own token
    } catch (error) {
      throw handleError(error);
    }
  },

  // Sends one invite per email and reports which succeeded/failed
  // individually (one bad email shouldn't block the rest).
  sendBulkInvitations: async (emails, companyId) => {
    const results = await Promise.allSettled(
      emails.map((email) => invitationService.sendInvitation(email, companyId))
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