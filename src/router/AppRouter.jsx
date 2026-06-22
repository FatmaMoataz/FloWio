import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import Summary from "../pages/Summary/Summary";
import Profile from "../pages/Profile/Profile";
import RecentActivity from "../pages/Profile/RecentActivity";
import Teams from "../pages/Profile/Teams";
import Projects from "../pages/Projects/Projects";
import ProjectForm from "../pages/Projects/ProjectForm";
import ProjectDetails from "../pages/Projects/ProjectDetails";
import ProjectKanban from "../pages/Projects/ProjectKanban";
import ProjectOverview from "../pages/Projects/ProjectOverview";
import AiAssistant from "../pages/Projects/AiAssistant";
import Community from "../pages/Community/Community";
import Chat from "../pages/Chat/Chats";
import Meetings from "../pages/Meetings/Meetings";
import Settings from "../pages/Settings/Settings";
import Notifications from "../pages/Notifications/Notifications";
import Schedule from "../pages/Schedule/Schedule";
import ToDo from "../pages/To-Do/To-Do";
import CompanyOnboarding from "../pages/Onboarding/CompanyOnboarding";
import TaskForm from "../pages/Projects/TaskForm";
import ForgotPassword from "../pages/Auth/ForgotPassword";


export default function AppRouter(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/:projectId" element={<ProjectOverview />} />
        <Route path="/projects/:projectId/details" element={<ProjectDetails />} />
        <Route path="/projects/:projectId/assistant" element={<AiAssistant />} />
        <Route path="/projects/:projectId/kanban" element={<ProjectKanban />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recent-activity" element={<RecentActivity />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/to-do" element={<ToDo />} />
        <Route path="/company-onboarding" element={<CompanyOnboarding />} />
        <Route path="/projects/:projectId/tasks/new" element={<TaskForm />} />
        <Route path="/projects/:projectId/tasks/:taskId/edit" element={<TaskForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

      </Routes>
    </BrowserRouter>
  )
}
