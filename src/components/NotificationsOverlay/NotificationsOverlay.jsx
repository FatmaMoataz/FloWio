import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCheckCircle,
  FaUsers,
  FaTasks,
  FaLaptopCode,
} from "react-icons/fa";

const initialSections = [
  {
    title: "Today",
    items: [
      {
        icon: <FaBell />,
        title: "Upcoming Meeting",
        desc: "Sprint Planning starts today at 3:00 PM",
        time: "2 min ago",
        unread: true,
        path: "/meetings",
      },
      {
        icon: <FaTasks />,
        title: "Task Updated",
        desc: "Ahmed updated UI Design Task",
        time: "12 min ago",
        unread: true,
        path: "/projects",
      },
      {
        icon: <FaCheckCircle />,
        title: "Meeting Completed",
        desc: "Meeting summary generated successfully",
        time: "30 min ago",
        unread: true,
        path: "/summary",
      },
    ],
  },
  {
    title: "Yesterday",
    items: [
      {
        icon: <FaUsers />,
        title: "New Team Member",
        desc: "Sarah joined Design Team",
        time: "1 day ago",
        unread: true,
        path: "/teams",
      },
      {
        icon: <FaLaptopCode />,
        title: "Project Progress",
        desc: "Flowio reached 80% completion",
        time: "1 day ago",
        unread: true,
        path: "/dashboard",
      },
    ],
  },
];

export default function NotificationsOverlay({ onClose }) {
  const navigate = useNavigate();
  const [sections, setSections] = useState(initialSections);

  const unreadCount = sections.reduce(
    (total, section) =>
      total + section.items.filter((item) => item.unread).length,
    0
  );

  const markAllAsRead = () => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          unread: false,
        })),
      }))
    );
  };

  const openNotification = (sectionTitle, itemTitle, path) => {
    setSections((prev) =>
      prev.map((section) =>
        section.title === sectionTitle
          ? {
              ...section,
              items: section.items.map((item) =>
                item.title === itemTitle ? { ...item, unread: false } : item
              ),
            }
          : section
      )
    );

    onClose?.();
    navigate(path);
  };

  return (
    <div className="absolute right-0 top-[58px] z-[1000] w-[380px] overflow-hidden rounded-[30px] border border-blue-300/10 bg-gradient-to-b from-[#151f68]/98 to-[#0a113d]/98 shadow-[0_30px_70px_rgba(0,0,0,.45)] backdrop-blur-xl">
      <div className="border-b border-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[20px] font-bold text-white">
              Notifications
            </h3>
            <p className="mt-1 text-[11px] text-white/45">
              Stay updated with your workspace
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#69b5ff] to-[#6178ff] text-white shadow-[0_0_20px_rgba(95,150,255,.35)]">
            <FaBell />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {unreadCount > 0 ? (
            <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
              {unreadCount} Unread
            </span>
          ) : (
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-bold text-[#5fffd0]">
              All Read
            </span>
          )}

          <button
            onClick={markAllAsRead}
            className="text-[11px] font-semibold text-cyan-300 transition hover:text-cyan-100"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="max-h-[430px] overflow-y-auto p-5">
        {sections.map((section) => (
          <div key={section.title} className="mb-8">
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[2px] text-white/35">
              {section.title}
            </h4>

            <div className="space-y-3">
              {section.items.map((item) => (
                <button
                  key={item.title}
                  onClick={() =>
                    openNotification(section.title, item.title, item.path)
                  }
                  className="group w-full rounded-[20px] border border-white/5 bg-[#10184c]/70 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-[#151f62] hover:shadow-[0_0_20px_rgba(95,150,255,.15)]"
                >
                  <div className="flex gap-4">
                    <div className="relative flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-gradient-to-r from-[#69b5ff] to-[#6178ff] text-white shadow-[0_0_15px_rgba(95,150,255,.25)]">
                      {item.icon}

                      {item.unread && (
                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#10184c] bg-[#5fffd0]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-[13px] font-bold text-white">
                          {item.title}
                        </h5>

                        <span className="text-[10px] text-white/40">
                          {item.time}
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] leading-relaxed text-white/55">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
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