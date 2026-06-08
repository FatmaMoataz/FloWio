import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import Summary from "../pages/Summary/Summary";
import Profile from "../pages/Profile/Profile";
import RecentActivity from "../pages/Profile/RecentActivity";
import Teams from "../pages/Profile/Teams";
import Projects from "../pages/Projects/Projects";
import Community from "../pages/Community/Community";
import Chat from "../pages/Chat/Chats";
import Meetings from "../pages/Meetings/Meetings";
import Settings from "../pages/Settings/Settings";
import Notifications from "../pages/Notifications/Notifications";
import Schedule from "../pages/Schedule/Schedule";

export default function AppRouter(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/projects" element={<Projects />} />
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
      </Routes>
    </BrowserRouter>
  )
}
