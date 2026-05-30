import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaKey,
  FaBuilding,
  FaRegUser,
} from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../../assets/logo.svg";

export default function Signup() {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [open, setOpen] = useState(null);
  const [google, setGoogle] = useState(false);
  const [gmail, setGmail] = useState("");

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

  const inputStyle =
    "h-[54px] rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 px-4 flex items-center gap-3 transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,.18)] focus-within:border-[#6eb5ff] focus-within:shadow-[0_0_18px_rgba(95,150,255,.25)]";

  const inputClass =
    "w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35";

  const submit = (e) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    navigate("/dashboard");
  };

  const Dropdown = ({ type, icon, placeholder, items }) => (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(open === type ? null : type)}
        className="w-full h-[54px] rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 px-4 flex items-center gap-3 text-white transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,.18)] hover:border-[#6eb5ff]/50"
      >
        <span className="text-[#78aaff]">{icon}</span>

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
        <div className="absolute left-0 top-[62px] z-50 w-full rounded-2xl border border-[#243d93]/40 bg-[#0b1246] p-2 shadow-[0_12px_30px_rgba(0,0,0,.45)]">
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
      <div className="w-[460px] rounded-[32px] bg-[#081142]/90 border border-blue-300/15 p-8 shadow-[0_0_60px_rgba(30,60,180,.25)]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src={logo}
            alt="Flowio"
            className="w-14 h-14 rounded-2xl object-cover"
          />

          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white via-[#82b6ff] to-[#4e7dff] bg-clip-text text-transparent">
            Flowio
          </h1>
        </div>

        <h2 className="text-center text-2xl font-bold">
          Welcome to <span className="text-[#82b6ff]">Flowio</span>
        </h2>

        <p className="text-center text-sm text-white/60 mt-2 mb-6">
          Flow through projects effortlessly and smarter with AI tools
        </p>

        <form onSubmit={submit} className="space-y-4">
          <label className={inputStyle}>
            <FaUser className="text-[#78aaff]" />

            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="Full Name..."
              className={inputClass}
            />
          </label>

          <label className={inputStyle}>
            <FaEnvelope className="text-[#78aaff]" />

            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Work Email..."
              className={inputClass}
            />
          </label>

          <label className={inputStyle}>
            <FaKey className="text-[#78aaff]" />

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
            <FaKey className="text-[#78aaff]" />

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
              items={["Designer", "Developer", "Manager"]}
            />
          </div>

          <button className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 font-bold hover:brightness-110 transition">
            Create Account
          </button>

          <button
            type="button"
            onClick={() => setGoogle(true)}
            className="w-full h-12 rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 text-white font-semibold transition-all duration-300 hover:border-[#6eb5ff] hover:bg-[#101a63]"
          >
            Continue with Google
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

      {google && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-[420px] rounded-[26px] bg-[#0b1246] border border-blue-300/15 p-8 text-center shadow-[0_0_40px_rgba(70,120,255,.3)]">
            <h3 className="text-2xl font-bold mb-2">
              Sign in with Google
            </h3>

            <p className="text-sm text-white/65 mb-5">
              Continue to Flowio using your Google account
            </p>

            <label className="mb-5 h-12 rounded-2xl border border-[#243d93]/40 bg-[#141f6d] px-4 flex items-center gap-3 transition-all duration-300 focus-within:border-[#6eb5ff] focus-within:shadow-[0_0_18px_rgba(95,150,255,.25)]">
              <FaEnvelope className="text-[#78aaff]" />

              <input
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Enter your Gmail"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setGoogle(false)}
                className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/15 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!gmail) {
                    alert("Please enter your Gmail");
                    return;
                  }

                  navigate("/dashboard");
                }}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 font-bold hover:brightness-110 transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}