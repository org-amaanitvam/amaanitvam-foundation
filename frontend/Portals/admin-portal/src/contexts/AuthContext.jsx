import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import api from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const res = await api.get('/admin/me');
          setUserProfile(res.data.user);
        } catch (err) {
          console.error('Failed to fetch admin profile:', err);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const verifyPortalEmail = async (email, purpose = 'login') => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) throw new Error('Email is required.');
    try {
      await api.post('/auth/verify-email', {
        email: normalizedEmail,
        portal: 'admin',
        purpose,
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'This email is not registered or active for this portal.';
      throw new Error(message);
    }
    return normalizedEmail;
  };

  const login = async (email, password) => {
    const verifiedEmail = await verifyPortalEmail(email, 'login');
    return signInWithEmailAndPassword(auth, verifiedEmail, password);
  };

  const logout = () => signOut(auth);

  const resetPassword = async (email) => {
    const verifiedEmail = await verifyPortalEmail(email, 'password_reset');
    return sendPasswordResetEmail(auth, verifiedEmail);
  };

  const value = { user, userProfile, setUserProfile, loading, login, logout, resetPassword };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};