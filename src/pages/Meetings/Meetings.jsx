import { useState } from "react";
import MainLayout from "../../layout/MainLayout";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaPaperPlane,
  FaPaperclip,
  FaSmile,
  FaDesktop,
  FaUsers,
  FaComments,
  FaEllipsisV,
  FaExpand,
  FaPlus,
  FaSignInAlt,
} from "react-icons/fa";

const participants = [
  {
    id: 1,
    name: "Mas Rover",
    role: "Product Designer",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    muted: false,
  },
  {
    id: 2,
    name: "Jack Bron",
    role: "Illustrator",
    img: "https://i.pravatar.cc/300?img=32",
    muted: true,
  },
  {
    id: 3,
    name: "Sarah Lee",
    role: "UI Designer",
    img: "https://i.pravatar.cc/300?img=44",
    muted: true,
  },
  {
    id: 4,
    name: "Ahmed Ali",
    role: "Frontend Dev",
    img: "https://i.pravatar.cc/300?img=12",
    muted: true,
  },
  {
    id: 5,
    name: "Nour Samy",
    role: "UX Researcher",
    img: "https://i.pravatar.cc/300?img=29",
    muted: true,
  },
  {
    id: 6,
    name: "Omar Khaled",
    role: "Project Lead",
    img: "https://i.pravatar.cc/300?img=15",
    muted: true,
  },
];

const initialMessages = [
  {
    sender: "Navia Fon",
    text: "Hey, is the illustration for the landing page done?",
    time: "10:00 AM",
    me: false,
  },
  {
    sender: "Jack Bron",
    text: "I just checked—it’s almost done.",
    time: "10:00 AM",
    me: false,
  },
  {
    sender: "You",
    text: "Do you think it’ll be finished by noon?",
    time: "10:00 AM",
    me: true,
  },
  {
    sender: "Jack Bron",
    text: "Yeah, I’m confident I can wrap it up in the next hour.",
    time: "10:00 AM",
    me: false,
  },
];

export default function Meetings() {
  const [inMeeting, setInMeeting] = useState(false);
  const [endModal, setEndModal] = useState(false);
  const [roomId, setRoomId] = useState("kmz-way-877-aa");

  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [screen, setScreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [peopleOpen, setPeopleOpen] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const startMeeting = () => {
    setRoomId("kmz-way-877-aa");
    setInMeeting(true);
  };

  const joinMeeting = () => {
    if (!roomId.trim()) {
      alert("Please enter meeting code");
      return;
    }

    setInMeeting(true);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "You",
        text: input.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        me: true,
      },
    ]);

    setInput("");
  };

  const endMeeting = () => {
    setEndModal(true);
  };

  const backToStart = () => {
    setEndModal(false);
    setInMeeting(false);
    setMic(true);
    setCamera(true);
    setScreen(false);
    setChatOpen(true);
    setPeopleOpen(false);
    setMessages(initialMessages);
  };

  const ControlButton = ({ active, onClick, children, danger }) => (
    <button
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-[14px] text-sm font-bold transition-all duration-300 hover:-translate-y-1 ${
        danger
          ? "bg-red-500 text-white shadow-[0_0_20px_rgba(255,60,80,.35)] hover:bg-red-600"
          : active
          ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.35)]"
          : "bg-white text-[#0b1246] hover:bg-white/90"
      }`}
    >
      {children}
    </button>
  );

  return (
    <MainLayout>
      <div className="h-full min-h-0 overflow-hidden text-white">
        {!inMeeting ? (
          <div className="grid h-full place-items-center">
            <div className="w-[620px] rounded-[34px] border border-blue-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#070b2d]/95 p-8 shadow-[0_24px_65px_rgba(0,0,0,.35)]">
              <div className="mb-8 text-center">
                <h2 className="text-[30px] font-extrabold">
                  Start or Join Meeting
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  Create a new Flowio meeting room or join using a meeting code.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <button
                  onClick={startMeeting}
                  className="group rounded-[26px] border border-blue-300/10 bg-[#10184c]/80 p-6 text-left transition hover:-translate-y-1 hover:bg-[#151f62] hover:shadow-[0_0_25px_rgba(95,150,255,.18)]"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-xl shadow-[0_0_18px_rgba(95,150,255,.35)]">
                    <FaPlus />
                  </div>

                  <h3 className="text-lg font-bold">Start New Meeting</h3>

                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Create a new meeting room and invite your team members.
                  </p>
                </button>

                <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/80 p-6">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-blue-400/15 text-xl text-[#78aaff]">
                    <FaSignInAlt />
                  </div>

                  <h3 className="text-lg font-bold">Join Meeting</h3>

                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Enter meeting code to join an existing room.
                  </p>

                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Meeting code..."
                    className="mt-5 h-11 w-full rounded-[15px] border border-blue-300/10 bg-[#141d66]/90 px-4 text-sm outline-none placeholder:text-white/35 focus:border-[#6eb5ff]/50"
                  />

                  <button
                    onClick={joinMeeting}
                    className="mt-4 h-11 w-full rounded-[15px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm font-bold shadow-[0_0_18px_rgba(95,150,255,.35)] hover:brightness-110"
                  >
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col rounded-[32px] border border-blue-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#070b2d]/95 p-6 shadow-[0_24px_65px_rgba(0,0,0,.35)]">
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <div>
                <h2 className="text-[24px] font-extrabold tracking-[-0.4px]">
                  Week 2 - Product Designer X Illustrator
                </h2>

                <p className="mt-1 text-xs text-white/45">
                  Live meeting room • Flowio collaboration session
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 items-center gap-3 rounded-[14px] border border-red-400/20 bg-red-500/10 px-4">
                  <span className="h-3 w-3 rounded-[4px] bg-red-500 shadow-[0_0_12px_rgba(255,0,0,.55)]" />
                  <span className="text-sm font-semibold text-white/85">
                    01:20:45
                  </span>
                </div>

                <button className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 text-white/70 hover:bg-white/15">
                  <FaEllipsisV />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[1fr_330px] gap-6">
              <div className="flex min-h-0 flex-col">
                <div className="grid min-h-0 flex-1 grid-cols-[1.2fr_.9fr] gap-5">
                  <div className="relative overflow-hidden rounded-[26px] border border-blue-300/20 bg-[#0b1246] shadow-[0_0_28px_rgba(95,150,255,.18)]">
                    <img
                      src={participants[0].img}
                      alt="Main speaker"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <button className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-[#0b1246]">
                        <FaMicrophone />
                      </button>

                      <span className="rounded-[14px] bg-black/45 px-4 py-2 text-sm font-semibold backdrop-blur">
                        Mas Rover
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 flex gap-3">
                      <button className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/45 backdrop-blur hover:bg-black/60">
                        <FaExpand />
                      </button>

                      <button className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-black/45 backdrop-blur hover:bg-black/60">
                        <FaEllipsisV />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-1">
                    {participants.slice(1).map((person) => (
                      <div
                        key={person.id}
                        className="relative h-[120px] overflow-hidden rounded-[20px] border border-white/10 bg-[#10184c] transition hover:-translate-y-1 hover:shadow-[0_0_22px_rgba(95,150,255,.18)]"
                      >
                        <img
                          src={person.img}
                          alt={person.name}
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500">
                            <FaMicrophoneSlash className="text-[11px]" />
                          </span>

                          <span className="max-w-[90px] truncate rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold backdrop-blur">
                            {person.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex shrink-0 items-center justify-between">
                  <div className="rounded-[14px] border border-blue-300/10 bg-[#10184c]/90 px-5 py-3 text-sm font-semibold text-white/85">
                    {roomId}
                  </div>

                  <div className="flex items-center gap-3">
                    <ControlButton active={mic} onClick={() => setMic(!mic)}>
                      {mic ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </ControlButton>

                    <ControlButton
                      active={camera}
                      onClick={() => setCamera(!camera)}
                    >
                      {camera ? <FaVideo /> : <FaVideoSlash />}
                    </ControlButton>

                    <ControlButton
                      active={screen}
                      onClick={() => setScreen(!screen)}
                    >
                      <FaDesktop />
                    </ControlButton>

                    <ControlButton active onClick={() => alert("Attach file")}>
                      <FaPaperclip />
                    </ControlButton>

                    <ControlButton active onClick={() => alert("Emoji picker")}>
                      <FaSmile />
                    </ControlButton>

                    <button
                      onClick={endMeeting}
                      className="ml-2 h-11 rounded-[14px] bg-red-500 px-6 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,60,80,.35)] transition hover:-translate-y-1 hover:bg-red-600"
                    >
                      End Meeting
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <ControlButton
                      active={peopleOpen}
                      onClick={() => {
                        setPeopleOpen(true);
                        setChatOpen(false);
                      }}
                    >
                      <FaUsers />
                    </ControlButton>

                    <ControlButton
                      active={chatOpen}
                      onClick={() => {
                        setChatOpen(true);
                        setPeopleOpen(false);
                      }}
                    >
                      <FaComments />
                    </ControlButton>
                  </div>
                </div>
              </div>

              <div className="min-h-0 overflow-hidden rounded-[26px] border border-blue-300/10 bg-[#10184c]/80 p-4">
                {chatOpen ? (
                  <div className="flex h-full min-h-0 flex-col">
                    <h3 className="mb-4 text-center text-[16px] font-bold">
                      Chat
                    </h3>

                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`rounded-[16px] p-3 text-[12px] leading-relaxed ${
                            msg.me
                              ? "ml-8 border border-blue-300/15 bg-[#0b1246] text-white"
                              : "mr-8 bg-white text-[#10184c]"
                          }`}
                        >
                          <div className="mb-1 flex justify-between gap-3">
                            <span className="font-bold">{msg.sender}</span>
                            <span
                              className={
                                msg.me ? "text-white/45" : "text-black/45"
                              }
                            >
                              {msg.time}
                            </span>
                          </div>

                          <p>{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex h-12 shrink-0 items-center gap-3 rounded-[16px] bg-white px-4">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Write Message"
                        className="flex-1 bg-transparent text-sm text-[#10184c] outline-none placeholder:text-black/40"
                      />

                      <button
                        onClick={sendMessage}
                        className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#11194c] text-white hover:brightness-125"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <h3 className="mb-4 text-center text-[16px] font-bold">
                      Participants
                    </h3>

                    <div className="space-y-3 overflow-y-auto pr-1">
                      {participants.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center gap-3 rounded-[16px] bg-[#0b1246]/80 p-3"
                        >
                          <img
                            src={person.img}
                            alt={person.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold">
                              {person.name}
                            </h4>
                            <p className="text-[11px] text-white/45">
                              {person.role}
                            </p>
                          </div>

                          <span className="text-xs text-white/45">
                            {person.muted ? (
                              <FaMicrophoneSlash />
                            ) : (
                              <FaMicrophone />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {endModal && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 backdrop-blur-md">
                <div className="w-[390px] rounded-[28px] border border-white/10 bg-gradient-to-b from-[#151f68] to-[#0a113d] p-7 text-center shadow-[0_25px_80px_rgba(0,0,0,.65)]">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                    <FaPhoneSlash />
                  </div>

                  <h3 className="text-2xl font-bold">Meeting has ended</h3>

                  <p className="mt-2 text-sm text-white/55">
                    Your meeting session has been ended successfully.
                  </p>

                  <button
                    onClick={backToStart}
                    className="mt-6 h-11 w-full rounded-[16px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm font-bold hover:brightness-110"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}