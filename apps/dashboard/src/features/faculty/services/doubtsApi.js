import api from '../../../services/api';

/**
 * Fetch doubts assigned to faculty or all active doubts
 * @param {string} [status] 'open' | 'in_progress' | 'resolved'
 */
export async function fetchAssignedDoubts(status = '') {
  try {
    const params = status ? { status } : {};
    const res = await api.get('/doubts', { params });
    const doubts = res.data?.doubts || res.data?.data || (Array.isArray(res.data) ? res.data : []);
    return {
      success: true,
      doubts: doubts.length > 0 ? doubts : MOCK_DOUBTS,
    };
  } catch (error) {
    console.warn('[doubtsApi] Fetch doubts fallback (demo mode):', error?.message);
    return {
      success: true,
      doubts: MOCK_DOUBTS,
      isMock: true,
    };
  }
}

/**
 * Fetch doubt by ID
 * @param {string} doubtId 
 */
export async function fetchDoubtById(doubtId) {
  try {
    const res = await api.get(`/doubts/${doubtId}`);
    return {
      success: true,
      doubt: res.data?.doubt || res.data,
    };
  } catch (error) {
    console.warn('[doubtsApi] Fetch doubt by ID fallback:', error?.message);
    const mock = MOCK_DOUBTS.find((d) => (d._id || d.id) === doubtId) || MOCK_DOUBTS[0];
    return {
      success: true,
      doubt: mock,
      isMock: true,
    };
  }
}

/**
 * Post response/answer to a doubt thread
 * @param {string} doubtId 
 * @param {Object} responseData { message, is_solution }
 */
export async function postDoubtResponse(doubtId, responseData) {
  try {
    const res = await api.post(`/doubts/${doubtId}/respond`, responseData);
    return {
      success: true,
      response: res.data?.response || res.data,
    };
  } catch (error) {
    console.warn('[doubtsApi] Post doubt response fallback (demo mode):', error?.message);
    return {
      success: true,
      response: {
        _id: 'resp-' + Date.now(),
        message: responseData.message,
        authorName: 'Prof. ABC (Faculty)',
        created_at: new Date().toISOString(),
        is_faculty_response: true,
      },
      isMock: true,
    };
  }
}

/**
 * Update doubt status (resolved, open, in_progress)
 * @param {string} doubtId 
 * @param {string} status 
 */
export async function updateDoubtStatus(doubtId, status) {
  try {
    const res = await api.patch(`/doubts/${doubtId}/resolve`, { status });
    return {
      success: true,
      doubt: res.data?.doubt || res.data,
    };
  } catch (error) {
    console.warn('[doubtsApi] Update doubt status fallback:', error?.message);
    return {
      success: true,
      doubtId,
      status,
      isMock: true,
    };
  }
}

export const MOCK_DOUBTS = [
  {
    _id: 'dbt-101',
    id: 'dbt-101',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav.sharma@example.com',
    courseName: 'Full Stack Web Development (Batch 2026-A)',
    subject: 'React useEffect dependency array loop causing infinite re-renders',
    question: 'When I pass an object state to useEffect dependencies, it keeps triggering an infinite loop. How can I memoize it properly using useMemo or useRef?',
    status: 'open',
    priority: 'high',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    responses: [
      {
        _id: 'resp-1',
        authorName: 'Aarav Sharma (Student)',
        message: 'Here is my sample code: useEffect(() => { fetchData(filterObj); }, [filterObj]);',
        created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        is_faculty_response: false,
      },
    ],
  },
  {
    _id: 'dbt-102',
    id: 'dbt-102',
    studentName: 'Riya Sen',
    studentEmail: 'riya.sen@example.com',
    courseName: 'UI/UX Product Design (Cohort 4)',
    subject: 'Figma Auto Layout horizontal wrapping behavior issue',
    question: 'In Figma v116, how do we combine Auto Layout wrap with fixed min-width constraints for responsive cards?',
    status: 'in_progress',
    priority: 'medium',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    responses: [
      {
        _id: 'resp-2',
        authorName: 'Prof. ABC (Faculty)',
        message: 'Set the frame layout to Wrap, and set each child card width to Fill container with a Min Width property in the right sidebar.',
        created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
        is_faculty_response: true,
      },
    ],
  },
  {
    _id: 'dbt-103',
    id: 'dbt-103',
    studentName: 'Vikramaditya Roy',
    studentEmail: 'vikram.roy@example.com',
    courseName: 'Cloud Architecture & DevOps',
    subject: 'Kubernetes Pod crashloop backoff error in Minikube environment',
    question: 'My NGINX deployment pod fails with CrashLoopBackOff due to missing configMap volume path.',
    status: 'resolved',
    priority: 'normal',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    responses: [
      {
        _id: 'resp-3',
        authorName: 'Prof. ABC (Faculty)',
        message: 'Ensure the configMap volume mount specifies mountPath: /etc/nginx/conf.d and subPath: nginx.conf.',
        created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
        is_faculty_response: true,
      },
    ],
  },
];
