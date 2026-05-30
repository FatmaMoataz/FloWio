import { useState } from "react";
import { FaBell } from "react-icons/fa";
import NotificationsOverlay from "../NotificationsOverlay/NotificationsOverlay";

export default function Topbar({ title }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between mb-7">
      <h1 className="text-white text-[42px] font-extrabold tracking-[-1px] leading-none">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="w-[230px] h-[46px] rounded-[16px] bg-[#141d66]/90 border border-blue-300/10 px-5 flex items-center">
          <input placeholder="Search..." className="bg-transparent outline-none text-white text-sm placeholder:text-white/35 w-full" />
        </div>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="w-[46px] h-[46px] rounded-[16px] bg-[#141d66]/90 border border-blue-300/10 text-white flex items-center justify-center hover:brightness-125 transition"><FaBell /></button>
          {open && <NotificationsOverlay onClose={() => setOpen(false)} />}
        </div>
      </div>
    </div>
  );
}
