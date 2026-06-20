  import { useState, useEffect } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import MainLayout from "../../layout/MainLayout";
  import { jwtDecode } from "jwt-decode";
  import API, { handleError } from "../../services/api";
  import meetingService from "../../services/meetingService";
  import storyService from "../../services/storyService";
  import { toast, ToastContainer } from "react-toastify";

  import {
    FaEllipsisH,
    FaVideo,
    FaComments,
    FaLaptopCode,
    FaRobot,
    FaProjectDiagram,
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

  const getProjectIcon = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("ai") || t.includes("bot")) return <FaRobot />;
    if (t.includes("code") || t.includes("app") || t.includes("dev")) return <FaLaptopCode />;
    return <FaProjectDiagram />;
  };

  const isDoneStory = (story) => {
    const status = String(story?.status || "").toLowerCase();
    return status === "done" || status === "completed";
  };

  const calculateProjectProgress = (project, stories = []) => {
    if (!stories.length) return project.status === "completed" ? 100 : 0;
    return Math.round((stories.filter(isDoneStory).length / stories.length) * 100);
  };

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
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);

    // ── إنشاء فريق جديد ─────────────────────────────────────────────
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [companyId, setCompanyId] = useState(null);

    const [memberEmail, setMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("member");

    // ── استخراج companyId من التوكن ──────────────────────────────────
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        let cId =
          decoded.companyId ||
          decoded.company ||
          (decoded.user && decoded.user.companyId) ||
          localStorage.getItem("companyId");

        if (!cId && decoded.role === "system-admin") {
          cId = "66391d5bb96fa3ef34a8145b";
          localStorage.setItem("companyId", cId);
        }

        setCompanyId(cId);
      } catch (err) {
        console.error("Error decoding token:", err);
        toast.error("Session error. Please log in again.");
      }
    }, []);

    // ── جلب الفرق + الأعضاء + المشاريع المرتبطة بكل فريق ─────────────
    const fetchTeamsAndMembers = async () => {
      if (!companyId) return;

      try {
        setLoadingTeams(true);

        const teamsRes = await API.get(`/api/teams/company/${companyId}`);

        if (teamsRes.data.success) {
          const fetchedTeams = teamsRes.data.data;

          const teamsWithDetails = await Promise.all(
            fetchedTeams.map(async (team) => {
              // Members
              let members = [];
              try {
                const membersRes = await API.get(`/api/teams/${team._id}/members`);
                members = membersRes.data.success ? membersRes.data.data : [];
              } catch (err) {
                console.error(`Error fetching members for team ${team._id}:`, err);
              }

              // Projects for this team (if backend exposes a teamId filter on projects)
              let projects = [];
              try {
                const projectsRes = await API.get(`/api/projects/team/${team._id}`);
                if (projectsRes.data.success) {
                  projects = projectsRes.data.data || [];
                }
              } catch (err) {
                // Endpoint may not exist yet — fall back to empty list, not fake data
                projects = [];
              }

              const projectsWithProgress = await Promise.all(
                projects.map(async (project) => {
                  try {
                    const storiesRes = await storyService.getStoriesByProject(project._id);
                    const stories = storiesRes?.data || storiesRes || [];
                    return {
                      ...project,
                      progress: calculateProjectProgress(project, Array.isArray(stories) ? stories : []),
                    };
                  } catch (err) {
                    console.error(`Error fetching stories for project ${project._id}:`, err);
                    return {
                      ...project,
                      progress: Number.isFinite(Number(project.progress))
                        ? Number(project.progress)
                        : calculateProjectProgress(project),
                    };
                  }
                })
              );

              return {
                ...team,
                archived: team.archived || false,
                members,
                projects: projectsWithProgress,
              };
            })
          );

          setTeams(teamsWithDetails);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error(handleError(error).message || "Failed to load teams data.");
      } finally {
        setLoadingTeams(false);
      }
    };

    useEffect(() => {
      fetchTeamsAndMembers();
    }, [companyId]);

    // ── إنشاء فريق جديد ─────────────────────────────────────────────
    const handleCreateTeam = async (e) => {
      e.preventDefault();
      if (!newTeamName.trim()) {
        toast.warn("Please enter a team name");
        return;
      }
      if (!companyId) {
        toast.error("Company information missing. Please re-login.");
        return;
      }

      setIsCreatingTeam(true);
      try {
        const response = await API.post("/api/teams", {
          name: newTeamName.trim(),
          companyId,
        });

        if (response.data.success) {
          const createdTeam = {
            ...response.data.data,
            archived: false,
            members: [],
            projects: [],
          };
          setTeams((prev) => [createdTeam, ...prev]);
          setNewTeamName("");
          setShowCreateModal(false);
          toast.success("Team created successfully! 🎉");
        }
      } catch (error) {
        console.error("Error creating team:", error);
        toast.error(handleError(error).message || "Failed to create team");
      } finally {
        setIsCreatingTeam(false);
      }
    };

    // ── إضافة عضو جديد بالإيميل ──────────────────────────────────────
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
        // 1. Search user by email
        const userRes = await API.get(
          `/api/users/search?email=${encodeURIComponent(memberEmail.trim())}`
        );

        const targetUserId =
          userRes.data?.data?._id ||
          userRes.data?.data?.[0]?._id || // in case backend returns an array
          userRes.data?.user?._id;

        if (!targetUserId) {
          toast.update(toastId, {
            render: "User not found with this email address.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          setIsSubmittingMember(false);
          return;
        }

        // 2. Add member to team
        const response = await API.post(`/api/teams/${team._id}/members`, {
          userId: targetUserId,
          role_in_team: newMemberRole,
        });

        if (response.data.success) {
          toast.update(toastId, {
            render: "Member added successfully! 🤝",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          await fetchTeamsAndMembers();
          setMemberEmail("");
          setNewMemberRole("member");
          setAddPanel(null);
        }
      } catch (error) {
        console.error("Error adding member:", error);
        const msg = handleError(error).message;
        toast.update(toastId, {
          render:
            error?.response?.status === 409
              ? "This user is already a member of the team."
              : msg || "Failed to add member.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      } finally {
        setIsSubmittingMember(false);
      }
    };

    // ── حذف عضو من الفريق ────────────────────────────────────────────
    const handleRemoveMember = async (teamId, memberId) => {
      if (!window.confirm("Are you sure you want to remove this member?")) return;

      try {
        await API.delete(`/api/teams/${teamId}/members/${memberId}`);

        setTeams((prev) =>
          prev.map((t) =>
            t._id === teamId
              ? { ...t, members: t.members.filter((m) => m._id !== memberId) }
              : t
          )
        );
        toast.success("Member removed from team");
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error(handleError(error).message || "Failed to remove member.");
      }
    };

    // ── بدء اجتماع فوري للفريق ────────────────────────────────────────
    // Meetings require a projectId. We use the team's first linked project.
    const handleStartMeeting = async (team) => {
      const project = (team.projects || [])[0];

      if (!project?._id) {
        toast.error("This team has no linked project. Create a project for this team first.");
        return;
      }

      try {
        setLoadingMeeting((prev) => ({ ...prev, [team._id]: true }));

        const attendeeIds = (team.members || [])
          .map((m) => m.userId?._id || m.userId)
          .filter(Boolean);

        // 1. Create the meeting under the team's project
        const meeting = await meetingService.createMeeting(
          project._id,
          `Instant Meeting - ${team.name}`,
          "",
          attendeeIds
        );

        // 2. Mark it as live immediately
        const started = await meetingService.startMeeting(meeting._id);

        toast.success("Launching instant meeting... 🚀");
        navigate(`/meeting/${started.roomId}`);
      } catch (error) {
        console.error("Error starting the meeting:", error);
        toast.error(error.message || "Failed to start the meeting.");
      } finally {
        setLoadingMeeting((prev) => ({ ...prev, [team._id]: false }));
      }
    };

    const visibleTeams = teams.filter(
      (team) =>
        !team.archived &&
        `${team.name} ${team.members?.map((m) => m.userId?.name || "").join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase())
    );

    // ── حذف فريق نهائياً ─────────────────────────────────────────────
    const deleteTeam = async (idx, id) => {
      if (!window.confirm("Are you sure you want to delete this team?")) return;
      try {
        await API.delete(`/api/teams/${id}`);
        setTeams((prev) => prev.filter((_, i) => i !== idx));
        toast.success("Team permanently deleted");
      } catch (error) {
        console.error("Error deleting team:", error);
        toast.error(handleError(error).message || "Failed to delete the team.");
      }
      setMenu(null);
    };

    // ── أرشفة (محلية فقط - الباكيند الحالي مايدعمهاش) ─────────────────
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

    // ── تعديل اسم الفريق ─────────────────────────────────────────────
    const saveEdit = async (idx, id) => {
      if (!editTeamName.trim()) return;
      try {
        const response = await API.put(`/api/teams/${id}`, { name: editTeamName.trim() });
        if (response.data.success) {
          setTeams((prev) =>
            prev.map((team, i) => (i === idx ? { ...team, name: editTeamName.trim() } : team))
          );
          setEditPanel(null);
          setEditTeamName("");
          toast.success("Team settings saved");
        }
      } catch (error) {
        console.error("Error updating team name:", error);
        toast.error(handleError(error).message || "Failed to save changes.");
      }
    };

    return (
      <MainLayout>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />

        <div className="min-h-0 text-white lg:h-full lg:overflow-hidden">

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

              <div className="flex h-11 w-full max-w-[260px] items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
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
          ) : visibleTeams.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-white/45">
              <p className="text-sm">No teams found.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex h-10 items-center gap-2 rounded-[14px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] px-4 text-xs font-bold transition hover:brightness-110"
              >
                <FaPlus /> Create your first team
              </button>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 lg:h-[calc(100%-60px)] lg:gap-6 lg:overflow-y-hidden lg:pr-2">
              {visibleTeams.map((team) => {
                const idx = teams.findIndex((t) => t._id === team._id);

                return (
                  <div
                    key={team._id}
                    className="flex min-w-[min(88vw,370px)] max-w-[370px] flex-col overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 p-4 shadow-[0_22px_55px_rgba(0,0,0,.30)] transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(95,150,255,.18)] sm:rounded-[30px] sm:p-5 lg:h-full lg:min-w-[370px]"
                  >
                    <div className="relative mb-4 flex shrink-0 items-center justify-between">
                      <div className="min-w-0">
                        {editPanel === idx ? (
                          <input
                            value={editTeamName}
                            onChange={(e) => setEditTeamName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(idx, team._id)}
                            autoFocus
                            className="h-9 w-[230px] rounded-xl bg-[#141d66] px-3 text-sm font-bold outline-none"
                          />
                        ) : (
                          <h3 className="truncate text-[17px] font-bold">{team.name}</h3>
                        )}
                        <p className="mt-1 text-[11px] text-white/45">{(team.members || []).length} Members</p>
                      </div>

                      {editPanel === idx ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(idx, team._id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/20 text-[#78aaff]"><FaSave /></button>
                          <button onClick={() => { setEditPanel(null); setEditTeamName(""); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/55"><FaTimes /></button>
                        </div>
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

                      {(team.members || []).length === 0 ? (
                        <div className="mb-5 rounded-[20px] border border-dashed border-white/10 p-4 text-center text-[11px] text-white/35">
                          No members yet. Click "Add" to invite someone by email.
                        </div>
                      ) : (
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

                              {/* <div className={`mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gradient-to-b ${avatarColors[i % 4]} text-2xl text-white`}>
                                {iconSet[i % 4]}
                              </div> */}
                              {m.userId?.avatar ? (
  <img
    src={m.userId.avatar}
    alt={m.userId?.name || "Member"}
    className="mx-auto h-[58px] w-[58px] rounded-full object-cover ring-2 ring-white/15"
  />
) : (
  <div className={`mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gradient-to-b ${avatarColors[i % 4]} text-[20px] font-black uppercase text-white`}>
    {(m.userId?.name || "?").charAt(0)}
  </div>
)}
                              <h4 className="mt-3 truncate text-[13px] font-bold">{m.userId?.name || "Unknown User"}</h4>
                              <p className="mt-1 truncate text-[10px] text-[#78aaff] font-semibold uppercase tracking-wider">{m.role_in_team}</p>
                              <p className="mt-0.5 truncate text-[9px] text-white/40">{m.userId?.specialization || "Developer"}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-[14px] font-bold">Projects</h4>
                        <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-[#78aaff]">{(team.projects || []).length} active</span>
                      </div>

                      {(team.projects || []).length === 0 ? (
                        <div className="rounded-[20px] border border-dashed border-white/10 p-4 text-center text-[11px] text-white/35">
                          No projects linked to this team yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {(team.projects || []).map((project) => {
                            const title = project.name || project.title || "Untitled";
                            const progress = project.progress ?? 0;
                            return (
                              <button
                                key={project._id || title}
                                onClick={() => navigate("/projects")}
                                className="rounded-[20px] bg-[#10184c]/90 p-4 text-left transition hover:-translate-y-1 hover:bg-[#182267]"
                              >
                                <div className="mb-3 flex items-center gap-2">
                                  <span className="text-[#f6c14f]">{getProjectIcon(title)}</span>
                                  <h5 className="truncate text-[11px] font-bold">{title}</h5>
                                </div>
                                <div className="h-[6px] rounded-full bg-white/15">
                                  <span className="block h-full rounded-full bg-gradient-to-r from-[#f6c14f] to-[#ff9f43]" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="mt-2 text-[10px] text-white/55">{progress}% Completed</p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex shrink-0 gap-3 pt-3">
                      <button
                        disabled={loadingMeeting[team._id]}
                        onClick={() => handleStartMeeting(team)}
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
              <div className="w-full max-w-[420px] rounded-[24px] border border-white/10 bg-[#0d1442] p-5 shadow-2xl sm:p-6">
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
                      autoFocus
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#141d66] px-4 text-sm outline-none focus:border-blue-400/50 text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isCreatingTeam}
                    className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-xs font-bold transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isCreatingTeam ? "Creating..." : "Create Team"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── Add Team Member Modal ────────────────────────────────── */}
          {addPanel !== null && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 backdrop-blur-md">
              <div className="w-full max-w-[420px] rounded-[24px] border border-white/10 bg-[#0d1442] p-5 shadow-2xl sm:p-6">
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
                      autoFocus
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
