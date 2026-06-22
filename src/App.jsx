import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import AppRouter from "./router/AppRouter";
import SplashScreen from "./components/Splash/SplashScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash ? <SplashScreen noRedirect /> : <AppRouter />}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
}