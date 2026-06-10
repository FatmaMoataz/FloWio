import { useRef, useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import NewChatOverlay from "../../components/NewChatOverlay/NewChatOverlay";
import io from "socket.io-client";
import axios from "axios";

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

// الأيقونات والألوان الافتراضية للـ UI
const defaultIcon = <FaUsers />;
const defaultColor = "from-[#6eb5ff] to-[#5b7dff]";

// لستة غرف مبدئية عشان تظهر عندك في الـ Side Menu علطول وما ترميش 404
const initialRooms = [
  {
    id: "room-1",
    name: "FloWio Group Chat",
    msg: "Tap to view history",
    time: "Now",
    online: true,
    pinned: true,
    icon: <FaUsers />,
    color: "from-[#6eb5ff] to-[#5b7dff]",
  },
  {
    id: "room-2",
    name: "General Room",
    msg: "Start talking here",
    time: "Now",
    online: true,
    pinned: false,
    icon: <FaUserTie />,
    color: "from-[#ffb86b] to-[#ff7b54]",
  },
];

// الروابط المستهدفة
const BACKEND_URL = "https://flowio-backend.vercel.app";
const SOCKET_SERVER_URL = "http://localhost:10000";

// ربط السوكيت بالـ Local server بتاعك للشات الفوري
const socket = io(SOCKET_SERVER_URL, { autoConnect: false });

// اليوزر الحالي (تأكدي من عمل الـ Auth والـ Context عشان يقرأ الـ ID الحقيقي ديناميكياً)
const CURRENT_USER_ID = "64b0f7ca72d9a102c48e8a11";

function Avatar({ icon, online, color, small }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b ${color || defaultColor} text-white shadow-[0_0_18px_rgba(255,255,255,.10)] ${small ? "h-10 w-10 text-sm" : "h-12 w-12 text-lg"}`}
    >
      {icon || defaultIcon}
      <span
        className={`absolute right-0 top-0 rounded-full border-2 border-[#0c144a] ${online ? "bg-[#37e783]" : "bg-white/70"} ${small ? "h-3 w-3" : "h-3.5 w-3.5"}`}
      />
    </div>
  );
}

export default function Chats() {
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // الـ States الأساسية
  const [chats, setChats] = useState(initialRooms);
  const [activeChat, setActiveChat] = useState(initialRooms[0]);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  // 1️⃣ فتح اتصال السوكيت وجلب تاريخ الشات من الـ Live API عند تغيير الأوضة
  useEffect(() => {
    if (!activeChat) return;

    // تشغيل السوكيت المحلي
    socket.connect();
    socket.emit("join_room", activeChat.name);

    // سحب تاريخ الرسايل الحقيقي من فيرسيل بناءً على اسم الأوضة المفتوحة
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/messages/${activeChat.name}`,
        );

        const formattedMessages = response.data.map((msg) => ({
          from:
            msg.sender?._id === CURRENT_USER_ID ||
            msg.sender === CURRENT_USER_ID
              ? "me"
              : "other",
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          senderData: msg.sender,
        }));

        setMessages(formattedMessages);
      } catch (err) {
        console.error("Error fetching chat history from Vercel:", err);
        setMessages([]); // لو مفيش داتا متسجلة بنبدأ على نظيف
      }
    };

    fetchChatHistory();

    // الاستماع للرسايل الفورية القادمة من الـ Local socket server
    socket.on("receive_message", (data) => {
      // 🔥 الحل هنا: بنضيف الرسالة فقط لو جاية من شخص تالت مش أنا، وعشان نمنع الـ Duplication
      const isFromMe = data.sender === CURRENT_USER_ID;

      if (data.room === activeChat.name && !isFromMe) {
        setMessages((prev) => [
          ...prev,
          {
            from: "other",
            text: data.text,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            senderData: data.sender,
          },
        ]);
      }
    });

    // تنظيف المستمعين تماماً عند الانتقال لشات آخر لمنع تكرار الاتصالات
    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [activeChat]);

  // عمل Scroll أوتوماتيك لتحت عند وصول رسايل جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // دالة البحث وتصفية الغرف
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(query.toLowerCase()),
  );

  const isSearching = query.trim().length > 0;
  const pinnedChats = filteredChats.filter((chat) => chat.pinned);
  const allChats = filteredChats.filter((chat) => !chat.pinned);

  // 2️⃣ دالة إضافة غرف جديدة لتتم Client-side تماماً لحين بناء الموديل في الباك إند
  const createNewChat = (chatInfo) => {
    const newChat = {
      id: `room-${Date.now()}`,
      name: chatInfo.name,
      msg: "New conversation created",
      time: "Now",
      online: true,
      pinned: false,
      icon: defaultIcon,
      color: defaultColor,
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
    setMessages([]); // تصفير الشات استعداداً لأول رسالة
    setNewChatOpen(false);
  };

  // 3️⃣ دالة إرسال الرسالة عبر السوكيت
  const sendMessage = () => {
    if (!input.trim() && files.length === 0) return;

    const messageData = {
      room: activeChat.name,
      sender: CURRENT_USER_ID,
      text: input.trim(),
    };

    // إرسال للـ Socket server المحلي عشان يوزعها لكل اليوزر في نفس الأوضة فوراً
    socket.emit("send_message", messageData);

    // إضافة تفاؤلية (Optimistic UI Update) في شاشتك فوراً
    setMessages((prev) => [
      ...prev,
      {
        from: "me",
        text: input.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
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
    if (!activeChat) return;

    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === activeChat.id ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
    setActiveChat((currentChat) =>
      currentChat
        ? { ...currentChat, pinned: !currentChat.pinned }
        : currentChat,
    );
    setQuery("");
    setMenuOpen(false);
  };

  const deleteChat = () => {
    if (!activeChat) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${activeChat.name}"?`,
    );

    if (!confirmed) return;

    const remainingChats = chats.filter((chat) => chat.id !== activeChat.id);
    setChats(remainingChats);
    setActiveChat(remainingChats[0] || null);
    setMessages([]);
    setQuery("");
    setMenuOpen(false);
  };

  const ChatCard = ({ chat }) => (
    <button
      onClick={() => {
        setActiveChat(chat);
        setMenuOpen(false);
        setNewChatOpen(false);
      }}
      className={`w-full rounded-[22px] p-3 text-left transition-all duration-300 ${activeChat?.id === chat.id ? "border border-blue-300/20 bg-gradient-to-r from-[#1c2a87]/95 to-[#141f69]/95 shadow-[0_0_22px_rgba(95,150,255,.22)]" : "bg-[#10184c]/90 hover:-translate-y-1 hover:bg-[#151f62]"}`}
    >
      <div className="flex items-center gap-3">
        <Avatar
          icon={chat.icon}
          online={chat.online}
          color={chat.color}
          small
        />
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
      <div className="grid min-h-0 grid-cols-1 gap-4 text-white lg:h-full lg:grid-cols-[300px_1fr] lg:gap-6">
        {/* LEFT PANEL */}
        <div className="max-h-[420px] min-h-0 overflow-y-auto rounded-[22px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 p-4 shadow-[0_22px_55px_rgba(0,0,0,.30)] sm:rounded-[28px] sm:p-5 lg:max-h-none">
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

          {isSearching ? (
            <>
              <p className="mb-3 text-[12px] text-white/45">Search Results</p>
              <div className="space-y-3">
                {filteredChats.length > 0 ? (
                  filteredChats.map((chat) => (
                    <ChatCard key={chat.id} chat={chat} />
                  ))
                ) : (
                  <p className="rounded-2xl bg-[#10184c]/60 p-3 text-[11px] text-white/35">
                    No chats match your search.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mb-3 text-[12px] text-white/45">Pinned Chat</p>
              <div className="space-y-3">
                {pinnedChats.length > 0 ? (
                  pinnedChats.map((chat) => (
                    <ChatCard key={chat.id} chat={chat} />
                  ))
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
            </>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex min-h-[520px] flex-col overflow-hidden rounded-[22px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 shadow-[0_22px_55px_rgba(0,0,0,.30)] sm:rounded-[28px] lg:h-full lg:min-h-0">
          {activeChat ? (
            <>
              <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    icon={activeChat.icon}
                    online={activeChat.online}
                    color={activeChat.color}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[16px] font-bold">
                        {activeChat.name}
                      </h3>
                      {activeChat.pinned && (
                        <FaThumbtack className="text-[11px] text-[#6eb5ff]" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#37e783]">
                      {activeChat.online ? "Active Now" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="text-white/75 transition hover:text-[#6eb5ff]"
                  >
                    <FaEllipsisH />
                  </button>
                </div>

                {menuOpen && (
                  <div className="absolute right-4 top-[58px] z-30 w-44 rounded-2xl border border-white/10 bg-[#0b1246] p-2 shadow-[0_18px_40px_rgba(0,0,0,.45)] sm:right-6">
                    <button
                      type="button"
                      onClick={togglePin}
                      className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-semibold text-white/80 transition hover:bg-blue-300/10 hover:text-[#7db6ff]"
                    >
                      <FaThumbtack />
                      {activeChat.pinned ? "Unpin Chat" : "Pin Chat"}
                    </button>
                    <button
                      type="button"
                      onClick={deleteChat}
                      className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-semibold text-[#ff7f96] transition hover:bg-red-400/10"
                    >
                      <FaTrash />
                      Delete Chat
                    </button>
                  </div>
                )}
              </div>

              {/* MESSAGES AREA */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-white/40">
                    No messages yet.
                  </div>
                )}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-end gap-3 ${msg.from === "me" ? "justify-end" : "justify-start"}`}
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
                      className={`max-w-[78%] sm:max-w-[430px] ${msg.from === "me" ? "text-right" : "text-left"}`}
                    >
                      <div
                        className={`rounded-[22px] px-5 py-3 text-[12px] leading-5 shadow-[0_12px_28px_rgba(0,0,0,.18)] ${msg.from === "me" ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white" : "bg-white text-[#0c123f]"}`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <div
                        className={`mt-2 flex items-center gap-2 text-[10px] text-white/45 ${msg.from === "me" ? "justify-end" : ""}`}
                      >
                        <span>{msg.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT AREA */}
              <div className="relative shrink-0 border-t border-white/10 p-4">
                <div className="flex h-12 items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#141d66]/90 px-4">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Write messages..."
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                  />
                  <button
                    onClick={sendMessage}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm shadow-[0_0_18px_rgba(95,150,255,.35)] transition hover:brightness-110"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-white/40">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
