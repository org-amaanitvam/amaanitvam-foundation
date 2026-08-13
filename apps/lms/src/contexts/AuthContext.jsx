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
  signInWithCustomToken,
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

const resolveStudentLoginEmail = async (identifier) => {
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

const fetchStudentSession = async (firebaseUser) => {
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
      'Your learner session could not be validated.',
    );
    error.code = data?.code || `HTTP_${response.status}`;
    throw error;
  }

  return data;
};

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
      await fetchStudentSession(firebaseUser);

    const portalUser = sessionData?.user || null;

    setSessionUser(portalUser);
    setMustChangePassword(
      portalUser?.mustChangePassword === true,
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
            'Your learner session could not be validated.',
          );
        } finally {
          setLoading(false);
        }
      },
    );

    return unsubscribe;
  }, []);

  // Cross-portal auth: accept custom tokens from the common login page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const crossToken = params.get('authToken');
    if (crossToken) {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
      signInWithCustomToken(auth, crossToken).catch((err) => {
        console.error('[lms] Cross-portal auth failed:', err.message);
      });
    }
  }, []);

  const login = async (identifier, password) => {
    const resolvedEmail =
      await resolveStudentLoginEmail(identifier);

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
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);