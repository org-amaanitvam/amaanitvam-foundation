import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://amaanitvam-foundation.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    // 1. Give Firebase a split second to initialize if it's lagging
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
        
        // 2. The Fix: Handle both older and newer Axios header injection
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
      localStorage.clear();
      sessionStorage.clear();

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;