import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/enrollments/enrollment.repository.js', () => ({
  findByStudentAndCourse: jest.fn(),
  findActiveByStudentAndCourse: jest.fn(),
  findAllActiveByStudent: jest.fn(),
  create: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/courses/course.repository.js', () => ({
  findById: jest.fn()
}));

const enrollmentRepo = await import('../../../src/modules/enrollments/enrollment.repository.js');
const courseRepo = await import('../../../src/modules/courses/course.repository.js');
const enrollmentService = await import('../../../src/modules/enrollments/enrollment.service.js');
const { AppError, NotFoundError } = await import('../../../src/shared/errors/index.js');

describe('Enrollment Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enrollInFreeCourse', () => {
    it('1. Missing or unpublished course → NotFoundError', async () => {
      courseRepo.findById.mockResolvedValue(null);
      await expect(enrollmentService.enrollInFreeCourse('student1', 'course1')).rejects.toThrow(NotFoundError);

      courseRepo.findById.mockResolvedValue({ is_published: false });
      await expect(enrollmentService.enrollInFreeCourse('student1', 'course1')).rejects.toThrow(NotFoundError);
    });

    it('2. Paid course → error status 422 and code PAYMENT_REQUIRED; verify create is not called', async () => {
      courseRepo.findById.mockResolvedValue({ is_published: true, is_free: false });
      
      const promise = enrollmentService.enrollInFreeCourse('student1', 'course1');
      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toMatchObject({ statusCode: 422, error: { code: 'PAYMENT_REQUIRED' } });
      
      expect(enrollmentRepo.create).not.toHaveBeenCalled();
    });

    it('3. Existing enrollment → error status 409 and code ENROLLMENT_ALREADY_EXISTS; verify create is not called', async () => {
      courseRepo.findById.mockResolvedValue({ is_published: true, is_free: true });
      enrollmentRepo.findByStudentAndCourse.mockResolvedValue({ _id: 'enrollment1' });
      
      const promise = enrollmentService.enrollInFreeCourse('student1', 'course1');
      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toMatchObject({ statusCode: 409, error: { code: 'ENROLLMENT_ALREADY_EXISTS' } });
      
      expect(enrollmentRepo.create).not.toHaveBeenCalled();
    });

    it('4. Free lifetime course (validity_days: null) → creates server-controlled enrollment data', async () => {
      courseRepo.findById.mockResolvedValue({ is_published: true, is_free: true, validity_days: null });
      enrollmentRepo.findByStudentAndCourse.mockResolvedValue(null);
      enrollmentRepo.create.mockResolvedValue({ _id: 'enrollment1' });

      await enrollmentService.enrollInFreeCourse('student1', 'course1');
      
      expect(enrollmentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        student_id: 'student1',
        course_id: 'course1',
        payment_id: null,
        is_active: true,
        completion_status: 'in_progress',
        expires_at: null,
        enrolled_at: expect.any(Date)
      }));
    });

    it('5. Finite validity_days → creates an expiry after enrollment time, including 0', async () => {
      // Test with 30 days
      courseRepo.findById.mockResolvedValueOnce({ is_published: true, is_free: true, validity_days: 30 });
      enrollmentRepo.findByStudentAndCourse.mockResolvedValueOnce(null);
      
      await enrollmentService.enrollInFreeCourse('student1', 'course30');
      
      const args30 = enrollmentRepo.create.mock.calls[0][0];
      expect(args30.expires_at).toBeInstanceOf(Date);
      expect(args30.expires_at.getTime()).toBeGreaterThan(args30.enrolled_at.getTime());

      // Test with 0 days
      jest.clearAllMocks();
      courseRepo.findById.mockResolvedValueOnce({ is_published: true, is_free: true, validity_days: 0 });
      enrollmentRepo.findByStudentAndCourse.mockResolvedValueOnce(null);
      
      await enrollmentService.enrollInFreeCourse('student1', 'course0');
      
      const args0 = enrollmentRepo.create.mock.calls[0][0];
      expect(args0.expires_at).toBeInstanceOf(Date);
      expect(args0.expires_at.getTime()).toBe(args0.enrolled_at.getTime());
    });

    it('6. Mongo duplicate-key error (code === 11000) during create → same 409 ENROLLMENT_ALREADY_EXISTS', async () => {
      courseRepo.findById.mockResolvedValue({ is_published: true, is_free: true });
      enrollmentRepo.findByStudentAndCourse.mockResolvedValue(null);
      
      const mongoError = new Error('Duplicate key');
      mongoError.code = 11000;
      enrollmentRepo.create.mockRejectedValue(mongoError);

      const promise = enrollmentService.enrollInFreeCourse('student1', 'course1');
      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toMatchObject({ statusCode: 409, error: { code: 'ENROLLMENT_ALREADY_EXISTS' } });
    });
  });

  describe('getMyEnrollment', () => {
    it('7. Missing active enrollment → ENROLLMENT_NOT_FOUND, Expired → ENROLLMENT_EXPIRED', async () => {
      // Missing
      enrollmentRepo.findActiveByStudentAndCourse.mockResolvedValueOnce(null);
      let promise = enrollmentService.getMyEnrollment('student1', 'course1');
      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toMatchObject({ statusCode: 404, error: { code: 'ENROLLMENT_NOT_FOUND' } });

      // Expired
      const pastDate = new Date(Date.now() - 10000);
      enrollmentRepo.findActiveByStudentAndCourse.mockResolvedValueOnce({ expires_at: pastDate });
      promise = enrollmentService.getMyEnrollment('student1', 'course1');
      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toMatchObject({ statusCode: 403, error: { code: 'ENROLLMENT_EXPIRED' } });
      
      // Valid (not missing, not expired)
      const futureDate = new Date(Date.now() + 10000);
      enrollmentRepo.findActiveByStudentAndCourse.mockResolvedValueOnce({ expires_at: futureDate });
      await expect(enrollmentService.getMyEnrollment('student1', 'course1')).resolves.toMatchObject({ expires_at: futureDate });
    });
  });

  describe('getMyEnrollments', () => {
    it('8. getMyEnrollments excludes expired records but retains lifetime and future-expiry records', async () => {
      const pastDate = new Date(Date.now() - 10000);
      const futureDate = new Date(Date.now() + 10000);
      
      const activeEnrollments = [
        { _id: 'lifetime', expires_at: null },
        { _id: 'future', expires_at: futureDate },
        { _id: 'expired', expires_at: pastDate }
      ];

      enrollmentRepo.findAllActiveByStudent.mockResolvedValue(activeEnrollments);
      
      const result = await enrollmentService.getMyEnrollments('student1');
      
      expect(result).toHaveLength(2);
      expect(result.map(e => e._id)).toEqual(['lifetime', 'future']);
      expect(result.map(e => e._id)).not.toContain('expired');
    });
  });
});
