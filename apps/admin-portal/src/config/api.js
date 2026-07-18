import axios from "axios";
import { auth } from "./firebase";

const configuredBaseUrl = String(import.meta.env.VITE_API_URL || "").trim();

const baseURL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, "")
  : import.meta.env.DEV
    ? "/api"
    : "https://amaanitvam-foundation.onrender.com/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const user = auth.currentUser;

    if (
      error.response?.status === 401 &&
      user &&
      request &&
      !request.__firebaseRetry
    ) {
      request.__firebaseRetry = true;

      try {
        const freshToken = await user.getIdToken(true);
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${freshToken}`;
        return api(request);
      } catch (refreshError) {
        console.error("Firebase token refresh failed:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
