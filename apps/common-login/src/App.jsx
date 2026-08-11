import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase.js';
import LoginPage from './pages/LoginPage.jsx';
import PortalSelector from './pages/PortalSelector.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

// v11 portal-switch handoff
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  // A portal bounced the user back here after signing out of that portal.
  // We deliberately KEEP the session on this origin: a super_admin must land
  // on the portal chooser, not on the login form. Single-portal roles are
  // signed out by the selector once their role is known.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('switch') === '1' || params.get('loggedOut') === '1') {
        sessionStorage.setItem('af.suppressAutoPortal', '1');
        params.delete('switch');
        params.delete('loggedOut');
        params.delete('reason');
        const qs = params.toString();
        window.history.replaceState(
          {},
          '',
          window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash,
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

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
      <div className="af-splash">
        <div className="af-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/select-portal" replace /> : <LoginPage />} />
      <Route path="/login" element={user ? <Navigate to="/select-portal" replace /> : <LoginPage />} />
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
        element={user ? <ChangePassword user={user} /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
