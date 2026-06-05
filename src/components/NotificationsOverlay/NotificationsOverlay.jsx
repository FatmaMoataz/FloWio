import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import notificationService from "../../services/notificationService";
import {
  FaBell,
  FaCheckCircle,
  FaUsers,
  FaTasks,
  FaLaptopCode,
  FaRocket,
} from "react-icons/fa";

const typeStyle = {
  system: {
    icon: <FaBell />,
    color: "from-[#6eb5ff] to-[#5b7dff]",
  },
  welcome: {
    icon: <FaRocket />,
    color: "from-[#5fffd0] to-[#5b7dff] shadow-[0_0_15px_rgba(95,255,208,0.4)]",
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

const getNotificationSection = (dateString) => {
  if (!dateString) return "Older";
  const notifDate = new Date(dateString);
  const today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (notifDate.toDateString() === today.toDateString()) return "Today";
  if (notifDate.toDateString() === yesterday.toDateString()) return "Yesterday";
  return "Older";
};

export default function NotificationsOverlay({ onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const decoded = jwtDecode(token);
        const realUserId = decoded._id;

        if (!realUserId) return;

        // 1. جلب إشعارات السيرفر
        const data = await notificationService.getUserNotifications(realUserId);
        const serverNotifs = data.notifications || [];

        // 2. جلب الإشعارات المحلية المخزنة بالـ localStorage
        const localData = localStorage.getItem("local_notifications");
        const localNotifs = localData ? JSON.parse(localData) : [];

        // 3. دمجهم سوا
        const allNotifs = [...localNotifs, ...serverNotifs];

        const transformed = allNotifs.map((notif) => {
          const safeType = (notif.type || "system").toLowerCase();
          return {
            id: notif._id || notif.id,
            title: notif.title || "No Title",
            desc: notif.message || notif.desc || "",
            type: typeStyle[safeType] ? safeType : "system",
            read: notif.is_read !== undefined ? notif.is_read : notif.read || false,
            time: notif.createdAt
              ? new Date(notif.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just Now",
            section: getNotificationSection(notif.createdAt),
            path: notif.path || "/notifications",
            isLocal: notif.isLocal || false,
            rawCreatedAt: notif.createdAt,
          };
        });

        // ترتيب تنازلي عشان الأحدث يظهر فوق دايماً
        transformed.sort((a, b) => new Date(b.rawCreatedAt) - new Date(a.rawCreatedAt));

        setNotifications(transformed);
      } catch (error) {
        console.error("Overlay fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((item) => !item.read);
    if (unreadNotifications.length === 0) return;

    try {
      // تحديث إشعارات السيرفر الحقيقية
      const realUnread = unreadNotifications.filter(item => !item.isLocal);
      if (realUnread.length > 0) {
        await Promise.all(
          realUnread.map((item) => notificationService.markAsRead(item.id))
        );
      }

      // تحديث الإشعارات المحلية في الـ localStorage لتبدو كـ مقروءة
      const localData = localStorage.getItem("local_notifications");
      if (localData) {
        const updatedLocal = JSON.parse(localData).map(n => ({ ...n, is_read: true }));
        localStorage.setItem("local_notifications", JSON.stringify(updatedLocal));
      }

      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Mark all read error:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const openNotification = async (id, path, isLocal) => {
    try {
      if (isLocal) {
        // تحديث حالة الإشعار المحلي الفردي داخل الـ localStorage
        const localData = localStorage.getItem("local_notifications");
        if (localData) {
          const updatedLocal = JSON.parse(localData).map(n => 
            (n.id === id || n._id === id) ? { ...n, is_read: true } : n
          );
          localStorage.setItem("local_notifications", JSON.stringify(updatedLocal));
        }
      } else {
        await notificationService.markAsRead(id);
      }

      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }

    onClose?.();
    navigate(path);
  };

  const sectionsToRender = ["Today", "Yesterday", "Older"];
  const grouped = {
    Today: notifications.filter((item) => item.section === "Today"),
    Yesterday: notifications.filter((item) => item.section === "Yesterday"),
    Older: notifications.filter((item) => item.section === "Older"),
  };

  return (
    <div className="absolute right-0 top-[58px] z-[1000] w-[380px] overflow-hidden rounded-[30px] border border-blue-300/10 bg-gradient-to-b from-[#151f68]/98 to-[#0a113d]/98 shadow-[0_30px_70px_rgba(0,0,0,.45)] backdrop-blur-xl">
      <div className="border-b border-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[20px] font-bold text-white">Notifications</h3>
            <p className="mt-1 text-[11px] text-white/45">Stay updated with your workspace</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#69b5ff] to-[#6178ff] text-white shadow-[0_0_20px_rgba(95,150,255,.35)]">
            <FaBell />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {unreadCount > 0 ? (
            <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">{unreadCount} Unread</span>
          ) : (
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-bold text-[#5fffd0]">All Read</span>
          )}

          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-[11px] font-semibold text-cyan-300 transition hover:text-cyan-100">
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[430px] overflow-y-auto p-5">
        {loading ? (
          <div className="py-8 text-center text-xs text-white/40">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-white/35">No notifications found.</div>
        ) : (
          sectionsToRender.map((section) => {
            const sectionItems = grouped[section] || [];
            if (sectionItems.length === 0) return null;

            return (
              <div key={section} className="mb-6 last:mb-0">
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-white/35">{section}</h4>

                <div className="space-y-3">
                  {sectionItems.map((item) => {
                    const style = typeStyle[item.type] || typeStyle.system;

                    return (
                      <button
                        key={item.id}
                        onClick={() => openNotification(item.id, item.path, item.isLocal)}
                        className={`group w-full rounded-[20px] border border-white/5 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-[#151f62] hover:shadow-[0_0_20px_rgba(95,150,255,.15)] ${
                          item.type === "welcome" ? "bg-gradient-to-r from-[#1a236a] to-[#10184c] border-cyan-500/20" : "bg-[#10184c]/70"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className={`relative flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-gradient-to-b ${style.color} text-white`}>
                            {style.icon}
                            {!item.read && (
                              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#10184c] bg-[#5fffd0]" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-[13px] font-bold text-white">{item.title}</h5>
                              <span className="text-[10px] text-white/40">{item.time}</span>
                            </div>
                            <p className="mt-2 text-[11px] leading-relaxed text-white/55">{item.desc}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-white/5 p-5">
        <button
          onClick={() => {
            onClose?.();
            navigate("/notifications");
          }}
          className="flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#69b5ff] to-[#6178ff] text-[13px] font-bold text-white shadow-[0_0_18px_rgba(95,150,255,.35)] transition hover:brightness-110"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
}