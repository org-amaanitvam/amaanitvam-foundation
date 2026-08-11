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

// Faculty Portal Component & Pages
import FacultyLayout from './features/faculty/components/FacultyLayout';
import FacultyDashboard from './features/faculty/pages/FacultyDashboard';
import FacultyCoursesList from './features/faculty/pages/FacultyCoursesList';
import CourseDetailBuilder from './features/faculty/pages/CourseDetailBuilder';
import SessionsCalendar from './features/faculty/pages/SessionsCalendar';
import DoubtsInbox from './features/faculty/pages/DoubtsInbox';
import DoubtResolverWorkspace from './features/faculty/pages/DoubtResolverWorkspace';
import AssignmentsManager from './features/faculty/pages/AssignmentsManager';
import SubmissionsReviewer from './features/faculty/pages/SubmissionsReviewer';
import FacultyAttendanceCenter from './features/faculty/pages/FacultyAttendanceCenter';
import ApplicationsReviewer from './features/faculty/pages/ApplicationsReviewer';
import FacultyAnnouncements from './features/faculty/pages/FacultyAnnouncements';
import FacultyAnalytics from './features/faculty/pages/FacultyAnalytics';
import FacultyNotifications from './features/faculty/pages/FacultyNotifications';
import FacultySettings from './features/faculty/pages/FacultySettings';
import FacultyHelpDesk from './features/faculty/pages/FacultyHelpDesk';

function DashPage({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function FacultyPage({ children }) {
  return (
    <ProtectedRoute allowedRoles={['faculty', 'admin', 'super_admin']}>
      <FacultyLayout>{children}</FacultyLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public / Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Safety-net: if Vercel ever sends /index.html to React Router,
          detect demo param and redirect to the right place */}
      <Route
        path="/index.html"
        element={(() => {
          const params = new URLSearchParams(window.location.search);
          if (params.get('demo') === 'faculty') {
            return <Navigate to={`/faculty/dashboard?demo=faculty`} replace />;
          }
          return <Navigate to="/" replace />;
        })()}
      />

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
      <Route path="/reports" element={<DashPage><Reports /></DashPage>} />
      <Route path="/member-reports/:uid" element={<DashPage><MemberReportsPage /></DashPage>} />
      
      {/* Admin/HR Feature Routes */}
      <Route path="/attendance" element={<DashPage><AttendancePage /></DashPage>} />
      <Route path="/departments" element={<DashPage><DepartmentsPage /></DashPage>} />

      {/* Faculty Portal Route Namespace */}
      <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
      <Route path="/faculty/dashboard" element={<FacultyPage><FacultyDashboard /></FacultyPage>} />
      <Route path="/faculty/courses" element={<FacultyPage><FacultyCoursesList /></FacultyPage>} />
      <Route path="/faculty/courses/:courseId" element={<FacultyPage><CourseDetailBuilder /></FacultyPage>} />
      <Route path="/faculty/sessions" element={<FacultyPage><SessionsCalendar /></FacultyPage>} />
      <Route path="/faculty/doubts" element={<FacultyPage><DoubtsInbox /></FacultyPage>} />
      <Route path="/faculty/doubts/:doubtId" element={<FacultyPage><DoubtResolverWorkspace /></FacultyPage>} />
      <Route path="/faculty/assignments" element={<FacultyPage><AssignmentsManager /></FacultyPage>} />
      <Route path="/faculty/assignments/:id/submissions" element={<FacultyPage><SubmissionsReviewer /></FacultyPage>} />
      <Route path="/faculty/attendance" element={<FacultyPage><FacultyAttendanceCenter /></FacultyPage>} />
      <Route path="/faculty/applications" element={<FacultyPage><ApplicationsReviewer /></FacultyPage>} />
      <Route path="/faculty/announcements" element={<FacultyPage><FacultyAnnouncements /></FacultyPage>} />
      <Route path="/faculty/analytics" element={<FacultyPage><FacultyAnalytics /></FacultyPage>} />
      <Route path="/faculty/notifications" element={<FacultyPage><FacultyNotifications /></FacultyPage>} />
      <Route path="/faculty/settings" element={<FacultyPage><FacultySettings /></FacultyPage>} />
      <Route path="/faculty/help" element={<FacultyPage><FacultyHelpDesk /></FacultyPage>} />
      
      {/* Catch-All Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}