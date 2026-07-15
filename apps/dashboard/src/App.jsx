import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Reports from './pages/Reports';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import MeetingsPage from './pages/MeetingsPage';
import TasksPage from './pages/TasksPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProfilePage from './pages/ProfilePage';
import MemberReportsPage from './pages/MemberReportsPage'; 
import AttendancePage from './pages/AttendancePage';
import DepartmentsPage from './pages/DepartmentsPage';

function DashPage({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<DashPage><DashboardHome /></DashPage>} />
      <Route path="/dashboard" element={<DashPage><DashboardHome /></DashPage>} />

      <Route path="/meetings" element={<DashPage><MeetingsPage /></DashPage>} />
      <Route path="/tasks" element={<DashPage><TasksPage /></DashPage>} />
      <Route path="/announcements" element={<DashPage><AnnouncementsPage /></DashPage>} />
      <Route path="/projects" element={<DashPage><ProjectsPage /></DashPage>} />
      <Route path="/profile" element={<DashPage><ProfilePage /></DashPage>} />
      <Route path="/member-reports" element={<DashPage><Reports /></DashPage>} /> 
      
      <Route path="/attendance" element={<DashPage><AttendancePage /></DashPage>} />
      <Route path="/departments" element={<DashPage><DepartmentsPage /></DashPage>} />
      
      {/* 
        Reports is now properly wrapped in DashPage so it 
        gets the Sidebar and authentication checks! 
      */}
      <Route path="/reports" element={<DashPage><Reports /></DashPage>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}