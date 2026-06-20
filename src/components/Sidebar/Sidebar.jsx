import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBriefcase,
  FaThLarge,
  FaUser,
  FaTasks,
  FaUsers,
  FaComments,
  FaCog,
} from "react-icons/fa";

import logo from "../../assets/logo.svg";

const links = [
  {
    to: "/dashboard",
    icon: <FaThLarge />,
    label: "Dashboard",
  },
  {
    to: "/projects",
    icon: <FaBriefcase />,
    label: "Projects",
  },
  {
    to: "/profile",
    icon: <FaUser />,
    label: "Profile",
  },
  {
    to: "/to-do",
    icon: <FaTasks />,
    label: "To-Do List",
  },
  {
    to: "/community",
    icon: <FaUsers />,
    label: "Community",
  },
  {
    to: "/chat",
    icon: <FaComments />,
    label: "Chat",
  },
];

export default function Sidebar({ onNavigate, variant = "desktop" }) {
  const isMobile = variant === "mobile";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      className={`flowio-sidebar flex shrink-0 border border-white/5 bg-[#0f1437]/90 ${
        isMobile
          ? "h-full w-full flex-col gap-4 overflow-y-auto rounded-[24px] px-4 py-5"
<<<<<<< HEAD
          : "hidden h-auto min-h-[calc(100vh-84px)] w-[92px] flex-col items-center justify-between gap-2 overflow-visible rounded-[28px] px-0 py-5 md:flex lg:h-full lg:min-h-0"
=======
          : `hidden h-full flex-col items-center justify-between gap-2 overflow-visible rounded-[24px] py-4 md:flex lg:rounded-[28px] lg:py-5 transition-all duration-300 ${
              isHovered ? "w-[200px]" : "w-[78px] lg:w-[92px]"
            }`
>>>>>>> 94e32e2dcdef66f4a1e71e4cd280b60790c7a1a0
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO */}
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        className={`
          w-11 h-11 rounded-[14px] overflow-hidden bg-[#05091f] border border-blue-300/20 
          shadow-[0_0_18px_rgba(60,100,255,.18)] flex items-center justify-center
          lg:h-14 lg:w-14 lg:rounded-[18px]
          ${!isMobile && isHovered ? "self-start ml-3" : ""}
          transition-all duration-300
        `}
      >
        <img
          src={logo}
          alt="Flowio"
          className="w-[120%] h-[120%] object-cover"
        />
      </NavLink>

      {/* NAVIGATION */}
      <nav
        className={`flex flex-1 ${
          isMobile
            ? "w-full flex-col gap-2"
            : "flex-col items-center justify-center gap-7 w-full"
        }`}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={link.label}
            onClick={onNavigate}
            className={({ isActive }) =>
              `
<<<<<<< HEAD
              h-11
              shrink-0
              rounded-[13px]
              flex
              items-center
              ${isMobile ? "w-full justify-start gap-3 px-4 text-sm font-semibold" : "w-12 justify-center"}
              text-[17px]
              transition-all
              duration-300
              md:h-12
              md:rounded-[16px]
              md:text-[20px]
=======
              h-11 shrink-0 rounded-[13px] flex items-center transition-all duration-300
              ${
                isMobile
                  ? "w-full justify-start gap-3 px-4 text-sm font-semibold"
                  : `${
                      isHovered
                        ? "w-full justify-start gap-3 px-4"
                        : "w-12 justify-center"
                    }`
              }
              text-[17px] md:h-11 md:rounded-[16px] md:text-[18px] lg:h-12 lg:text-[20px]
>>>>>>> 94e32e2dcdef66f4a1e71e4cd280b60790c7a1a0
              ${
                isActive
                  ? "bg-blue-300/15 text-[#7db6ff] shadow-[0_0_20px_rgba(110,181,255,.25)] scale-105"
                  : "text-white/70 hover:bg-blue-300/10 hover:text-[#7db6ff] hover:scale-105"
              }
            `
            }
          >
            {link.icon}
            {isHovered && !isMobile && (
              <span className="text-sm font-semibold whitespace-nowrap">
                {link.label}
              </span>
            )}
            {isMobile && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* SETTINGS */}
      <NavLink
        to="/settings"
        title="Settings"
        onClick={onNavigate}
        className={({ isActive }) =>
          `
<<<<<<< HEAD
          h-10
          ${isMobile ? "w-full justify-start gap-3 px-4 text-sm font-semibold" : "w-12 justify-center"}
          shrink-0
          rounded-[13px]
          flex
          items-center
          text-[17px]
          transition-all
          duration-300
          md:h-12
          md:w-12
          md:rounded-[16px]
          md:text-[20px]
=======
          h-10 shrink-0 rounded-[13px] flex items-center transition-all duration-300
          ${
            isMobile
              ? "w-full justify-start gap-3 px-4 text-sm font-semibold"
              : `${
                  isHovered
                    ? "w-full justify-start gap-3 px-4"
                    : "w-12 justify-center"
                }`
          }
          text-[17px] md:h-11 md:rounded-[16px] md:text-[18px] lg:h-12 lg:text-[20px]
>>>>>>> 94e32e2dcdef66f4a1e71e4cd280b60790c7a1a0
          ${
            isActive
              ? "bg-blue-300/15 text-[#7db6ff] shadow-[0_0_20px_rgba(110,181,255,.25)] scale-105"
              : "text-white/70 hover:bg-blue-300/10 hover:text-[#7db6ff] hover:scale-105"
          }
        `
        }
      >
        <FaCog />
        {isHovered && !isMobile && (
          <span className="text-sm font-semibold whitespace-nowrap">
            Settings
          </span>
        )}
        {isMobile && <span>Settings</span>}
      </NavLink>
    </aside>
  );
}