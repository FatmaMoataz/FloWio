import { useRef, useState, useEffect, useMemo } from "react";
import MainLayout from "../../layout/MainLayout";
import NewChatOverlay from "../../components/NewChatOverlay/NewChatOverlay";
import io from "socket.io-client";
import axios from "axios";

import {
  FaSearch,
  FaEllipsisH,
  FaPaperPlane,
  FaPlus,
  FaUsers,
  FaUserTie,
  FaTrash,
  FaBellSlash,
  FaThumbtack,
  FaVolumeUp,
} from "react-icons/fa";

const defaultIcon = <FaUsers />;
const defaultColor = "from-[#6eb5ff] to-[#5b7dff]";

const initialRooms = [
  {
    id: "room-1",
    name: "FloWio Group Chat",
    msg: "Tap to view history",
    time: "Now",
    online: true,
    pinned: true,
    muted: false,
    iconType: "users",
    color: "from-[#6eb5ff] to-[#5b7dff]",
  },
  {
    id: "room-2",
    name: "General Room",
    msg: "Start talking here",
    time: "Now",
    online: true,
    pinned: false,
    muted: false,
    iconType: "tie",
    color: "from-[#ffb86b] to-[#ff7b54]",
  },
];

const BACKEND_URL = "https://flowio-backend.vercel.app";
const SOCKET_SERVER_URL = "http://localhost:10000";
const socket = io(SOCKET_SERVER_URL, { autoConnect: false });
const CURRENT_USER_ID = "64b0f7ca72d9a102c48e8a11";

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getIcon = (type) => {
  if (type === "tie") return <FaUserTie />;
  return <FaUsers />;
};

function Avatar({ iconType, online, color, small }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b ${
        color || defaultColor
      } text-white shadow-[0_0_18px_rgba(255,255,255,.10)] ${
        small ? "h-10 w-10 text-sm" : "h-12 w-12 text-lg"
      }`}
    >
      {getIcon(iconType)}
      <span
        className={`absolute right-0 top-0 rounded-full border-2 border-[#0c144a] ${
          online ? "bg-[#37e783]" : "bg-white/70"
        } ${small ? "h-3 w-3" : "h-3.5 w-3.5"}`}
      />
    </div>
  );
}

export default function Chats() {
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("flowioChats");
    return saved ? JSON.parse(saved) : initialRooms;
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return localStorage.getItem("flowioActiveChatId") || "room-1";
  });

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [messagesByChat, setMessagesByChat] = useState(() => {
    const saved = localStorage.getItem("flowioMessagesByChat");
    return saved ? JSON.parse(saved) : {};
  });

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [openChatMenuId, setOpenChatMenuId] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const messages = activeChat ? messagesByChat[activeChat.id] || [] : [];

  useEffect(() => {
    localStorage.setItem("flowioChats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("flowioMessagesByChat", JSON.stringify(messagesByChat));
  }, [messagesByChat]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("flowioActiveChatId", activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChat) return;

    socket.connect();
    socket.emit("join_room", activeChat.name);

    const fetchChatHistory = async () => {
      const localMessages = messagesByChat[activeChat.id];

      if (localMessages?.length) return;

      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/messages/${activeChat.name}`,
        );

        const formattedMessages = response.data.map((msg) => ({
          from:
            msg.sender?._id === CURRENT_USER_ID || msg.sender === CURRENT_USER_ID
              ? "me"
              : "other",
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessagesByChat((prev) => ({
          ...prev,
          [activeChat.id]: formattedMessages,
        }));
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    fetchChatHistory();

    socket.on("receive_message", (data) => {
      const isFromMe = data.sender === CURRENT_USER_ID;

      if (data.room === activeChat.name && !isFromMe) {
        const newMsg = {
          from: "other",
          text: data.text,
          time: getTime(),
        };

        setMessagesByChat((prev) => ({
          ...prev,
          [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
        }));

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat.id
              ? { ...chat, msg: data.text, time: "Now" }
              : chat,
          ),
        );
      }
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [activeChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [chats, query]);

  const pinnedChats = filteredChats.filter((chat) => chat.pinned);
  const allChats = filteredChats.filter((chat) => !chat.pinned);

  const createNewChat = (chatInfo) => {
    const newChat = {
      id: `room-${Date.now()}`,
      name: chatInfo.name,
      msg: "New conversation created",
      time: "Now",
      online: true,
      pinned: false,
      muted: false,
      iconType: "users",
      color: defaultColor,
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMessagesByChat((prev) => ({ ...prev, [newChat.id]: [] }));
    setNewChatOpen(false);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;

    const cleanText = input.trim();

    socket.emit("send_message", {
      room: activeChat.name,
      sender: CURRENT_USER_ID,
      text: cleanText,
    });

    const newMessage = {
      from: "me",
      text: cleanText,
      time: getTime(),
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage],
    }));

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? { ...chat, msg: cleanText, time: "Now" }
          : chat,
      ),
    );

    setInput("");
  };

  const togglePinChat = (chatId) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
    setOpenChatMenuId(null);
    setHeaderMenuOpen(false);
  };

  const toggleMuteChat = (chatId) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, muted: !chat.muted } : chat,
      ),
    );
    setOpenChatMenuId(null);
    setHeaderMenuOpen(false);
  };

  const deleteChat = (chatId) => {
    const chat = chats.find((item) => item.id === chatId);
    if (!chat) return;

    const confirmed = window.confirm(`Delete "${chat.name}"?`);
    if (!confirmed) return;

    const remaining = chats.filter((item) => item.id !== chatId);

    setChats(remaining);

    setMessagesByChat((prev) => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });

    if (activeChatId === chatId) {
      setActiveChatId(remaining[0]?.id || "");
    }

    setOpenChatMenuId(null);
    setHeaderMenuOpen(false);
  };

  const ChatOptions = ({ chat }) => (
    <div className="absolute right-2 top-10 z-[9999] w-40 overflow-hidden rounded-[16px] border border-blue-300/10 bg-[#0b1246] p-2 shadow-[0_18px_45px_rgba(0,0,0,.55)]">
      <button
        type="button"
        onClick={() => togglePinChat(chat.id)}
        className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold text-white/75 transition hover:bg-blue-300/10 hover:text-[#7db6ff]"
      >
        <FaThumbtack />
        {chat.pinned ? "Unpin" : "Pin"}
      </button>

      <button
        type="button"
        onClick={() => toggleMuteChat(chat.id)}
        className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold text-white/75 transition hover:bg-blue-300/10 hover:text-[#7db6ff]"
      >
        {chat.muted ? <FaVolumeUp /> : <FaBellSlash />}
        {chat.muted ? "Unmute" : "Mute"}
      </button>

      <button
        type="button"
        onClick={() => deleteChat(chat.id)}
        className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold text-[#ff7f96] transition hover:bg-red-400/10"
      >
        <FaTrash />
        Delete
      </button>
    </div>
  );

  const ChatCard = ({ chat }) => (
    <div className="relative">
      <button
        onClick={() => {
          setActiveChatId(chat.id);
          setOpenChatMenuId(null);
          setHeaderMenuOpen(false);
          setNewChatOpen(false);
        }}
        className={`w-full rounded-[22px] p-3 pr-10 text-left transition-all duration-300 ${
          activeChat?.id === chat.id
            ? "border border-blue-300/20 bg-gradient-to-r from-[#1c2a87]/95 to-[#141f69]/95 shadow-[0_0_22px_rgba(95,150,255,.22)]"
            : "bg-[#10184c]/90 hover:-translate-y-1 hover:bg-[#151f62]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Avatar
            iconType={chat.iconType}
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
              {chat.muted && (
                <FaBellSlash className="text-[9px] text-white/35" />
              )}
            </div>

            <p className="mt-1 truncate text-[11px] text-white/50">
              {chat.msg}
            </p>
          </div>

          <span className="text-[9px] text-white/40">{chat.time}</span>
        </div>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenChatMenuId(openChatMenuId === chat.id ? null : chat.id);
        }}
        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white"
      >
        <FaEllipsisH />
      </button>

      {openChatMenuId === chat.id && <ChatOptions chat={chat} />}
    </div>
  );

  return (
    <MainLayout title="Chats">
      <div className="grid min-h-0 grid-cols-1 gap-4 text-white lg:h-full lg:grid-cols-[300px_1fr] lg:gap-6">
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

          {query.trim() ? (
            <>
              <p className="mb-3 text-[12px] text-white/45">Search Results</p>
              <div className="space-y-3">
                {filteredChats.length ? (
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
                {pinnedChats.length ? (
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
                {allChats.length ? (
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

        <div className="flex min-h-[520px] flex-col overflow-hidden rounded-[22px] border border-white/5 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 shadow-[0_22px_55px_rgba(0,0,0,.30)] sm:rounded-[28px] lg:h-full lg:min-h-0">
          {activeChat ? (
            <>
              <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    iconType={activeChat.iconType}
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

                      {activeChat.muted && (
                        <FaBellSlash className="text-[11px] text-white/35" />
                      )}
                    </div>

                    <p className="mt-1 text-[11px] text-[#37e783]">
                      {activeChat.online ? "Active Now" : "Offline"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setHeaderMenuOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-[#6eb5ff]"
                >
                  <FaEllipsisH />
                </button>

                {headerMenuOpen && (
                  <div className="absolute right-6 top-[58px] z-30">
                    <ChatOptions chat={activeChat} />
                  </div>
                )}
              </div>

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
                        iconType={activeChat.iconType}
                        online={activeChat.online}
                        color={activeChat.color}
                        small
                      />
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-[430px] ${
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
                        <p>{msg.text}</p>
                      </div>

                      <div
                        className={`mt-2 flex items-center gap-2 text-[10px] text-white/45 ${
                          msg.from === "me" ? "justify-end" : ""
                        }`}
                      >
                        <span>{msg.time}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

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