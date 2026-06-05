import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

import {
  FaEllipsisH,
  FaVideo,
  FaComments,
  FaLaptopCode,
  FaRobot,
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
  FaTimes,
} from "react-icons/fa";

const iconSet = [<FaUserAstronaut />, <FaUserNinja />, <FaUserTie />, <FaUserGraduate />];

const avatarColors = [
  "from-[#5ea0ff] to-[#3b5fff]",
  "from-[#ff5ea8] to-[#ff3d7f]",
  "from-[#5fffd0] to-[#35b7ff]",
  "from-[#ffc857] to-[#ff8f3d]",
];

export default function Teams() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [menu, setMenu] = useState(null);
  const [search, setSearch] = useState("");
  const [addPanel, setAddPanel] = useState(null); 
  const [editPanel, setEditPanel] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [loadingMeeting, setLoadingMeeting] = useState({});
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // States لإنشاء فريق جديد
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [companyId, setCompanyId] = useState("65cb1111117890abcdef1111"); 

  const [memberEmail, setMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member"); 

  // ── جلب الـ Teams مع الـ Members بتوعهم من الباكيند ─────────────────
  const fetchTeamsAndMembers = async () => {
    try {
      setLoadingTeams(true);
      const token = localStorage.getItem("token");
      
      const teamsRes = await axios.get(
        `https://flowio-backend.vercel.app/api/teams/company/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (teamsRes.data.success) {
        const fetchedTeams = teamsRes.data.data;

        const teamsWithMembers = await Promise.all(
          fetchedTeams.map(async (team) => {
            try {
              const membersRes = await axios.get(
                `https://flowio-backend.vercel.app/api/teams/${team._id}/members`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              return {
                ...team,
                archived: team.archived || false,
                members: membersRes.data.success ? membersRes.data.data : [],
                projects: team.projects || [
                  ["Website Redesign", <FaLaptopCode />, "65%"],
                  ["AI Assistant", <FaRobot />, "40%"],
                ],
              };
            } catch (err) {
              console.error(`Error fetching members for team ${team._id}:`, err);
              return {
                ...team,
                archived: team.archived || false,
                members: [],
                projects: [["Website Redesign", <FaLaptopCode />, "65%"]],
              };
            }
          })
        );

        setTeams(teamsWithMembers);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams data.");
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndMembers();
  }, [companyId]);

  // ── دالة إنشاء فريق جديد ──────────────────────────────────────
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      toast.warn("Please enter a team name");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://flowio-backend.vercel.app/api/teams",
        { name: newTeamName.trim(), companyId: companyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const createdTeam = {
          ...response.data.data,
          archived: false,
          members: [],
          projects: [["New Project", <FaLaptopCode />, "0%"]],
        };
        setTeams((prev) => [createdTeam, ...prev]);
        setNewTeamName("");
        setShowCreateModal(false);
        toast.success("Team created successfully! 🎉");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error(error.response?.data?.message || "Failed to create team");
    }
  };

  // ── دالة إضافة عضو جديد للفريق بواسطة البريد الإلكتروني ────────────────────────
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    
    if (!memberEmail.trim()) {
      toast.warn("Please enter a valid email address");
      return;
    }

    const team = teams[addPanel];
    setIsSubmittingMember(true);
    const toastId = toast.loading("Searching and adding team member...");

    try {
      const token = localStorage.getItem("token");

      // 1. خطوة البحث عن المستخدم بالإيميل
      const userRes = await axios.get(
        `https://flowio-backend.vercel.app/api/users/search?email=${memberEmail.trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const targetUserId = userRes.data?.data?._id || userRes.data?.user?._id;

      if (!targetUserId) {
        toast.update(toastId, { 
          render: "User not found with this email address.", 
          type: "error", 
          isLoading: false, 
          autoClose: 3000 
        });
        setIsSubmittingMember(false);
        return;
      }

      // 2. إرسال الطلب للباكيند الحالي
      const response = await axios.post(
        `https://flowio-backend.vercel.app/api/teams/${team._id}/members`,
        {
          userId: targetUserId,
          role_in_team: newMemberRole,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.update(toastId, { 
          render: "Member added successfully! 🤝", 
          type: "success", 
          isLoading: false, 
          autoClose: 3000 
        });
        fetchTeamsAndMembers();
        setMemberEmail("");
        setNewMemberRole("member");
        setAddPanel(null);
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.update(toastId, { 
        render: error.response?.data?.message || "Failed to add member.", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      });
    } finally {
      setIsSubmittingMember(false);
    }
  };

  // ── دالة حذف عضو من الفريق ────────────────────────────────────
  const handleRemoveMember = async (teamId, memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://flowio-backend.vercel.app/api/teams/${teamId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTeams(prev => prev.map(t => t._id === teamId ? { ...t, members: t.members.filter(m => m._id !== memberId) } : t));
      toast.success("Member removed from team");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member.");
    }
  };

  // ── دالة الـ Meeting ───────────────────────────────────────────
  const handleStartMeeting = async (meetingId) => {
    if (!meetingId) {
      toast.error("Meeting ID is missing!");
      return;
    }
    try {
      setLoadingMeeting(prev => ({ ...prev, [meetingId]: true }));
      const token = localStorage.getItem("token"); 
      const response = await axios.patch(
        `https://flowio-backend.vercel.app/api/meetings/${meetingId}/start`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { roomId } = response.data;
      toast.success("Launching instant meeting... 🚀");
      navigate(`/meetings/${roomId || meetingId}`);
    } catch (error) {
      console.error("Error starting the meeting:", error);
      toast.error(error.response?.data?.message || "Failed to start the meeting.");
    } finally {
      setLoadingMeeting(prev => ({ ...prev, [meetingId]: false }));
    }
  };

  const visibleTeams = teams.filter(
    (team) =>
      !team.archived &&
      `${team.name} ${team.members?.map((m) => m.userId?.name || "").join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const deleteTeam = async (idx, id) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://flowio-backend.vercel.app/api/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams((prev) => prev.filter((_, i) => i !== idx));
      toast.success("Team permanently deleted");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete the team.");
    }
    setMenu(null);
  };

  const archiveTeam = (idx) => {
    setTeams((prev) => prev.map((team, i) => (i === idx ? { ...team, archived: true } : team)));
    setMenu(null);
    toast.info("Team moved to archives");
  };

  const startEdit = (idx) => {
    setEditPanel(idx);
    setEditTeamName(teams[idx].name);
    setMenu(null);
  };

  const saveEdit = async (idx, id) => {
    if (!editTeamName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://flowio-backend.vercel.app/api/teams/${id}`,
        { name: editTeamName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeams((prev) => prev.map((team, i) => (i === idx ? { ...team, name: editTeamName.trim() } : team)));
      setEditPanel(null);
      setEditTeamName("");
      toast.success("Team settings saved");
    } catch (error) {
      console.error("Error updating team name:", error);
      toast.error("Failed to save changes.");
    }
  };

  return (
    <MainLayout>
      {/* Toast container configuration injection */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      <div className="h-full min-h-0 overflow-hidden text-white">
        
        {/* ── Header Section ──────────────────────────────────────── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[14px]">
            <button onClick={() => navigate("/profile")} className="text-white/60 transition hover:text-[#6eb5ff]">←</button>
            <span className="text-white/45">Profile</span>
            <span className="text-white/35">›</span>
            <h2 className="text-[25px] font-extrabold tracking-[-0.4px]">Teams</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-11 items-center gap-2 rounded-[16px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] px-5 text-xs font-bold shadow-[0_0_20px_rgba(95,150,255,0.3)] transition hover:brightness-110"
            >
              <FaPlus /> New Team
            </button>

            <div className="flex h-11 w-[260px] items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
              <FaSearch className="text-xs text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams or members..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
              />
            </div>
          </div>
        </div>

        {/* ── Teams Cards Layout ──────────────────────────────────── */}
        {loadingTeams ? (
          <div className="flex h-40 items-center justify-center text-white/65">Loading teams and members...</div>
        ) : (
          <div className="flex h-[calc(100%-60px)] gap-6 overflow-x-auto overflow-y-hidden pb-4 pr-2">
            {visibleTeams.map((team) => {
              const idx = teams.findIndex((t) => t._id === team._id);

              return (
                <div
                  key={team._id}
                  className="flex h-full min-w-[370px] max-w-[370px] flex-col overflow-hidden rounded-[30px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 p-5 shadow-[0_22px_55px_rgba(0,0,0,.30)] transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(95,150,255,.18)]"
                >
                  <div className="relative mb-4 flex shrink-0 items-center justify-between">
                    <div className="min-w-0">
                      {editPanel === idx ? (
                        <input
                          value={editTeamName}
                          onChange={(e) => setEditTeamName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(idx, team._id)}
                          className="h-9 w-[230px] rounded-xl bg-[#141d66] px-3 text-sm font-bold outline-none"
                        />
                      ) : (
                        <h3 className="truncate text-[17px] font-bold">{team.name}</h3>
                      )}
                      <p className="mt-1 text-[11px] text-white/45">{(team.members || []).length} Members</p>
                    </div>

                    {editPanel === idx ? (
                      <button onClick={() => saveEdit(idx, team._id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/20 text-[#78aaff]"><FaSave /></button>
                    ) : (
                      <button onClick={() => setMenu(menu === idx ? null : idx)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-[#6eb5ff]"><FaEllipsisH /></button>
                    )}

                    {menu === idx && (
                      <div className="absolute right-0 top-10 z-50 w-[175px] rounded-2xl border border-white/10 bg-[#0b1246] p-2 shadow-[0_18px_40px_rgba(0,0,0,.35)]">
                        <button onClick={() => startEdit(idx)} className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs hover:bg-blue-300/15"><FaEdit /> Edit Team</button>
                        <button onClick={() => navigate("/projects")} className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs hover:bg-blue-300/15"><FaEye /> View Details</button>
                        <button onClick={() => archiveTeam(idx)} className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs hover:bg-blue-300/15"><FaArchive /> Archive</button>
                        <button onClick={() => deleteTeam(idx, team._id)} className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs text-[#ff6b8a] hover:bg-red-400/15"><FaTrash /> Delete</button>
                      </div>
                    )}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="mb-5 rounded-[22px] bg-[#10184c]/70 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-400/15 text-[#78aaff]"><FaUsers /></div>
                          <div>
                            <p className="text-[12px] font-bold">Members</p>
                            <p className="text-[10px] text-white/40">Manage team members</p>
                          </div>
                        </div>
                        <button onClick={() => setAddPanel(idx)} className="flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] px-4 text-[11px] font-bold transition hover:brightness-110"><FaPlus /> Add</button>
                      </div>
                    </div>

                    <div className="mb-5 flex gap-4 overflow-x-auto overflow-y-hidden pb-3">
                      {(team.members || []).map((m, i) => (
                        <div key={m._id || i} className="relative min-w-[105px] rounded-[20px] bg-[#10184c]/60 p-3 text-center transition hover:bg-[#151f62]">
                          
                          <button 
                            onClick={() => handleRemoveMember(team._id, m._id)}
                            className="absolute right-2 top-2 text-[10px] text-white/40 hover:text-red-400"
                            title="Remove Member"
                          >
                            <FaTimes />
                          </button>

                          <div className={`mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gradient-to-b ${avatarColors[i % 4]} text-2xl text-white`}>
                            {iconSet[i % 4]}
                          </div>
                          <h4 className="mt-3 truncate text-[13px] font-bold">{m.userId?.name || "Unknown User"}</h4>
                          <p className="mt-1 truncate text-[10px] text-[#78aaff] font-semibold uppercase tracking-wider">{m.role_in_team}</p>
                          <p className="mt-0.5 truncate text-[9px] text-white/40">{m.userId?.specialization || "Developer"}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-[14px] font-bold">Projects</h4>
                      <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">{(team.projects || []).length} active</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {(team.projects || []).map((project) => (
                        <button key={project[0]} onClick={() => navigate("/projects")} className="rounded-[20px] bg-[#10184c]/90 p-4 text-left transition hover:-translate-y-1 hover:bg-[#182267]">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-[#f6c14f]">{project[1]}</span>
                            <h5 className="truncate text-[11px] font-bold">{project[0]}</h5>
                          </div>
                          <div className="h-[6px] rounded-full bg-white/15">
                            <span className="block h-full rounded-full bg-gradient-to-r from-[#f6c14f] to-[#ff9f43]" style={{ width: project[2] }} />
                          </div>
                          <p className="mt-2 text-[10px] text-white/55">{project[2]} Completed</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex shrink-0 gap-3 pt-3">
                    <button
                      disabled={loadingMeeting[team._id]}
                      onClick={() => handleStartMeeting(team._id)}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-[11px] font-bold shadow-[0_0_18px_rgba(95,150,255,.25)] transition hover:brightness-110 disabled:opacity-50"
                    >
                      {loadingMeeting[team._id] ? "Starting..." : "Start Meeting"}
                      <FaVideo />
                    </button>

                    <Link to="/chat" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-blue-400/15 text-[11px] font-bold text-[#78aaff] transition hover:bg-blue-400/25">Group Chat<FaComments /></Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Create New Team Modal ───────────────────────────────── */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-[420px] rounded-[24px] border border-white/10 bg-[#0d1442] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Create New Team</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-white/45 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-white/60">Team Name</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g., Alpha Developers"
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#141d66] px-4 text-sm outline-none focus:border-blue-400/50 text-white"
                  />
                </div>
                <button type="submit" className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-xs font-bold transition hover:brightness-110">Create Team</button>
              </form>
            </div>
          </div>
        )}

        {/* ── Add Team Member Modal ────────────────────────────────── */}
        {addPanel !== null && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 backdrop-blur-md">
            <div className="w-[420px] rounded-[24px] border border-white/10 bg-[#0d1442] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Add Team Member</h3>
                  <p className="text-xs text-white/45 mt-0.5">To: {teams[addPanel]?.name}</p>
                </div>
                <button onClick={() => setAddPanel(null)} className="text-white/45 hover:text-white"><FaTimes /></button>
              </div>

              <form onSubmit={handleAddMemberSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-white/60">User Email Address</label>
                  <input
                    type="email"
                    required
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="e.g., member@company.com"
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#141d66] px-4 text-xs outline-none focus:border-blue-400/50 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-white/60">Role in Team</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#141d66] px-4 text-sm outline-none focus:border-blue-400/50 text-white"
                  >
                    <option value="member">Member</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingMember}
                  className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-xs font-bold transition hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmittingMember ? "Processing..." : "Add Member"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}