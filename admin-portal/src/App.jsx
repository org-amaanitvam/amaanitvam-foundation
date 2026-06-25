import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Members from './pages/Members';
import Donations from './pages/Donations';
import Certificates from './pages/Certificates';
import Content from './pages/Content';
import Gallery from './pages/Gallery';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import MyCertificates from './pages/MyCertificates';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
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
        path="/attendance"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Attendance />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-certificates"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <MyCertificates />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
