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
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-start md:justify-between md:gap-8">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-[-0.4px] sm:text-[25px]">
            Settings
          </h2>
          <p className="mt-2 text-[12px] text-white/45">
            Manage your preferences, security and account details.
          </p>
        </div>

        <div className="flex h-11 w-full items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4 md:max-w-[300px]">
          <FaSearch className="text-xs text-white/40" />
          <input
            placeholder="Search settings..."
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2 border-b border-white/10 sm:mb-8 sm:flex sm:gap-7">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center justify-center gap-2 rounded-t-xl px-2 pb-4 pt-2 text-[12px] font-bold transition sm:justify-start sm:px-1 sm:pt-0 sm:text-[14px] ${
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

      <div className="min-h-0 flex-1 overflow-visible pr-0 md:overflow-y-auto md:pr-2">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "security" && <SecuritySettings />}
        {activeTab === "account" && <AccountSettings />}
      </div>
    </div>
  );
}
