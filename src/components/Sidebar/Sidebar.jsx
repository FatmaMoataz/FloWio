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

export default function Sidebar() {
  return (
    <aside
      className="flowio-sidebar
      w-full
      h-auto
      shrink-0
      rounded-[20px]
      bg-[#0f1437]/90
      border
      border-white/5
      flex
      flex-row
      items-center
      justify-between
      gap-2
      overflow-x-auto
      px-3
      py-3
      lg:h-full
      lg:w-[92px]
      lg:flex-col
      lg:overflow-visible
      lg:rounded-[28px]
      lg:px-0
      lg:py-5
      "
    >
      {/* LOGO */}

      <NavLink
        to="/dashboard"
        className="
        w-11
        h-11
        rounded-[14px]
        overflow-hidden
        bg-[#05091f]
        border
        border-blue-300/20
        shadow-[0_0_18px_rgba(60,100,255,.18)]
        flex
        items-center
        justify-center
        lg:h-14
        lg:w-14
        lg:rounded-[18px]
        "
      >
        <img
          src={logo}
          alt="Flowio"
          className="w-[120%] h-[120%] object-cover"
        />
      </NavLink>

      {/* NAVIGATION */}

      <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-2 lg:flex-col lg:gap-7">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={link.label}
            className={({ isActive }) =>
              `
              w-10
              h-10
              shrink-0
              rounded-[13px]
              flex
              items-center
              justify-center
              text-[17px]
              transition-all
              duration-300
              sm:w-11
              sm:h-11
              lg:w-12
              lg:h-12
              lg:rounded-[16px]
              lg:text-[20px]
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
          w-10
          h-10
          shrink-0
          rounded-[13px]
          flex
          items-center
          justify-center
          text-[17px]
          transition-all
          duration-300
          sm:w-11
          sm:h-11
          lg:w-12
          lg:h-12
          lg:rounded-[16px]
          lg:text-[20px]
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
