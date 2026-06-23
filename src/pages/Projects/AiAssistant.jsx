import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBolt, FaPaperPlane, FaSpinner } from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import AiSceneArtwork from "./AiSceneArtwork";
import projectService from "../../services/projectService";
import chatService from "../../services/chatService";

// ── Helpers ───────────────────────────────────────────────────────────────────

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const WELCOME_MESSAGE = {
  role: "assistant",
  text: "Hello! I'm here to assist you.\nNeed help with your tasks?",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AiAssistant() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [messages, setMessages]     = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText]   = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // On mount: fetch project + load chat history (if we have a real projectId)
  useEffect(() => {
    if (projectId && isValidObjectId(projectId)) {
      fetchProjectAndHistory();
    }
  }, [projectId]);

  const fetchProjectAndHistory = async () => {
    setLoading(true);
    try {
      const [projectRes, historyRes] = await Promise.all([
        projectService.getProjectById(projectId),
        chatService.getHistory(projectId),
      ]);

      if (projectRes.success && projectRes.data) {
        setProject(projectRes.data);
      }

      // If there's prior history, replace the placeholder welcome message
      if (historyRes.success && historyRes.data.messages?.length > 0) {
        setMessages(historyRes.data.messages);
      }
    } catch (err) {
      console.warn("[AiAssistant] Setup failed:", err.message);
      // Non-fatal — the assistant still works without project context
    } finally {
      setLoading(false);
    }
  };

  // ── Send message ─────────────────────────────────────────────────────────────

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isProcessing) return;

    // Optimistically append user message
    const optimisticUser = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, optimisticUser]);
    setInputText("");
    setIsProcessing(true);

    try {
      const result = await chatService.sendMessage(projectId, trimmed);

      if (result.success) {
        setMessages((prev) => [...prev, result.data.reply]);
      } else {
        throw new Error("Unexpected response shape");
      }
    } catch (err) {
      console.error("[AiAssistant] sendMessage failed:", err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          isError: true,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const handleBack = () => {
    if (project?._id) {
      navigate(`/projects/${project._id}`);
    } else {
      navigate("/projects");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <section className="flowio-projects-page flowio-ai-fullscreen relative flex h-full min-h-[650px] flex-col overflow-hidden rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(circle_at_50%_70%,#14105c_0%,#090c4f_35%,#05072d_76%)] p-5 text-white sm:p-7 lg:min-h-0">

        {/* ── Header ── */}
        <header className="relative z-20 flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 transition"
            aria-label="Back to project"
          >
            <FaArrowLeft />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#40539b]/50 bg-[#121a56] text-xs text-[#8ec8ff]">
            <FaBolt />
          </span>
          <div>
            <h1 className="font-semibold">AI Assistant</h1>
            {loading ? (
              <p className="text-[10px] text-white/40 flex items-center gap-1">
                <FaSpinner className="animate-spin text-[8px]" />
                Loading project context...
              </p>
            ) : project ? (
              <p className="text-[10px] text-white/40 truncate max-w-[200px]">
                Context: {project.name}
              </p>
            ) : (
              <p className="text-[10px] text-white/40">General Assistant</p>
            )}
          </div>
        </header>

        {/* ── Message thread ── */}
        <div className="relative z-10 flex flex-1 flex-col gap-3 overflow-y-auto pb-6 pt-4 px-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[78%] whitespace-pre-line rounded-[18px] px-5 py-3 text-sm leading-5 shadow-md
                  ${msg.role === "user"
                    ? "bg-[#2a3a8f] text-white/90"
                    : msg.isError
                      ? "bg-[#3a1a1a]/90 text-red-300/80"
                      : "bg-[#121a4c]/90 text-white/70"
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-[#121a4c]/90 rounded-[18px] px-5 py-3 flex items-center gap-2 text-white/50 text-sm">
                <FaSpinner className="animate-spin text-xs" />
                <span>Thinking…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Artwork + glow (decorative, sits behind thread) ── */}
        <AiSceneArtwork className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-auto max-h-[40%] w-full object-contain opacity-20" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-44 w-[72%] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />

        {/* ── Input bar ── */}
        <form
          onSubmit={submit}
          className="flowio-ai-full-input relative z-20 mx-auto flex w-full max-w-4xl items-center rounded-full border border-[#23347e]/50 bg-[#0d164d]/95 px-5 py-3 shadow-[0_14px_35px_rgba(1,4,30,.28)]"
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              project
                ? `Ask about ${project.name}…`
                : "Ask anything about your projects…"
            }
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
            disabled={isProcessing}
          />
          <button
            type="submit"
            className={`transition ${
              isProcessing
                ? "cursor-not-allowed text-white/30"
                : "text-[#4d8eea] hover:text-[#6aa8f5]"
            }`}
            disabled={isProcessing}
          >
            <FaPaperPlane />
          </button>
        </form>
      </section>
    </MainLayout>
  );
}