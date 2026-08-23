import { Routes, Route, Navigate } from 'react-router-dom';
import { cloneElement } from 'react';
import Layout from './layouts/Layout';
import CourseCatalog from './features/catalog/CourseCatalog';
import CourseDetail from './features/course/CourseDetail';
import Login from './features/auth/Login';
import ProtectedRoute from './components/guards/ProtectedRoute';
import StudentLayout from './features/student/components/StudentLayout';
import StudentDashboard from './features/student/pages/StudentDashboard';
import StudentCourses from './features/student/pages/StudentCourses';
import StudentSessions from './features/student/pages/StudentSessions';
import StudentDoubts from './features/student/pages/StudentDoubts';
import StudentAssignments from './features/student/pages/StudentAssignments';
import StudentAttendance from './features/student/pages/StudentAttendance';
import StudentAnnouncements from './features/student/pages/StudentAnnouncements';
import StudentAnalytics from './features/student/pages/StudentAnalytics';
import StudentNotifications from './features/student/pages/StudentNotifications';
import StudentSettings from './features/student/pages/StudentSettings';
import StudentHelpDesk from './features/student/pages/StudentHelpDesk';
import StudentApplications from './features/student/pages/StudentApplications';
import StudentCourseDetail from './features/student/pages/StudentCourseDetail';
import StudentDoubtWorkspace from './features/student/pages/StudentDoubtWorkspace';
import StudentSubmissions from './features/student/pages/StudentSubmissions';
import ResourcesCatalog from './features/catalog/ResourcesCatalog';
import StudentResources from './features/student/pages/StudentResources';
import ResourceDetails from './features/Resource/ResourceDetails';

const withStudentLayout = (element) => (
  <StudentLayout>
    {(props) => cloneElement(element, props)}
  </StudentLayout>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/" element={<CourseCatalog />} />
        <Route path="/course/:slug" element={<CourseDetail />} />
        <Route path="/resources" element={<ResourcesCatalog />} />
        <Route path="/resource/:slug" element={<ResourceDetails />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <Navigate to="/student/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard"
        element={<ProtectedRoute>{withStudentLayout(<StudentDashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/student/courses"
        element={<ProtectedRoute>{withStudentLayout(<StudentCourses />)}</ProtectedRoute>}
      />
      <Route
        path="/student/courses/:courseId"
        element={<ProtectedRoute>{withStudentLayout(<StudentCourseDetail />)}</ProtectedRoute>}
      />
      <Route
        path="/student/sessions"
        element={<ProtectedRoute>{withStudentLayout(<StudentSessions />)}</ProtectedRoute>}
      />
      <Route
        path="/student/resources"
        element={<ProtectedRoute>{withStudentLayout(<StudentResources />)}</ProtectedRoute>}
      />
      <Route
        path="/student/doubts"
        element={<ProtectedRoute>{withStudentLayout(<StudentDoubts />)}</ProtectedRoute>}
      />
      <Route
        path="/student/doubts/:doubtId"
        element={<ProtectedRoute>{withStudentLayout(<StudentDoubtWorkspace />)}</ProtectedRoute>}
      />
      <Route
        path="/student/assignments"
        element={<ProtectedRoute>{withStudentLayout(<StudentAssignments />)}</ProtectedRoute>}
      />
      <Route
        path="/student/assignments/:id/submissions"
        element={<ProtectedRoute>{withStudentLayout(<StudentSubmissions />)}</ProtectedRoute>}
      />
      <Route
        path="/student/attendance"
        element={<ProtectedRoute>{withStudentLayout(<StudentAttendance />)}</ProtectedRoute>}
      />
      <Route
        path="/student/announcements"
        element={<ProtectedRoute>{withStudentLayout(<StudentAnnouncements />)}</ProtectedRoute>}
      />
      <Route
        path="/student/analytics"
        element={<ProtectedRoute>{withStudentLayout(<StudentAnalytics />)}</ProtectedRoute>}
      />
      <Route
        path="/student/notifications"
        element={<ProtectedRoute>{withStudentLayout(<StudentNotifications />)}</ProtectedRoute>}
      />
      <Route
        path="/student/settings"
        element={<ProtectedRoute>{withStudentLayout(<StudentSettings />)}</ProtectedRoute>}
      />
      <Route
        path="/student/help"
        element={<ProtectedRoute>{withStudentLayout(<StudentHelpDesk />)}</ProtectedRoute>}
      />
      <Route
        path="/student/applications"
        element={<ProtectedRoute>{withStudentLayout(<StudentApplications />)}</ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}