import { useState } from "react";
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
} from "react-icons/fa";

const Toggle = ({ checked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative h-7 w-12 rounded-full transition-all duration-300 ${
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

export default function SecuritySettings() {
  const savedSecurity = JSON.parse(
    localStorage.getItem("flowio-security") || "{}"
  );

  const [twoFA, setTwoFA] = useState(savedSecurity.twoFA || false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [reportDownloaded, setReportDownloaded] = useState(false);

  const [show, setShow] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

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

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2300);
  };

  const passwordStrength = () => {
    const password = passwords.newPassword;

    if (!password) {
      return { label: "Empty", width: "0%", color: "bg-white/10" };
    }

    if (password.length < 6) {
      return { label: "Weak", width: "35%", color: "bg-red-400" };
    }

    if (password.length < 10) {
      return { label: "Medium", width: "65%", color: "bg-yellow-400" };
    }

    return { label: "Strong", width: "100%", color: "bg-emerald-400" };
  };

  const strength = passwordStrength();

  const updatePassword = (field, value) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSecurity = () => {
    if (passwords.current || passwords.newPassword || passwords.confirm) {
      if (!passwords.current) {
        showMessage("Please enter your current password");
        return;
      }

      if (!passwords.newPassword) {
        showMessage("Please enter your new password");
        return;
      }

      if (passwords.newPassword.length < 6) {
        showMessage("Password must be at least 6 characters");
        return;
      }

      if (passwords.newPassword !== passwords.confirm) {
        showMessage("New password and confirm password do not match");
        return;
      }
    }

    localStorage.setItem(
      "flowio-security",
      JSON.stringify({
        twoFA,
        passwordUpdated: !!passwords.newPassword,
      })
    );

    setPasswords({
      current: "",
      newPassword: "",
      confirm: "",
    });

    setSaved(true);
    showMessage("Security settings saved successfully");
    setTimeout(() => setSaved(false), 2200);
  };

  const logoutDevice = (id) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id && !session.current
          ? {
              ...session,
              active: false,
              status: "Logged Out",
              time: "Just now",
            }
          : session
      )
    );

    showMessage("Device logged out successfully");
  };

  const logoutAllDevices = () => {
    setSessions((prev) =>
      prev.map((session) =>
        session.current
          ? session
          : {
              ...session,
              active: false,
              status: "Logged Out",
              time: "Just now",
            }
      )
    );

    showMessage("All other devices logged out");
  };

  const downloadReport = () => {
    const report = `
Flowio Security Report

Two-Factor Authentication: ${twoFA ? "Enabled" : "Disabled"}

Devices:
${sessions
  .map(
    (s) =>
      `- ${s.device} | ${s.browser} | ${s.location} | ${s.status} | ${s.time}`
  )
  .join("\n")}
`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "flowio-security-report.txt";
    link.click();

    URL.revokeObjectURL(url);

    setReportDownloaded(true);
    showMessage("Security report downloaded");
    setTimeout(() => setReportDownloaded(false), 2200);
  };

 const renderPasswordInput = (label, field, placeholder) => (
  <div>
    <p className="mb-2 text-[12px] font-bold text-white/70">{label}</p>

    <div className="flex h-12 items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#0b1246]/85 px-4 transition focus-within:border-[#6eb5ff]/50 focus-within:shadow-[0_0_18px_rgba(95,150,255,.18)]">
      <FaLock className="text-[#78aaff]" />

      <input
        type={show[field] ? "text" : "password"}
        value={passwords[field]}
        onChange={(e) =>
          setPasswords((prev) => ({
            ...prev,
            [field]: e.target.value,
          }))
        }
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
      />

      <button
        type="button"
        onClick={() =>
          setShow((prev) => ({
            ...prev,
            [field]: !prev[field],
          }))
        }
        className="text-white/40 transition hover:text-[#78aaff]"
      >
        {show[field] ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  </div>
);

  return (
    <div className="animate-[fadeUp_.35s_ease] space-y-6 pb-4">
      {message && (
        <div className="fixed right-8 top-8 z-[9999] rounded-[18px] border border-blue-300/15 bg-[#10184c] px-5 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(0,0,0,.45)]">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_.85fr] lg:gap-6">
        <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-blue-400/15 text-[#78aaff]">
              <FaLock />
            </span>

            <div>
              <h3 className="text-[17px] font-bold">Password Security</h3>
              <p className="text-[11px] text-white/45">
                Update your password and protect your account.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
          {renderPasswordInput("Current Password", "current", "Enter current password")}

{renderPasswordInput("New Password", "newPassword", "Enter new password")}

{renderPasswordInput("Confirm Password", "confirm", "Confirm new password")}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] text-white/45">
                Password Strength
              </span>

              <span className="text-[11px] font-bold text-[#78aaff]">
                {strength.label}
              </span>
            </div>

            <div className="h-[7px] overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-[18px] border border-blue-300/10 bg-[#0b1246]/60 p-4">
            <FaInfoCircle className="mt-0.5 text-[#78aaff]" />
            <p className="text-[11px] leading-relaxed text-white/50">
              Use at least 6 characters. A stronger password should include
              letters, numbers and symbols.
            </p>
          </div>
        </div>

        <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-blue-400/15 text-[#78aaff]">
              <FaShieldAlt />
            </span>

            <div>
              <h3 className="text-[17px] font-bold">Two-Factor Auth</h3>
              <p className="text-[11px] text-white/45">
                Add an extra login verification step.
              </p>
            </div>
          </div>

          <div className="rounded-[22px] bg-[#0b1246]/80 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold">2FA Protection</h4>
                <p className="mt-1 text-[11px] text-white/45">
                  Require a security code when signing in.
                </p>
              </div>

              <Toggle
                checked={twoFA}
                onClick={() => {
                  setTwoFA((prev) => !prev);
                  showMessage(
                    !twoFA
                      ? "Two-factor authentication enabled"
                      : "Two-factor authentication disabled"
                  );
                }}
              />
            </div>

            <div
              className={`rounded-[16px] px-4 py-3 text-[11px] transition ${
                twoFA
                  ? "bg-emerald-400/10 text-[#5fffd0]"
                  : "bg-yellow-400/10 text-yellow-300"
              }`}
            >
              {twoFA
                ? "Two-factor authentication is currently enabled."
                : "Two-factor authentication is currently disabled."}
            </div>
          </div>

          <div className="mt-5 rounded-[22px] bg-[#0b1246]/70 p-5">
            <h4 className="mb-2 text-[13px] font-bold">Security Tip</h4>
            <p className="text-[11px] leading-relaxed text-white/50">
              Avoid sharing your credentials. Flowio will never ask for your
              password outside the official login screen.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:bg-[#141f69]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold">Device Login History</h3>
            <p className="mt-1 text-[11px] text-white/45">
              Review active sessions and recent login activity.
            </p>
          </div>

          <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
            {sessions.filter((s) => s.active).length} Active
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

              <p className="mt-1 text-[11px] text-white/45">
                {session.location}
              </p>

              <p className="mt-3 text-[10px] font-bold text-[#78aaff]">
                {session.time}
              </p>

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
                  <>
                    <FaCheck /> Current Device
                  </>
                ) : session.active ? (
                  <>
                    <FaSignOutAlt /> Logout
                  </>
                ) : (
                  <>
                    <FaTimes /> Logged Out
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-5 shadow-[0_18px_40px_rgba(0,0,0,.18)]">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={logoutAllDevices}
            className="flex h-11 items-center gap-2 rounded-[16px] bg-red-400/15 px-5 text-sm font-bold text-[#ff6b8a] transition hover:bg-red-400/25"
          >
            <FaSignOutAlt />
            Logout All Devices
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

        <button
          type="button"
          onClick={saveSecurity}
          className={`flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-[16px] text-sm font-bold transition-all duration-300 ${
            saved
              ? "bg-emerald-400/20 text-[#5fffd0]"
              : "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_20px_rgba(95,150,255,.30)] hover:-translate-y-1 hover:brightness-110"
          }`}
        >
          {saved ? (
            <>
              <FaCheck /> Saved
            </>
          ) : (
            <>
              <FaSave /> Save Security
            </>
          )}
        </button>
      </div>
    </div>
  );
}
