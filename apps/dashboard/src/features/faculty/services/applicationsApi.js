import api from '../../../services/api';

/**
 * Fetch candidate applications submitted to faculty department
 * @param {Object} filters { status, type, search }
 */
export async function fetchApplications(filters = {}) {
  try {
    const res = await api.get('/faculty/applications', { params: filters });
    return {
      success: true,
      applications: res.data?.applications || res.data?.data || res.data,
    };
  } catch (error) {
    console.warn('[applicationsApi] Fetch applications fallback (demo mode):', error?.message);
    return {
      success: true,
      applications: MOCK_APPLICATIONS,
      isMock: true,
    };
  }
}

/**
 * Update application decision status (approved, rejected, interviewing)
 * @param {string} applicationId
 * @param {string} status
 * @param {string} notes
 */
export async function updateApplicationStatus(applicationId, status, notes = '') {
  try {
    const res = await api.patch(`/faculty/applications/${applicationId}`, { status, notes });
    return {
      success: true,
      application: res.data?.application || res.data,
    };
  } catch (error) {
    console.warn('[applicationsApi] Update application status fallback (demo mode):', error?.message);
    return {
      success: true,
      applicationId,
      status,
      notes,
      isMock: true,
    };
  }
}

export const MOCK_APPLICATIONS = [
  {
    _id: 'app-001',
    id: 'app-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    type: 'Course Admission',
    target: 'Full Stack Web Development (Batch 2026-A)',
    qualification: 'B.Tech Computer Science (3rd Year)',
    institution: 'IIT Bombay',
    gpa: '8.9 / 10',
    sop: 'Passionate about modern web architectures and full-stack cloud applications. I want to build scalable SaaS products and join the upcoming batch.',
    status: 'pending',
    appliedDate: '2026-08-08',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    notes: '',
  },
  {
    _id: 'app-002',
    id: 'app-002',
    name: 'Riya Sen',
    email: 'riya.sen@example.com',
    phone: '+91 91234 56789',
    type: 'Teaching Assistant',
    target: 'UI/UX Product Design (Cohort 4)',
    qualification: 'M.Des Interaction Design',
    institution: 'NID Ahmedabad',
    gpa: '9.2 / 10',
    sop: '3 years of UX prototyping experience. I wish to assist Prof. ABC in conducting design sprint workshops and mentoring junior cohorts.',
    status: 'interviewing',
    appliedDate: '2026-08-05',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    notes: 'Shortlisted for technical interview round on Aug 12.',
  },
  {
    _id: 'app-003',
    id: 'app-003',
    name: 'Vikramaditya Roy',
    email: 'vikram.roy@example.com',
    phone: '+91 99887 76655',
    type: 'Research Intern',
    target: 'Cloud Architecture & DevOps Lab',
    qualification: 'B.E. Information Technology',
    institution: 'BITS Pilani',
    gpa: '8.5 / 10',
    sop: 'Focusing on Kubernetes cluster optimization and serverless performance benchmarks. Seeking 6-month research internship under Amaanitvam Foundation.',
    status: 'approved',
    appliedDate: '2026-08-01',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    notes: 'Approved by department head. Offer letter issued.',
  },
  {
    _id: 'app-004',
    id: 'app-004',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@example.com',
    phone: '+91 94455 66778',
    type: 'Course Admission',
    target: 'UI/UX Product Design (Cohort 4)',
    qualification: 'B.A. Graphic Design',
    institution: 'SNDT University',
    gpa: '7.8 / 10',
    sop: 'Eager to pivot into digital product design and design systems for enterprise software.',
    status: 'rejected',
    appliedDate: '2026-07-28',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    notes: 'Prerequisites not met for advanced cohort.',
  },
];
