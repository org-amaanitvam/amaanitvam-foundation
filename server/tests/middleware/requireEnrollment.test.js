import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/modules/lessons/lesson.repository.js', () => ({
  findById: jest.fn()
}));

jest.unstable_mockModule('../../src/modules/quizzes/quiz.repository.js', () => ({
  findById: jest.fn()
}));

jest.unstable_mockModule('../../src/modules/assignments/assignment.repository.js', () => ({
  findById: jest.fn()
}));

jest.unstable_mockModule('../../src/modules/enrollments/enrollment.service.js', () => ({
  getMyEnrollment: jest.fn()
}));

const lessonRepo = await import('../../src/modules/lessons/lesson.repository.js');
const quizRepo = await import('../../src/modules/quizzes/quiz.repository.js');
const assignmentRepo = await import('../../src/modules/assignments/assignment.repository.js');
const enrollmentService = await import('../../src/modules/enrollments/enrollment.service.js');
const { requireEnrollment } = await import('../../src/middleware/requireEnrollment.js');
const { NotFoundError } = await import('../../src/shared/errors/AppError.js');

/**
 * Helper: builds a minimal Express-style { req, res, next } triple.
 */
const buildReqResNext = (params = {}, body = {}, query = {}) => {
  const req = {
    params,
    body,
    query,
    user: { id: 'student_abc' }
  };
  const res = {};
  const next = jest.fn();
  return { req, res, next };
};

describe('requireEnrollment Middleware Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Direct courseId resolution ──────────────────────────────
  it('1. Resolves course directly from req.params.courseId', async () => {
    enrollmentService.getMyEnrollment.mockResolvedValue({ _id: 'enr1' });

    const { req, res, next } = buildReqResNext({ courseId: 'course_123' });
    await requireEnrollment(req, res, next);

    expect(enrollmentService.getMyEnrollment).toHaveBeenCalledWith('student_abc', 'course_123');
    expect(next).toHaveBeenCalledWith();
    // No repository lookups needed for direct courseId
    expect(lessonRepo.findById).not.toHaveBeenCalled();
    expect(quizRepo.findById).not.toHaveBeenCalled();
    expect(assignmentRepo.findById).not.toHaveBeenCalled();
  });

  // ── 2. Course resolution through lessonId ─────────────────────
  it('2. Resolves course through lessonId → lesson.course_id', async () => {
    lessonRepo.findById.mockResolvedValue({ _id: 'lesson_1', course_id: 'course_from_lesson' });
    enrollmentService.getMyEnrollment.mockResolvedValue({ _id: 'enr2' });

    const { req, res, next } = buildReqResNext({ lessonId: 'lesson_1' });
    await requireEnrollment(req, res, next);

    expect(lessonRepo.findById).toHaveBeenCalledWith('lesson_1');
    expect(enrollmentService.getMyEnrollment).toHaveBeenCalledWith('student_abc', 'course_from_lesson');
    expect(next).toHaveBeenCalledWith();
  });

  // ── 3. Course resolution through quizId ───────────────────────
  it('3. Resolves course through quizId → quiz.course_id', async () => {
    quizRepo.findById.mockResolvedValue({ _id: 'quiz_1', course_id: 'course_from_quiz' });
    enrollmentService.getMyEnrollment.mockResolvedValue({ _id: 'enr3' });

    const { req, res, next } = buildReqResNext({ quizId: 'quiz_1' });
    await requireEnrollment(req, res, next);

    expect(quizRepo.findById).toHaveBeenCalledWith('quiz_1');
    expect(enrollmentService.getMyEnrollment).toHaveBeenCalledWith('student_abc', 'course_from_quiz');
    expect(next).toHaveBeenCalledWith();
  });

  // ── 4. Course resolution through assignmentId ─────────────────
  it('4. Resolves course through assignmentId → assignment.course_id', async () => {
    assignmentRepo.findById.mockResolvedValue({ _id: 'asgn_1', course_id: 'course_from_assignment' });
    enrollmentService.getMyEnrollment.mockResolvedValue({ _id: 'enr4' });

    const { req, res, next } = buildReqResNext({ assignmentId: 'asgn_1' });
    await requireEnrollment(req, res, next);

    expect(assignmentRepo.findById).toHaveBeenCalledWith('asgn_1');
    expect(enrollmentService.getMyEnrollment).toHaveBeenCalledWith('student_abc', 'course_from_assignment');
    expect(next).toHaveBeenCalledWith();
  });

  // ── 5. Missing referenced resource forwards NotFoundError ─────
  it('5. Forwards NotFoundError when lesson does not exist', async () => {
    lessonRepo.findById.mockResolvedValue(null);

    const { req, res, next } = buildReqResNext({ lessonId: 'missing_lesson' });
    await requireEnrollment(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toMatch(/lesson/i);
  });

  it('5b. Forwards NotFoundError when quiz does not exist', async () => {
    quizRepo.findById.mockResolvedValue(null);

    const { req, res, next } = buildReqResNext({ quizId: 'missing_quiz' });
    await requireEnrollment(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toMatch(/quiz/i);
  });

  it('5c. Forwards NotFoundError when assignment does not exist', async () => {
    assignmentRepo.findById.mockResolvedValue(null);

    const { req, res, next } = buildReqResNext({ assignmentId: 'missing_asgn' });
    await requireEnrollment(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toMatch(/assignment/i);
  });

  // ── 6. No supported route parameter forwards NotFoundError ────
  it('6. Forwards NotFoundError when no supported param is present', async () => {
    const { req, res, next } = buildReqResNext({ someOtherId: 'xyz' });
    await requireEnrollment(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(NotFoundError);
  });

  // ── 7. Active enrollment calls next() with req.user.id ────────
  it('7. Calls next() without arguments when enrollment is active', async () => {
    enrollmentService.getMyEnrollment.mockResolvedValue({ _id: 'enr_valid' });

    const { req, res, next } = buildReqResNext({ courseId: 'course_xyz' });
    await requireEnrollment(req, res, next);

    // next() called with zero arguments = success
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    // Confirms req.user.id was forwarded
    expect(enrollmentService.getMyEnrollment).toHaveBeenCalledWith('student_abc', 'course_xyz');
  });

  // ── 8. Enrollment-service rejection forwarded to next(error) ──
  it('8. Forwards enrollment-service rejection to next(error)', async () => {
    const serviceError = new NotFoundError('Active enrollment not found');
    enrollmentService.getMyEnrollment.mockRejectedValue(serviceError);

    const { req, res, next } = buildReqResNext({ courseId: 'course_no_enroll' });
    await requireEnrollment(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(serviceError);
  });

  // ── 9. Request body and query values are ignored ──────────────
  it('9. Ignores courseId in body and query; uses only params', async () => {
    // courseId exists only in body and query, not in params
    const { req, res, next } = buildReqResNext(
      {},                             // params — no courseId
      { courseId: 'body_course' },    // body
      { courseId: 'query_course' }    // query
    );
    await requireEnrollment(req, res, next);

    // Should NOT have called enrollment service with body/query courseId
    expect(enrollmentService.getMyEnrollment).not.toHaveBeenCalled();
    // Should forward a NotFoundError (no param resolved)
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(NotFoundError);
  });
});
