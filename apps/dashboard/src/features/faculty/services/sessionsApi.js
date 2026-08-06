// Meetings & Live Sessions API Service
const API_BASE = '/api/meetings';

export async function fetchFacultySessions(organizerId, token) {
  const res = await fetch(`${API_BASE}?organizer_id=${organizerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createLiveSession(sessionData, token) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sessionData),
  });
  return res.json();
}
