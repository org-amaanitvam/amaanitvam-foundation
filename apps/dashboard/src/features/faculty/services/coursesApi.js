import api from '../../../services/api';

/**
 * Fetch courses assigned to faculty member
 */
export async function fetchAssignedCourses() {
  try {
    const res = await api.get('/courses');
    const courses = res.data?.courses || res.data?.data || (Array.isArray(res.data) ? res.data : []);
    return {
      success: true,
      courses,
    };
  } catch (error) {
    console.error('[coursesApi] Fetch courses error:', error?.response?.data?.message || error?.message);
    return {
      success: false,
      courses: [],
      error: error?.response?.data?.message || error?.message,
    };
  }
}

/**
 * Fetch course details by ID
 * @param {string} courseId 
 */
export async function fetchCourseById(courseId) {
  try {
    const res = await api.get(`/courses/${courseId}`);
    return {
      success: true,
      course: res.data?.course || res.data,
    };
  } catch (error) {
    console.error('[coursesApi] Fetch course by ID error:', error?.response?.data?.message || error?.message);
    return {
      success: false,
      course: null,
      error: error?.response?.data?.message || error?.message,
    };
  }
}

/**
 * Fetch modules for a specific course
 * @param {string} courseId
 */
export async function fetchCourseModules(courseId) {
  try {
    const res = await api.get(`/courses/${courseId}/modules`);
    const modules = res.data?.modules || res.data?.data || (Array.isArray(res.data) ? res.data : []);
    return {
      success: true,
      modules,
    };
  } catch (error) {
    console.error('[coursesApi] Fetch modules error:', error?.response?.data?.message || error?.message);
    return {
      success: false,
      modules: [],
      error: error?.response?.data?.message || error?.message,
    };
  }
}

/**
 * Create a new module for a course
 * @param {string} courseId 
 * @param {Object} data 
 */
export async function createCourseModule(courseId, data) {
  try {
    const res = await api.post(`/courses/${courseId}/modules`, data);
    return {
      success: true,
      module: res.data?.module || res.data,
    };
  } catch (error) {
    console.error('[coursesApi] Create module error:', error?.response?.data?.message || error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || error?.message,
    };
  }
}

/**
 * Add a lesson to a module
 * @param {string} courseId 
 * @param {string} moduleId 
 * @param {Object} data 
 */
export async function createModuleLesson(courseId, moduleId, data) {
  try {
    const res = await api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, data);
    return {
      success: true,
      lesson: res.data?.lesson || res.data,
    };
  } catch (error) {
    console.error('[coursesApi] Create lesson error:', error?.response?.data?.message || error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || error?.message,
    };
  }
}

export const MOCK_COURSES = [
  {
    _id: 'crs-1',
    id: 1,
    title: 'Full Stack Web Development',
    category: 'Web Development',
    description: 'Learn frontend, backend and database development with modern web technologies.',
    students: 128,
    modulesCount: 12,
    lessonsCount: 56,
    progress: 85,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
  },
  {
    _id: 'crs-2',
    id: 2,
    title: 'Data Structures & Algorithms',
    category: 'Programming',
    description: 'Master computer science fundamentals, algorithm efficiency, and problem solving.',
    students: 96,
    modulesCount: 10,
    lessonsCount: 44,
    progress: 72,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600',
  },
  {
    _id: 'crs-3',
    id: 3,
    title: 'UI / UX Design Fundamentals',
    category: 'Design',
    description: 'Figma components, design systems, usability research, and high-fidelity prototyping.',
    students: 64,
    modulesCount: 8,
    lessonsCount: 31,
    progress: 60,
    status: 'Draft',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600',
  },
];

export const MOCK_MODULES = [
  {
    id: 1,
    _id: 'mod-1',
    title: 'HTML & CSS Fundamentals',
    lessonsCount: 6,
    duration: '4h 20m',
    items: ['Introduction to HTML', 'HTML Semantic Elements', 'CSS Fundamentals'],
  },
  {
    id: 2,
    _id: 'mod-2',
    title: 'JavaScript Fundamentals',
    lessonsCount: 8,
    duration: '6h 15m',
    items: ['Variables & Data Types', 'Functions & Scope', 'Async/Await & Promises'],
  },
  {
    id: 3,
    _id: 'mod-3',
    title: 'React.js Development',
    lessonsCount: 10,
    duration: '8h 40m',
    items: ['JSX Syntax & Components', 'React State Architecture & Hooks', 'Routing & Data Fetching'],
  },
];
