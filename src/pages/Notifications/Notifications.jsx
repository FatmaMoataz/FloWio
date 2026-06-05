import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import MainLayout from "../../layout/MainLayout";
import notificationService from "../../services/notificationService";
import {
  FaSearch,
  FaBell,
  FaCheckCircle,
  FaTasks,
  FaUsers,
  FaLaptopCode,
  FaTrash,
  FaEye,
  FaCheck,
} from "react-icons/fa";

const typeStyle = {
  system: {
    icon: <FaBell />,
    color: "from-[#6eb5ff] to-[#5b7dff]",
  },
  task_assigned: {
    icon: <FaTasks />,
    color: "from-[#ffb86b] to-[#ff7b54]",
  },
  task_updated: {
    icon: <FaTasks />,
    color: "from-[#ffb86b] to-[#ff7b54]",
  },
  comment: {
    icon: <FaCheckCircle />,
    color: "from-[#5fffd0] to-[#35b7ff]",
  },
  like: {
    icon: <FaUsers />,
    color: "from-[#ff5ea8] to-[#ff3d7f]",
  },
  mention: {
    icon: <FaUsers />,
    color: "from-[#ff5ea8] to-[#ff3d7f]",
  },
  polls: {
    icon: <FaLaptopCode />,
    color: "from-[#8f7cff] to-[#5b7dff]",
  },
};

// دالة مساعدة لتحديد القسم بناءً على التاريخ
const getNotificationSection = (dateString) => {
  if (!dateString) return "Older";
  const notifDate = new Date(dateString);
  const today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (notifDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (notifDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return "Older";
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.warning("User not authenticated. Please login again.");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const decoded = jwtDecode(token);
        const realUserId = decoded._id;

        if (!realUserId) {
          toast.error("Invalid token payload. User ID not found.");
          setLoading(false);
          return;
        }

        const data = await notificationService.getUserNotifications(realUserId);

        const transformedNotifications = (data.notifications || []).map(
          (notif) => {
            const safeType = (notif.type || "system").toLowerCase();
            return {
              id: notif._id,
              title: notif.title || "No Title",
              desc: notif.message || "",
              type: typeStyle[safeType] ? safeType : "system",
              read: notif.is_read || false,
              time: notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
              section: getNotificationSection(notif.createdAt), //  تم التعديل هنا
            };
          }
        );

        setNotifications(transformedNotifications);
      } catch (error) {
        console.error("Fetch notifications error:", error);
        toast.error(error.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const filtered = notifications.filter((item) => {
    const matchSearch = `${item.title} ${item.desc}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ||
      (filter === "Unread" && !item.read) ||
      (filter === "Read" && item.read);

    return matchSearch && matchFilter;
  });

  const sectionsToRender = ["Today", "Yesterday", "Older"];
  
  const grouped = {
    Today: filtered.filter((item) => item.section === "Today"),
    Yesterday: filtered.filter((item) => item.section === "Yesterday"),
    Older: filtered.filter((item) => item.section === "Older"),
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(filtered.map((item) => item.id));
  };

  const markSelectedRead = async () => {
    try {
      await Promise.all(
        selected.map((id) => notificationService.markAsRead(id))
      );

      setNotifications((prev) =>
        prev.map((item) =>
          selected.includes(item.id) ? { ...item, read: true } : item
        )
      );
      setSelected([]);
      toast.success("Marked as read");
    } catch (error) {
      console.error("Mark as read error:", error);
      toast.error(error.message || "Failed to mark notifications as read");
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(
        selected.map((id) => notificationService.deleteNotification(id))
      );

      setNotifications((prev) =>
        prev.filter((item) => !selected.includes(item.id))
      );
      setSelected([]);
      toast.success("Notifications deleted");
    } catch (error) {
      console.error("Delete notifications error:", error);
      toast.error(error.message || "Failed to delete notifications");
    }
  };

  const markOneRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    } catch (error) {
      console.error("Mark as read error:", error);
      toast.error(error.message || "Failed to mark as read");
    }
  };

  return (
    <MainLayout title="Notifications">
      <div className="h-full min-h-0 text-white">
        <div className="flex h-full min-h-0 flex-col rounded-[28px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 p-6 shadow-[0_22px_55px_rgba(0,0,0,.30)]">
          {/* TOP TOOLS */}
          <div className="mb-5 flex items-center justify-between gap-5">
            <div className="flex h-11 w-[360px] items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
              <FaSearch className="text-xs text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={selectAll}
                className="h-10 rounded-full bg-blue-400/15 px-4 text-xs font-bold text-[#78aaff] transition hover:bg-blue-400/25"
              >
                Select All
              </button>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-10 rounded-full border border-blue-300/10 bg-[#141d66] px-4 text-xs font-bold text-white outline-none"
              >
                <option value="All">All</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
              </select>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="mb-5 flex items-center justify-between rounded-[20px] border border-blue-300/10 bg-[#10184c]/90 px-5 py-3">
              <span className="text-xs text-white/60">
                {selected.length} notification selected
              </span>

              <div className="flex gap-3">
                <button
                  onClick={markSelectedRead}
                  className="flex h-9 items-center gap-2 rounded-full bg-blue-400/15 px-4 text-xs font-bold text-[#78aaff] hover:bg-blue-400/25"
                >
                  <FaCheck /> Mark read
                </button>

                <button
                  onClick={deleteSelected}
                  className="flex h-9 items-center gap-2 rounded-full bg-red-400/15 px-4 text-xs font-bold text-[#ff6b8a] hover:bg-red-400/25"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          )}

          {/* LIST */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center text-white/60">
                  <div className="mb-4 text-sm">Loading notifications...</div>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[18px] bg-[#10184c]/60 p-4 text-xs text-white/35">
                No notifications found.
              </div>
            ) : (
              sectionsToRender.map((section) => {
                const sectionItems = grouped[section] || [];
                if (sectionItems.length === 0) return null;

                return (
                  <div key={section} className="mb-7">
                    <div className="mb-3 flex items-center gap-4">
                      <span className="text-[12px] font-bold text-white/45">
                        {section}
                      </span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="space-y-4">
                      {sectionItems.map((item) => {
                        const style = typeStyle[item.type] || typeStyle.system;
                        const isSelected = selected.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            className={`grid min-h-18.5 grid-cols-[28px_46px_1fr_110px_95px] items-center gap-4 rounded-[22px] border px-4 py-3 transition-all duration-300 ${
                              isSelected
                                ? "border-blue-300/30 bg-gradient-to-r from-[#1c2a87]/95 to-[#141f69]/95 shadow-[0_0_22px_rgba(95,150,255,.22)]"
                                : "border-white/5 bg-[#10184c]/80 hover:-translate-y-1 hover:bg-[#151f62]"
                            }`}
                          >
                            <button
                              onClick={() => toggleSelect(item.id)}
                              className={`flex h-4 w-4 items-center justify-center rounded border ${
                                isSelected
                                  ? "border-transparent bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff]"
                                  : "border-white/35"
                              }`}
                            >
                              {isSelected && <FaCheck className="text-[8px]" />}
                            </button>

                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b ${style.color} text-white shadow-[0_0_18px_rgba(95,150,255,.25)]`}
                            >
                              {style.icon}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-[13px] font-bold">
                                  {item.title}
                                </h3>

                                {!item.read && (
                                  <span className="h-2 w-2 rounded-full bg-[#6eb5ff]" />
                                )}
                              </div>

                              <p className="mt-1 text-[11px] text-white/55">
                                {item.desc}
                              </p>
                            </div>

                            <span className="text-[10px] text-white/40">
                              {item.time}
                            </span>

                            <button
                              onClick={() => markOneRead(item.id)}
                              className="flex h-9 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-[11px] font-bold text-white shadow-[0_0_15px_rgba(95,150,255,.25)] transition hover:brightness-110"
                            >
                              <FaEye />
                              Details
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}