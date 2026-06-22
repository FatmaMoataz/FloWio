import API, { handleError } from "./api";

const subscriptionService = {
  // plan: "free" | "starter" | "pro" (enterprise has no self-serve checkout)
  // billingCycle: "monthly" | "yearly"
  startCheckout: async ({ plan, billingCycle, seats }) => {
    try {
      const response = await API.post("/api/subscriptions/checkout", {
        plan,
        billingCycle,
        seats,
      });
      return response.data; // { success, free: true, data } OR { success, url }
    } catch (error) {
      throw handleError(error);
    }
  },

  // Call this when the user lands back on /onboarding?session_id=... after
  // Stripe Checkout, so the UI updates immediately instead of waiting on
  // the webhook.
  verifySession: async (sessionId) => {
    try {
      const response = await API.get(`/api/subscriptions/session/${sessionId}`);
      return response.data.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default subscriptionService;