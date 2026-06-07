import { useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaEllipsisH,
  FaTimes,
} from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";

export default function Community() {
  const currentUserId = localStorage.getItem("userId") || "current-user";
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollText, setPollText] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollError, setPollError] = useState("");
  const [posts, setPosts] = useState([
    {
      id: 1,
      authorId: "ceo-amaton",
      name: "Mike Johnson",
      role: "CEO of Amaton",
      avatar: "https://i.pravatar.cc/100?img=12",
      content:
        "We tried other tools such as Boom, Gologolo Meet, etc. There is nothing as good as meet.line yet!",
      time: "2 hours ago",
      liked: false,
    },
    {
      id: 2,
      authorId: "community-member",
      name: "Mike Johnson",
      role: "CEO of Amaton",
      avatar: "https://i.pravatar.cc/100?img=12",
      content:
        "We tried other tools such as Boom, Gologolo Meet, etc. There is nothing as good as meet.line yet!",
      time: "2 hours ago",
      liked: false,
    },
  ]);

  const toggleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, liked: !post.liked } : post,
      ),
    );
  };

  const deletePost = (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setOpenMenuId(null);
  };

  const togglePollVote = (postId, optionIndex) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId || !post.options) return post;

        const votes = post.votes || Array(post.options.length).fill(0);
        const nextVotes = [...votes];
        const previousVote = post.userVote;

        if (previousVote === optionIndex) {
          nextVotes[optionIndex] = Math.max(0, nextVotes[optionIndex] - 1);
          return { ...post, votes: nextVotes, userVote: null };
        }

        if (previousVote !== null && previousVote !== undefined) {
          nextVotes[previousVote] = Math.max(0, nextVotes[previousVote] - 1);
        }

        nextVotes[optionIndex] += 1;
        return { ...post, votes: nextVotes, userVote: optionIndex };
      }),
    );
  };

  const addPoll = (e) => {
    e.preventDefault();

    const trimmedText = pollText.trim();
    const options = pollOptions.map((option) => option.trim()).filter(Boolean);

    if (!trimmedText) {
      setPollError("Poll question is required.");
      return;
    }

    if (options.length < 2) {
      setPollError("Please add at least two poll options.");
      return;
    }

    setPosts((prev) => [
      {
        id: Date.now(),
        authorId: currentUserId,
        name: "You",
        role: "Flowio Member",
        avatar: "https://i.pravatar.cc/100?img=5",
        content: trimmedText,
        options,
        votes: Array(options.length).fill(0),
        userVote: null,
        time: "Just now",
        liked: false,
      },
      ...prev,
    ]);

    setPollText("");
    setPollOptions(["", ""]);
    setPollError("");
    setIsPollOpen(false);
  };

  const updatePollOption = (index, value) => {
    setPollOptions((prev) =>
      prev.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  };

  const closePollModal = () => {
    setIsPollOpen(false);
    setPollText("");
    setPollOptions(["", ""]);
    setPollError("");
  };

  return (
    <MainLayout title="Community">
      <div className="relative h-full min-h-0 overflow-y-auto pr-2 text-white">
        {openMenuId && (
          <button
            type="button"
            aria-label="Close post menu"
            onClick={() => setOpenMenuId(null)}
            className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm"
          />
        )}

        <div className="mx-auto flex w-full max-w-[820px] flex-col">
          <div className="mx-auto mb-7 flex w-full max-w-[760px] items-center gap-4">
            <img
              src="https://i.pravatar.cc/100?img=5"
              alt=""
              className="h-11 w-11 rounded-full object-cover ring-2 ring-[#64CFFF]/25"
            />

            <div className="flex h-13 flex-1 items-center justify-between rounded-[14px] border border-blue-300/10 bg-[#101650]/90 px-5 shadow-[0_14px_34px_rgba(0,0,0,.18)]">
              <span className="text-xs text-white/55">Write post...</span>

              <button
                type="button"
                onClick={() => setIsPollOpen(true)}
                className="text-[11px] font-semibold text-white/75 transition hover:text-[#64CFFF]"
              >
                + create a poll
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {posts.map((post) => {
              const isOwner = post.authorId === currentUserId;

              return (
                <article
                  key={post.id}
                  className={`relative overflow-hidden rounded-[18px] border border-white/[0.05] bg-gradient-to-br from-[#151d60]/95 to-[#0b103d]/95 px-5 py-4 shadow-[0_20px_48px_rgba(0,0,0,.34),0_0_22px_rgba(28,48,130,.16)] before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-r-full before:bg-[#26377f]/80 before:shadow-[0_0_18px_rgba(38,55,127,.45)] ${
                    openMenuId === post.id ? "z-20" : "z-0"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={post.avatar}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-[#64CFFF]/20"
                      />

                      <div>
                        <h3 className="text-[15px] font-bold">{post.name}</h3>
                        <p className="mt-1 text-[11px] text-white/55">
                          {post.role}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          isOwner &&
                          setOpenMenuId(openMenuId === post.id ? null : post.id)
                        }
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                          isOwner
                            ? "text-white/65 hover:bg-white/10 hover:text-white"
                            : "cursor-default text-white/25"
                        }`}
                        aria-label="Post menu"
                      >
                        <FaEllipsisH />
                      </button>

                      {openMenuId === post.id && isOwner && (
                        <div className="absolute right-0 top-9 z-20 w-32 rounded-2xl border border-white/10 bg-[#121957] p-2 shadow-[0_18px_40px_rgba(0,0,0,.45)]">
                          <button
                            type="button"
                            onClick={() => deletePost(post.id)}
                            className="flex h-9 w-full items-center rounded-xl px-3 text-left text-xs font-semibold text-[#ff6b8a] transition hover:bg-red-400/15"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-7 text-[13px] leading-relaxed text-white/85">
                    "{post.content}"
                  </p>

                  {post.options && (
                    <div className="mt-4 space-y-2">
                      {post.options.map((option, optionIndex) => {
                        const votes =
                          post.votes || Array(post.options.length).fill(0);
                        const totalVotes = votes.reduce(
                          (total, voteCount) => total + voteCount,
                          0,
                        );
                        const percentage =
                          totalVotes > 0
                            ? Math.round(
                                (votes[optionIndex] / totalVotes) * 100,
                              )
                            : 0;
                        const hasVoted =
                          post.userVote !== null && post.userVote !== undefined;
                        const isSelected = post.userVote === optionIndex;

                        return (
                          <button
                            key={`${option}-${optionIndex}`}
                            type="button"
                            onClick={() => togglePollVote(post.id, optionIndex)}
                            className={`relative h-10 w-full overflow-hidden rounded-xl border px-4 text-left text-xs transition ${
                              isSelected
                                ? "border-[#64CFFF]/60 bg-[#64CFFF]/10 text-white"
                                : "border-white/10 bg-white/[0.04] text-white/75 hover:border-[#64CFFF]/45 hover:bg-[#64CFFF]/10"
                            }`}
                          >
                            {hasVoted && (
                              <span
                                className="absolute inset-y-0 left-0 bg-[#64CFFF]/18 transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            )}
                            <span className="relative z-10 flex items-center justify-between gap-3">
                              <span>{option}</span>
                              {hasVoted && (
                                <span className="font-bold text-[#64CFFF]">
                                  {percentage}%
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-5 text-xl">
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        className={`transition ${
                          post.liked
                            ? "text-pink-400"
                            : "text-white hover:text-pink-400"
                        }`}
                        aria-label={post.liked ? "Unlike post" : "Like post"}
                      >
                        {post.liked ? <FaHeart /> : <FaRegHeart />}
                      </button>

                      <button
                        type="button"
                        className="text-white transition hover:text-cyan-400"
                      >
                        <FaRegComment />
                      </button>
                    </div>

                    <span className="text-[10px] text-white/50">
                      - {post.time}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {isPollOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[26px] border border-white/10 bg-gradient-to-br from-[#16206d] to-[#0d1448] p-6 text-white shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold">Create Poll</h3>
                <button
                  type="button"
                  onClick={closePollModal}
                  className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={addPoll} className="space-y-4">
                {pollError && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-200">
                    {pollError}
                  </div>
                )}

                <textarea
                  value={pollText}
                  onChange={(e) => setPollText(e.target.value)}
                  rows="3"
                  placeholder="Write your poll question..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0f35] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#64CFFF]"
                />

                <div className="space-y-3">
                  {pollOptions.map((option, index) => (
                    <input
                      key={index}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f35] px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#64CFFF]"
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() => setPollOptions((prev) => [...prev, ""])}
                    className="h-10 rounded-xl border border-white/10 px-4 text-xs font-semibold text-white/70 transition hover:border-[#64CFFF]/45 hover:text-white"
                  >
                    + Add option
                  </button>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closePollModal}
                    className="h-10 rounded-xl px-4 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#5089D6] px-6 text-sm font-bold transition hover:brightness-110"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
