import { NavLink } from "react-router-dom";
import {
  FaBriefcase,
  FaClipboardList,
  FaUser,
  FaUsers,
  FaComments,
  FaCog,
} from "react-icons/fa";

import logo from "../../assets/logo.svg";

const links = [
  {
    to: "/dashboard",
    icon: <FaBriefcase />,
    label: "Dashboard",
  },
  {
    to: "/projects",
    icon: <FaClipboardList />,
    label: "Projects",
  },
  {
    to: "/profile",
    icon: <FaUser />,
    label: "Profile",
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

export default function Sidebar() {
  return (
    <aside
      className="
      w-[92px]
      h-full
      shrink-0
      rounded-[28px]
      bg-[#0f1437]/90
      border
      border-white/5
      flex
      flex-col
      items-center
      justify-between
      py-5
      "
    >
      {/* LOGO */}

      <NavLink
        to="/dashboard"
        className="
        w-14
        h-14
        rounded-[18px]
        overflow-hidden
        bg-[#05091f]
        border
        border-blue-300/20
        shadow-[0_0_18px_rgba(60,100,255,.18)]
        flex
        items-center
        justify-center
        "
      >
        <img
          src={logo}
          alt="Flowio"
          className="w-[120%] h-[120%] object-cover"
        />
      </NavLink>

      {/* NAVIGATION */}

      <nav className="flex flex-col gap-7">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={link.label}
            className={({ isActive }) =>
              `
              w-12
              h-12
              rounded-[16px]
              flex
              items-center
              justify-center
              text-[20px]
              transition-all
              duration-300
              ${
                isActive
                  ? "bg-blue-300/15 text-[#7db6ff] shadow-[0_0_20px_rgba(110,181,255,.25)] scale-105"
                  : "text-white/70 hover:bg-blue-300/10 hover:text-[#7db6ff] hover:scale-105"
              }
            `
            }
          >
            {link.icon}
          </NavLink>
        ))}
      </nav>

      {/* SETTINGS */}

      <NavLink
        to="/settings"
        title="Settings"
        className={({ isActive }) =>
          `
          w-12
          h-12
          rounded-[16px]
          flex
          items-center
          justify-center
          text-[20px]
          transition-all
          duration-300
          ${
            isActive
              ? "bg-blue-300/15 text-[#7db6ff] shadow-[0_0_20px_rgba(110,181,255,.25)] scale-105"
              : "text-white/70 hover:bg-blue-300/10 hover:text-[#7db6ff] hover:scale-105"
          }
        `
        }
      >
        <FaCog />
      </NavLink>
    </aside>
  );
}
