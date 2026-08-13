import axios from 'axios';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

const isDev =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isDev
    ? 'http://localhost:5000/api'
    : 'https://amaanitvam-foundation.onrender.com/api'),
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
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('[LMS API] Could not get Firebase token:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const status = error.response?.status;

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
        request.headers.Authorization = `Bearer ${freshToken}`;
        return api(request);
      } catch (refreshError) {
        console.error(
          '[LMS API] Firebase token refresh failed:',
          refreshError,
        );
      }
    }

    if (status === 401 && request?._firebaseTokenRetried) {
      console.error('[LMS API] Backend rejected the refreshed token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();

      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('[LMS API] Sign-out failed:', signOutError);
      }

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

function unwrapData(payload) {
  if (!payload) return null;
  if (payload.success === true && payload.data !== undefined) return payload.data;
  return payload;
}

const unwrapList = (payload, key = 'data') => {
  const body = unwrapData(payload);
  if (Array.isArray(body?.[key])) return body[key];
  if (Array.isArray(body)) return body;
  return Array.isArray(payload?.[key]) ? payload[key] : [];
};

function unwrapDocument(payload, keys) {
  const body = unwrapData(payload);
  for (const key of keys) {
    if (body?.[key] !== undefined) return body[key];
  }
  return body;
}

// ─── Course catalog (public) ────────────────────────────────────────────
export async function fetchPublishedCourses() {
  const { data } = await api.get('/courses?is_published=true');
  return unwrapList(data);
}

export async function fetchCourseBySlug(slug) {
  const courses = await fetchPublishedCourses();
  return courses.find((c) => c.slug === slug) || null;
}

export async function fetchCourseModules(courseId) {
  const { data } = await api.get(`/courses/${courseId}/modules`);
  return unwrapList(data);
}

export async function fetchModuleLessons(courseId, moduleId) {
  const { data } = await api.get(`/courses/${courseId}/modules/${moduleId}/lessons`);
  return unwrapList(data);
}

// ─── Doubts (student: list own / create / get / rate) ──────────────────
export async function fetchMyDoubts(token, { status = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  const { data } = await api.get(`/doubts?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return { items: unwrapList(data), total: data?.meta?.total || 0 };
}

export async function fetchDoubtById(doubtId, token) {
  const { data } = await api.get(`/doubts/${doubtId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return unwrapDocument(data, ['doubt']);
}

export async function createDoubt(payload, token) {
  const { data } = await api.post('/doubts', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return unwrapDocument(data, ['doubt']);
}

export async function rateDoubt(doubtId, payload, token) {
  const { data } = await api.post(`/doubts/${doubtId}/rate`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

// ─── Attendance (student has attendance.read / attendance.write) ────────
export async function punchIn(userId, token) {
  const { data } = await api.post('/attendance/punch-in', {
    userId,
    punchIn: new Date(),
  }, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

export async function punchOut(userId, token) {
  const { data } = await api.post('/attendance/punch-out', {
    userId,
    punchOut: new Date(),
  }, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

export async function fetchMyAttendance(userId, token) {
  const { data } = await api.get(`/attendance/member/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return Array.isArray(data?.history) ? data.history : [];
}

// ─── Meetings / Sessions ────────────────────────────────────────────────
export async function fetchSessions({ organizerId = '', token, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (organizerId) params.set('organizer_id', organizerId);
  if (limit) params.set('limit', limit);
  const { data } = await api.get(`/meetings?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return unwrapList(data);
}

// ─── Announcements ──────────────────────────────────────────────────────
export async function fetchAnnouncements(token) {
  const { data } = await api.get('/announcements', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return unwrapList(data, 'announcements');
}

// ─── Notifications ──────────────────────────────────────────────────────
export async function fetchNotifications(token) {
  const { data } = await api.get('/notifications', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return unwrapList(data, 'notifications');
}

export async function fetchUnreadCount(token) {
  const { data } = await api.get('/notifications/unread-count', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const body = unwrapData(data);
  return body?.unread_count ?? body?.unreadCount ?? body?.count ?? 0;
}

export async function markNotificationRead(notificationId, token) {
  const { data } = await api.patch(`/notifications/${notificationId}/read`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

export async function markAllNotificationsRead(token) {
  const { data } = await api.patch('/notifications/read-all', {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

export default api;