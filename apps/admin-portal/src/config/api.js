
import axios from 'axios';
import { auth } from './firebase.js';

const productionApi = 'https://amaanitvam-foundation.onrender.com/api';
const configuredApi = String(import.meta.env.VITE_API_URL || '')
  .trim()
  .replace(/\/+$/, '');

// Local Vite development may use /api and its proxy. A production build must
// always call the Render backend directly; a relative /api value would point
// at admin.amaanitvam.org and return the static site's 404 response.
export const apiBaseURL = import.meta.env.DEV
  ? (configuredApi || '/api')
  : productionApi;

const baseURL = apiBaseURL;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const waitForAuth = async () => {
  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
  }
  return auth.currentUser;
};

const persistToken = (token) => {
  if (!token) return;
  localStorage.setItem('adminToken', token);
  localStorage.setItem('firebaseToken', token);
};

api.interceptors.request.use(async (config) => {
  const user = await waitForAuth();
  if (!user) return config;

  const token = await user.getIdToken();
  persistToken(token);
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const shouldRetry =
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest.__firebaseAuthRetried;

    if (shouldRetry) {
      const user = await waitForAuth();
      if (user) {
        originalRequest.__firebaseAuthRetried = true;
        const freshToken = await user.getIdToken(true);
        persistToken(freshToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        return api.request(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
