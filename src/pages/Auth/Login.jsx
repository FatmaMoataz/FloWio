import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../../assets/logo.svg";
import axios from "axios";

const BACKEND_URL = "https://flowio-backend.vercel.app";

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
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
        message: "Hi there, we're absolutely thrilled to have you here. Let's start managing your workflows perfectly!",
        type: "welcome",
        is_read: false,
        createdAt: new Date().toISOString(),
        path: "/dashboard",
        isLocal: true,
      };
      localStorage.setItem("local_notifications", JSON.stringify([welcomeNotif]));

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_left,rgba(0,40,170,.48),transparent_35%),linear-gradient(90deg,#02030f,#07144a_55%,#05060f)] flex items-center justify-center p-8 text-white">
      <div className="w-[460px] rounded-[32px] bg-[#081142]/90 border border-blue-300/15 p-8 shadow-[0_0_60px_rgba(30,60,180,.25)]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src={logo}
            alt="Flowio"
            className="w-14 h-14 rounded-2xl object-cover"
          />
          <h1 className="text-5xl font-extrabold bg-linear-to-r from-white via-[#82b6ff] to-[#4e7dff] bg-clip-text text-transparent">
            Flowio
          </h1>
        </div>

        <h2 className="text-center text-2xl font-bold mb-3">Welcome back</h2>
        <p className="text-center text-sm text-white/60 mb-6">
          Login to continue managing your projects with Flowio
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="h-13.5 rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 px-4 flex items-center gap-3 transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,.18)] focus-within:border-[#6eb5ff] focus-within:shadow-[0_0_18px_rgba(95,150,255,.25)]">
            <FaEnvelope className="text-[#78aaff]" />
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
            <FaKey className="text-[#78aaff]" />
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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-linear-to-r from-sky-400 to-indigo-500 font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-5">
          Don&apos;t have an account? {" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-[#82b6ff] cursor-pointer font-bold"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}