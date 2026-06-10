const THEME_KEY = "flowio-theme";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: light)").matches
    ? "Light"
    : "Dark";

export const applyTheme = (preference) => {
  const resolvedTheme =
    preference === "System" ? getSystemTheme() : preference;

  document.documentElement.classList.toggle(
    "flowio-light",
    resolvedTheme === "Light",
  );
  document.documentElement.dataset.theme = resolvedTheme.toLowerCase();
};

export const setThemePreference = (preference) => {
  localStorage.setItem(THEME_KEY, preference);
  applyTheme(preference);
  window.dispatchEvent(
    new CustomEvent("flowio-theme-change", { detail: preference }),
  );
};

export const getThemePreference = () =>
  localStorage.getItem(THEME_KEY) || "Dark";

export const initializeTheme = () => {
  const updateTheme = () => applyTheme(getThemePreference());
  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

  updateTheme();
  mediaQuery.addEventListener("change", updateTheme);
  window.addEventListener("storage", updateTheme);

  return () => {
    mediaQuery.removeEventListener("change", updateTheme);
    window.removeEventListener("storage", updateTheme);
  };
};
