import axios from 'axios';

const isDev =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const api = axios.create({
  baseURL: isDev ? 'http://localhost:5000/api' : 'https://amaanitvam-foundation.onrender.com/api',
  timeout: 15000,
});

export async function fetchPublishedCourses() {
  const { data } = await api.get('/courses?is_published=true');
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchCourseBySlug(slug) {
  // The course list returns objects keyed by _id; look up by slug client-side
  // for discovery. A dedicated slug endpoint can be added later.
  const courses = await fetchPublishedCourses();
  return courses.find((c) => c.slug === slug) || null;
}

export async function fetchCourseModules(courseId) {
  const { data } = await api.get(`/courses/${courseId}/modules`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchModuleLessons(courseId, moduleId) {
  const { data } = await api.get(`/courses/${courseId}/modules/${moduleId}/lessons`);
  return Array.isArray(data?.data) ? data.data : [];
}