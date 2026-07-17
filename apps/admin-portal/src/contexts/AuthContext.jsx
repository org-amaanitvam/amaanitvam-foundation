import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../config/firebase.js";
import api from "../config/api.js";

const AuthContext = createContext(null);

const storeToken = async (firebaseUser) => {
  if (!firebaseUser?.getIdToken) return null;
  const token = await firebaseUser.getIdToken(true);
  localStorage.setItem("adminToken", token);
  localStorage.setItem("firebaseToken", token);
  return token;
};

const clearTokens = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("firebaseToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    const endpoints = ["/profile/me"];

    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        const profile = res.data?.user || res.data?.admin || res.data?.profile || res.data || null;
        setUserProfile(profile);
        return profile;
      } catch (error) {
        if (![401, 403, 404].includes(error?.response?.status)) {
          console.warn(`Profile request failed at ${endpoint}:`, error?.message || error);
        }
      }
    }

    setUserProfile(null);
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          await storeToken(firebaseUser);
          setUser(firebaseUser);
          await fetchUserProfile();
        } else {
          clearTokens();
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await storeToken(result.user);
      setUser(result.user);
      await fetchUserProfile();
      return result.user;
    } catch (error) {
      const message =
        error?.code === "auth/invalid-credential" || error?.code === "auth/wrong-password"
          ? "Invalid email or password."
          : error?.message || "Failed to sign in.";
      throw new Error(message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    clearTokens();
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email) => sendPasswordResetEmail(auth, email);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      login,
      logout,
      resetPassword,
      refreshProfile: fetchUserProfile,
      isAuthenticated: Boolean(user),
    }),
    [user, userProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
