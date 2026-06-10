import { useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import NotificationsOverlay from "../NotificationsOverlay/NotificationsOverlay";

export default function Topbar({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
}) {
  const [open, setOpen] = useState(false);
  const hasSearchHandler = typeof onSearchChange === "function";

  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="text-white text-[34px] font-extrabold leading-none">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="w-[300px] h-10 rounded-[14px] bg-[#141d66]/90 border border-blue-300/10 px-4 flex items-center gap-3">
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
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="w-10 h-10 rounded-[14px] bg-[#141d66]/90 border border-blue-300/10 text-white flex items-center justify-center hover:brightness-125 transition"><FaBell /></button>
          {open && <NotificationsOverlay onClose={() => setOpen(false)} />}
        </div>
      </div>
    </div>
  );
}
