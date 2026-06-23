export const getFlowioUser = () => {
  try {
    return JSON.parse(localStorage.getItem("flowioUser") || "{}");
  } catch {
    return {};
  }
};

export const saveFlowioUser = (user) => {
  const current = getFlowioUser();

  const updated = {
    ...current,
    ...user,
  };

  localStorage.setItem("flowioUser", JSON.stringify(updated));

  localStorage.setItem("userName", updated.name || "");
  localStorage.setItem("userEmail", updated.email || "");
  localStorage.setItem("userAvatar", updated.avatar || "");
  localStorage.setItem("userRole", updated.role || "");
  localStorage.setItem("userSpecialization", updated.specialization || "");

  window.dispatchEvent(new Event("flowioUserUpdated"));

  return updated;
};