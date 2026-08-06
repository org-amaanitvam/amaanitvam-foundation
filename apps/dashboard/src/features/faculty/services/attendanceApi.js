// Attendance API Service
const API_BASE = '/api/attendance';

export async function punchInFaculty(userId, token) {
  const res = await fetch(`${API_BASE}/punch-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, punchIn: new Date() }),
  });
  return res.json();
}

export async function punchOutFaculty(userId, token) {
  const res = await fetch(`${API_BASE}/punch-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, punchOut: new Date() }),
  });
  return res.json();
}

export async function submitStudentAttendance(courseId, date, records, token) {
  const res = await fetch(`${API_BASE}/student-marking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ course_id: courseId, date, records }),
  });
  return res.json();
}
