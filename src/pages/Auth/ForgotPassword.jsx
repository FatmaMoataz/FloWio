import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEnvelope,
  FaShieldAlt,
  FaKey,
  FaCheck,
} from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../../assets/logo.svg";
import authService from "../../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  // Step 1: request an OTP by email
  const sendCode = async (e) => {
    e?.preventDefault();

    if (!email) {
      toast.warning("Please enter your email");
      return;
    }

    if (!emailValid) {
      toast.warning("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setStep(2);
      toast.success(res.message || "Verification code sent! Check your inbox.");
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the OTP the user received by email
  const verifyCode = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.warning("Please enter the verification code");
      return;
    }

    if (otp.length !== 6) {
      toast.warning("The code must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      await authService.verifyOtp(email, otp);
      toast.success("Code verified successfully");
      setStep(3);
    } catch (err) {
      toast.error(err.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: set the new password (otp is re-checked server-side here too)
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
      const res = await authService.resetPassword(email, otp, password);

      if (res.data?.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        localStorage.setItem("userId", res.data.user._id);
      }

      toast.success("Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          {step === 1 && "Forgot Password?"}
          {step === 2 && "Verify Your Code"}
          {step === 3 && "Reset Password"}
        </h2>

        <p className="mb-6 text-center text-sm text-white/60">
          {step === 1 &&
            "Enter your email and we will send you a verification code."}
          {step === 2 && `We sent a 6-digit code to ${email}`}
          {step === 3 && "Create a new secure password for your account."}
        </p>

        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`h-2.5 rounded-full transition-all ${
                step >= item ? "w-8 bg-[#64CFFF]" : "w-2.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={sendCode} className="space-y-4">
            <AuthInput
              icon={<FaEnvelope />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-[#5089D6] font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyCode} className="space-y-4">
            <AuthInput
              icon={<FaShieldAlt />}
              value={otp}
              onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-[#5089D6] font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={sendCode}
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-[#242279] text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Resending..." : "Resend Code"}
            </button>
          </form>
        )}

        {step === 3 && (
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
        )}

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