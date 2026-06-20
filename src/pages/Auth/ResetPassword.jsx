import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaKey,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../../assets/logo.svg";
import authService from "../../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.warning("Please fill all password fields");
      return;
    }

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword(resetToken, password);

      if (res.data?.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        localStorage.setItem("userId", res.data.user._id);
      }

      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  // No token in the URL at all -> don't even show the form.
  if (!resetToken) {
    return (
      <div className="flowio-auth-page flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_left,rgba(0,40,170,.48),transparent_35%),linear-gradient(90deg,#02030f,#07144a_55%,#05060f)] p-3 text-white sm:p-6 lg:p-8">
        <div className="flowio-auth-card w-full max-w-[460px] rounded-[24px] border border-blue-300/15 bg-[#081142]/90 p-5 text-center shadow-[0_0_60px_rgba(30,60,180,.25)] sm:rounded-[32px] sm:p-8">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-3xl text-red-400">
              <FaExclamationTriangle />
            </div>
          </div>
          <h2 className="mb-3 text-2xl font-bold">Invalid Reset Link</h2>
          <p className="mb-6 text-sm text-white/60">
            This password reset link is missing or invalid. Please request a
            new one.
          </p>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="h-12 w-full rounded-2xl bg-[#5089D6] font-bold transition hover:brightness-110"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flowio-auth-page flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_left,rgba(0,40,170,.48),transparent_35%),linear-gradient(90deg,#02030f,#07144a_55%,#05060f)] p-3 text-white sm:p-6 lg:p-8">
      <div className="flowio-auth-card w-full max-w-[460px] rounded-[24px] border border-blue-300/15 bg-[#081142]/90 p-5 shadow-[0_0_60px_rgba(30,60,180,.25)] sm:rounded-[32px] sm:p-8">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mb-5 flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-[#64CFFF]"
        >
          <FaArrowLeft />
          Back to Login
        </button>

        <div className="mb-4 flex items-center justify-center gap-3">
          <img
            src={logo}
            alt="Flowio"
            className="h-14 w-14 rounded-2xl object-cover"
          />
          <h1 className="bg-linear-to-b from-[#4F58AF] to-[#64CFFF] bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
            Flowio
          </h1>
        </div>

        <h2 className="mb-3 text-center text-2xl font-bold">
          Reset Password
        </h2>
        <p className="mb-6 text-center text-sm text-white/60">
          Create a new secure password for your account.
        </p>

        <form onSubmit={resetPassword} className="space-y-4">
          <AuthInput
            icon={<FaKey />}
            type={showPass ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="New Password"
            disabled={loading}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-white/40 transition hover:text-[#78aaff]"
              >
                {showPass ? <IoEyeOff /> : <IoEye />}
              </button>
            }
          />

          <AuthInput
            icon={<FaCheck />}
            type={showConfirmPass ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm Password"
            disabled={loading}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="text-white/40 transition hover:text-[#78aaff]"
              >
                {showConfirmPass ? <IoEyeOff /> : <IoEye />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-[#5089D6] font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-white/60">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer font-bold text-[#82b6ff]"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

function AuthInput({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  disabled = false,
  rightIcon,
}) {
  return (
    <label className="flex h-13.5 items-center gap-3 rounded-2xl border border-[#243d93]/40 bg-[#0b1246]/95 px-4 shadow-[0_10px_25px_rgba(0,0,0,.18)] transition-all duration-300 focus-within:border-[#6eb5ff] focus-within:shadow-[0_0_18px_rgba(95,150,255,.25)]">
      <span className="text-white">{icon}</span>

      <input
        type={type}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {rightIcon}
    </label>
  );
}