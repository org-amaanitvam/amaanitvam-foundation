import axios from 'axios';
import { auth } from './firebase';

const productionApi = 'https://amaanitvam-foundation.onrender.com/api';
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : productionApi);

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
