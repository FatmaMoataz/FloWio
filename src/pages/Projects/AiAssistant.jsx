import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBolt, FaPaperPlane, FaSpinner } from "react-icons/fa";
import MainLayout from "../../layout/MainLayout";
import AiSceneArtwork from "./AiSceneArtwork";
import projectService from "../../services/projectService";

export default function AiAssistant() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState(
    "Hello! I'm here to assist you.\nNeed help with your tasks?",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch project if projectId exists
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      
      // Only fetch from backend if it looks like a MongoDB ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(projectId)) {
        const response = await projectService.getProjectById(projectId);
        
        if (response.success && response.data) {
          setProject(response.data);
        }
      }
    } catch (err) {
      console.log("Could not fetch project for AI assistant:", err.message);
      // AI Assistant can work without project context
    } finally {
      setLoading(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!message.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const userMessage = message.trim();
      let aiResponse = "";
      
      if (project) {
        aiResponse = `I'm analyzing "${userMessage}" for the project "${project.name}".\n\n`;
        
        if (userMessage.toLowerCase().includes("task") || userMessage.toLowerCase().includes("create")) {
          aiResponse += "I can help you create tasks for this project. What would you like to accomplish?\n\n";
          aiResponse += "For example:\n• Create a new task\n• Assign tasks to team members\n• Set task priorities and deadlines";
        } else if (userMessage.toLowerCase().includes("progress") || userMessage.toLowerCase().includes("status")) {
          aiResponse += "Based on the current project data, I can provide insights on:\n• Overall project progress\n• Task completion rates\n• Bottlenecks and blockers";
        } else if (userMessage.toLowerCase().includes("deadline") || userMessage.toLowerCase().includes("schedule")) {
          aiResponse += "I can help you manage project timelines by:\n• Suggesting realistic deadlines\n• Identifying scheduling conflicts\n• Recommending task prioritization";
        } else {
          aiResponse += "I'm here to help with:\n• Task management and organization\n• Project planning and scheduling\n• Progress tracking and reporting\n• Team collaboration suggestions";
        }
      } else {
        aiResponse = `I'm here to help you with your projects and tasks.\n\n`;
        aiResponse += "You can ask me about:\n• Creating and organizing projects\n• Managing tasks and deadlines\n• Improving team productivity\n• Project planning best practices";
      }
      
      setReply(aiResponse);
      setMessage("");
      setIsProcessing(false);
    }, 1000);
  };

  const handleBack = () => {
    if (project && project._id) {
      navigate(`/projects/${project._id}`);
    } else {
      navigate("/projects");
    }
  };

  return (
    <MainLayout>
      <section className="flowio-projects-page flowio-ai-fullscreen relative flex h-full min-h-[650px] flex-col overflow-hidden rounded-[30px] border border-[#18226f]/60 bg-[radial-gradient(circle_at_50%_70%,#14105c_0%,#090c4f_35%,#05072d_76%)] p-5 text-white sm:p-7 lg:min-h-0">
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

        <div className="relative z-10 flex flex-1 items-center justify-center pb-24">
          <div className="flowio-ai-full-message relative z-20 max-w-2xl whitespace-pre-line rounded-[24px] bg-[#121a4c]/90 px-10 py-5 text-sm leading-5 text-white/70 shadow-xl max-h-[60vh] overflow-y-auto">
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin text-xs" />
                <span>Processing...</span>
              </div>
            ) : (
              reply
            )}
          </div>
          <AiSceneArtwork className="absolute inset-x-0 bottom-0 mx-auto h-auto max-h-[70%] w-full object-contain opacity-65" />
          <div className="absolute bottom-0 left-1/2 h-44 w-[72%] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        </div>

        <form 
          onSubmit={submit} 
          className="flowio-ai-full-input relative z-20 mx-auto flex w-full max-w-4xl items-center rounded-full border border-[#23347e]/50 bg-[#0d164d]/95 px-5 py-3 shadow-[0_14px_35px_rgba(1,4,30,.28)]"
        >
          <input 
            value={message} 
            onChange={(event) => setMessage(event.target.value)} 
            placeholder={project ? `Ask about ${project.name}...` : "Ask anything about your projects..."} 
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            className={`transition ${isProcessing ? 'text-white/30 cursor-not-allowed' : 'text-[#4d8eea] hover:text-[#6aa8f5]'}`}
            disabled={isProcessing}
          >
            <FaPaperPlane />
          </button>
        </form>
      </section>
    </MainLayout>
  );
}