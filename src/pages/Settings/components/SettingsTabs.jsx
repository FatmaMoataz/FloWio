import { useState } from "react";
import { FaSlidersH, FaShieldAlt, FaUserCircle, FaSearch } from "react-icons/fa";

import GeneralSettings from "./GeneralSettings";
import SecuritySettings from "./SecuritySettings";
import AccountSettings from "./AccountSettings";

const tabs = [
  { id: "general", label: "General", icon: <FaSlidersH /> },
  { id: "security", label: "Security", icon: <FaShieldAlt /> },
  { id: "account", label: "Account", icon: <FaUserCircle /> },
];

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <div className="mb-8 flex items-start justify-between gap-8">
        <div>
          <h2 className="text-[25px] font-extrabold tracking-[-0.4px]">
            Settings
          </h2>
          <p className="mt-2 text-[12px] text-white/45">
            Manage your preferences, security and account details.
          </p>
        </div>

        <div className="flex h-11 w-full max-w-[300px] items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
          <FaSearch className="text-xs text-white/40" />
          <input
            placeholder="Search settings..."
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
          />
        </div>
      </div>

      <div className="mb-8 flex gap-7 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2.5 px-1 pb-4 text-[14px] font-bold transition ${
              activeTab === tab.id
                ? "text-[#82b6ff]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <span className="text-[14px]">{tab.icon}</span>
            {tab.label}

            {activeTab === tab.id && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff]" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "security" && <SecuritySettings />}
        {activeTab === "account" && <AccountSettings />}
      </div>
    </div>
  );
}
