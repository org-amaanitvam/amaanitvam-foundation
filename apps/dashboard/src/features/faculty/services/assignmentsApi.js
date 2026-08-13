import api from '../../../services/api';

/**
 * Fetch list of coursework assignments created by or assigned to faculty
 * @param {Object} [params]
 */
export async function fetchFacultyAssignments(params = {}) {
  try {
    const res = await api.get('/tasks', { params: { category: 'assignment', ...params } });
    const assignments = res.data?.tasks || res.data?.assignments || res.data?.data || (Array.isArray(res.data) ? res.data : []);
    return {
      success: true,
      assignments: assignments.length > 0 ? assignments : MOCK_ASSIGNMENTS,
    };
  } catch (error) {
    console.warn('[assignmentsApi] Fetch assignments fallback (demo mode):', error?.message);
    return {
      success: true,
      assignments: MOCK_ASSIGNMENTS,
      isMock: true,
    };
  }
}

/**
 * Create a new coursework assignment
 * @param {Object} data 
 */
export async function createAssignment(data) {
  try {
    const res = await api.post('/tasks', { ...data, category: 'assignment' });
    return {
      success: true,
      assignment: res.data?.task || res.data?.assignment || res.data,
    };
  } catch (error) {
    console.warn('[assignmentsApi] Create assignment fallback (demo mode):', error?.message);
    return {
      success: true,
      assignment: {
        ...data,
        _id: 'asg-' + Date.now(),
        id: 'asg-' + Date.now(),
        submittedCount: 0,
        pendingReviewCount: 0,
        status: data.status || 'Published',
        created_at: new Date().toISOString(),
      },
      isMock: true,
    };
  }
}

/**
 * Fetch student submissions for a specific assignment
 * @param {string} assignmentId 
 */
export async function fetchAssignmentSubmissions(assignmentId) {
  try {
    const res = await api.get(`/tasks/${assignmentId}/submissions`);
    const submissions = res.data?.submissions || res.data?.data || (Array.isArray(res.data) ? res.data : []);
    return {
      success: true,
      submissions: submissions.length > 0 ? submissions : MOCK_SUBMISSIONS,
    };
  } catch (error) {
    console.warn('[assignmentsApi] Fetch submissions fallback (demo mode):', error?.message);
    return {
      success: true,
      submissions: MOCK_SUBMISSIONS,
      isMock: true,
    };
  }
}

/**
 * Grade student submission & post feedback
 * @param {string} submissionId 
 * @param {number} grade 
 * @param {string} feedback 
 */
export async function gradeStudentSubmission(submissionId, grade, feedback = '') {
  try {
    const res = await api.post(`/tasks/submissions/${submissionId}/grade`, { grade, feedback });
    return {
      success: true,
      submission: res.data?.submission || res.data,
    };
  } catch (error) {
    console.warn('[assignmentsApi] Grade submission fallback (demo mode):', error?.message);
    return {
      success: true,
      submissionId,
      grade,
      feedback,
      isMock: true,
    };
  }
}

export const MOCK_ASSIGNMENTS = [
  {
    _id: 'asg-101',
    id: 'asg-101',
    title: 'React State Architecture & Redux Toolkit Capstone Project',
    courseName: 'Full Stack Web Development (Batch 2026-A)',
    courseId: 'crs-1',
    dueDate: '2026-08-18',
    totalPoints: 100,
    submittedCount: 24,
    pendingReviewCount: 5,
    totalEnrolled: 28,
    status: 'Published',
    description: 'Implement client-side state management, async thunks, and persistent local caching for the e-commerce dashboard.',
  },
  {
    _id: 'asg-102',
    id: 'asg-102',
    title: 'Figma Token Systems & High-Fidelity Prototyping Workshop',
    courseName: 'UI/UX Product Design (Cohort 4)',
    courseId: 'crs-2',
    dueDate: '2026-08-20',
    totalPoints: 50,
    submittedCount: 38,
    pendingReviewCount: 12,
    totalEnrolled: 42,
    status: 'Published',
    description: 'Create variable design tokens for dark/light themes and interactive component variants in Figma.',
  },
  {
    _id: 'asg-103',
    id: 'asg-103',
    title: 'Node.js Express Microservices & JWT Authentication Lab',
    courseName: 'Full Stack Web Development (Batch 2026-A)',
    courseId: 'crs-1',
    dueDate: '2026-08-10',
    totalPoints: 100,
    submittedCount: 28,
    pendingReviewCount: 0,
    totalEnrolled: 28,
    status: 'Completed',
    description: 'Build REST endpoints with JWT authentication middleware, password hashing, and rate limiting.',
  },
];

export const MOCK_SUBMISSIONS = [
  {
    _id: 'sub-001',
    id: 'sub-001',
    studentName: 'Aarav Sharma',
    rollNo: 'AF-2026-001',
    email: 'aarav.sharma@amaanitvam.org',
    submittedAt: '2026-08-10T14:30:00Z',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Aarav_Sharma_React_Capstone.pdf',
    githubRepo: 'https://github.com/aarav/react-state-architecture',
    status: 'pending',
    grade: null,
    feedback: '',
  },
  {
    _id: 'sub-002',
    id: 'sub-002',
    studentName: 'Ananya Verma',
    rollNo: 'AF-2026-002',
    email: 'ananya.v@amaanitvam.org',
    submittedAt: '2026-08-09T18:15:00Z',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Ananya_Verma_Assignment_Submission.pdf',
    githubRepo: 'https://github.com/ananya/react-redux-store',
    status: 'graded',
    grade: 95,
    feedback: 'Excellent component separation and state normalization. Good work!',
  },
  {
    _id: 'sub-003',
    id: 'sub-003',
    studentName: 'Rohan Gupta',
    rollNo: 'AF-2026-003',
    email: 'rohan.g@amaanitvam.org',
    submittedAt: '2026-08-10T09:45:00Z',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Rohan_Gupta_Redux_Project.pdf',
    githubRepo: 'https://github.com/rohan/redux-dashboard',
    status: 'pending',
    grade: null,
    feedback: '',
  },
  {
    _id: 'sub-004',
    id: 'sub-004',
    studentName: 'Priya Nair',
    rollNo: 'AF-2026-004',
    email: 'priya.nair@amaanitvam.org',
    submittedAt: '2026-08-08T22:10:00Z',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Priya_Nair_React_Capstone.pdf',
    githubRepo: 'https://github.com/priya/react-app-capstone',
    status: 'graded',
    grade: 88,
    feedback: 'Good implementation. Consider splitting large component files.',
  },
];
