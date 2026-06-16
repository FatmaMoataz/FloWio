import { useState, useEffect, useCallback } from "react";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaLaptop,
  FaMobileAlt,
  FaChrome,
  FaSignOutAlt,
  FaDownload,
  FaCheck,
  FaSave,
  FaTimes,
  FaInfoCircle,
  FaSpinner,
} from "react-icons/fa";

// ─── API helpers ──────────────────────────────────────────────────────────────
const API_BASE = "https://flowio-backend.vercel.app/api";

function getAuthHeaders() {
  const token =
    localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const Toggle = ({ checked, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`relative h-7 w-12 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
      checked ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff]" : "bg-white/15"
    }`}
  >
    <span
      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
        checked ? "left-6" : "left-1"
      }`}
    />
  </button>
);

const Toast = ({ message, type = "info" }) => {
  if (!message) return null;
  const colors = {
    info: "border-blue-300/15 bg-[#10184c]",
    success: "border-emerald-400/20 bg-[#0d2b1f]",
    error: "border-red-400/20 bg-[#2b0d0d]",
  };
  return (
    <div
      className={`fixed right-8 top-8 z-[9999] rounded-[18px] border px-5 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(0,0,0,.45)] ${colors[type]}`}
    >
      {message}
    </div>
  );
};

// ─── Password strength ────────────────────────────────────────────────────────
function passwordStrength(password) {
  if (!password) return { label: "Empty", width: "0%", color: "bg-white/10" };
  if (password.length < 6) return { label: "Weak", width: "35%", color: "bg-red-400" };
  if (password.length < 10) return { label: "Medium", width: "65%", color: "bg-yellow-400" };
  return { label: "Strong", width: "100%", color: "bg-emerald-400" };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SecuritySettings() {
  // ── Toast state ──
  const [toast, setToast] = useState({ message: "", type: "info" });
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "info" }), 2500);
  }, []);

  // ── Password form ──
  const [passwords, setPasswords] = useState({ current: "", newPassword: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPassword: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // ── 2FA ──
  const [twoFA, setTwoFA] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  // ── Sessions ──
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Windows PC",
      browser: "Chrome Browser",
      location: "Alexandria, Egypt",
      time: "Current Device",
      icon: <FaLaptop />,
      status: "Active",
      active: true,
      current: true,
    },
    {
      id: 2,
      device: "MacBook Pro",
      browser: "Safari Browser",
      location: "Cairo, Egypt",
      time: "Yesterday, 8:30 PM",
      icon: <FaLaptop />,
      status: "Logged Out",
      active: false,
      current: false,
    },
    {
      id: 3,
      device: "Samsung A56",
      browser: "Mobile Chrome",
      location: "Alexandria, Egypt",
      time: "3 days ago",
      icon: <FaMobileAlt />,
      status: "Active",
      active: true,
      current: false,
    },
  ]);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);

  // ── Load 2FA preference from localStorage (backend can store it in user model later) ──
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("flowio-security") || "{}");
    if (saved.twoFA !== undefined) setTwoFA(saved.twoFA);
  }, []);

  // ── Password change — calls PUT /api/users/me/password ──
  const handleSavePassword = async () => {
    if (!passwords.current && !passwords.newPassword && !passwords.confirm) {
      showToast("No password changes to save", "info");
      return;
    }

    if (!passwords.current) return showToast("Please enter your current password", "error");
    if (!passwords.newPassword) return showToast("Please enter a new password", "error");
    if (passwords.newPassword.length < 6) return showToast("Password must be at least 6 characters", "error");
    if (passwords.newPassword !== passwords.confirm) return showToast("Passwords do not match", "error");

    setPasswordLoading(true);
    try {
      await apiRequest("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirm,
        }),
      });

      setPasswords({ current: "", newPassword: "", confirm: "" });
      setPasswordSaved(true);
      showToast("Password updated successfully", "success");
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      showToast(err.message || "Failed to update password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── 2FA toggle — persists locally; swap for a real endpoint when available ──
  const handleToggle2FA = async () => {
    setTwoFALoading(true);
    try {
      const next = !twoFA;
      // Replace this block with a real API call when your backend exposes one:
      // await apiRequest("/users/me/2fa", { method: "PUT", body: JSON.stringify({ enabled: next }) });
      await new Promise((r) => setTimeout(r, 400)); // simulated latency
      setTwoFA(next);
      localStorage.setItem("flowio-security", JSON.stringify({ twoFA: next }));
      showToast(
        next ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
        next ? "success" : "info"
      );
    } catch (err) {
      showToast("Failed to update 2FA setting", "error");
    } finally {
      setTwoFALoading(false);
    }
  };

  // ── Logout single device (optimistic UI; real endpoint: POST /api/auth/logout) ──
  const logoutDevice = (id) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id && !s.current
          ? { ...s, active: false, status: "Logged Out", time: "Just now" }
          : s
      )
    );
    showToast("Device logged out successfully", "success");
  };

  // ── Logout all devices — calls POST /api/auth/logout-all ──
  const logoutAllDevices = async () => {
    setLogoutAllLoading(true);
    try {
      await apiRequest("/auth/logout-all", { method: "POST" });
      setSessions((prev) =>
        prev.map((s) =>
          s.current ? s : { ...s, active: false, status: "Logged Out", time: "Just now" }
        )
      );
      showToast("All other devices logged out", "success");
    } catch (err) {
      showToast(err.message || "Failed to logout all devices", "error");
    } finally {
      setLogoutAllLoading(false);
    }
  };

  // ── Download security report ──
  const downloadReport = () => {
    const report = `Flowio Security Report\n\nTwo-Factor Authentication: ${twoFA ? "Enabled" : "Disabled"}\n\nDevices:\n${sessions
      .map((s) => `- ${s.device} | ${s.browser} | ${s.location} | ${s.status} | ${s.time}`)
      .join("\n")}`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flowio-security-report.txt";
    link.click();
    URL.revokeObjectURL(url);

    setReportDownloaded(true);
    showToast("Security report downloaded", "success");
    setTimeout(() => setReportDownloaded(false), 2500);
  };

  // ── Password input renderer ──
  const renderPasswordInput = (label, field, placeholder) => (
    <div>
      <p className="mb-2 text-[12px] font-bold text-white/70">{label}</p>
      <div className="flex h-12 items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#0b1246]/85 px-4 transition focus-within:border-[#6eb5ff]/50 focus-within:shadow-[0_0_18px_rgba(95,150,255,.18)]">
        <FaLock className="text-[#78aaff]" />
        <input
          type={show[field] ? "text" : "password"}
          value={passwords[field]}
          onChange={(e) => setPasswords((prev) => ({ ...prev, [field]: e.target.value }))}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => ({ ...prev, [field]: !prev[field] }))}
          className="text-white/40 transition hover:text-[#78aaff]"
        >
          {show[field] ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );

  const strength = passwordStrength(passwords.newPassword);
  const activeSessions = sessions.filter((s) => s.active).length;

  return (
    <div className="animate-[fadeUp_.35s_ease] space-y-6 pb-4">
      <Toast message={toast.message} type={toast.type} />

      {/* ── Top row: Password + 2FA ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_.85fr] lg:gap-6">

        {/* Password card */}
        <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-blue-400/15 text-[#78aaff]">
              <FaLock />
            </span>
            <div>
              <h3 className="text-[17px] font-bold">Password Security</h3>
              <p className="text-[11px] text-white/45">Update your password and protect your account.</p>
            </div>
          </div>

          <div className="grid gap-4">
            {renderPasswordInput("Current Password", "current", "Enter current password")}
            {renderPasswordInput("New Password", "newPassword", "Enter new password")}
            {renderPasswordInput("Confirm Password", "confirm", "Confirm new password")}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] text-white/45">Password Strength</span>
              <span className="text-[11px] font-bold text-[#78aaff]">{strength.label}</span>
            </div>
            <div className="h-[7px] overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-[18px] border border-blue-300/10 bg-[#0b1246]/60 p-4">
            <FaInfoCircle className="mt-0.5 shrink-0 text-[#78aaff]" />
            <p className="text-[11px] leading-relaxed text-white/50">
              Use at least 6 characters. A stronger password should include letters, numbers, and symbols.
            </p>
          </div>

          {/* Save password button inside the card */}
          <button
            type="button"
            onClick={handleSavePassword}
            disabled={passwordLoading}
            className={`mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[16px] text-sm font-bold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
              passwordSaved
                ? "bg-emerald-400/20 text-[#5fffd0]"
                : "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_20px_rgba(95,150,255,.30)] hover:-translate-y-1 hover:brightness-110"
            }`}
          >
            {passwordLoading ? (
              <><FaSpinner className="animate-spin" /> Saving…</>
            ) : passwordSaved ? (
              <><FaCheck /> Saved</>
            ) : (
              <><FaSave /> Update Password</>
            )}
          </button>
        </div>

        {/* 2FA card */}
        <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-blue-400/15 text-[#78aaff]">
              <FaShieldAlt />
            </span>
            <div>
              <h3 className="text-[17px] font-bold">Two-Factor Auth</h3>
              <p className="text-[11px] text-white/45">Add an extra login verification step.</p>
            </div>
          </div>

          <div className="rounded-[22px] bg-[#0b1246]/80 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold">2FA Protection</h4>
                <p className="mt-1 text-[11px] text-white/45">Require a security code when signing in.</p>
              </div>
              <Toggle checked={twoFA} onClick={handleToggle2FA} disabled={twoFALoading} />
            </div>

            <div
              className={`rounded-[16px] px-4 py-3 text-[11px] transition ${
                twoFA ? "bg-emerald-400/10 text-[#5fffd0]" : "bg-yellow-400/10 text-yellow-300"
              }`}
            >
              {twoFALoading
                ? "Updating…"
                : twoFA
                ? "Two-factor authentication is currently enabled."
                : "Two-factor authentication is currently disabled."}
            </div>
          </div>

          <div className="mt-5 rounded-[22px] bg-[#0b1246]/70 p-5">
            <h4 className="mb-2 text-[13px] font-bold">Security Tip</h4>
            <p className="text-[11px] leading-relaxed text-white/50">
              Avoid sharing your credentials. Flowio will never ask for your password outside the official login screen.
            </p>
          </div>
        </div>
      </div>

      {/* ── Sessions ── */}
      <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:bg-[#141f69]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold">Device Login History</h3>
            <p className="mt-1 text-[11px] text-white/45">Review active sessions and recent login activity.</p>
          </div>
          <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
            {activeSessions} Active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-[22px] bg-[#0b1246]/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[#172371]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-400/15 text-[#78aaff]">
                  {session.icon}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[9px] font-bold ${
                    session.active
                      ? "bg-emerald-400/10 text-[#5fffd0]"
                      : "bg-red-400/10 text-[#ff6b8a]"
                  }`}
                >
                  {session.status}
                </span>
              </div>

              <h4 className="text-[13px] font-bold">{session.device}</h4>
              <p className="mt-1 flex items-center gap-2 text-[11px] text-white/45">
                <FaChrome /> {session.browser}
              </p>
              <p className="mt-1 text-[11px] text-white/45">{session.location}</p>
              <p className="mt-3 text-[10px] font-bold text-[#78aaff]">{session.time}</p>

              <button
                type="button"
                disabled={session.current || !session.active}
                onClick={() => logoutDevice(session.id)}
                className={`mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-[14px] text-[11px] font-bold transition ${
                  session.current
                    ? "cursor-not-allowed bg-white/10 text-white/35"
                    : session.active
                    ? "bg-red-400/15 text-[#ff6b8a] hover:bg-red-400/25"
                    : "cursor-not-allowed bg-white/10 text-white/35"
                }`}
              >
                {session.current ? (
                  <><FaCheck /> Current Device</>
                ) : session.active ? (
                  <><FaSignOutAlt /> Logout</>
                ) : (
                  <><FaTimes /> Logged Out</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="flex items-center justify-between rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-5 shadow-[0_18px_40px_rgba(0,0,0,.18)]">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={logoutAllDevices}
            disabled={logoutAllLoading}
            className="flex h-11 items-center gap-2 rounded-[16px] bg-red-400/15 px-5 text-sm font-bold text-[#ff6b8a] transition hover:bg-red-400/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {logoutAllLoading ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />}
            {logoutAllLoading ? "Logging out…" : "Logout All Devices"}
          </button>

          <button
            type="button"
            onClick={downloadReport}
            className={`flex h-11 items-center gap-2 rounded-[16px] px-5 text-sm font-bold transition ${
              reportDownloaded
                ? "bg-emerald-400/20 text-[#5fffd0]"
                : "bg-blue-400/15 text-[#78aaff] hover:bg-blue-400/25"
            }`}
          >
            {reportDownloaded ? <FaCheck /> : <FaDownload />}
            {reportDownloaded ? "Downloaded" : "Download Report"}
          </button>
        </div>
      </div>
    </div>
  );
}