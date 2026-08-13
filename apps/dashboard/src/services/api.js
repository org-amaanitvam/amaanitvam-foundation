import axios from 'axios';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

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
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });
    }

    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();

        config.headers = config.headers || {};

        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[API Auth] Token attached: ${config.url}`);
      } catch (error) {
        console.error('[API Auth] Could not get Firebase token:', error);
      }
    } else {
      console.warn(`[API Auth] No Firebase user for: ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const status = error.response?.status;

    /*
     * Retry one time with a newly issued Firebase ID token.
     * This prevents an old cached token from immediately logging the user out.
     */
    if (
      status === 401 &&
      request &&
      !request._firebaseTokenRetried &&
      auth.currentUser
    ) {
      request._firebaseTokenRetried = true;

      try {
        const freshToken = await auth.currentUser.getIdToken(true);

        request.headers = request.headers || {};

        if (typeof request.headers.set === 'function') {
          request.headers.set('Authorization', `Bearer ${freshToken}`);
        } else {
          request.headers.Authorization = `Bearer ${freshToken}`;
        }

        console.warn('[API Auth] Retrying request with refreshed token');

        return api(request);
      } catch (refreshError) {
        console.error(
          '[API Auth] Firebase token refresh failed:',
          refreshError
        );
      }
    }

    /*
     * IMPORTANT: a 401 on ONE endpoint must NOT destroy the whole session.
     * The previous code called signOut() + window.location.replace('/login')
     * from here, so any single failing widget request (a burst of parallel
     * dashboard calls) kicked the user straight back out of the dashboard a
     * second after login. Session validity is owned solely by AuthContext
     * (/api/auth/session). Here we only notify listeners.
     */
    if (status === 401 && request?._firebaseTokenRetried) {
      console.error(
        '[API Auth] Backend rejected the refreshed Firebase token for',
        request?.url
      );

      window.dispatchEvent(
        new CustomEvent('dashboard:auth-rejected', {
          detail: { url: request?.url },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;
