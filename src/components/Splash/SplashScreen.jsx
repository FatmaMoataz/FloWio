import { useEffect } from "react";
import logo from "../../assets/logo.svg";

export default function SplashScreen({ noRedirect = false }) {
  useEffect(() => {
    if (noRedirect) return;

    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 2800);

    return () => clearTimeout(timer);
  }, [noRedirect]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_left,rgba(0,40,170,.48),transparent_35%),linear-gradient(90deg,#02030f,#07144a_55%,#05060f)] text-white">
      <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] animate-pulse rounded-full bg-[#64CFFF]/20 blur-[100px]" />
      <div className="absolute bottom-[-140px] right-[-120px] h-[380px] w-[380px] animate-pulse rounded-full bg-[#4F58AF]/25 blur-[110px]" />

      <div className="absolute inset-0 opacity-[0.12]">
<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_left,rgba(0,40,170,.48),transparent_35%),linear-gradient(90deg,#02030f,#07144a_55%,#05060f)] text-white"></div>      </div>

      <div className="relative flex flex-col items-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping rounded-[32px] bg-[#64CFFF]/20" />
          <div className="absolute inset-[-18px] animate-spin rounded-full border border-[#64CFFF]/20 border-t-[#64CFFF]/70" />

          <img
            src={logo}
            alt="Flowio"
            className="relative h-24 w-24 animate-[flowioLogo_1.4s_ease-in-out_infinite] rounded-[28px] object-cover shadow-[0_0_55px_rgba(100,207,255,.35)]"
          />
        </div>

        <h1 className="animate-[flowioFadeUp_.9s_ease_forwards] bg-linear-to-b from-[#4F58AF] to-[#64CFFF] bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl">
          Flowio
        </h1>

        <p className="mt-3 animate-[flowioFadeUp_1.1s_ease_forwards] text-sm font-medium text-white/55">
          Flow through projects effortlessly
        </p>

        <div className="mt-8 h-1.5 w-52 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[flowioLoading_1.15s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#4F58AF] to-[#64CFFF]" />
        </div>
      </div>
    </div>
  );
}