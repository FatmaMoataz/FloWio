import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import AppRouter from "./router/AppRouter";
import { initializeTheme } from "./utils/theme";

export default function App() {
  useEffect(() => initializeTheme(), []);

  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
