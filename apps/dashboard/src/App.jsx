import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Features (The New Architecture Paths)
import Login from './features/auth/Login';
import DashboardHome from './features/home/DashboardHome';
import MeetingsPage from './features/meetings/MeetingsPage';
import TasksPage from './features/tasks/TasksPage';
import AnnouncementsPage from './features/announcements/AnnouncementsPage';
import ProjectsPage from './features/projects/ProjectsPage';
import ProfilePage from './features/profile/ProfilePage';
import Reports from './features/reports/Reports';
import MemberReportsPage from './features/reports/MemberReportsPage'; 
import AttendancePage from './features/attendance/AttendancePage';
import DepartmentsPage from './features/departments/DepartmentsPage';

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
      {/* Public / Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Core Dashboard Routes */}
      <Route path="/" element={<DashPage><DashboardHome /></DashPage>} />
      <Route path="/dashboard" element={<DashPage><DashboardHome /></DashPage>} />

      {/* Feature Routes */}
      <Route path="/meetings" element={<DashPage><MeetingsPage /></DashPage>} />
      <Route path="/tasks" element={<DashPage><TasksPage /></DashPage>} />
      <Route path="/announcements" element={<DashPage><AnnouncementsPage /></DashPage>} />
      <Route path="/projects" element={<DashPage><ProjectsPage /></DashPage>} />
      <Route path="/profile" element={<DashPage><ProfilePage /></DashPage>} />
      
      {/* Reports Feature Group */}
      <Route path="/member-reports" element={<DashPage><Reports /></DashPage>} /> 
      <Route path="/reports" element={<DashPage><Reports /></DashPage>} />
      
      {/* Admin/HR Feature Routes */}
      <Route path="/attendance" element={<DashPage><AttendancePage /></DashPage>} />
      <Route path="/departments" element={<DashPage><DepartmentsPage /></DashPage>} />
      
      {/* Catch-All Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}