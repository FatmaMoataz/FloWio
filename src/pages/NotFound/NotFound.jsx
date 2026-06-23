import { FaHome, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#101c6d,#050716)] px-4 text-white">
      <div className="w-full max-w-[600px] text-center">
        <h1 className="bg-gradient-to-r from-[#4F58AF] to-[#64CFFF] bg-clip-text text-[110px] font-black text-transparent">
          404
        </h1>

        <h2 className="mt-2 text-3xl font-extrabold">
          Oops! Page Not Found
        </h2>

        <p className="mt-4 text-white/55">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-white/10 px-6 font-semibold transition hover:bg-white/15"
          >
            <FaArrowLeft />
            Go Back
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#4F58AF] to-[#64CFFF] px-6 font-semibold text-white shadow-[0_0_25px_rgba(100,207,255,.35)] transition hover:brightness-110"
          >
            <FaHome />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}