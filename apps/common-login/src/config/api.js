import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';

const productionApi = 'https://amaanitvam-foundation.onrender.com/api';

export const apiBaseURL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || '/api')
  : (import.meta.env.VITE_API_URL || productionApi);

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

let authReadyPromise = null;

const waitForFirebaseUser = async () => {
  if (auth.currentUser) return auth.currentUser;
  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
    return auth.currentUser;
  }
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      let settled = false;
      let unsubscribe = () => {};
      const finish = (user) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        unsubscribe();
        resolve(user || null);
      };
      const timeoutId = window.setTimeout(() => finish(auth.currentUser), 5000);
      unsubscribe = onAuthStateChanged(auth, (user) => finish(user), () => finish(null));
    });
  }
  return authReadyPromise;
};

api.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};
  delete config.headers.Authorization;
  delete config.headers.authorization;
  const user = await waitForFirebaseUser();
  if (user) {
    const token = await user.getIdToken(false);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error?.config;
    if (error?.response?.status === 401 && request && !request.__retried) {
      request.__retried = true;
      const user = await waitForFirebaseUser();
      if (user) {
        try {
          const freshToken = await user.getIdToken(true);
          request.headers = request.headers || {};
          request.headers.Authorization = `Bearer ${freshToken}`;
          return api.request(request);
        } catch (e) {
          console.error('[common-login] Token refresh failed:', e);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
