import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/quizzes/quiz.repository.js', () => ({
  create: jest.fn(),
  findByLessonId: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/assignments/assignment.repository.js', () => ({
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findById: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/assignment_submissions/assignment_submission.repository.js', () => ({
  findById: jest.fn(),
  update: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/lessons/lesson.repository.js', () => ({
  findById: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/courses/course.repository.js', () => ({
  findById: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/course-modules/course_module.repository.js', () => ({
  findById: jest.fn()
}));

const quizRepo = await import('../../../src/modules/quizzes/quiz.repository.js');
const assignmentRepo = await import('../../../src/modules/assignments/assignment.repository.js');
const submissionRepo = await import('../../../src/modules/assignment_submissions/assignment_submission.repository.js');
const lessonRepo = await import('../../../src/modules/lessons/lesson.repository.js');
const courseRepo = await import('../../../src/modules/courses/course.repository.js');
const courseModuleRepo = await import('../../../src/modules/course-modules/course_module.repository.js');

const quizService = await import('../../../src/modules/quizzes/quiz.service.js');
const assignmentService = await import('../../../src/modules/assignments/assignment.service.js');
const submissionService = await import('../../../src/modules/assignment_submissions/assignment_submission.service.js');
const { NotFoundError, BadRequestError } = await import('../../../src/shared/errors/AppError.js');

describe('Assessment Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Quiz Service (Creation)', () => {
    it('should reject if lesson or course is missing', async () => {
      lessonRepo.findById.mockResolvedValue(null);
      await expect(quizService.createQuiz('lesson1', { title: 'Q1' }))
        .rejects.toThrow(NotFoundError);

      lessonRepo.findById.mockResolvedValue({ course_id: 'course1' });
      courseRepo.findById.mockResolvedValue(null);
      await expect(quizService.createQuiz('lesson1', { title: 'Q1' }))
        .rejects.toThrow(NotFoundError);
    });

    it('should reject a duplicate quiz for the same lesson', async () => {
      lessonRepo.findById.mockResolvedValue({ course_id: 'course1' });
      courseRepo.findById.mockResolvedValue({ _id: 'course1' });
      quizRepo.findByLessonId.mockResolvedValue({ _id: 'quiz1' });

      await expect(quizService.createQuiz('lesson1', { title: 'Q1' }))
        .rejects.toMatchObject({
          statusCode: 409,
          error: { code: 'CONFLICT' }
        });
    });

    it('should map a MongoDB 11000 duplicate-key race to 409 CONFLICT', async () => {
      lessonRepo.findById.mockResolvedValue({ course_id: 'course1' });
      courseRepo.findById.mockResolvedValue({ _id: 'course1' });
      quizRepo.findByLessonId.mockResolvedValue(null);
      
      const mongoError = new Error('Duplicate key');
      mongoError.code = 11000;
      quizRepo.create.mockRejectedValue(mongoError);

      await expect(quizService.createQuiz('lesson1', { title: 'Q1' }))
        .rejects.toMatchObject({
          statusCode: 409,
          error: { code: 'CONFLICT' }
        });
    });

    it('should derive course_id and lesson_id server-side and create', async () => {
      lessonRepo.findById.mockResolvedValue({ course_id: 'course1' });
      courseRepo.findById.mockResolvedValue({ _id: 'course1' });
      quizRepo.findByLessonId.mockResolvedValue(null);
      quizRepo.create.mockResolvedValue({ success: true });

      await quizService.createQuiz('lesson1', { title: 'Q1', course_id: 'hacked', lesson_id: 'hacked' });

      expect(quizRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Q1',
        lesson_id: 'lesson1',
        course_id: 'course1'
      }));
    });
  });

  describe('Assignment Service', () => {
    describe('createAssignment', () => {
      it('should ignore client-controlled course_id, created_by_id, and is_deleted', async () => {
        courseRepo.findById.mockResolvedValue({ _id: 'course1' });
        assignmentRepo.create.mockResolvedValue({ success: true });

        const payload = {
          title: 'A1',
          course_id: 'hackCourse',
          created_by_id: 'hackUser',
          is_deleted: true
        };

        await assignmentService.createAssignment('course1', payload, 'user1');

        expect(assignmentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
          title: 'A1',
          course_id: 'course1',
          created_by_id: 'user1',
          is_deleted: false
        }));
      });

      it('should reject cross-course module references', async () => {
        courseRepo.findById.mockResolvedValue({ _id: 'course1' });
        courseModuleRepo.findById.mockResolvedValue({ course_id: 'course2' });

        await expect(assignmentService.createAssignment('course1', { title: 'A1', module_id: 'mod1' }, 'user1'))
          .rejects.toThrow(BadRequestError);
      });
      
      it('should reject cross-course lesson references', async () => {
        courseRepo.findById.mockResolvedValue({ _id: 'course1' });
        lessonRepo.findById.mockResolvedValue({ course_id: 'course2' });

        await expect(assignmentService.createAssignment('course1', { title: 'A1', lesson_id: 'lesson1' }, 'user1'))
          .rejects.toThrow(BadRequestError);
      });

      it('should reject lesson/module mismatch when both belong to the course', async () => {
        courseRepo.findById.mockResolvedValue({ _id: 'course1' });
        courseModuleRepo.findById.mockResolvedValue({ _id: 'mod1', course_id: 'course1' });
        lessonRepo.findById.mockResolvedValue({ _id: 'lesson1', course_id: 'course1', module_id: 'mod2' });

        await expect(assignmentService.createAssignment('course1', { title: 'A1', module_id: 'mod1', lesson_id: 'lesson1' }, 'user1'))
          .rejects.toThrow(BadRequestError);
          
        expect(assignmentRepo.create).not.toHaveBeenCalled();
      });
    });

    describe('updateAssignment', () => {
      it('should update only allowlisted fields and reject cross-course references', async () => {
        assignmentRepo.findById.mockResolvedValue({ _id: 'a1', course_id: 'course1' });
        courseModuleRepo.findById.mockResolvedValue({ course_id: 'course2' });

        await expect(assignmentService.updateAssignment('a1', { module_id: 'mod1' }))
          .rejects.toThrow(BadRequestError);

        courseModuleRepo.findById.mockResolvedValue({ course_id: 'course1' });
        assignmentRepo.update.mockResolvedValue({ success: true });

        await assignmentService.updateAssignment('a1', {
          module_id: 'mod1',
          title: 'New Title',
          is_deleted: true,
          created_by_id: 'hacker'
        });

        const updateCall = assignmentRepo.update.mock.calls[0][1];
        expect(updateCall.title).toBe('New Title');
        expect(updateCall.module_id).toBe('mod1');
        expect(updateCall.is_deleted).toBeUndefined();
        expect(updateCall.created_by_id).toBeUndefined();
      });
    });

    describe('deleteAssignment', () => {
      it('should soft-delete through the repository', async () => {
        assignmentRepo.findById.mockResolvedValue({ _id: 'a1' });
        assignmentRepo.softDelete.mockResolvedValue({ success: true });
        
        await assignmentService.deleteAssignment('a1');
        
        expect(assignmentRepo.softDelete).toHaveBeenCalledWith('a1');
      });
    });

    describe('getAssignmentForStudent', () => {
      it('should reject with NotFoundError if assignment is missing', async () => {
        assignmentRepo.findById.mockResolvedValue(null);
        await expect(assignmentService.getAssignmentForStudent('a1'))
          .rejects.toThrow(NotFoundError);
        expect(assignmentRepo.findById).toHaveBeenCalledWith('a1');
      });

      it('should reject with NotFoundError if assignment is unpublished', async () => {
        assignmentRepo.findById.mockResolvedValue({ _id: 'a1', course_id: 'course1', is_published: false });
        await expect(assignmentService.getAssignmentForStudent('a1'))
          .rejects.toThrow(NotFoundError);
        expect(assignmentRepo.findById).toHaveBeenCalledWith('a1');
      });

      it('should resolve and return the assignment if published', async () => {
        const mockAssignment = { _id: 'a1', course_id: 'course1', is_published: true };
        assignmentRepo.findById.mockResolvedValue(mockAssignment);
        const result = await assignmentService.getAssignmentForStudent('a1');
        expect(result).toEqual(mockAssignment);
        expect(assignmentRepo.findById).toHaveBeenCalledWith('a1');
      });
    });
  });

  describe('Assignment Submission Service', () => {
    describe('gradeSubmission', () => {
      it('should reject a missing or mismatched submission', async () => {
        assignmentRepo.findById.mockResolvedValue({ _id: 'a1', max_score: 100 });
        submissionRepo.findById.mockResolvedValue(null);
        await expect(submissionService.gradeSubmission('a1', 'sub1', { score: 90 }, 'staff1'))
          .rejects.toThrow(NotFoundError);

        submissionRepo.findById.mockResolvedValue({ _id: 'sub1', assignment_id: 'a2' });
        await expect(submissionService.gradeSubmission('a1', 'sub1', { score: 90 }, 'staff1'))
          .rejects.toThrow(BadRequestError);
      });

      it('should reject non-numeric, negative, and over-maximum scores', async () => {
        assignmentRepo.findById.mockResolvedValue({ _id: 'a1', max_score: 50 });
        submissionRepo.findById.mockResolvedValue({ _id: 'sub1', assignment_id: 'a1' });

        await expect(submissionService.gradeSubmission('a1', 'sub1', { score: '90' }, 'staff1'))
          .rejects.toThrow(BadRequestError);
        await expect(submissionService.gradeSubmission('a1', 'sub1', { score: -10 }, 'staff1'))
          .rejects.toThrow(BadRequestError);
        await expect(submissionService.gradeSubmission('a1', 'sub1', { score: 60 }, 'staff1'))
          .rejects.toThrow(BadRequestError);
      });

      it('should accept score 0 and score equal to max_score, writing only server-controlled fields', async () => {
        assignmentRepo.findById.mockResolvedValue({ _id: 'a1', max_score: 50 });
        submissionRepo.findById.mockResolvedValue({ _id: 'sub1', assignment_id: 'a1' });

        await submissionService.gradeSubmission('a1', 'sub1', { score: 0, feedback: 'needs work', malicious: true }, 'staff1');
        const updateCall0 = submissionRepo.update.mock.calls[0][1];
        expect(updateCall0.score).toBe(0);
        expect(updateCall0.status).toBe('graded');
        expect(updateCall0.graded_by_id).toBe('staff1');
        expect(updateCall0.malicious).toBeUndefined();

        await submissionService.gradeSubmission('a1', 'sub1', { score: 50, feedback: 'perfect' }, 'staff1');
        const updateCall50 = submissionRepo.update.mock.calls[1][1];
        expect(updateCall50.score).toBe(50);
        expect(updateCall50.status).toBe('graded');
        expect(updateCall50.graded_by_id).toBe('staff1');
        expect(updateCall50.graded_at).toBeInstanceOf(Date);
      });
    });
  });
});
