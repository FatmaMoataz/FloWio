import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

import {
  FaEllipsisH,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaVideo,
  FaComments,
  FaLaptopCode,
  FaPalette,
  FaRobot,
  FaChartLine,
  FaUserAstronaut,
  FaUserNinja,
  FaUserTie,
  FaUserGraduate,
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaEye,
  FaArchive,
  FaUsers,
  FaSave,
} from "react-icons/fa";

const iconSet = [<FaUserAstronaut />, <FaUserNinja />, <FaUserTie />, <FaUserGraduate />];

const avatarColors = [
  "from-[#5ea0ff] to-[#3b5fff]",
  "from-[#ff5ea8] to-[#ff3d7f]",
  "from-[#5fffd0] to-[#35b7ff]",
  "from-[#ffc857] to-[#ff8f3d]",
];

const makeMember = (name, role = "Team Member") => ({
  name,
  role,
  facebook: "https://facebook.com",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
});

export default function Teams() {
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [search, setSearch] = useState("");
  const [addPanel, setAddPanel] = useState(null);
  const [editPanel, setEditPanel] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");

  const [member, setMember] = useState({
    name: "",
    role: "",
    facebook: "",
    github: "",
    linkedin: "",
  });

  const [teams, setTeams] = useState([
    {
      name: "Flowio Team Members",
      archived: false,
      members: [
        makeMember("Shahd", "Backend Developer"),
        makeMember("John", "AI Engineer"),
        makeMember("Ahmed", "Project Analyst"),
        makeMember("Mina", "Frontend Developer"),
        makeMember("Karim", "UI Designer"),
      ],
      projects: [
        ["Website Redesign", <FaLaptopCode />, "65%"],
        ["AI Assistant", <FaRobot />, "40%"],
      ],
    },
    {
      name: "Qo Team Members",
      archived: false,
      members: [
        makeMember("Adham", "Backend Developer"),
        makeMember("Farah", "AI Engineer"),
        makeMember("Sara", "Project Analyst"),
      ],
      projects: [
        ["Mobile App UI", <FaPalette />, "75%"],
        ["Brand System", <FaPalette />, "55%"],
      ],
    },
    {
      name: "Mn Team Members",
      archived: false,
      members: [
        makeMember("Joseph", "Backend Developer"),
        makeMember("Laila", "AI Engineer"),
        makeMember("Sama", "Project Analyst"),
      ],
      projects: [
        ["Market Study", <FaChartLine />, "60%"],
        ["AI Workflow", <FaRobot />, "35%"],
      ],
    },
    {
      name: "Design Team",
      archived: false,
      members: [
        makeMember("Aya", "Backend Developer"),
        makeMember("Omar", "AI Engineer"),
        makeMember("Nour", "Project Analyst"),
      ],
      projects: [
        ["Website Redesign", <FaLaptopCode />, "65%"],
        ["UI System", <FaPalette />, "70%"],
      ],
    },
  ]);

  const visibleTeams = teams.filter(
    (team) =>
      !team.archived &&
      `${team.name} ${team.members.map((m) => m.name).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const resetMember = () => {
    setMember({
      name: "",
      role: "",
      facebook: "",
      github: "",
      linkedin: "",
    });
  };

  const isValidUrl = (url, domain) => {
    if (!url) return true;
    try {
      return new URL(url).href.includes(domain);
    } catch {
      return false;
    }
  };

  const addMember = (idx) => {
    if (!member.name.trim()) {
      alert("Please enter member name");
      return;
    }

    if (!isValidUrl(member.facebook, "facebook.com")) {
      alert("Please enter valid Facebook link");
      return;
    }

    if (!isValidUrl(member.github, "github.com")) {
      alert("Please enter valid GitHub link");
      return;
    }

    if (!isValidUrl(member.linkedin, "linkedin.com")) {
      alert("Please enter valid LinkedIn link");
      return;
    }

    setTeams((prev) =>
      prev.map((team, i) =>
        i === idx
          ? {
              ...team,
              members: [
                ...team.members,
                {
                  name: member.name.trim(),
                  role: member.role || "Team Member",
                  facebook: member.facebook || "https://facebook.com",
                  github: member.github || "https://github.com",
                  linkedin: member.linkedin || "https://linkedin.com",
                },
              ],
            }
          : team
      )
    );

    resetMember();
    setAddPanel(null);
  };

  const deleteTeam = (idx) => {
    setTeams((prev) => prev.filter((_, i) => i !== idx));
    setMenu(null);
  };

  const archiveTeam = (idx) => {
    setTeams((prev) =>
      prev.map((team, i) => (i === idx ? { ...team, archived: true } : team))
    );
    setMenu(null);
  };

  const startEdit = (idx) => {
    setEditPanel(idx);
    setEditTeamName(teams[idx].name);
    setMenu(null);
  };

  const saveEdit = (idx) => {
    if (!editTeamName.trim()) return;

    setTeams((prev) =>
      prev.map((team, i) =>
        i === idx ? { ...team, name: editTeamName.trim() } : team
      )
    );

    setEditPanel(null);
    setEditTeamName("");
  };

  return (
    <MainLayout>
      <div className="h-full min-h-0 overflow-hidden text-white">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[14px]">
            <button
              onClick={() => navigate("/profile")}
              className="text-white/60 transition hover:text-[#6eb5ff]"
            >
              ←
            </button>

            <span className="text-white/45">Profile</span>
            <span className="text-white/35">›</span>

            <h2 className="text-[25px] font-extrabold tracking-[-0.4px]">
              Teams
            </h2>
          </div>

          <div className="flex h-11 w-[310px] items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
            <FaSearch className="text-xs text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams or members..."
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
            />
          </div>
        </div>

        <div className="flex h-[calc(100%-60px)] gap-6 overflow-x-auto overflow-y-hidden pb-4 pr-2">
          {visibleTeams.map((team) => {
            const idx = teams.findIndex((t) => t.name === team.name);

            return (
              <div
                key={team.name}
                className="flex h-full min-w-[370px] max-w-[370px] flex-col overflow-hidden rounded-[30px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 p-5 shadow-[0_22px_55px_rgba(0,0,0,.30)] transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(95,150,255,.18)]"
              >
                <div className="relative mb-4 flex shrink-0 items-center justify-between">
                  <div className="min-w-0">
                    {editPanel === idx ? (
                      <input
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(idx)}
                        className="h-9 w-[230px] rounded-xl bg-[#141d66] px-3 text-sm font-bold outline-none"
                      />
                    ) : (
                      <h3 className="truncate text-[17px] font-bold">
                        {team.name}
                      </h3>
                    )}

                    <p className="mt-1 text-[11px] text-white/45">
                      {team.members.length} Members
                    </p>
                  </div>

                  {editPanel === idx ? (
                    <button
                      onClick={() => saveEdit(idx)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/20 text-[#78aaff]"
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button
                      onClick={() => setMenu(menu === idx ? null : idx)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-[#6eb5ff]"
                    >
                      <FaEllipsisH />
                    </button>
                  )}

                  {menu === idx && (
                    <div className="absolute right-0 top-10 z-50 w-[175px] rounded-2xl border border-white/10 bg-[#0b1246] p-2 shadow-[0_18px_40px_rgba(0,0,0,.35)]">
                      <button
                        onClick={() => startEdit(idx)}
                        className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs hover:bg-blue-300/15"
                      >
                        <FaEdit /> Edit Team
                      </button>

                      <button
                        onClick={() => navigate("/projects")}
                        className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs hover:bg-blue-300/15"
                      >
                        <FaEye /> View Details
                      </button>

                      <button
                        onClick={() => archiveTeam(idx)}
                        className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs hover:bg-blue-300/15"
                      >
                        <FaArchive /> Archive
                      </button>

                      <button
                        onClick={() => deleteTeam(idx)}
                        className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs text-[#ff6b8a] hover:bg-red-400/15"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="mb-5 rounded-[22px] bg-[#10184c]/70 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-400/15 text-[#78aaff]">
                          <FaUsers />
                        </div>

                        <div>
                          <p className="text-[12px] font-bold">Members</p>
                          <p className="text-[10px] text-white/40">
                            Manage team members
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAddPanel(idx);
                          setMenu(null);
                        }}
                        className="flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] px-4 text-[11px] font-bold shadow-[0_0_18px_rgba(95,150,255,.25)] transition hover:brightness-110"
                      >
                        <FaPlus /> Add
                      </button>
                    </div>
                  </div>

                  <div className="mb-5 flex gap-4 overflow-x-auto overflow-y-hidden pb-3">
                    {team.members.map((m, i) => (
                      <div
                        key={m.name + i}
                        className="min-w-[92px] rounded-[20px] bg-[#10184c]/60 p-3 text-center transition hover:bg-[#151f62]"
                      >
                        <div
                          className={`mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gradient-to-b ${
                            avatarColors[i % 4]
                          } text-2xl text-white shadow-[0_0_18px_rgba(255,255,255,.10)]`}
                        >
                          {iconSet[i % 4]}
                        </div>

                        <h4 className="mt-3 truncate text-[13px] font-bold">
                          {m.name}
                        </h4>

                        <p className="mt-1 truncate text-[10px] text-white/50">
                          {m.role}
                        </p>

                        <div className="mt-3 flex justify-center gap-3 text-[12px] text-white/60">
                          <a
                            href={m.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[#6eb5ff]"
                          >
                            <FaFacebookF />
                          </a>
                          <a
                            href={m.github}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[#6eb5ff]"
                          >
                            <FaGithub />
                          </a>
                          <a
                            href={m.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[#6eb5ff]"
                          >
                            <FaLinkedinIn />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-[14px] font-bold">Projects</h4>

                    <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">
                      {team.projects.length} active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {team.projects.map((project) => (
                      <button
                        key={project[0]}
                        onClick={() => navigate("/projects")}
                        className="rounded-[20px] bg-[#10184c]/90 p-4 text-left transition hover:-translate-y-1 hover:bg-[#182267]"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-[#f6c14f]">{project[1]}</span>
                          <h5 className="truncate text-[11px] font-bold">
                            {project[0]}
                          </h5>
                        </div>

                        <div className="h-[6px] rounded-full bg-white/15">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-[#f6c14f] to-[#ff9f43]"
                            style={{ width: project[2] }}
                          />
                        </div>

                        <p className="mt-2 text-[10px] text-white/55">
                          {project[2]} Completed
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex shrink-0 gap-3 pt-3">
                  <Link
                    to="/meetings"
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-[11px] font-bold shadow-[0_0_18px_rgba(95,150,255,.25)] transition hover:brightness-110"
                  >
                    Start Meeting
                    <FaVideo />
                  </Link>

                  <Link
                    to="/chat"
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-blue-400/15 text-[11px] font-bold text-[#78aaff] transition hover:bg-blue-400/25"
                  >
                    Group Chat
                    <FaComments />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {addPanel !== null && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 backdrop-blur-md">
            <div className="w-[500px] rounded-[32px] border border-blue-300/10 bg-[radial-gradient(circle_at_top_right,rgba(110,181,255,.18),transparent_35%),linear-gradient(180deg,rgba(18,24,76,.98),rgba(8,13,44,.98))] p-7 text-white shadow-[0_25px_80px_rgba(0,0,0,.65)]">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <h3 className="text-[24px] font-bold">Add New Member</h3>
                  <p className="mt-1 text-[12px] text-white/45">
                    Add a new member to {teams[addPanel]?.name}.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAddPanel(null);
                    resetMember();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
                >
                  ×
                </button>
              </div>

              {[
                ["name", "Member Name", <FaUserTie />],
                ["role", "Role / Job Title", <FaUserGraduate />],
                ["facebook", "https://facebook.com/username", <FaFacebookF />],
                ["github", "https://github.com/username", <FaGithub />],
                ["linkedin", "https://linkedin.com/in/username", <FaLinkedinIn />],
              ].map(([key, placeholder, icon]) => (
                <div
                  key={key}
                  className="mb-4 flex h-12 items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4 transition focus-within:border-[#6eb5ff]/50 focus-within:shadow-[0_0_20px_rgba(95,150,255,.18)]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/15 text-[12px] text-[#78aaff]">
                    {icon}
                  </span>

                  <input
                    type={
                      ["facebook", "github", "linkedin"].includes(key)
                        ? "url"
                        : "text"
                    }
                    value={member[key]}
                    onChange={(e) =>
                      setMember({ ...member, [key]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
                  />
                </div>
              ))}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setAddPanel(null);
                    resetMember();
                  }}
                  className="h-12 flex-1 rounded-[16px] bg-white/10 text-sm font-semibold hover:bg-white/15"
                >
                  Cancel
                </button>

                <button
                  onClick={() => addMember(addPanel)}
                  className="h-12 flex-1 rounded-[16px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm font-bold shadow-[0_0_20px_rgba(95,150,255,.35)] hover:brightness-110"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}