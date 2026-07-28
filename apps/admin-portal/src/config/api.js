import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';

const productionApi = 'https://amaanitvam-foundation.onrender.com/api';

const normalizeApiBase = (value) => {
  const normalized = String(value || '').trim().replace(/\/+$/, '');

  if (!normalized) return '';
  if (normalized === '/api' || normalized.endsWith('/api')) return normalized;

  return `${normalized}/api`;
};

const configuredApi = normalizeApiBase(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '',
);

export const apiBaseURL = import.meta.env.DEV
  ? configuredApi || '/api'
  : configuredApi || productionApi;

// Compatibility export for any existing code importing { baseURL }.
export const baseURL = apiBaseURL;

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let authReadyPromise = null;

const waitForFirebaseUser = async () => {
  if (auth.currentUser) return auth.currentUser;

  // Firebase v10+ exposes authStateReady(). Waiting here prevents protected
  // requests from racing ahead of persisted-login restoration after refresh.
  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
    return auth.currentUser;
  }

  // Compatibility fallback for older Firebase Auth versions.
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

      const timeoutId = window.setTimeout(
        () => finish(auth.currentUser),
        5000,
      );

      unsubscribe = onAuthStateChanged(
        auth,
        (user) => finish(user),
        () => finish(null),
      );
    });
  }

  return authReadyPromise;
};

const ensureHeaders = (config) => {
  config.headers = config.headers || {};
  return config.headers;
};

const removeAuthorization = (headers) => {
  if (!headers) return;

  if (typeof headers.delete === 'function') {
    headers.delete('Authorization');
    headers.delete('authorization');
    return;
  }

  delete headers.Authorization;
  delete headers.authorization;
};

const setAuthorization = (headers, token) => {
  if (typeof headers.set === 'function') {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.Authorization = `Bearer ${token}`;
  }
};

const clearLegacyStoredTokens = () => {
  for (const key of [
    'adminToken',
    'firebaseToken',
    'token',
    'authToken',
  ]) {
    localStorage.removeItem(key);
  }
};

api.interceptors.request.use(
  async (config) => {
    const headers = ensureHeaders(config);

    // Never allow an old localStorage/default Axios token to override the
    // currently authenticated Firebase user's ID token.
    removeAuthorization(headers);

    const user = await waitForFirebaseUser();

    if (user) {
      const token = await user.getIdToken(false);
      setAuthorization(headers, token);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error?.config;

    if (
      error?.response?.status === 401 &&
      request &&
      !request.__amaanitvamFirebaseRetry
    ) {
      request.__amaanitvamFirebaseRetry = true;

      const user = await waitForFirebaseUser();

      if (user) {
        try {
          const freshToken = await user.getIdToken(true);
          const headers = ensureHeaders(request);
          removeAuthorization(headers);
          setAuthorization(headers, freshToken);
          clearLegacyStoredTokens();
          return api.request(request);
        } catch (refreshError) {
          console.error(
            '[admin-api] Firebase token refresh failed:',
            refreshError,
          );
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
