import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../../assets/logo.svg";
import axios from "axios";

const BACKEND_URL = "https://flowio-backend.vercel.app";

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.warning("Please fill all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.warning("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data.data?._id) {
        localStorage.setItem("userId", response.data.data._id);
      }

      toast.success("Login successful!");

      // حفظ إشعار ترحيبي محلي موحد من خلال الـ localStorage
      const welcomeNotif = {
        id: "welcome_" + Date.now(),
        title: "Welcome to Flowio! 🚀",
        message:
          "Hi there, we're absolutely thrilled to have you here. Let's start managing your workflows perfectly!",
        type: "welcome",
        is_read: false,
        createdAt: new Date().toISOString(),
        path: "/dashboard",
        isLocal: true,
      };
      localStorage.setItem(
        "local_notifications",
        JSON.stringify([welcomeNotif]),
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    if (!googleEmail) {
      toast.warning("Please enter your Gmail");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BACKEND_URL}/api/auth/google`, {
        email: googleEmail,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data._id) {
        localStorage.setItem("userId", response.data._id);
      }

      setShowGooglePopup(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google auth error:", error);
      toast.error(
        error.response?.data?.message || "Google authentication failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flowio-auth-page flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_left,rgba(0,40,170,.48),transparent_35%),linear-gradient(90deg,#02030f,#07144a_55%,#05060f)] p-3 text-white sm:p-6 lg:p-8">
      <div className="flowio-auth-card w-full max-w-[460px] rounded-[24px] border border-blue-300/15 bg-[#081142]/90 p-5 shadow-[0_0_60px_rgba(30,60,180,.25)] sm:rounded-[32px] sm:p-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src={logo}
            alt="Flowio"
            className="w-14 h-14 rounded-2xl object-cover"
          />
          <h1 className="bg-linear-to-b from-[#4F58AF] to-[#64CFFF] bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
            Flowio
          </h1>
        </div>

        <h2 className="text-center text-2xl font-bold mb-3">
          Welcome to{" "}
          <span className="inline-block bg-linear-to-b from-[#4F58AF] to-[#64CFFF] bg-clip-text text-3xl font-extrabold text-transparent">
            Flowio
          </span>
        </h2>
        <p className="text-center text-sm text-white/60 mb-6">
          Flow through projects effortlessly and smarter with AI-tools
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="h-13.5 rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 px-4 flex items-center gap-3 transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,.18)] focus-within:border-[#6eb5ff] focus-within:shadow-[0_0_18px_rgba(95,150,255,.25)]">
            <FaEnvelope className="text-[#ffffff]" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              disabled={loading}
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
            />
          </label>

          <label className="h-13.5 rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 px-4 flex items-center gap-3 transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,.18)] focus-within:border-[#6eb5ff] focus-within:shadow-[0_0_18px_rgba(95,150,255,.25)]">
            <FaKey className="text-[#ffffff]" />
            <input
              type={showPass ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              disabled={loading}
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-white/40 hover:text-[#78aaff] transition"
            >
              {showPass ? <IoEyeOff /> : <IoEye />}
            </button>
          </label>

          <div className="flex items-center justify-between text-xs text-white/55">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />

              <span
                className="
      relative
      h-6
      w-11
      rounded-full
      bg-[#D7D9E2]
      transition-all
      duration-300
      peer-checked:bg-[#5089D6]

      after:absolute
      after:left-[3px]
      after:top-1/2
      after:h-5
      after:w-5
      after:-translate-y-1/2
      after:rounded-full
      after:bg-white
      after:shadow-md
      after:transition-all
      after:duration-300

      peer-checked:after:translate-x-5
    "
              />

              <span className="text-sm text-white/70">Remember me</span>
            </label>

           <button
  type="button"
  onClick={() => navigate("/forgot-password")}
  className="text-white/55 transition hover:text-[#64CFFF]"
>
  Forgot password?
</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-[#5089D6] font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => setShowGooglePopup(true)}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-[#242279] text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <FcGoogle className="text-xl" />
              Sign in with google
            </span>
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-5">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-[#82b6ff] cursor-pointer font-bold"
          >
            Sign up
          </span>
        </p>
      </div>

      {showGooglePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-[420px] rounded-[26px] border border-blue-300/15 bg-[#0b1246] p-5 text-center shadow-[0_0_40px_rgba(70,120,255,.3)] sm:p-8">
            <h3 className="text-2xl font-bold mb-2">Sign in with Google</h3>

            <p className="text-sm text-white/65 mb-5">
              Continue to Flowio using your Google account
            </p>

            <label className="mb-5 h-12 rounded-2xl border border-[#243d93]/40 bg-[#141f6d] px-4 flex items-center gap-3 transition-all duration-300 focus-within:border-[#6eb5ff] focus-within:shadow-[0_0_18px_rgba(95,150,255,.25)]">
              <FaEnvelope className="text-[#78aaff]" />

              <input
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="Enter your Gmail"
                disabled={loading}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowGooglePopup(false);
                  setGoogleEmail("");
                }}
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSubmit}
                className="flex-1 h-11 rounded-xl bg-[#5089D6] font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
