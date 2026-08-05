import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase.js';
import LoginPage from './pages/LoginPage.jsx';
import PortalSelector from './pages/PortalSelector.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setSessionData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5d0f2d]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#d8a15f] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#e9c9a3] text-sm font-medium tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/select-portal" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/select-portal" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/select-portal"
        element={
          user ? (
            <PortalSelector
              user={user}
              sessionData={sessionData}
              setSessionData={setSessionData}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/change-password"
        element={
          user ? (
            <ChangePassword user={user} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
