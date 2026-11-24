import { jest } from '@jest/globals';
import request from 'supertest';
import { UnauthorizedError, ForbiddenError } from '../src/shared/errors/AppError.js';

// Variables to control mock behavior
let mockUser = null; 

jest.unstable_mockModule('../src/middleware/authenticate.js', () => ({
  authenticate: (req, res, next) => {
    if (!mockUser) {
      return next(new UnauthorizedError('Not authenticated', 'USER_UNAUTHORIZED'));
    }
    req.user = mockUser;
    next();
  }
}));

jest.unstable_mockModule('../src/middleware/authorize.js', () => ({
  authorizeStrict: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return next(new ForbiddenError('Not authenticated', 'USER_UNAUTHORIZED'));
      }
      const userRole = req.user.role;
      if (!userRole) {
        return next(new ForbiddenError('Role not assigned', 'USER_UNAUTHORIZED'));
      }
      if (!roles.includes(userRole)) {
        return next(new ForbiddenError(`Role ${userRole} is not authorized to access this resource`, 'USER_UNAUTHORIZED'));
      }
      next();
    };
  },
  authorize: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return next(new ForbiddenError('Not authenticated', 'USER_UNAUTHORIZED'));
      }
      const userRole = req.user.role;
      if (!userRole) {
        return next(new ForbiddenError('Role not assigned', 'USER_UNAUTHORIZED'));
      }
      if (userRole === "super_admin") {
        return next();
      }
      if (!roles.includes(userRole)) {
        return next(new ForbiddenError(`Role ${userRole} is not authorized to access this resource`, 'USER_UNAUTHORIZED'));
      }
      next();
    };
  }
}));

jest.unstable_mockModule('../src/middleware/requireEnrollment.js', () => ({
  requireEnrollment: (req, res, next) => next()
}));

// Mock LMS controllers used by routes
const mockControllerAction = (req, res) => res.status(200).json({ success: true, mocked: true });

jest.unstable_mockModule('../src/modules/assignments/assignment.controller.js', () => ({
  getAssignmentsByCourse: mockControllerAction,
  createAssignment: mockControllerAction,
  getAssignmentById: mockControllerAction,
  updateAssignment: mockControllerAction,
  deleteAssignment: mockControllerAction,
  getAssignmentForStudent: mockControllerAction,
}));

jest.unstable_mockModule('../src/modules/quizzes/quiz.controller.js', () => ({
  createQuiz: mockControllerAction,
  updateQuiz: mockControllerAction,
  getQuizForLessonForStudent: mockControllerAction,
}));

jest.unstable_mockModule('../src/modules/progress/progress.controller.js', () => ({
  completeLesson: mockControllerAction,
  updatePosition: mockControllerAction,
  getCourseSummary: mockControllerAction,
}));

jest.unstable_mockModule('../src/modules/assignment_submissions/assignment_submission.controller.js', () => ({
  getSubmissionsByAssignment: mockControllerAction,
  gradeSubmission: mockControllerAction,
  submitAssignment: mockControllerAction,
}));

jest.unstable_mockModule('../src/modules/quiz-attempts/quiz_attempt.controller.js', () => ({
  submitAttempt: mockControllerAction,
  getMyAttempts: mockControllerAction,
}));

const appModule = await import('../src/app.js');
const app = appModule.default;

describe('App Smoke Test', () => {
  beforeEach(() => {
    mockUser = null;
  });

  it('should boot successfully and return 404 for unknown route', async () => {
    const res = await request(app).get('/api/unknown-route-smoke-test');
    expect(res.statusCode).toBe(404);
  });

  it('should respond to public settings endpoint', async () => {
    const res = await request(app).get('/api/public/settings');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('LMS 401/403 Strict Authorization Boundaries', () => {
  beforeEach(() => {
    mockUser = null;
  });

  const facultyRoute = '/api/courses/course123/assignments';
  const studentRoute = '/api/assignments/assign123/student';

  it('should return 401 for unauthenticated request to protected LMS routes', async () => {
    const resFaculty = await request(app).get(facultyRoute);
    expect(resFaculty.statusCode).toBe(401);

    const resStudent = await request(app).get(studentRoute);
    expect(resStudent.statusCode).toBe(401);
  });

  it('should return 403 when a student accesses a faculty-only route', async () => {
    mockUser = { id: 'u1', role: 'student' };
    const res = await request(app).get(facultyRoute);
    expect(res.statusCode).toBe(403);
  });

  it('should return 403 when an admin (or super_admin) accesses a strict student route', async () => {
    mockUser = { id: 'u1', role: 'admin' };
    const resAdmin = await request(app).get(studentRoute);
    expect(resAdmin.statusCode).toBe(403);

    mockUser = { id: 'u2', role: 'super_admin' };
    const resSuperAdmin = await request(app).get(studentRoute);
    expect(resSuperAdmin.statusCode).toBe(403);
  });

  it('should return 200 when a faculty accesses a faculty route', async () => {
    mockUser = { id: 'u1', role: 'faculty' };
    const res = await request(app).get(facultyRoute);
    expect(res.statusCode).toBe(200);
  });

  it('should return 200 when a student accesses a student route', async () => {
    mockUser = { id: 'u1', role: 'student' };
    const res = await request(app).get(studentRoute);
    expect(res.statusCode).toBe(200);
  });
});
