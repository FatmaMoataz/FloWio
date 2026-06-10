import { useState } from "react";
import {
  FaSearch,
  FaUsers,
  FaUserTie,
  FaUserGraduate,
  FaUserAstronaut,
  FaUserNinja,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

const people = [
  { id: 2, name: "Hamza Iqbal", role: "AI Engineer", online: true, icon: <FaUserTie />, color: "from-[#ffb86b] to-[#ff7b54]" },
  { id: 3, name: "Sara Javed", role: "UI Designer", online: false, icon: <FaUserGraduate />, color: "from-[#ff5ea8] to-[#ff3d7f]" },
  { id: 4, name: "Ayesha Noor", role: "Frontend Developer", online: true, icon: <FaUserAstronaut />, color: "from-[#5fffd0] to-[#35b7ff]" },
  { id: 5, name: "Omar Khaled", role: "Project Manager", online: false, icon: <FaUserNinja />, color: "from-[#ffd166] to-[#ffb703]" },
];

function MiniAvatar({ icon, color, online }) {
  return (
    <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b ${color} text-white`}>
      {icon}
      <span className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#0c144a] ${online ? "bg-[#37e783]" : "bg-white/70"}`} />
    </div>
  );
}

export default function NewChatOverlay({ onClose, onCreate }) {
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState([]);

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (person) => {
    setSelected((prev) =>
      prev.some((p) => p.id === person.id)
        ? prev.filter((p) => p.id !== person.id)
        : [...prev, person]
    );
  };

  const startOnePersonChat = (person) => {
    onCreate({
      name: person.name,
      online: person.online,
      icon: person.icon,
      color: person.color,
      pinned: false,
    });
  };

  const createGroup = () => {
    if (!groupName.trim() || selected.length < 2) return;

    onCreate({
      name: groupName.trim(),
      online: true,
      icon: <FaUsers />,
      color: "from-[#6eb5ff] to-[#5b7dff]",
      pinned: false,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(110,181,255,.18),transparent_35%),linear-gradient(180deg,rgba(18,24,76,.98),rgba(8,13,44,.98))] p-4 text-white shadow-[0_25px_80px_rgba(0,0,0,.65)] sm:rounded-[28px] sm:p-5">
        
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">New Chat</h3>
            <p className="mt-1 text-[11px] text-white/50">
              Select people to start chat or create a group.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4 flex h-11 items-center rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
          <FaSearch className="text-xs text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="ml-3 w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
          />
        </div>

        <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
          {filteredPeople.map((person) => {
            const isSelected = selected.some((p) => p.id === person.id);

            return (
              <div
                key={person.id}
                className={`flex items-center gap-3 rounded-[18px] p-3 transition ${
                  isSelected
                    ? "border border-blue-300/20 bg-gradient-to-r from-[#1c2a87]/95 to-[#141f69]/95"
                    : "bg-[#10184c]/90 hover:bg-[#151f62]"
                }`}
              >
                <button onClick={() => toggleSelect(person)}>
                  <MiniAvatar icon={person.icon} color={person.color} online={person.online} />
                </button>

                <button
                  onClick={() => startOnePersonChat(person)}
                  className="min-w-0 flex-1 text-left"
                >
                  <h4 className="text-[13px] font-bold">{person.name}</h4>
                  <p className="mt-1 text-[11px] text-white/45">{person.role}</p>
                </button>

                <button
                  onClick={() => toggleSelect(person)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-transparent bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff]"
                      : "border-white/20"
                  }`}
                >
                  {isSelected && <FaCheck className="text-[10px]" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-[20px] border border-white/10 bg-[#10184c]/80 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FaUsers className="text-[#6eb5ff]" />
            <h4 className="text-sm font-bold">Create Group</h4>
            <span className="ml-auto text-[11px] text-white/45">
              {selected.length} selected
            </span>
          </div>

          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name..."
            className="mb-3 h-10 w-full rounded-[14px] border border-blue-300/10 bg-[#141d66]/90 px-4 text-xs text-white outline-none placeholder:text-white/35"
          />

          <button
            onClick={createGroup}
            disabled={!groupName.trim() || selected.length < 2}
            className={`h-10 w-full rounded-[14px] text-xs font-bold transition ${
              groupName.trim() && selected.length >= 2
                ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white hover:brightness-110"
                : "bg-white/10 text-white/35 cursor-not-allowed"
            }`}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
