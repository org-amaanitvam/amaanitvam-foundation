import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './features/auth/pages/Login';
import Candidates from './features/candidates/pages/Candidates';
import Members from './features/members/pages/Members';
import Donations from './features/donations/pages/Donations';
import Certificates from './features/certificates/pages/Certificates';
import Content from './features/cms/pages/Content';
import Gallery from './features/gallery/pages/Gallery';
import Tasks from './features/tasks/pages/Tasks';
import Settings from './features/settings/pages/Settings';
import CMS from './features/cms/pages/CMS';
import Profile from './features/profile/pages/Profile';
import LearningHub from './features/digital-library/pages/LearningHub';
import ContactMessages from './features/contact/pages/ContactMessages'; // <-- Added import

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/candidates" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Candidates />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Members />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donations"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Donations />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Certificates />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning-hub"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <LearningHub />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      {/* ---> NEW CONTACT MESSAGES ROUTE ADDED HERE <--- */}
      <Route
        path="/contact-messages"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ContactMessages />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Content />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Gallery />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Tasks />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cms"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CMS />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Profile />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
  );
}