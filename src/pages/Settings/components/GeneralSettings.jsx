import { useState, useEffect } from "react";import {
  FaPalette,
  FaDesktop,
  FaBell,
  FaVolumeUp,
  FaRegChartBar,
  FaCalendarCheck,
  FaLinkedinIn,
  FaGithub,
  FaFacebookF,
  FaSave,
  FaCheck,
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

export default function GeneralSettings() {
  const savedData = JSON.parse(
    localStorage.getItem("flowio-general") || "{}"
  );

  const [mode, setMode] = useState(savedData.mode || "Dark");
  const [defaultPage, setDefaultPage] = useState(
    savedData.defaultPage || "Dashboard"
  );

  const [toggles, setToggles] = useState(
    savedData.toggles || {
      reports: true,
      sound: true,
      desktop: false,
      reminders: true,
    }
  );

  const [links, setLinks] = useState(
    savedData.links || {
      linkedin: "",
      github: "",
      facebook: "",
    }
  );

 const [saved, setSaved] = useState(false);

useEffect(() => {
  const savedTheme = localStorage.getItem("flowio-theme") || "Dark";
  applyTheme(savedTheme);
}, []);

const applyTheme = (theme) => {
  setMode(theme);
  localStorage.setItem("flowio-theme", theme);

  if (theme === "Light") {
    document.documentElement.classList.add("flowio-light");
  } else {
    document.documentElement.classList.remove("flowio-light");
  }
};

const updateToggle = (key) => {
  const updated = {
    ...toggles,
    [key]: !toggles[key],
  };

  setToggles(updated);
  localStorage.setItem(
    "flowio-notifications",
    JSON.stringify(updated)
  );
};
  
  const saveChanges = () => {
    localStorage.setItem(
      "flowio-general",
      JSON.stringify({
        mode,
        defaultPage,
        toggles,
        links,
      })
    );

    localStorage.setItem("flowio-theme", mode);
    localStorage.setItem("flowio-default-page", defaultPage);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2200);
  };

  return (
    <div className="animate-[fadeUp_.35s_ease] space-y-6 pb-4">
      <div className="grid grid-cols-2 gap-6">
        {/* THEME */}
        <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-400/15 text-[#78aaff]">
              <FaPalette />
            </span>

            <div>
              <h3 className="text-[16px] font-bold">
                Theme & Appearance
              </h3>

              <p className="text-[11px] text-white/45">
                Customize Flowio visual style.
              </p>
            </div>
          </div>

          <p className="mb-3 text-[12px] font-bold text-white/70">
            Mode
          </p>

          <div className="grid grid-cols-3 gap-3">
            {["Dark", "Light", "System"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  localStorage.setItem("flowio-theme", item);
                }}
                className={`h-10 rounded-[14px] text-xs font-bold transition-all duration-300 ${
                  mode === item
                    ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.28)]"
                    : "bg-[#0b1246]/80 text-white/55 hover:bg-[#172371] hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[18px] border border-blue-300/10 bg-[#0b1246]/70 p-4">
            <h4 className="mb-2 text-[13px] font-bold text-white">
              Current Theme
            </h4>

            <p className="text-[11px] leading-relaxed text-white/50">
              Flowio currently uses the official dark blue design system across
              all pages. Your selected mode is saved locally.
            </p>
          </div>
        </div>

        {/* APP PREFERENCES */}
        <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-400/15 text-[#78aaff]">
              <FaDesktop />
            </span>

            <div>
              <h3 className="text-[16px] font-bold">App Preferences</h3>

              <p className="text-[11px] text-white/45">
                Set your default workspace behavior.
              </p>
            </div>
          </div>

          <p className="mb-3 text-[12px] font-bold text-white/70">
            Default Screen
          </p>

          <div className="grid grid-cols-2 gap-3">
            {["Dashboard", "Projects", "Teams", "Chat", "Meetings"].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setDefaultPage(item);
                    localStorage.setItem("flowio-default-page", item);
                  }}
                  className={`h-11 rounded-[15px] text-xs font-bold transition-all duration-300 ${
                    defaultPage === item
                      ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.28)]"
                      : "bg-[#0b1246]/80 text-white/55 hover:bg-[#172371] hover:text-white"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <div className="mt-6 rounded-[18px] border border-blue-300/10 bg-[#0b1246]/70 p-4">
            <h4 className="mb-2 text-[13px] font-bold text-white">
              Selected Default
            </h4>

            <p className="text-[11px] leading-relaxed text-white/50">
              Flowio will remember your preferred start screen as{" "}
              <span className="font-bold text-[#78aaff]">
                {defaultPage}
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:bg-[#141f69]">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-400/15 text-[#78aaff]">
            <FaBell />
          </span>

          <div>
            <h3 className="text-[16px] font-bold">Notifications</h3>

            <p className="text-[11px] text-white/45">
              Choose which alerts you want to receive.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            [
              "reports",
              "Reports",
              "Enable reports notifications",
              <FaRegChartBar />,
            ],
            ["sound", "Sound", "Enable sound notifications", <FaVolumeUp />],
            ["desktop", "Desktop", "Receive desktop alerts", <FaDesktop />],
            ["reminders", "Meetings", "Meeting reminders", <FaCalendarCheck />],
          ].map(([key, title, desc, icon]) => (
            <div
              key={key}
              className="rounded-[20px] bg-[#0b1246]/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[#172371]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[#78aaff]">{icon}</span>

                <Toggle
                  checked={toggles[key]}
                  onClick={() => updateToggle(key)}
                />
              </div>

              <h4 className="text-[13px] font-bold">{title}</h4>

              <p className="mt-1 text-[10px] leading-relaxed text-white/45">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SOCIAL LINKS */}
      <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:bg-[#141f69]">
        <h3 className="mb-5 text-[16px] font-bold">Social Media Links</h3>

        <div className="grid grid-cols-3 gap-4">
          {[
            ["linkedin", <FaLinkedinIn />, "LinkedIn URL"],
            ["github", <FaGithub />, "GitHub URL"],
            ["facebook", <FaFacebookF />, "Facebook URL"],
          ].map(([key, icon, placeholder]) => (
            <label
              key={key}
              className="flex h-12 items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#0b1246]/85 px-4 transition focus-within:border-[#6eb5ff]/50 focus-within:shadow-[0_0_18px_rgba(95,150,255,.18)]"
            >
              <span className="text-[#78aaff]">{icon}</span>

              <input
                value={links[key]}
                onChange={(e) =>
                  setLinks({
                    ...links,
                    [key]: e.target.value,
                  })
                }
                placeholder={placeholder}
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
              />
            </label>
          ))}
        </div>
      </div>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveChanges}
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
              <FaSave /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}