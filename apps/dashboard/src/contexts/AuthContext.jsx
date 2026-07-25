import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';

const AuthContext = createContext(null);

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

  if (!response.ok || !data?.success) {
    const error = new Error(
      data?.message ||
      'Your dashboard session could not be validated.',
    );
    error.code = data?.code || `HTTP_${response.status}`;
    throw error;
  }

  return data;
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

        if (!firebaseUser) {
          clearSessionState();
          setLoading(false);
          return;
        }

        try {
          await loadSession(firebaseUser);
        } catch (error) {
          setSessionUser(null);
          setMustChangePassword(false);
          setSessionError(
            error?.message ||
            'Your dashboard session could not be validated.',
          );
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
    await signOut(auth);
    clearSessionState();
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
