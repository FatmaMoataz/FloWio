import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

import {
  FaVideo,
  FaCheckCircle,
  FaTasks,
  FaComments,
  FaClock,
  FaEnvelope,
  FaChevronLeft,
  FaSearch,
  FaTrash,
  FaCheck,
  FaLayerGroup,
} from "react-icons/fa";

export default function RecentActivity() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [items, setItems] = useState([
    {
      id: 1,
      title: "John Sent You an invitation To Join Meeting",
      desc: "You have a new invitation to join the Flowio meeting.",
      time: "2 min ago",
      action: "Accept",
      icon: <FaEnvelope />,
      color: "from-[#ff5ea8] to-[#ff3d7f]",
      checked: false,
      link: "/meetings",
      status: "new",
    },
    {
      id: 2,
      title: "Meeting With Sarah",
      desc: "Meeting summary is ready to view.",
      time: "20 min ago",
      action: "Summary",
      icon: <FaVideo />,
      color: "from-[#ffd166] to-[#ffb703]",
      checked: false,
      link: "/summary",
      status: "new",
    },
    {
      id: 3,
      title: "Task Completed",
      desc: "A project task has been marked as completed.",
      time: "30/1",
      action: "Details",
      icon: <FaCheckCircle />,
      color: "from-[#d8deea] to-[#9ca8bd]",
      checked: false,
      link: "/projects",
      status: "normal",
    },
    {
      id: 4,
      title: "Client Meeting Q1",
      desc: "Client meeting notes are available now.",
      time: "40 min ago",
      action: "Summary",
      icon: <FaComments />,
      color: "from-[#5fffd0] to-[#35b7ff]",
      checked: false,
      link: "/summary",
      status: "normal",
    },
    {
      id: 5,
      title: "Reminder for your meetings",
      desc: "You have a meeting reminder scheduled.",
      time: "9 min ago",
      action: "Details",
      icon: <FaClock />,
      color: "from-[#ffb86b] to-[#ff7b54]",
      checked: false,
      link: "/notifications",
      status: "new",
    },
    {
      id: 6,
      title: "Task Completed",
      desc: "Omar finished the frontend integration task.",
      time: "12h ago",
      action: "Details",
      icon: <FaTasks />,
      color: "from-[#d8deea] to-[#9ca8bd]",
      checked: false,
      link: "/projects",
      status: "normal",
    },
  ]);

  const filteredItems = items.filter((item) =>
    `${item.title} ${item.desc} ${item.action}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const selectedCount = items.filter((item) => item.checked).length;
  const allSelected = items.length > 0 && items.every((item) => item.checked);

  const toggle = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const selectAll = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        checked: !allSelected,
      })),
    );
    setOpen(false);
  };

  const deleteSelected = () => {
    setItems((prev) => prev.filter((item) => !item.checked));
    setOpen(false);
  };

  const acceptInvitation = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              action: "Open Meeting",
              status: "accepted",
              checked: false,
              color: "from-[#5fffd0] to-[#35b7ff]",
              icon: <FaCheckCircle />,
            }
          : item,
      ),
    );
  };

  const actionClass = (item) => {
    if (item.status === "accepted") {
      return "bg-emerald-400/15 text-[#5fffd0] hover:bg-emerald-400/25";
    }

    if (item.action === "Accept") {
      return "bg-gradient-to-r from-[#5fffd0] to-[#35b7ff] text-white shadow-[0_0_18px_rgba(95,255,208,.20)] hover:brightness-110";
    }

    if (item.action === "Summary") {
      return "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.25)] hover:brightness-110";
    }

    return "bg-blue-400/15 text-[#78aaff] hover:bg-blue-400/25";
  };

  const handleAction = (item) => {
    if (item.action === "Accept") {
      acceptInvitation(item.id);
      setTimeout(() => navigate("/meetings"), 400);
      return;
    }

    if (item.status === "accepted") {
      navigate("/meetings");
      return;
    }

    navigate(item.link);
  };

  const cardClass =
    "relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-[#16206d]/95 to-[#0d1448]/95 shadow-[0_22px_55px_rgba(0,0,0,.30)]";

  return (
    <MainLayout>
      <div className="min-h-0 text-white lg:h-full lg:overflow-hidden">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-cyan-300"
            >
              <FaChevronLeft />
            </button>

            <span className="text-[13px] text-white/45">Profile</span>
            <span className="text-white/35">›</span>

            <h2 className="text-[24px] font-extrabold tracking-[-0.4px]">
              Recent Activity
            </h2>
          </div>

          <div className="flex h-11 w-full max-w-[310px] items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
            <FaSearch className="text-xs text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
            />
          </div>
        </div>

        <div className={`${cardClass} flex flex-col p-4 sm:p-7 lg:h-[calc(100%-58px)]`}>
          <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative z-20 mb-5 flex items-center justify-between">
            <div className="flex gap-3">
              <div className="rounded-[20px] bg-[#10184c]/80 px-4 py-3">
                <p className="text-[10px] text-white/45">Activities</p>
                <h4 className="mt-1 text-[16px] font-bold">{items.length}</h4>
              </div>

              <div className="rounded-[20px] bg-[#10184c]/80 px-4 py-3">
                <p className="text-[10px] text-white/45">Selected</p>
                <h4 className="mt-1 text-[16px] font-bold">{selectedCount}</h4>
              </div>

              <div className="rounded-[20px] bg-[#10184c]/80 px-4 py-3">
                <p className="text-[10px] text-white/45">New</p>
                <h4 className="mt-1 text-[16px] font-bold">
                  {items.filter((item) => item.status === "new").length}
                </h4>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] px-5 text-[12px] font-bold text-white transition hover:brightness-110"
              >
                <FaLayerGroup />
                Actions ▾
              </button>

              {open && (
                <div className="absolute right-0 top-12 z-50 w-[165px] rounded-2xl border border-white/10 bg-[#0b1246] p-2 shadow-[0_18px_40px_rgba(0,0,0,.35)]">
                  <button
                    onClick={selectAll}
                    className="mb-2 flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-semibold text-white transition hover:bg-blue-300/15"
                  >
                    <FaCheck />
                    {allSelected ? "Unselect All" : "Select All"}
                  </button>

                  <button
                    onClick={deleteSelected}
                    disabled={selectedCount === 0}
                    className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-semibold text-[#ff6b8a] transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto pr-3">
            {filteredItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-400/15 text-[#78aaff]">
                  <FaLayerGroup />
                </div>

                <h3 className="text-lg font-bold">No Recent Activities</h3>

                <p className="mt-2 max-w-[300px] text-xs leading-relaxed text-white/45">
                  Everything is up to date. Try searching with another keyword.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onDoubleClick={() => handleAction(item)}
                  className={`mb-4 grid min-h-[78px] cursor-pointer grid-cols-[34px_44px_1fr] items-center gap-3 rounded-[20px] border px-3 py-3 shadow-[0_12px_28px_rgba(0,0,0,.20)] transition-all duration-300 hover:-translate-y-[2px] sm:grid-cols-[34px_48px_1fr_110px_110px] sm:gap-5 sm:rounded-[24px] sm:px-5 ${
                    item.checked
                      ? "border-blue-300/25 bg-gradient-to-r from-[#1c2a87]/95 to-[#141f69]/95"
                      : "border-white/5 bg-[#11194c]/92 hover:bg-[#162061]"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(item.id);
                    }}
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition ${
                      item.checked
                        ? "border-transparent bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff]"
                        : "border-white/30 hover:border-[#6eb5ff]"
                    }`}
                  >
                    {item.checked && <FaCheck className="text-[8px]" />}
                  </button>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b ${item.color} text-white shadow-[0_0_18px_rgba(255,255,255,.10)]`}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-[13px] font-bold tracking-[-0.1px]">
                        {item.title}
                      </h4>

                      {item.status === "new" && (
                        <span className="rounded-full bg-blue-400/15 px-2 py-0.5 text-[8px] font-bold text-[#78aaff]">
                          NEW
                        </span>
                      )}

                      {item.status === "accepted" && (
                        <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[8px] font-bold text-[#5fffd0]">
                          ACCEPTED
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-[11px] text-white/55">
                      {item.desc}
                    </p>
                  </div>

                  <span className="text-center text-[11px] text-white/45">
                    {item.time}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(item);
                    }}
                    className={`flex h-9 items-center justify-center rounded-full text-[12px] font-bold transition ${actionClass(item)}`}
                  >
                    {item.action}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}