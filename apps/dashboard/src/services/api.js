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
     * Log out only when the API also rejects the newly refreshed token.
     */
    if (status === 401 && request?._firebaseTokenRetried) {
      console.error(
        '[API Auth] Backend rejected the refreshed Firebase token'
      );

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();

      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('[API Auth] Sign-out failed:', signOutError);
      }

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
