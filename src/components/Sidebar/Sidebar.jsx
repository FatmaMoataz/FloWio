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

  return (
    <aside
      className={`flowio-sidebar flex shrink-0 border border-white/5 bg-[#0f1437]/90 ${
        isMobile
          ? "h-full w-full flex-col gap-4 overflow-y-auto rounded-[24px] px-4 py-5"
          : "hidden h-full w-[94px] flex-col items-center justify-between gap-2 overflow-visible rounded-[28px] py-5 md:flex"
      }`}
    >
      {/* LOGO */}
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        className="h-13 w-13 overflow-hidden rounded-[17px] border border-blue-300/20 bg-[#05091f]
          shadow-[0_0_18px_rgba(60,100,255,.18)] flex items-center justify-center
          lg:h-14 lg:w-14 lg:rounded-[18px]"
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
            : "w-full flex-col items-center justify-center gap-7"
        }`}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `
              relative h-11 shrink-0 rounded-[13px] flex items-center transition-all duration-300
              ${
                isMobile
                  ? "w-full justify-start gap-3 px-4 text-sm font-semibold"
                  : "w-12 justify-center"
              }
              text-[17px] md:h-12 md:rounded-[16px] md:text-[20px]
              ${
                isActive
                  ? "bg-blue-300/15 text-[#7db6ff] shadow-[0_0_20px_rgba(110,181,255,.25)] scale-105"
                  : "text-white/70 hover:bg-blue-300/10 hover:text-[#7db6ff] hover:scale-105"
              }
            `
            }
          >
            {link.icon}
            {isMobile && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* SETTINGS */}
      <NavLink
        to="/settings"
        onClick={onNavigate}
        className={({ isActive }) =>
          `
          relative h-10 shrink-0 rounded-[13px] flex items-center transition-all duration-300
          ${
            isMobile
              ? "w-full justify-start gap-3 px-4 text-sm font-semibold"
              : "w-12 justify-center"
          }
          text-[17px] md:h-12 md:rounded-[16px] md:text-[20px]
          ${
            isActive
              ? "bg-blue-300/15 text-[#7db6ff] shadow-[0_0_20px_rgba(110,181,255,.25)] scale-105"
              : "text-white/70 hover:bg-blue-300/10 hover:text-[#7db6ff] hover:scale-105"
          }
        `
        }
      >
        <FaCog />
        {isMobile && <span>Settings</span>}
      </NavLink>
    </aside>
  );
}
