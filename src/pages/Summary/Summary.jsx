import { useState } from "react";
import MainLayout from "../../layout/MainLayout";
import {
  FaSearch,
  FaChevronLeft,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaUsers,
  FaTasks,
} from "react-icons/fa";

const meetingsData = [
  {
    title: "Meeting 10",
    type: "UI Review",
    time: "Just now",
    summary: [
      "Reviewed final chat page interactions.",
      "Improved overlays and dropdown behavior.",
      "Checked colors and spacing consistency.",
      "Prepared final UI polish tasks.",
    ],
  },
  {
    title: "Meeting 9",
    type: "Frontend",
    time: "1 hour ago",
    summary: [
      "Connected buttons with proper actions.",
      "Added upload file options.",
      "Fixed chat input visibility.",
      "Enhanced user interaction feedback.",
    ],
  },
  {
    title: "Meeting 8",
    type: "Design",
    time: "Today",
    summary: [
      "Improved page cards and gradients.",
      "Updated layout spacing.",
      "Reviewed archive section.",
      "Enhanced visual hierarchy.",
    ],
  },
  {
    title: "Meeting 7",
    type: "Testing",
    time: "Today",
    summary: [
      "Tested all main buttons.",
      "Checked routing between pages.",
      "Reviewed responsive behavior.",
      "Fixed minor UI bugs.",
    ],
  },
  {
    title: "Meeting 6",
    type: "Requirements",
    time: "9 min ago",
    summary: [
      "Reviewed latest requirement updates.",
      "Discussed changes requested by the client.",
      "Assigned owners for pending items.",
      "Prepared next sprint priorities.",
    ],
  },
  {
    title: "Meeting 5",
    type: "Requirements",
    time: "Yesterday",
    summary: [
      "Reviewed dashboard UI structure.",
      "Fixed spacing and alignment issues.",
      "Discussed reusable components.",
      "Prepared tasks for frontend integration.",
    ],
  },
  {
    title: "Meeting 4",
    type: "Requirements",
    time: "30 Sep",
    summary: [
      "Collected feedback on current screens.",
      "Updated color consistency across pages.",
      "Reviewed sidebar and navigation behavior.",
      "Defined next design improvements.",
    ],
  },
  {
    title: "Meeting 3",
    type: "Planning",
    time: "21 Oct",
    summary: [
      "Discussed project progress.",
      "Reviewed pending bugs.",
      "Improved page layout and responsiveness.",
      "Planned upcoming meeting summary screen.",
    ],
  },
  {
    title: "Meeting 2",
    type: "Profile",
    time: "12 Feb",
    summary: [
      "Reviewed profile page structure.",
      "Added recent activity actions.",
      "Discussed team cards and chat access.",
      "Prepared task documentation.",
    ],
  },
  {
    title: "Meeting 1",
    type: "Kickoff",
    time: "Old",
    summary: [
      "Reviewed overall project status.",
      "Discussed UI progress and pending issues.",
      "Collected feedback on current screens.",
      "Defined priorities for the next phase.",
    ],
  },
];

const tasks = [
  {
    name: "Fatma",
    title: "UI Enhancement",
    points: [
      "Update screens based on feedback.",
      "Improve user flow and visual consistency.",
    ],
    color: "from-[#ffbd67] to-[#ff3f8d]",
  },
  {
    name: "Ahmed",
    title: "Frontend Fixes",
    points: [
      "Implement updated UI designs.",
      "Fix UI-related bugs and spacing issues.",
    ],
    color: "from-[#6eb5ff] to-[#5b7dff]",
  },
  {
    name: "Omar",
    title: "Integration",
    points: [
      "Support frontend integration.",
      "Handle required API updates.",
    ],
    color: "from-[#5fffd0] to-[#35b7ff]",
  },
];

export default function Summary() {
  const [activeMeeting, setActiveMeeting] = useState(meetingsData[0]);
  const [search, setSearch] = useState("");

  const filteredMeetings = meetingsData.filter((meeting) =>
    `${meeting.title} ${meeting.type} ${meeting.summary.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="h-full w-full overflow-hidden text-white">
        {/* BREADCRUMB */}
        <div className="mb-5 flex h-[26px] items-center gap-3 text-xs text-white/55">
          <FaChevronLeft />
          <span>Projects</span>
          <span>›</span>
          <b className="text-white">Summary</b>
          <span>›</span>
          <b className="text-white">Flowio Project</b>
        </div>

        <div className="grid h-[calc(100%-46px)] grid-cols-[300px_1fr] gap-8">
          {/* ARCHIVE */}
          <div className="flex h-full flex-col rounded-[26px] border border-indigo-300/10 bg-gradient-to-b from-[#131d68]/95 to-[#0c144a]/95 p-5 shadow-[0_18px_42px_rgba(0,0,0,.24)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-bold">Archive</h3>

              <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
                {filteredMeetings.length} meetings
              </span>
            </div>

            <div className="mb-5 flex h-10 items-center gap-3 rounded-2xl bg-[#060d3a]/90 px-4 text-white/45">
              <FaSearch />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search meetings..."
                className="w-full bg-transparent text-[11px] text-white outline-none placeholder:text-white/40"
              />
            </div>

            <div className="h-[400px] overflow-y-auto pr-2">
              <div className="flex flex-col gap-4">
                {filteredMeetings.map((meeting) => (
                  <button
                    key={meeting.title}
                    onClick={() => setActiveMeeting(meeting)}
                    className={`rounded-[20px] p-4 text-left transition-all duration-300 ${
                      activeMeeting.title === meeting.title
                        ? "border border-blue-300/20 bg-gradient-to-r from-[#1c2a87]/95 to-[#141f69]/95 shadow-[0_0_30px_rgba(95,150,255,.35)]"
                        : "bg-[#10184c]/70 hover:-translate-y-1 hover:bg-[#151f62] hover:shadow-[0_0_22px_rgba(95,150,255,.18)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[13px] font-bold">
                          {meeting.title}
                        </h4>

                        <p className="mt-1 text-[10px] text-white/40">
                          {meeting.type}
                        </p>
                      </div>

                      <span className="text-[10px] text-white/40">
                        {meeting.time}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[10px] text-white/45">
                      <FaCalendarAlt />
                      Meeting Notes
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="grid h-full grid-rows-[82px_1fr_1fr] gap-6 overflow-hidden">
            {/* STATS */}
            <div className="grid grid-cols-3 gap-5">
              {[
                [<FaClipboardList />, "Meetings", meetingsData.length],
                [<FaTasks />, "Tasks", tasks.length],
                [<FaUsers />, "Team Members", 3],
              ].map((stat) => (
                <div
                  key={stat[1]}
                  className="flex items-center gap-4 rounded-[22px] border border-indigo-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 px-5 shadow-[0_14px_32px_rgba(0,0,0,.22)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.35)]">
                    {stat[0]}
                  </div>

                  <div>
                    <p className="text-[10px] text-white/45">{stat[1]}</p>
                    <h4 className="text-[18px] font-extrabold">{stat[2]}</h4>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="rounded-[26px] border border-indigo-300/10 bg-gradient-to-b from-[#131d68]/95 to-[#0c144a]/95 p-7 shadow-[0_18px_42px_rgba(0,0,0,.24)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold">
                    {activeMeeting.title} Summary
                  </h3>

                  <p className="mt-1 text-[11px] text-white/45">
                    {activeMeeting.type} • {activeMeeting.time}
                  </p>
                </div>

                <span className="rounded-full bg-blue-400/15 px-4 py-2 text-[11px] font-bold text-[#78aaff]">
                  Active Summary
                </span>
              </div>

              <ul className="grid grid-cols-2 gap-4">
                {activeMeeting.summary.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-[18px] bg-[#10184c]/70 p-4 text-[12px] leading-relaxed text-white/80"
                  >
                    <FaCheckCircle className="mt-1 shrink-0 text-[#6eb5ff]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* TASKS */}
            <div className="rounded-[26px] border border-indigo-300/10 bg-gradient-to-b from-[#131d68]/95 to-[#0c144a]/95 p-7 shadow-[0_18px_42px_rgba(0,0,0,.24)]">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-[18px] font-bold">Tasks ({tasks.length})</h3>

                <span className="text-[11px] text-white/45">
                  Assigned team responsibilities
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <div
                    key={task.name}
                    className="rounded-[24px] bg-gradient-to-b from-[#1c2a87]/90 to-[#141f69]/95 p-5 shadow-[0_14px_28px_rgba(0,0,0,.16)] transition hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(95,150,255,.25)]"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-[44px] w-[44px] items-center justify-center rounded-full bg-gradient-to-b ${task.color} shadow-[0_0_16px_rgba(255,255,255,.12)]`}
                      >
                        <FaUser />
                      </div>

                      <div>
                        <h4 className="text-[14px] font-bold">{task.name}</h4>
                        <p className="mt-1 text-[10px] text-white/45">
                          {task.title}
                        </p>
                      </div>
                    </div>

                    <ul className="flex list-disc flex-col gap-3 pl-4 text-[10px] leading-relaxed text-white/70">
                      {task.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}