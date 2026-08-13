import api from '../../../services/api';

/**
 * Fetch broadcast announcements feed
 * @param {Object} [params]
 */
export async function fetchAnnouncements(params = {}) {
  try {
    const res = await api.get('/announcements', { params });
    return {
      success: true,
      announcements: res.data?.announcements || res.data?.data || (Array.isArray(res.data) ? res.data : []),
    };
  } catch (error) {
    console.warn('[announcementsApi] Fetch announcements fallback:', error?.message);
    return {
      success: true,
      announcements: MOCK_ANNOUNCEMENTS,
      isMock: true,
    };
  }
}

/**
 * Create a new announcement broadcast
 * @param {Object} announcementData
 */
export async function createAnnouncement(announcementData) {
  try {
    const res = await api.post('/announcements', announcementData);
    return {
      success: true,
      announcement: res.data?.announcement || res.data,
    };
  } catch (error) {
    // In demo mode (no backend), simulate a successful create
    console.warn('[announcementsApi] Create announcement fallback (demo mode):', error?.message);
    return {
      success: true,
      announcement: {
        ...announcementData,
        _id: 'ann-mock-' + Date.now(),
        id: 'ann-mock-' + Date.now(),
      },
      isMock: true,
    };
  }
}

/**
 * Update an existing announcement
 * @param {string} id
 * @param {Object} updateData
 */
export async function updateAnnouncement(id, updateData) {
  try {
    const res = await api.put(`/announcements/${id}`, updateData);
    return {
      success: true,
      announcement: res.data?.announcement || res.data,
    };
  } catch (error) {
    console.warn('[announcementsApi] Update announcement fallback (demo mode):', error?.message);
    return {
      success: true,
      isMock: true,
    };
  }
}

/**
 * Soft delete or archive an announcement
 * @param {string} id
 */
export async function deleteAnnouncement(id) {
  try {
    const res = await api.put(`/announcements/${id}`, { is_deleted: true, is_active: false });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.warn('[announcementsApi] Delete announcement fallback (demo mode):', error?.message);
    return {
      success: true,
      isMock: true,
    };
  }
}

// Fallback Mock Announcements (in-memory store for demo mode)
export const MOCK_ANNOUNCEMENTS = [
  {
    _id: 'ann-1',
    id: 'ann-1',
    title: 'Upcoming Mid-Term Assignment Submission Deadline & Submission Guidelines',
    content: 'Please ensure all React State Architecture projects are submitted via the LMS portal before Friday 11:59 PM. Submissions via email will not be graded.',
    category: 'Assignment',
    priority: 'High',
    author: 'Prof. ABC',
    targetAudience: 'Full Stack Web Development (Batch 2026-A)',
    courseId: 'crs-1',
    isPinned: true,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    is_active: true,
    is_deleted: false,
  },
  {
    _id: 'ann-2',
    id: 'ann-2',
    title: 'Guest Lecture: Scalable System Design & Microservices in Industry',
    content: 'We are thrilled to announce a special industry expert session this Saturday at 11:00 AM IST. Google Lead Architect will share live architecture breakdowns.',
    category: 'Event',
    priority: 'Normal',
    author: 'Amaanitvam Academic Council',
    targetAudience: 'All Registered Faculty & Students',
    courseId: 'all',
    isPinned: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    is_active: true,
    is_deleted: false,
  },
  {
    _id: 'ann-3',
    id: 'ann-3',
    title: 'UI/UX Design Cohort 4 Workshop Schedule Revision',
    content: 'The Figma Tokens & Component Library session has been rescheduled to Thursday 4:00 PM due to public holiday observance.',
    category: 'Schedule',
    priority: 'Normal',
    author: 'Prof. ABC',
    targetAudience: 'UI/UX Product Design (Cohort 4)',
    courseId: 'crs-2',
    isPinned: false,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    is_active: true,
    is_deleted: false,
  },
];
