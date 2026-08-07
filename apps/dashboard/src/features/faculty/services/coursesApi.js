// Courses & Curriculum API Service
const API_BASE = '/api/courses';

export async function fetchAssignedCourses(token) {
  const res = await fetch(`${API_BASE}?assigned_to=me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchCourseModules(courseId, token) {
  const res = await fetch(`/api/course-modules?course_id=${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchModuleLessons(moduleId, token) {
  const res = await fetch(`/api/lessons?module_id=${moduleId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createCourseModule(data, token) {
  const res = await fetch('/api/course-modules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createModuleLesson(data, token) {
  const res = await fetch('/api/lessons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
