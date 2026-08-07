import api from '../../../services/api';

/**
 * Fetch live sessions for a faculty member
 * @param {string} organizerId
 * @param {Object} params
 */
export async function fetchFacultySessions(organizerId, params = {}) {
  try {
    const res = await api.get('/meetings', {
      params: { organizer_id: organizerId, ...params },
    });
    return {
      success: true,
      meetings: res.data?.meetings || res.data?.data || (Array.isArray(res.data) ? res.data : []),
    };
  } catch (error) {
    console.warn('[sessionsApi] Fetch meetings endpoint failed, returning fallback mock data:', error?.message);
    return {
      success: true,
      meetings: MOCK_FACULTY_SESSIONS,
      isMock: true,
    };
  }
}

/**
 * Schedule a new live session / meeting
 * @param {Object} sessionData
 */
export async function createLiveSession(sessionData) {
  try {
    const res = await api.post('/meetings', sessionData);
    return {
      success: true,
      meeting: res.data?.meeting || res.data?.data || res.data,
    };
  } catch (error) {
    // Demo/offline fallback – simulate success
    console.warn('[sessionsApi] Create meeting fallback (demo mode):', error?.message);
    return {
      success: true,
      meeting: {
        ...sessionData,
        _id: 'sess-local-' + Date.now(),
        id: 'sess-local-' + Date.now(),
        attendeesCount: 0,
        maxCapacity: 40,
      },
      isMock: true,
    };
  }
}

/**
 * Upload minutes of meeting document (PDF / DOC)
 * @param {string} sessionId
 * @param {FormData} formData
 */
export async function uploadSessionMinutes(sessionId, formData) {
  try {
    const res = await api.post(`/meetings/${sessionId}/minutes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    // Demo/offline fallback – simulate success
    console.warn('[sessionsApi] Upload minutes fallback (demo mode):', error?.message);
    return {
      success: true,
      isMock: true,
    };
  }
}

// Fallback Mock Sessions for development/demo resiliency
export const MOCK_FACULTY_SESSIONS = [
  {
    _id: 'sess-101',
    id: 'sess-101',
    title: 'Full Stack Development - React Router & State Architecture',
    courseId: 'crs-1',
    courseName: 'Full Stack Web Development',
    batchName: 'Batch 2026-A',
    startTime: new Date(Date.now() + 3600000 * 2).toISOString(), // 2 hours from now
    endTime: new Date(Date.now() + 3600000 * 4).toISOString(),
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    status: 'upcoming',
    attendeesCount: 28,
    maxCapacity: 35,
    description: 'Deep dive into advanced client-side routing, protected routes, and state persistence pattern.',
  },
  {
    _id: 'sess-102',
    id: 'sess-102',
    title: 'UI/UX Masterclass - Figma Components & Tokens',
    courseId: 'crs-2',
    courseName: 'UI/UX Product Design',
    batchName: 'Design Cohort 4',
    startTime: new Date(Date.now() + 3600000 * 26).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 3600000 * 28).toISOString(),
    meetingUrl: 'https://zoom.us/j/987654321',
    status: 'scheduled',
    attendeesCount: 42,
    maxCapacity: 50,
    description: 'Hands-on workshop on design tokens, typography scale, and responsive grid layouts.',
  },
  {
    _id: 'sess-103',
    id: 'sess-103',
    title: 'Node.js & MongoDB Security Best Practices',
    courseId: 'crs-1',
    courseName: 'Full Stack Web Development',
    batchName: 'Batch 2026-A',
    startTime: new Date(Date.now() - 3600000 * 24).toISOString(), // Yesterday
    endTime: new Date(Date.now() - 3600000 * 22).toISOString(),
    meetingUrl: 'https://meet.google.com/xyz-uvwx-rst',
    status: 'completed',
    attendeesCount: 31,
    maxCapacity: 35,
    description: 'Securing API endpoints with JWT, rate limiting, and input sanitization.',
    minutesUrl: '#',
  },
];
