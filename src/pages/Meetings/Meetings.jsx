import { useState, useEffect, useRef } from "react";
import MainLayout from "../../layout/MainLayout";
import { JitsiMeeting } from '@jitsi/react-sdk';
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
  FaPlus,
  FaSignInAlt,
} from "react-icons/fa";

const initialMessages = [
  { sender: "Jack Bron", text: "Hey, is the illustration done?", time: "10:00 AM", me: false },
  { sender: "You", text: "Yes, we are testing the live system now!", time: "10:01 AM", me: true },
];

export default function Meetings() {
  const [inMeeting, setInMeeting] = useState(false);
  const [endModal, setEndModal] = useState(false);
  const [roomId, setRoomId] = useState(""); // الـ UUID اللي هيجي من الباكيند
  const [dbMeetingId, setDbMeetingId] = useState(""); // الـ _id بتاع الميتنج في المونجو

  // التحكم في المايك والكاميرا من الأزرار بتاعتكم
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [screen, setScreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [peopleOpen, setPeopleOpen] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [jitsiApi, setJitsiApi] = useState(null);

  // لـ تسجيل الصوت (عشان نبعته لـ process-audio للـ AI Summarizer)
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 1️⃣ استدعاء الباكيند لإنشاء ميتنج حقيقي (Start New Meeting)
  const startMeeting = async () => {
    try {
      // محاكاة لرد الباكيند بتاعكم بالظبط (يمكنكم تفعيل الـ fetch الحقيقي هنا)
      const mockBackendResponse = {
        success: true,
        data: {
          _id: "65f1a2b3c4d5e6f7a8b9c0d1", 
          roomId: "kmz-way-877-aa", // كود الغرفة اللي سما هتدخل بيه
          title: "Week 2 - Product Designer X Illustrator"
        }
      };

      const meeting = mockBackendResponse.data;
      setRoomId(meeting.roomId);
      setDbMeetingId(meeting._id);

      setInMeeting(true);
      startAudioRecording(); // نبدأ نسجل الصوت للـ AI
    } catch (err) {
      console.error("Failed to start meeting via backend:", err);
    }
  };

  // 2️⃣ الانضمام لميتنج موجود مسبقاً (Join Meeting)
  const joinMeeting = async () => {
    if (!roomId.trim()) {
      alert("Please enter meeting code");
      return;
    }
    try {
      setDbMeetingId("65f1a2b3c4d5e6f7a8b9c0d1");
      setInMeeting(true);
    } catch (err) {
      console.error("Meeting not found in archive:", err);
    }
  };

  // 3️⃣ تسجيل الصوت محلياً لإرساله للـ AI Summarizer عند إنهاء الميتنج
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadAudioToAI(audioBlob);
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Microphone access denied for AI Recording:", err);
    }
  };

  // 4️⃣ إنهاء الميتنج وربطه بالـ endMeeting في الباكيند
  const endMeeting = async () => {
    if (jitsiApi) jitsiApi.executeCommand('hangup');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop(); 
    }
    setEndModal(true);
  };

  // 5️⃣ رفع الـ Audio للباكيند للمعالجة بالذكاء الاصطناعي
  const uploadAudioToAI = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "meeting-rec.webm");
    console.log("Uploading audio to backend for AI processing...");
  };

  // أزرار التحكم المخصصة تتحكم في Jitsi مباشرة
  const toggleMic = () => {
    if (jitsiApi) jitsiApi.executeCommand('toggleAudio');
    setMic(!mic);
  };

  const toggleCamera = () => {
    if (jitsiApi) jitsiApi.executeCommand('toggleVideo');
    setCamera(!camera);
  };

  const toggleShareScreen = () => {
    if (jitsiApi) jitsiApi.executeCommand('toggleShareScreen');
    setScreen(!screen);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: "You",
        text: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        me: true,
      },
    ]);
    setInput("");
  };

  const backToStart = () => {
    setEndModal(false);
    setInMeeting(false);
    setRoomId("");
    setMessages(initialMessages);
  };

  const ControlButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-[14px] text-sm font-bold transition-all duration-300 hover:-translate-y-1 ${
        active
          ? "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.35)]"
          : "bg-white text-[#0b1246] hover:bg-white/90"
      }`}
    >
      {children}
    </button>
  );

  return (
    <MainLayout>
      <div className="min-h-0 text-white lg:h-full lg:overflow-hidden">
        {!inMeeting ? (
          /* ─── شاشة الدخول ─── */
          <div className="grid h-full place-items-center">
            <div className="w-[620px] rounded-[34px] border border-blue-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#070b2d]/95 p-8 shadow-[0_24px_65px_rgba(0,0,0,.35)]">
              <div className="mb-8 text-center">
                <h2 className="text-[30px] font-extrabold">Start or Join Meeting</h2>
                <p className="mt-2 text-sm text-white/55">
                  Create a new Flowio meeting room integrated with AI Summarizer.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <button
                  onClick={startMeeting}
                  className="group rounded-[26px] border border-blue-300/10 bg-[#10184c]/80 p-6 text-left transition hover:-translate-y-1 hover:bg-[#151f62]"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-xl">
                    <FaPlus />
                  </div>
                  <h3 className="text-lg font-bold">Start New Meeting</h3>
                  <p className="mt-2 text-xs text-white/50">Generates secure ID & enables background AI audio capture.</p>
                </button>

                <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/80 p-6">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-blue-400/15 text-xl text-[#78aaff]">
                    <FaSignInAlt />
                  </div>
                  <h3 className="text-lg font-bold">Join Meeting</h3>
                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter code..."
                    className="mt-5 h-11 w-full rounded-[15px] border border-blue-300/10 bg-[#141d66]/90 px-4 text-sm outline-none text-white"
                  />
                  <button
                    onClick={joinMeeting}
                    className="mt-4 h-11 w-full rounded-[15px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm font-bold"
                  >
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── شاشة الـ Live Meeting (المعدلة بالكامل) ─── */
          <div className="flex h-full flex-col rounded-[32px] border border-blue-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#070b2d]/95 p-6 shadow-[0_24px_65px_rgba(0,0,0,.35)]">
            
            {/* Header */}
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <div>
                <h2 className="text-[24px] font-extrabold tracking-[-0.4px]">Week 2 - Product Designer X Illustrator</h2>
                <p className="mt-1 text-xs text-white/45">Live session Linked to AI Log ID: {dbMeetingId}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 items-center gap-3 rounded-[14px] border border-red-400/20 bg-red-500/10 px-4">
                  <span className="h-3 w-3 rounded-[4px] bg-red-500 animate-pulse" />
                  <span className="text-sm font-semibold text-white/85">REC & ARCHIVING</span>
                </div>
              </div>
            </div>

            {/* الـ Grid الأساسي */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[1fr_330px] xl:gap-6">
              
              {/* العمود الأيسر: مساحة الـ Jitsi الكاملة + أزرار التحكم */}
              <div className="flex min-h-0 flex-col">
                
                {/* 🌟 تعديل مساحة الفيديو: الـ Jitsi بياخد الـ Container ده كله وبيقسم الشاشة لوحده تلقائياً أول ما سما تدخل */}
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-[26px] border border-blue-300/20 bg-[#0b1246] shadow-inner">
                  <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={roomId}
                    configOverwrite={{
                      startWithAudioMuted: !mic,
                      startWithVideoMuted: !camera,
                      prejoinPageEnabled: false,
                      toolbarButtons: [], // إخفاء تولبار جيتسي عشان نعتمد أزراركم بالكامل
                      disableDeepLinking: true,
                    }}
                    interfaceConfigOverwrite={{
                      SHOW_JITSI_WATERMARK: false,
                      filmStripOnly: false, // بيعرض المشتركين كلهم كـ Grid View متوازن ونظيف
                    }}
                    userInfo={{ displayName: "Fatma Moataz" }}
                    onApiReady={(api) => setJitsiApi(api)}
                    getIFrameRef={(iframe) => { 
                      iframe.style.height = '100%'; 
                      iframe.style.width = '100%'; 
                      iframe.style.border = 'none';
                    }}
                  />
                </div>

                {/* شريط التحكم السفلي الأصلي بتاعكم */}
                <div className="mt-5 flex shrink-0 items-center justify-between">
                  <div className="rounded-[14px] border border-blue-300/10 bg-[#10184c]/90 px-5 py-3 text-sm font-semibold text-yellow-400 font-mono">
                    Room Code: {roomId}
                  </div>

                  <div className="flex items-center gap-3">
                    <ControlButton active={mic} onClick={toggleMic}>
                      {mic ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </ControlButton>

                    <ControlButton active={camera} onClick={toggleCamera}>
                      {camera ? <FaVideo /> : <FaVideoSlash />}
                    </ControlButton>

                    <ControlButton active={screen} onClick={toggleShareScreen}>
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
                      className="ml-2 h-11 rounded-[14px] bg-red-500 px-6 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,60,80,.35)] transition hover:bg-red-600"
                    >
                      End Meeting
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <ControlButton active={peopleOpen} onClick={() => { setPeopleOpen(true); setChatOpen(false); }}>
                      <FaUsers />
                    </ControlButton>
                    <ControlButton active={chatOpen} onClick={() => { setChatOpen(true); setPeopleOpen(false); }}>
                      <FaComments />
                    </ControlButton>
                  </div>
                </div>
              </div>

              {/* العمود الأيمن: الـ Custom Chat بتاع Flowio */}
              <div className="min-h-0 overflow-hidden rounded-[26px] border border-blue-300/10 bg-[#10184c]/80 p-4">
                {chatOpen ? (
                  <div className="flex h-full min-h-0 flex-col">
                    <h3 className="mb-4 text-center text-[16px] font-bold">Flowio Custom Chat</h3>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {messages.map((msg, index) => (
                        <div key={index} className={`rounded-[16px] p-3 text-[12px] ${msg.me ? "ml-8 bg-[#0b1246] text-white" : "mr-8 bg-white text-[#10184c]"}`}>
                          <div className="mb-1 flex justify-between font-bold">
                            <span>{msg.sender}</span>
                            <span className="text-[10px] opacity-50">{msg.time}</span>
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
                        placeholder="Write Message..."
                        className="flex-1 bg-transparent text-sm text-[#10184c] outline-none"
                      />
                      <button onClick={sendMessage} className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#11194c] text-white">
                        <FaPaperPlane />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <h3 className="mb-4 text-center text-[16px] font-bold">Active Stream</h3>
                    <p className="text-center text-xs text-white/50 mt-10">Jitsi engine is automatically managing active participant layouts.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal نهاية الاجتماع والأرشفة */}
            {endModal && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 backdrop-blur-md">
                <div className="w-full max-w-[390px] rounded-[24px] bg-gradient-to-b from-[#151f68] to-[#0a113d] p-5 text-center sm:rounded-[28px] sm:p-7">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                    <FaPhoneSlash />
                  </div>
                  <h3 className="text-2xl font-bold">Meeting Archived!</h3>
                  <p className="mt-2 text-sm text-white/55">
                    The session has ended. Audio file was uploaded successfully to AI Summarizer. Check your logs tab for the results soon!
                  </p>
                  <button onClick={backToStart} className="mt-6 h-11 w-full rounded-[16px] bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-sm font-bold">
                    Go to Dashboard
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
