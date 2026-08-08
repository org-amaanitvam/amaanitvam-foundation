import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase.js';
import LoginPage from './pages/LoginPage.jsx';
import PortalSelector from './pages/PortalSelector.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  // A portal redirected here after signing out. Clear the session that still
  // lives on this origin, otherwise a single-portal user is instantly bounced
  // back into the portal they just left.
  const [clearingSession, setClearingSession] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('loggedOut') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!clearingSession) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem('af.suppressAutoPortal', '1');
        const url = new URL(window.location.href);
        url.searchParams.delete('loggedOut');
        window.history.replaceState({}, '', url.pathname + url.hash);
      } catch {
        /* ignore */
      }
      setClearingSession(false);
    };
    signOut(auth).catch(() => {}).finally(finish);
  }, [clearingSession]);

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

  if (loading || clearingSession) {
    return (
      <div className="af-splash">
        <div className="af-spinner" />
        <p>{clearingSession ? 'Signing you out…' : 'Loading…'}</p>
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
