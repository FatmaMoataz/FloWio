import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaKey,
  FaBuilding,
  FaRegUser,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../../assets/logo.svg";
import axios from "axios";

const BACKEND_URL = "https://flowio-backend.vercel.app";

export default function Signup() {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [open, setOpen] = useState(null);
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: "",
  });

  const setField = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const saveWelcomeNotification = (name) => {
    const welcomeNotif = {
      id: "welcome_" + Date.now(),
      title: "Welcome to Flowio! 🚀",
      message: `Hi ${name || "there"}, we're absolutely thrilled to have you here. Let's start managing your workflows perfectly!`,
      type: "welcome",
      is_read: false,
      createdAt: new Date().toISOString(),
      path: "/dashboard",
      isLocal: true,
    };
    localStorage.setItem("local_notifications", JSON.stringify([welcomeNotif]));
  };

  const inputStyle =
    "h-13.5 rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 px-4 flex items-center gap-3 transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,.18)] focus-within:border-[#6eb5ff] focus-within:shadow-[0_0_18px_rgba(95,150,255,.25)]";

  const inputClass =
    "w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.warning("Please fill all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        company: form.company,
        role: form.role,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data._id) {
        localStorage.setItem("userId", response.data._id);
      }

      toast.success("Account created successfully!");

      // حفظ إشعار الترحيب المحلي الموحد بالاسم المكتوب
      saveWelcomeNotification(form.fullName);

      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong during signup.",
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

      // حفظ إشعار الترحيب لليوزر الجديد المسجل بجوجل
      saveWelcomeNotification("");

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

  const Dropdown = ({ type, icon, placeholder, items }) => (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(open === type ? null : type)}
        className="w-full h-13.5 rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 px-4 flex items-center gap-3 text-white transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,.18)] hover:border-[#6eb5ff]/50"
      >
        <span className="text-[#ffffff]">{icon}</span>

        <span
          className={`text-sm font-semibold ${
            form[type] ? "text-white" : "text-white/40"
          }`}
        >
          {form[type] || placeholder}
        </span>

        <span className="ml-auto text-xs text-white/50">▾</span>
      </button>

      {open === type && (
        <div className="absolute left-0 top-15.5 z-50 w-full rounded-2xl border border-[#243d93]/40 bg-[#0b1246] p-2 shadow-[0_12px_30px_rgba(0,0,0,.45)]">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setField(type, item);
                setOpen(null);
              }}
              className="w-full h-10 rounded-xl px-3 text-left text-sm text-white hover:bg-blue-300/15"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_left,rgba(0,40,170,.48),transparent_35%),linear-gradient(90deg,#02030f,#07144a_55%,#05060f)] flex items-center justify-center p-8 text-white">
      <div className="w-115 rounded-4xl bg-[#081142]/90 border border-blue-300/15 p-8 shadow-[0_0_60px_rgba(30,60,180,.25)]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src={logo}
            alt="Flowio"
            className="w-14 h-14 rounded-2xl object-cover"
          />

          <h1 className="text-5xl font-extrabold bg-linear-to-b from-[#4F58AF] to-[#64CFFF] bg-clip-text text-transparent">
            Flowio
          </h1>
        </div>

        <h2 className="text-center text-2xl font-bold">
          Welcome to{" "}
          <span className="bg-linear-to-b from-[#4F58AF] to-[#64CFFF] bg-clip-text text-transparent">
            Flowio
          </span>
        </h2>

        <p className="text-center text-sm text-white/60 mt-2 mb-6">
          Flow through projects effortlessly and smarter with AI tools
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className={inputStyle}>
            <FaUser className="text-[#ffffff]" />

            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="Full Name..."
              className={inputClass}
            />
          </label>

          <label className={inputStyle}>
            <FaEnvelope className="text-[#ffffff]" />

            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Work Email..."
              className={inputClass}
            />
          </label>

          <label className={inputStyle}>
            <FaKey className="text-[#ffffff]" />

            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder="Enter password..."
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-white/40 hover:text-[#78aaff] transition"
            >
              {showPass ? <IoEyeOff /> : <IoEye />}
            </button>
          </label>

          <label className={inputStyle}>
            <FaKey className="text-[#ffffff]" />

            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              placeholder="Confirm password..."
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-white/40 hover:text-[#78aaff] transition"
            >
              {showConfirm ? <IoEyeOff /> : <IoEye />}
            </button>
          </label>

          <div className="flex gap-4">
            <Dropdown
              type="company"
              icon={<FaBuilding />}
              placeholder="Company"
              items={["Startup", "Agency", "Enterprise"]}
            />

            <Dropdown
              type="role"
              icon={<FaRegUser />}
              placeholder="Role"
              items={[
                "system-admin",
                "project-manager",
                "founder",
                "team-member",
              ]}
            />
          </div>

          <button className="w-full h-12 rounded-2xl bg-[#5089D6] font-bold hover:brightness-110 transition">
            Create Account
          </button>

          <button
            type="button"
            onClick={() => setShowGooglePopup(true)}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-[#242279] text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <FcGoogle className="text-xl" />
              Continue with Google
            </span>
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-5">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#82b6ff] cursor-pointer font-bold"
          >
            Login
          </span>
        </p>
      </div>

      {showGooglePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-105 rounded-[26px] bg-[#0b1246] border border-blue-300/15 p-8 text-center shadow-[0_0_40px_rgba(70,120,255,.3)]">
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
                className="flex-1 h-11 rounded-xl bg-linear-to-r from-sky-400 to-indigo-500 font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
