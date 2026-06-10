import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/poppins";
import "./styles/global.css";
import App from "./App";
import { applyTheme, getThemePreference } from "./utils/theme";

applyTheme(getThemePreference());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
