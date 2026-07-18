import axios from 'axios';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth'; // 1. THE FIX: Import the Firebase sign-out function

const isDevelopment = import.meta.env.MODE === 'development';
const defaultBaseURL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : 'https://amaanitvam-foundation.onrender.com/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    if (!auth.currentUser) {
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });
    }

    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        
        if (config.headers && typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`✅ [API Token Attached] -> ${config.url}`);
      } catch (err) {
        console.error('❌ [API Token Error] Failed to get Firebase token:', err);
      }
    } else {
      console.error(`🚨 [API Warning] Request fired to ${config.url} with NO Firebase user!`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🚨 401 Unauthorized caught! Forcing a full Firebase logout to break the loop...");
      localStorage.clear();
      sessionStorage.clear();

      // 2. THE FIX: Actually sign out of Firebase!
      signOut(auth).then(() => {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;