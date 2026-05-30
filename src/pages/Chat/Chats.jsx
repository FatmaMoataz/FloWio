import { useRef, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import NewChatOverlay from "../../components/NewChatOverlay/NewChatOverlay";

import {
  FaSearch,
  FaPhoneAlt,
  FaEllipsisH,
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaPlus,
  FaUsers,
  FaUserTie,
  FaUserAstronaut,
  FaUserNinja,
  FaUserGraduate,
  FaTrash,
  FaInfoCircle,
  FaBellSlash,
  FaFileAlt,
  FaImage,
  FaVideo,
  FaMicrophone,
  FaTimes,
  FaThumbtack,
} from "react-icons/fa";

const emojis = ["😀", "😂", "😍", "🥰", "👍", "🔥", "❤️", "🎉", "👏", "😎", "✅", "💙"];

const initialChats = [
  { id: 1, name: "FloWio Group Chat", msg: "Thanks for offering to help!", time: "04:24 AM", online: true, pinned: true, icon: <FaUsers />, color: "from-[#6eb5ff] to-[#5b7dff]" },
  { id: 2, name: "Hamza Iqbal", msg: "Perfect! The payment...", time: "04:24 AM", online: true, pinned: false, icon: <FaUserTie />, color: "from-[#ffb86b] to-[#ff7b54]" },
  { id: 3, name: "Sara Javed", msg: "I can start tomorrow...", time: "03:18 AM", online: false, pinned: false, icon: <FaUserGraduate />, color: "from-[#ff5ea8] to-[#ff3d7f]" },
  { id: 4, name: "Ayesha Noor", msg: "Sure, I will check it.", time: "Yesterday", online: true, pinned: false, icon: <FaUserAstronaut />, color: "from-[#5fffd0] to-[#35b7ff]" },
  { id: 5, name: "Omar Khaled", msg: "Let's review the task.", time: "Mon", online: false, pinned: false, icon: <FaUserNinja />, color: "from-[#ffd166] to-[#ffb703]" },
];

const initialMessages = [
  { from: "other", text: "Hi! I saw your help request for grocery shopping. I'd be happy to help!", time: "12:42 PM" },
  { from: "me", text: "That's wonderful! Thank you so much. I need help getting groceries for my elderly mother.", time: "01:12 PM" },
  { from: "other", text: "Of course! I have a car and I'm familiar with the area. What time works best for you?", time: "01:47 PM" },
  { from: "me", text: "How about tomorrow around 2 PM? I can provide the shopping list and payment for groceries.", time: "01:57 PM" },
];

function Avatar({ icon, online, color, small }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b ${color} text-white shadow-[0_0_18px_rgba(255,255,255,.10)] ${
        small ? "h-10 w-10 text-sm" : "h-12 w-12 text-lg"
      }`}
    >
      {icon}
      <span
        className={`absolute right-0 top-0 rounded-full border-2 border-[#0c144a] ${
          online ? "bg-[#37e783]" : "bg-white/70"
        } ${small ? "h-3 w-3" : "h-3.5 w-3.5"}`}
      />
    </div>
  );
}

export default function Chats() {
  const fileInputRef = useRef(null);

  const [chats, setChats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState(initialChats[0]);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [files, setFiles] = useState([]);

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const [muted, setMuted] = useState(false);
  const [fileAccept, setFileAccept] = useState("*/*");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(query.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((chat) => chat.pinned);
  const allChats = filteredChats.filter((chat) => !chat.pinned);

  const getTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const createNewChat = (chatInfo) => {
    const newChat = {
      id: Date.now(),
      name: chatInfo.name,
      msg: "New conversation created",
      time: "Now",
      online: chatInfo.online,
      pinned: false,
      icon: chatInfo.icon,
      color: chatInfo.color,
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
    setMessages([]);
    setNewChatOpen(false);
  };

  const openUpload = (accept) => {
    setFileAccept(accept);
    setAttachOpen(false);

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []).map((file) => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = () => {
    if (!input.trim() && files.length === 0) return;

    setMessages((prev) => [
      ...prev,
      {
        from: "me",
        text: input.trim(),
        files,
        time: getTime(),
      },
    ]);

    setInput("");
    setFiles([]);
    setEmojiOpen(false);
    setAttachOpen(false);
  };

  const clearChat = () => {
    setMessages([]);
    setMenuOpen(false);
  };

  const togglePin = () => {
    const updatedChats = chats.map((chat) =>
      chat.id === activeChat.id ? { ...chat, pinned: !chat.pinned } : chat
    );

    setChats(updatedChats);
    setActiveChat(updatedChats.find((chat) => chat.id === activeChat.id));
    setMenuOpen(false);
  };

  const ChatCard = ({ chat }) => (
    <button
      onClick={() => {
        setActiveChat(chat);
        setMenuOpen(false);
        setNewChatOpen(false);
      }}
      className={`w-full rounded-[22px] p-3 text-left transition-all duration-300 ${
        activeChat.id === chat.id
          ? "border border-blue-300/20 bg-gradient-to-r from-[#1c2a87]/95 to-[#141f69]/95 shadow-[0_0_22px_rgba(95,150,255,.22)]"
          : "bg-[#10184c]/90 hover:-translate-y-1 hover:bg-[#151f62]"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar icon={chat.icon} online={chat.online} color={chat.color} small />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h4 className="truncate text-[13px] font-bold">{chat.name}</h4>
            {chat.pinned && (
              <FaThumbtack className="text-[9px] text-[#6eb5ff]" />
            )}
          </div>

          <p className="mt-1 truncate text-[11px] text-white/50">{chat.msg}</p>
        </div>

        <span className="text-[9px] text-white/40">{chat.time}</span>
      </div>
    </button>
  );

  return (
    <MainLayout title="Chats">
      <div className="grid h-full min-h-0 grid-cols-[300px_1fr] gap-6 text-white">
        {/* LEFT PANEL */}
        <div className="min-h-0 overflow-y-auto rounded-[28px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 p-5 shadow-[0_22px_55px_rgba(0,0,0,.30)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[17px] font-bold tracking-[-0.2px]">
              Messages
            </h3>

            <div className="relative">
              <button
                onClick={() => setNewChatOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm shadow-[0_0_18px_rgba(95,150,255,.35)] transition hover:brightness-110"
              >
                <FaPlus />
              </button>

              {newChatOpen && (
                <NewChatOverlay
                  onClose={() => setNewChatOpen(false)}
                  onCreate={createNewChat}
                />
              )}
            </div>
          </div>

          <div className="mb-5 flex h-11 items-center rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
            <FaSearch className="text-xs text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="ml-3 w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
            />
          </div>

          <p className="mb-3 text-[12px] text-white/45">Pinned Chat</p>

          <div className="space-y-3">
            {pinnedChats.length > 0 ? (
              pinnedChats.map((chat) => <ChatCard key={chat.id} chat={chat} />)
            ) : (
              <p className="rounded-2xl bg-[#10184c]/60 p-3 text-[11px] text-white/35">
                No pinned chats yet.
              </p>
            )}
          </div>

          <p className="mb-3 mt-6 text-[12px] text-white/45">All Chats</p>

          <div className="space-y-3">
            {allChats.length > 0 ? (
              allChats.map((chat) => <ChatCard key={chat.id} chat={chat} />)
            ) : (
              <p className="rounded-2xl bg-[#10184c]/60 p-3 text-[11px] text-white/35">
                No chats available.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 shadow-[0_22px_55px_rgba(0,0,0,.30)]">
          <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <Avatar
                icon={activeChat.icon}
                online={activeChat.online}
                color={activeChat.color}
              />

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold">{activeChat.name}</h3>
                  {activeChat.pinned && (
                    <FaThumbtack className="text-[11px] text-[#6eb5ff]" />
                  )}
                </div>

                <p className="mt-1 text-[11px] text-[#37e783]">
                  {activeChat.online ? "Active Now" : "Offline"}
                  {muted && <span className="ml-2 text-white/45">• Muted</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => alert(`Calling ${activeChat.name}...`)}
                className="text-white/75 transition hover:text-[#6eb5ff]"
              >
                <FaPhoneAlt />
              </button>

              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="text-white/75 transition hover:text-[#6eb5ff]"
              >
                <FaEllipsisH />
              </button>
            </div>

            {menuOpen && (
              <div className="absolute right-6 top-[62px] z-50 w-[200px] rounded-[18px] border border-white/10 bg-[#0b1246] p-2 shadow-[0_18px_40px_rgba(0,0,0,.35)]">
                <button
                  onClick={() => alert(`${activeChat.name} information opened`)}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs transition hover:bg-blue-300/15"
                >
                  <FaInfoCircle /> Chat Info
                </button>

                <button
                  onClick={togglePin}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs transition hover:bg-blue-300/15"
                >
                  <FaThumbtack />{" "}
                  {activeChat.pinned ? "Unpin Chat" : "Pin Chat"}
                </button>

                <button
                  onClick={() => {
                    setMuted((prev) => !prev);
                    setMenuOpen(false);
                  }}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs transition hover:bg-blue-300/15"
                >
                  <FaBellSlash /> {muted ? "Unmute Chat" : "Mute Chat"}
                </button>

                <button
                  onClick={clearChat}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs text-[#ff6b8a] transition hover:bg-red-400/15"
                >
                  <FaTrash /> Delete Chat
                </button>
              </div>
            )}
          </div>

          {/* MESSAGES */}
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-white/40">
                No messages yet.
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-3 ${
                  msg.from === "me" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.from === "other" && (
                  <Avatar
                    icon={activeChat.icon}
                    online={activeChat.online}
                    color={activeChat.color}
                    small
                  />
                )}

                <div
                  className={`max-w-[430px] ${
                    msg.from === "me" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`rounded-[22px] px-5 py-3 text-[12px] leading-5 shadow-[0_12px_28px_rgba(0,0,0,.18)] ${
                      msg.from === "me"
                        ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white"
                        : "bg-white text-[#0c123f]"
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}

                    {msg.files?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.files.map((file, i) => (
                          <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2 text-[11px] underline"
                          >
                            <FaFileAlt />
                            <span className="truncate">{file.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`mt-2 flex items-center gap-2 text-[10px] text-white/45 ${
                      msg.from === "me" ? "justify-end" : ""
                    }`}
                  >
                    {msg.from === "me" && (
                      <span className="text-[#6eb5ff]">✓✓</span>
                    )}
                    <span>{msg.time}</span>
                    {msg.from === "me" && (
                      <span className="font-bold text-white">Me</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="relative shrink-0 border-t border-white/10 p-4">
            {emojiOpen && (
              <div className="absolute bottom-[78px] left-5 z-50 grid w-[235px] grid-cols-6 gap-2 rounded-[20px] border border-white/10 bg-[#0b1246] p-4 shadow-[0_18px_40px_rgba(0,0,0,.35)]">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setInput((prev) => prev + emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-blue-300/15"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {attachOpen && (
              <div className="absolute bottom-[78px] right-16 z-50 w-[210px] rounded-[18px] border border-white/10 bg-[#0b1246] p-2 shadow-[0_18px_40px_rgba(0,0,0,.35)]">
                <button
                  onClick={() =>
                    openUpload(".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx")
                  }
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs transition hover:bg-blue-300/15"
                >
                  <FaFileAlt /> Upload File
                </button>

                <button
                  onClick={() => openUpload("image/*")}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs transition hover:bg-blue-300/15"
                >
                  <FaImage /> Upload Image
                </button>

                <button
                  onClick={() => openUpload("video/*")}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs transition hover:bg-blue-300/15"
                >
                  <FaVideo /> Upload Video
                </button>

                <button
                  onClick={() => {
                    alert("Voice message feature ready as UI only");
                    setAttachOpen(false);
                  }}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs transition hover:bg-blue-300/15"
                >
                  <FaMicrophone /> Voice Message
                </button>
              </div>
            )}

            {files.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex max-w-[230px] items-center gap-2 rounded-full bg-[#10184c]/90 px-3 py-2 text-[11px] text-white/80"
                  >
                    <FaFileAlt />
                    <span className="truncate">{file.name}</span>
                    <span className="text-white/35">{file.size}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-[#ff6b8a] transition hover:text-red-300"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex h-12 items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
              <button
                onClick={() => {
                  setEmojiOpen((prev) => !prev);
                  setAttachOpen(false);
                }}
                className="text-white/45 transition hover:text-[#6eb5ff]"
              >
                <FaSmile />
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Write messages..."
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
              />

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={fileAccept}
                className="hidden"
                onChange={handleFiles}
              />

              <button
                onClick={() => {
                  setAttachOpen((prev) => !prev);
                  setEmojiOpen(false);
                }}
                className="text-white/45 transition hover:text-[#6eb5ff]"
              >
                <FaPaperclip />
              </button>

              <button
                onClick={sendMessage}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm shadow-[0_0_18px_rgba(95,150,255,.35)] transition hover:brightness-110"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}