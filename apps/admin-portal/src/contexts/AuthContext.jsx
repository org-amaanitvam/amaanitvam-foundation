import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase.js';
import api from '../config/api.js';
import { redirectToCommonLogin } from '../config/portal.js';


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

const storeToken = async (firebaseUser, forceRefresh = false) => {
  if (!firebaseUser?.getIdToken) return null;
  const token = await firebaseUser.getIdToken(forceRefresh);
  localStorage.setItem('adminToken', token);
  localStorage.setItem('firebaseToken', token);
  return token;
};

const clearTokens = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('firebaseToken');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    setProfileError('');
    const endpoints = ['/profile/me', '/admin/me'];
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        const profile =
          response.data?.user ||
          response.data?.admin ||
          response.data?.profile ||
          response.data?.data ||
          response.data ||
          null;

        if (profile) {
          setUserProfile(profile);
          return profile;
        }
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;
        if (![401, 403, 404].includes(status)) {
          console.warn(`Profile request failed at ${endpoint}:`, error?.message || error);
        }
      }
    }

    const status = lastError?.response?.status;
    const message =
      status === 401
        ? 'Your saved login session was rejected. Sign out and sign in again once.'
        : status === 403
          ? 'This Firebase account is signed in but is not authorized as an administrator.'
          : lastError?.response?.data?.message || 'The administrator profile could not be loaded.';

    setUserProfile(null);
    setProfileError(message);
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (!firebaseUser && CROSS_PORTAL_SSO.pending) {
        // A cross-portal hand-off is in flight; keep the loader up.
        await CROSS_PORTAL_SSO.promise;
        if (auth.currentUser) return;
      }

      try {
        if (firebaseUser) {
          await storeToken(firebaseUser, true);
          setUser(firebaseUser);
          await fetchUserProfile();
        } else {
          clearTokens();
          setUser(null);
          setUserProfile(null);
          setProfileError('');
        }
      } catch (error) {
        console.error('Admin authentication initialization failed:', error);
        setProfileError(error?.message || 'Authentication initialization failed.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = useCallback(async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await storeToken(result.user, true);
      setUser(result.user);
      await fetchUserProfile();
      return result.user;
    } catch (error) {
      const message =
        error?.code === "auth/invalid-credential" || error?.code === "auth/wrong-password"
          ? "Invalid email or password."
          : error?.message || "Failed to sign in.";
      throw new Error(message, { cause: error });
    }
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      clearTokens();
      setUser(null);
      setUserProfile(null);
      setProfileError('');
      redirectToCommonLogin('signed-out');
    }
  };

  const resetPassword = useCallback(async (email) => sendPasswordResetEmail(auth, email), []);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      setUserProfile,
      profileError,
      loading,
      login,
      logout,
      resetPassword,
      refreshProfile: fetchUserProfile,
      isAuthenticated: Boolean(user),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, userProfile, profileError, loading, login, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
