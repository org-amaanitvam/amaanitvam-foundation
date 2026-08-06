// Doubts Resolution API Service
const API_BASE = '/api/doubts';

export async function fetchAssignedDoubts(facultyId, status = '', token) {
  const query = new URLSearchParams({ assigned_faculty_id: facultyId });
  if (status) query.append('status', status);

  const res = await fetch(`${API_BASE}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchDoubtById(doubtId, token) {
  const res = await fetch(`${API_BASE}/${doubtId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function postDoubtResponse(doubtId, responseData, token) {
  const res = await fetch(`${API_BASE}/${doubtId}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(responseData),
  });
  return res.json();
}

export async function updateDoubtStatus(doubtId, status, token) {
  const res = await fetch(`${API_BASE}/${doubtId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return res.json();
}
