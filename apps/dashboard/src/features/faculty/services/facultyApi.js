// Faculty API Client Services
const API_BASE = '/api/faculty';

export async function fetchFacultyProfile(facultyId, token) {
  const res = await fetch(`${API_BASE}/${facultyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchFacultyStats(facultyId, token) {
  const res = await fetch(`${API_BASE}/${facultyId}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateFacultyProfile(facultyId, data, token) {
  const res = await fetch(`${API_BASE}/${facultyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
