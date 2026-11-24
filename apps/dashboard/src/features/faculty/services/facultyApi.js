import api from '../../../services/api';

/**
 * Fetch faculty profile
 * @param {string} facultyId 
 */
export async function fetchFacultyProfile(facultyId) {
  try {
    const res = await api.get(`/faculty/${facultyId || 'me'}`);
    return {
      success: true,
      profile: res.data?.faculty || res.data?.profile || res.data,
    };
  } catch (error) {
    console.error('[facultyApi] Fetch profile error:', error?.response?.data?.message || error?.message);
    return {
      success: false,
      profile: null,
      error: error?.response?.data?.message || error?.message,
    };
  }
}

/**
 * Fetch faculty analytics & teaching performance metrics
 * @param {string} facultyId 
 */
export async function fetchFacultyStats(facultyId) {
  try {
    const res = await api.get(`/faculty/${facultyId || 'me'}/stats`);
    return {
      success: true,
      stats: res.data?.stats || res.data,
    };
  } catch (error) {
    console.error('[facultyApi] Fetch stats error:', error?.response?.data?.message || error?.message);
    return {
      success: false,
      stats: null,
      error: error?.response?.data?.message || error?.message,
    };
  }
}

/**
 * Update faculty profile
 * @param {string} facultyId 
 * @param {Object} data 
 */
export async function updateFacultyProfile(facultyId, data) {
  try {
    const res = await api.put(`/faculty/${facultyId || 'me'}`, data);
    return {
      success: true,
      profile: res.data?.faculty || res.data?.profile || res.data,
    };
  } catch (error) {
    console.error('[facultyApi] Update profile error:', error?.response?.data?.message || error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || error?.message,
    };
  }
}

export const MOCK_FACULTY_PROFILE = {
  id: 'fac-101',
  name: 'Prof. ABC',
  email: 'faculty@amaanitvam.org',
  department: 'Department of Computer Science & Engineering',
  designation: 'Senior Associate Professor',
};

export const MOCK_FACULTY_STATS = {
  engagementRate: 92.4,
  completionRate: 87.6,
  doubtResolutionRate: 94.1,
  performanceData: [
    { course: 'React', engagement: 92, completion: 88, doubts: 95 },
    { course: 'Python', engagement: 86, completion: 82, doubts: 91 },
    { course: 'UI/UX', engagement: 95, completion: 90, doubts: 97 },
    { course: 'Database', engagement: 81, completion: 79, doubts: 89 },
    { course: 'Java', engagement: 89, completion: 85, doubts: 93 },
  ],
  monthlyData: [
    { month: 'Jan', students: 82 },
    { month: 'Feb', students: 96 },
    { month: 'Mar', students: 108 },
    { month: 'Apr', students: 115 },
    { month: 'May', students: 121 },
    { month: 'Jun', students: 128 },
  ],
  doubtData: [
    { name: 'Resolved', value: 94 },
    { name: 'Pending', value: 6 },
  ],
};
