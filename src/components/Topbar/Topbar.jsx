import { useState } from "react";
import { FaBars, FaBell, FaSearch } from "react-icons/fa";
import NotificationsOverlay from "../NotificationsOverlay/NotificationsOverlay";

export default function Topbar({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = true,
  onMenuClick,
}) {
  const [open, setOpen] = useState(false);
  const hasSearchHandler = typeof onSearchChange === "function";

  return (
    <div className={`mb-5 flex gap-3 sm:flex-row sm:items-center sm:justify-between ${showSearch ? "flex-col" : "flex-row items-center justify-between"}`}>
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flowio-topbar-control flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-blue-300/10 bg-[#141d66]/90 text-white transition hover:brightness-125 md:hidden"
            aria-label="Open navigation menu"
          >
            <FaBars />
          </button>
        )}
        <h1 className="min-w-0 truncate text-[26px] font-extrabold leading-none text-white sm:text-[30px] lg:text-[34px]">{title}</h1>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {showSearch && (
          <div className="flowio-topbar-control flex h-10 min-w-0 flex-1 items-center gap-3 rounded-[14px] border border-blue-300/10 bg-[#141d66]/90 px-4 sm:w-[260px] sm:flex-none lg:w-[300px]">
            <FaSearch className="text-sm text-white/35" />
            <input
              value={hasSearchHandler ? searchValue : undefined}
              onChange={
                hasSearchHandler
                  ? (event) => onSearchChange(event.target.value)
                  : undefined
              }
              placeholder={searchPlaceholder}
              className="bg-transparent outline-none text-white text-sm placeholder:text-white/35 w-full"
            />
          </div>
        )}
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flowio-topbar-control flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-blue-300/10 bg-[#141d66]/90 text-white transition hover:brightness-125"><FaBell /></button>
          {open && <NotificationsOverlay onClose={() => setOpen(false)} />}
        </div>
      </div>
    </div>
  );
}
