import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowUp,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaPlus,
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaTasks,
  FaClock,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";

const days = ["S", "M", "T", "W", "T", "F", "S"];

const meetingsData = [
  { id: 1, day: 14, title: "UX Review Meeting", badge: 4 },
  { id: 2, day: 15, title: "Frontend Sprint Sync", badge: 5 },
  { id: 3, day: 18, title: "Flowio Progress Update", badge: 8 },
  { id: 4, day: 20, title: "Team Planning Session", badge: 10 },
  { id: 5, day: 23, title: "Final Design Review", badge: 12 },
];

const initialTasks = {
  today: [
    { text: "Review dashboard UI spacing", done: false },
    { text: "Update schedule page interactions", done: true },
  ],
  tomorrow: [
    { text: "Prepare meeting summary layout", done: false },
    { text: "Polish notifications empty state", done: false },
  ],
  friday: [
    { text: "Test responsive layout for Flowio pages", done: false },
  ],
};

export default function Schedule() {

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const [monthIndex, setMonthIndex] = useState(3);
  const [selectedDay, setSelectedDay] = useState(18);
  const [activeMeeting, setActiveMeeting] = useState(3);
  const [editMode, setEditMode] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");

  const calendarDays = useMemo(
    () => [
      27, 28, 29, 30, 1, 2, 3,
      4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17,
      18, 19, 20, 21, 22, 23, 24,
      25, 26, 27, 28, 29, 30, 31,
    ],
    []
  );

  const allTasks = [...tasks.today, ...tasks.tomorrow, ...tasks.friday];
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((task) => task.done).length;
  const pendingTasks = totalTasks - completedTasks;
  const lateTasks = pendingTasks;

  const completedPercent = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const latePercent = totalTasks
    ? Math.round((lateTasks / totalTasks) * 100)
    : 0;

  const onTimePercent = completedPercent;
  const navigate = useNavigate();
  const addTask = () => {
    if (!newTask.trim()) return;

    setTasks((prev) => ({
      ...prev,
      today: [...prev.today, { text: newTask.trim(), done: false }],
    }));

    setNewTask("");
  };

  const toggleTask = (section, index) => {
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].map((task, i) =>
        i === index ? { ...task, done: !task.done } : task
      ),
    }));
  };

  const removeTask = (section, index) => {
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const stats = [
    {
      label: "Total Tasks Completed",
      value: `${completedTasks} of ${totalTasks}`,
      width: `${completedPercent}%`,
      color: "bg-[#61d7ff]",
    },
    {
      label: "Tasks On-time",
      value: `${completedTasks} of ${totalTasks}`,
      width: `${onTimePercent}%`,
      color: "bg-[#45e68b]",
    },
    {
      label: "Tasks Late",
      value: `${lateTasks} of ${totalTasks}`,
      width: `${latePercent}%`,
      color: "bg-[#ff5d73]",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-0 text-white lg:h-full lg:overflow-hidden">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
           <button
  onClick={() => navigate("/profile")}
  className="text-white/60 transition hover:text-[#6eb5ff]"
>
  <FaChevronLeft />
</button>
            <span className="text-white/50">Profile</span>
            <span className="text-white/30">›</span>
            <h1 className="text-[25px] font-extrabold tracking-[-.4px]">
              Schedule
            </h1>
          </div>

          <button
            onClick={() => setEditMode(!editMode)}
            className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] px-5 text-xs font-bold shadow-[0_0_18px_rgba(95,150,255,.35)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            {editMode ? <FaSave /> : <FaEdit />}
            {editMode ? "Done" : "Add Tasks"}
          </button>
        </div>

        <div className="grid gap-5 lg:h-[calc(100%-55px)] lg:grid-cols-[1fr_1.18fr] lg:gap-6">
          {/* LEFT CARD */}
          <div className="rounded-[34px] border border-blue-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#090d34]/95 p-6 shadow-[0_25px_70px_rgba(0,0,0,.35)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/65">
                {months[monthIndex]} 2026
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setMonthIndex((prev) => (prev === 0 ? 11 : prev - 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#10184c] text-[10px] transition hover:scale-110"
                >
                  <FaChevronLeft />
                </button>

                <button
                  onClick={() =>
                    setMonthIndex((prev) => (prev === 11 ? 0 : prev + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#10184c] text-[10px] transition hover:scale-110"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-7 text-center text-[13px] font-bold text-white/50">
              {days.map((day, i) => (
                <span key={i}>{day}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-3 text-center text-[13px] text-white/70">
              {calendarDays.map((day, i) => {
                const active = day === selectedDay;
                const highlighted = meetingsData.some((m) => m.day === day);

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDay(day);
                      const meeting = meetingsData.find((m) => m.day === day);
                      if (meeting) setActiveMeeting(meeting.id);
                    }}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                      active
                        ? "scale-110 bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.55)]"
                        : highlighted
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="my-5 h-px bg-white/10" />

            {/* MINI SUMMARY */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-[#0b1246]/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-[#78aaff]">
                  <FaCalendarAlt />
                  <span className="text-[10px] font-bold">Meetings</span>
                </div>
                <p className="text-lg font-extrabold">{meetingsData.length}</p>
              </div>

              <div className="rounded-[18px] bg-[#0b1246]/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-[#45e68b]">
                  <FaCheck />
                  <span className="text-[10px] font-bold">Done</span>
                </div>
                <p className="text-lg font-extrabold">{completedTasks}</p>
              </div>

              <div className="rounded-[18px] bg-[#0b1246]/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-[#ffcf5a]">
                  <FaClock />
                  <span className="text-[10px] font-bold">Pending</span>
                </div>
                <p className="text-lg font-extrabold">{pendingTasks}</p>
              </div>
            </div>

            {editMode && (
              <div className="mb-5 flex gap-3">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Add new task..."
                  className="h-10 flex-1 rounded-[14px] border border-blue-300/10 bg-[#0b1246]/80 px-4 text-xs text-white outline-none placeholder:text-white/35 focus:border-[#6eb5ff]/50"
                />

                <button
                  onClick={addTask}
                  className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-400/20 text-[#78aaff] transition hover:bg-blue-400/30"
                >
                  <FaPlus />
                </button>
              </div>
            )}

            <div className="max-h-[210px] space-y-4 overflow-y-auto pr-2">
              {[
                ["today", "Tasks today"],
                ["tomorrow", "Tasks tomorrow"],
                ["friday", "Tasks Friday"],
              ].map(([key, title]) => (
                <div key={key}>
                  <h3 className="mb-2 text-[13px] font-bold text-white/55">
                    {title}
                  </h3>

                  <div className="space-y-2">
                    {tasks[key].map((task, index) => (
                      <div
                        key={`${task.text}-${index}`}
                        className="group flex items-center justify-between gap-3 rounded-[12px] px-1 py-1 text-[12px] text-white/75 transition hover:bg-white/5"
                      >
                        <button
                          onClick={() => toggleTask(key, index)}
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] transition ${
                              task.done
                                ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff]"
                                : "bg-white"
                            }`}
                          >
                            {task.done && <FaCheck className="text-[9px]" />}
                          </span>

                          <span
                            className={`truncate transition ${
                              task.done
                                ? "text-white/35 line-through"
                                : "text-white/80"
                            }`}
                          >
                            {task.text}
                          </span>
                        </button>

                        {editMode && (
                          <button
                            onClick={() => removeTask(key, index)}
                            className="text-[#ff6b8a] opacity-0 transition group-hover:opacity-100"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="grid min-h-0 content-start gap-12 overflow-hidden">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-bold">Upcoming Meetings</h2>
                <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
                  {meetingsData.length} Scheduled
                </span>
              </div>

              <div className="space-y-3">
                {meetingsData.map((meeting) => {
                  const active = activeMeeting === meeting.id;

                  return (
                    <button
                      key={meeting.id}
                      onClick={() => {
                        setActiveMeeting(meeting.id);
                        setSelectedDay(meeting.day);
                      }}
                      className={`flex h-[62px] w-full items-center justify-between rounded-[25px] px-6 text-left transition-all duration-300 hover:-translate-y-1 ${
                        active
                          ? "bg-gradient-to-r from-[#74b8ff] to-[#4f86ff] shadow-[0_20px_50px_rgba(95,150,255,.28)]"
                          : "bg-[#121a5b]/90 shadow-[0_18px_40px_rgba(0,0,0,.18)] hover:bg-[#192371]"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <span
                          className={`text-[31px] font-light ${
                            active ? "text-white" : "text-white/35"
                          }`}
                        >
                          {meeting.day}
                        </span>

                        <div>
                          <p
                            className={
                              active
                                ? "text-[10px] text-white/70"
                                : "text-[10px] text-white/40"
                            }
                          >
                            {months[monthIndex]} 2026
                          </p>
                          <h3 className="text-[13px] font-bold">
                            {meeting.title}
                          </h3>
                        </div>
                      </div>

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                          active
                            ? "bg-white text-[#6baaff]"
                            : "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white"
                        }`}
                      >
                        {meeting.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[0.9fr_1.25fr] sm:gap-6">
              <div className="flex min-h-[205px] flex-col justify-between rounded-[30px] border border-blue-300/10 bg-[#111b63]/95 p-6 shadow-[0_22px_50px_rgba(0,0,0,.28)] transition hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold">Tasks Late</h3>

                  <span className="rounded-full bg-red-400/10 px-3 py-1 text-[10px] font-bold text-[#ff5d73]">
                    {lateTasks} Left
                  </span>
                </div>

                <div className="flex flex-1 items-center justify-center gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10 text-[#ff5d73]">
                    {latePercent > 40 ? (
                      <FaArrowDown className="text-xl" />
                    ) : (
                      <FaArrowUp className="text-xl text-[#45e68b]" />
                    )}
                  </div>

                  <div className="flex h-[95px] w-[125px] flex-col items-center justify-center rounded-[24px] border border-blue-300/10 bg-[#0b1246]/85 text-center shadow-[0_0_25px_rgba(0,0,0,.18)]">
                    <p
                      className={`text-[34px] font-extrabold ${
                        latePercent > 40 ? "text-[#ff5d73]" : "text-[#45e68b]"
                      }`}
                    >
                      {latePercent}%
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-white/40">
                      {lateTasks} TASKS LEFT
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-[205px] rounded-[30px] border border-blue-300/10 bg-[#111b63]/95 p-6 shadow-[0_22px_50px_rgba(0,0,0,.28)] transition hover:-translate-y-1">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-[15px] font-bold">Completed Tasks</h3>

                  <div className="flex gap-2">
                    <span className="h-4 w-4 rounded-full bg-white/90" />
                    <span className="h-4 w-4 rounded-full bg-white/60" />
                  </div>
                </div>

                <div className="space-y-5">
                  {stats.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-[11px]">
                        <span className="text-white/65">{item.label}</span>
                        <span className="font-bold text-white/75">
                          {item.value}
                        </span>
                      </div>

                      <div className="h-[12px] overflow-hidden rounded-full bg-white/25">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
