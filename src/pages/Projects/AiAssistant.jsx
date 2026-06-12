import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBolt, FaPaperPlane } from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import AiSceneArtwork from "./AiSceneArtwork";
import { getProject } from "./projectStore";

export default function AiAssistant() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = getProject(projectId);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState(
    "Hello! I'm here to assist you.\nNeed help with your tasks?",
  );

  const submit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setReply(`Let's work on "${message.trim()}". I can help organize it into tasks, priorities, and deadlines.`);
    setMessage("");
  };

  return (
    <MainLayout>
      <section className="flowio-projects-page flowio-ai-fullscreen relative flex h-full min-h-[650px] flex-col overflow-hidden rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(circle_at_50%_70%,#14105c_0%,#090c4f_35%,#05072d_76%)] p-5 text-white sm:p-7 lg:min-h-0">
        <header className="relative z-20 flex items-center gap-4">
          <button type="button" onClick={() => navigate(project ? `/projects/${project.id}` : "/projects")} className="rounded-lg p-2 text-white/80 hover:bg-white/10" aria-label="Back to project">
            <FaArrowLeft />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#40539b]/50 bg-[#121a56] text-xs text-[#8ec8ff]"><FaBolt /></span>
          <h1 className="font-semibold">AI Assistant</h1>
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center pb-24">
          <div className="flowio-ai-full-message relative z-20 whitespace-pre-line rounded-[24px] bg-[#121a4c]/90 px-10 py-5 text-sm leading-5 text-white/70 shadow-xl">
            {reply}
          </div>
          <AiSceneArtwork className="absolute inset-x-0 bottom-0 mx-auto h-auto max-h-[70%] w-full object-contain opacity-65" />
          <div className="absolute bottom-0 left-1/2 h-44 w-[72%] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        </div>

        <form onSubmit={submit} className="flowio-ai-full-input relative z-20 mx-auto flex w-full max-w-4xl items-center rounded-full border border-[#23347e]/50 bg-[#0d164d]/95 px-5 py-3 shadow-[0_14px_35px_rgba(1,4,30,.28)]">
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask anything..." className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35" />
          <button type="submit" className="text-[#4d8eea]"><FaPaperPlane /></button>
        </form>
      </section>
    </MainLayout>
  );
}
