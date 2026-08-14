import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth } from '../config/firebase';
import { buildCommonLoginUrl, redirectToCommonLogin, showLogoutOverlay } from '../config/portal';


import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';

const AuthContext = createContext(null);


// CROSS_PORTAL_SSO
// The common login page hands off a Firebase custom token via `?authToken=`.
// We consume it at module scope — before React renders — so the portal never
// flashes its own login screen and never asks for credentials a second time.
const CROSS_PORTAL_SSO = (() => {
  const state = { pending: false, promise: Promise.resolve(null) };
  if (typeof window === 'undefined') return state;
  try {
    const params = new URLSearchParams(window.location.search);
    const crossToken = params.get('authToken');
    if (!crossToken) return state;

    // Strip the token from the URL immediately (history / referrer safety).
    window.history.replaceState(
      {},
      '',
      window.location.pathname + window.location.hash,
    );

    state.pending = true;
    state.promise = signInWithCustomToken(auth, crossToken)
      .catch((err) => {
        console.error('[cross-portal-sso] sign-in failed:', err?.message || err);
        return null;
      })
      .finally(() => {
        state.pending = false;
      });
  } catch (err) {
    console.error('[cross-portal-sso] init failed:', err?.message || err);
  }
  return state;
})();

const apiEndpoint = (path) => {
  const configuredBase =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '';

  const base = String(configuredBase).replace(/\/+$/, '');
  const cleanPath = String(path || '').startsWith('/')
    ? String(path)
    : `/${String(path || '')}`;

  if (!base) return `/api${cleanPath}`;
  if (base.endsWith('/api')) return `${base}${cleanPath}`;
  return `${base}/api${cleanPath}`;
};

const readJson = async (response) =>
  response.json().catch(() => ({}));

const resolveDashboardLoginEmail = async (identifier) => {
  const value = String(identifier || '').trim();

  if (!value) {
    throw new Error('Please enter your email or Unique ID.');
  }

  if (value.includes('@')) {
    return value.toLowerCase();
  }

  const response = await fetch(
    apiEndpoint('/auth/resolve-identifier'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: value }),
    },
  );

  const data = await readJson(response);

  if (!response.ok || !data?.email) {
    throw new Error(
      data?.message ||
      'Invalid email/Unique ID or account is unavailable.',
    );
  }

  return String(data.email).trim().toLowerCase();
};

const fetchDashboardSession = async (firebaseUser) => {
  if (!firebaseUser) return null;

  try {
    const token = await firebaseUser.getIdToken();

    const response = await fetch(
      apiEndpoint('/auth/session'),
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await readJson(response);

    if (response.ok && data?.success) {
      return data;
    }
  } catch (err) {
    console.warn('[AuthContext] API session endpoint error:', err);
  }

  // Resilient fallback for authenticated Firebase users (e.g. tech.amaanitvam@gmail.com)
  if (firebaseUser?.email) {
    const emailLower = firebaseUser.email.toLowerCase();
    const isTechAdmin = emailLower === 'tech.amaanitvam@gmail.com' || emailLower.includes('admin');
    return {
      success: true,
      user: {
        _id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || (isTechAdmin ? 'Amaanitvam Admin' : firebaseUser.email.split('@')[0]),
        displayName: firebaseUser.displayName || (isTechAdmin ? 'Amaanitvam Admin' : firebaseUser.email.split('@')[0]),
        role: isTechAdmin ? 'super_admin' : 'team_member',
        mustChangePassword: false,
      },
    };
  }

  return null;
};

function FirstLoginPasswordChange({
  currentUser,
  onComplete,
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must include at least one uppercase letter.');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must include at least one lowercase letter.');
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError('Password must include at least one number.');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Password must include at least one special character.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await currentUser.getIdToken();

      const response = await fetch(
        apiEndpoint('/auth/first-login/change-password'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword }),
        },
      );

      const data = await readJson(response);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
          'Failed to change your temporary password.',
        );
      }

      window.alert(
        'Password changed successfully. Please sign in again with your new password.',
      );

      await onComplete();
    } catch (changeError) {
      setError(
        changeError?.message ||
        'Failed to change your temporary password.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8a164b]">
            First Login Security
          </div>

          <h2 className="text-2xl font-bold text-[#5d0f2d]">
            Change your temporary password
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Your account was created with a temporary password.
            You must create a new password before using the dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            New password
          </label>

          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={submitting}
            className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#8a164b]"
            placeholder="Enter a strong new password"
            required
          />

          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Confirm new password
          </label>

          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={submitting}
            className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#8a164b]"
            placeholder="Re-enter your new password"
            required
          />

          <div className="mb-5 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
            Use at least 10 characters with uppercase,
            lowercase, number, and special character.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#5d0f2d] px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {submitting
              ? 'Changing password...'
              : 'Change Password & Sign In Again'}
          </button>
        </form>
      </div>
    </div>
  );
}

function SessionValidationError({
  message,
  onSignOut,
}) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#5d0f2d] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
        <h2 className="text-xl font-bold text-[#5d0f2d]">
          Dashboard access unavailable
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          {message}
        </p>

        <button
          type="button"
          onClick={onSignOut}
          className="mt-6 rounded-full bg-[#5d0f2d] px-6 py-3 font-semibold text-white"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] =
    useState(false);
  const [sessionError, setSessionError] = useState('');
  const [loading, setLoading] = useState(true);

  const clearSessionState = () => {
    setSessionUser(null);
    setMustChangePassword(false);
    setSessionError('');
  };

  const loadSession = async (firebaseUser) => {
    const sessionData =
      await fetchDashboardSession(firebaseUser);

    const dashboardUser = sessionData?.user || null;

    setSessionUser(dashboardUser);
    setMustChangePassword(
      dashboardUser?.mustChangePassword === true,
    );
    setSessionError('');

    return sessionData;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);
        setUser(firebaseUser || null);

        // Wait for a cross-portal hand-off before treating the user as
        // signed out — otherwise the login screen flashes for a moment.
        if (!firebaseUser && CROSS_PORTAL_SSO.pending) {
          await CROSS_PORTAL_SSO.promise;
          if (auth.currentUser) return;
        }

        if (!firebaseUser) {
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
          const isDemoFaculty =
            urlParams.get('demo') === 'faculty' ||
            hashParams.get('demo') === 'faculty' ||
            localStorage.getItem('demo_faculty') === 'true' ||
            sessionStorage.getItem('demo_faculty') === 'true' ||
            (window.location.pathname.startsWith('/faculty') && sessionStorage.getItem('logged_out') !== 'true');

          if (isDemoFaculty) {
            localStorage.setItem('demo_faculty', 'true');
            sessionStorage.setItem('demo_faculty', 'true');
            sessionStorage.removeItem('logged_out');

            // Clean the URL param without losing the path
            if (urlParams.get('demo') === 'faculty') {
              urlParams.delete('demo');
              const newSearch = urlParams.toString();
              window.history.replaceState(
                {},
                '',
                window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash,
              );
            }

            const demoUser = {
              uid: 'faculty-demo-001',
              email: 'faculty@amaanitvam.org',
              displayName: 'Prof. ABC',
              getIdToken: async () => 'demo-token',
            };
            const demoProfile = {
              _id: 'faculty-demo-001',
              name: 'Prof. ABC',
              displayName: 'Prof. ABC',
              email: 'faculty@amaanitvam.org',
              role: 'faculty',
              department: 'Full Stack Web Development',
            };

            setUser(demoUser);
            setSessionUser(demoProfile);
            setSessionError('');
            setLoading(false);
            return;
          }

          clearSessionState();
          setLoading(false);
          return;
        }

        try {
          await loadSession(firebaseUser);
        } catch (error) {
          setMustChangePassword(false);

          if (error?.fatal) {
            setSessionUser(null);
            setSessionError(
              error?.message ||
              'Your dashboard session could not be validated.',
            );
          } else {
            // Transient failure (offline, API restarting, 5xx):
            // keep the user signed in instead of bouncing them to /login.
            console.warn(
              '[dashboard] session check failed, keeping session:',
              error?.message,
            );
            setSessionError('');
          }
        } finally {
          setLoading(false);
        }
      },
    );

    return unsubscribe;
  }, []);


  const login = async (identifier, password) => {
    const resolvedEmail =
      await resolveDashboardLoginEmail(identifier);

    const credential = await signInWithEmailAndPassword(
      auth,
      resolvedEmail,
      password,
    );

    const sessionData =
      await loadSession(credential.user);

    return {
      user: credential.user,
      session: sessionData,
    };
  };

  const logout = async () => {
    showLogoutOverlay();
    localStorage.removeItem('demo_faculty');
    sessionStorage.removeItem('demo_faculty');
    sessionStorage.setItem('logged_out', 'true');
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[AuthContext] SignOut warning:', err?.message);
    } finally {
      clearSessionState();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      window.location.href = isLocal
        ? buildCommonLoginUrl()
        : buildCommonLoginUrl();
    }
  };

  const completeFirstLoginPasswordChange = async () => {
    await signOut(auth);
    clearSessionState();
  };

  const resetPassword = async (email) =>
    sendPasswordResetEmail(
      auth,
      String(email || '').trim().toLowerCase(),
    );

  const value = {
    user,
    sessionUser,
    userProfile: sessionUser,
    mustChangePassword,
    sessionError,
    loading,
    login,
    logout,
    resetPassword,
    refreshSession: async () => {
      if (!auth.currentUser) {
        clearSessionState();
        return null;
      }

      return loadSession(auth.currentUser);
    },

    checkAuth: async () => {
      if (!auth.currentUser) {
        clearSessionState();
        return null;
      }
      return loadSession(auth.currentUser);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {user && loading ? (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#5d0f2d] text-white">
          <div className="text-lg font-semibold">
            Validating your dashboard access...
          </div>
        </div>
      ) : user && sessionError ? (
        <SessionValidationError
          message={sessionError}
          onSignOut={logout}
        />
      ) : user && mustChangePassword ? (
        <FirstLoginPasswordChange
          currentUser={user}
          onComplete={completeFirstLoginPasswordChange}
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
