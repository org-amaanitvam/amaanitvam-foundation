
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase.js';
import api from '../config/api.js';

const AuthContext = createContext(null);

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
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await storeToken(result.user, true);
      setUser(result.user);
      await fetchUserProfile();
      return result.user;
    } catch (error) {
      const message =
        error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : error?.message || 'Failed to sign in.';
      throw new Error(message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    clearTokens();
    setUser(null);
    setUserProfile(null);
    setProfileError('');
  };

  const resetPassword = async (email) => sendPasswordResetEmail(auth, email);

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
    [user, userProfile, profileError, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
