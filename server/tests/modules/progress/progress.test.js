import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/progress/progress.repository.js', () => ({
  upsert: jest.fn(),
  findByCourse: jest.fn(),
  countCompleted: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/lessons/lesson.repository.js', () => ({
  findById: jest.fn(),
  findAllByModuleId: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/courses/course.repository.js', () => ({
  findById: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/course-modules/course_module.repository.js', () => ({
  findAllByCourseId: jest.fn()
}));

const progressRepo = await import('../../../src/modules/progress/progress.repository.js');
const lessonRepo = await import('../../../src/modules/lessons/lesson.repository.js');
const courseRepo = await import('../../../src/modules/courses/course.repository.js');
const courseModuleRepo = await import('../../../src/modules/course-modules/course_module.repository.js');
const progressService = await import('../../../src/modules/progress/progress.service.js');
const { NotFoundError, BadRequestError } = await import('../../../src/shared/errors/AppError.js');

describe('Progress Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('completeLesson', () => {
    it('should reject if lesson is missing', async () => {
      lessonRepo.findById.mockResolvedValue(null);
      await expect(progressService.completeLesson('student1', 'lesson1'))
        .rejects.toThrow(NotFoundError);
    });

    it('should reject if lesson is not published', async () => {
      lessonRepo.findById.mockResolvedValue({ _id: 'lesson1', is_published: false });
      await expect(progressService.completeLesson('student1', 'lesson1'))
        .rejects.toThrow(NotFoundError);
    });

    it('should reject if course is missing', async () => {
      lessonRepo.findById.mockResolvedValue({ _id: 'lesson1', course_id: 'course1', is_published: true });
      courseRepo.findById.mockResolvedValue(null);
      await expect(progressService.completeLesson('student1', 'lesson1'))
        .rejects.toThrow(NotFoundError);
    });

    it('should successfully complete a lesson', async () => {
      lessonRepo.findById.mockResolvedValue({ _id: 'lesson1', course_id: 'course1', is_published: true });
      courseRepo.findById.mockResolvedValue({ _id: 'course1' });
      progressRepo.upsert.mockResolvedValue({ is_completed: true });

      const result = await progressService.completeLesson('student1', 'lesson1');
      expect(progressRepo.upsert).toHaveBeenCalledWith('student1', 'course1', 'lesson1', expect.objectContaining({
        is_completed: true,
        completed_at: expect.any(Date)
      }));
      expect(result.is_completed).toBe(true);
    });
  });

  describe('updatePosition', () => {
    beforeEach(() => {
      lessonRepo.findById.mockResolvedValue({ _id: 'lesson1', course_id: 'course1', is_published: true });
      courseRepo.findById.mockResolvedValue({ _id: 'course1' });
    });

    it('should reject malformed payload', async () => {
      await expect(progressService.updatePosition('student1', 'lesson1', null))
        .rejects.toThrow(BadRequestError);
      await expect(progressService.updatePosition('student1', 'lesson1', []))
        .rejects.toThrow(BadRequestError);
      await expect(progressService.updatePosition('student1', 'lesson1', 'string'))
        .rejects.toThrow(BadRequestError);
    });

    it('should reject invalid video_progress_percent', async () => {
      await expect(progressService.updatePosition('student1', 'lesson1', { video_progress_percent: 105 }))
        .rejects.toThrow(BadRequestError);
      await expect(progressService.updatePosition('student1', 'lesson1', { video_progress_percent: -5 }))
        .rejects.toThrow(BadRequestError);
      await expect(progressService.updatePosition('student1', 'lesson1', { video_progress_percent: '50' }))
        .rejects.toThrow(BadRequestError);
    });

    it('should accept only allowed fields and filter out malicious fields', async () => {
      const payload = {
        last_position_sec: 120,
        video_progress_percent: 50,
        time_spent_min: 2,
        malicious_field: 'hack'
      };

      progressRepo.upsert.mockResolvedValue({ success: true });

      await progressService.updatePosition('student1', 'lesson1', payload);

      const upsertArgs = progressRepo.upsert.mock.calls[0][3];
      expect(upsertArgs.last_position_sec).toBe(120);
      expect(upsertArgs.video_progress_percent).toBe(50);
      expect(upsertArgs.time_spent_min).toBe(2);
      expect(upsertArgs.malicious_field).toBeUndefined();
    });
  });

  describe('getCourseSummary', () => {
    it('should return overall totals and module-grouped lesson-progress records, including empty modules', async () => {
      courseRepo.findById.mockResolvedValue({ _id: 'course1', total_lessons: 10 });
      progressRepo.countCompleted.mockResolvedValue(2);
      
      const modules = [
        { _id: 'mod1' },
        { _id: 'mod2' }
      ];
      courseModuleRepo.findAllByCourseId.mockResolvedValue(modules);

      lessonRepo.findAllByModuleId.mockImplementation(async (moduleId) => {
        if (moduleId === 'mod1') return [{ _id: 'lesson1' }, { _id: 'lesson2' }];
        return [];
      });

      progressRepo.findByCourse.mockResolvedValue([
        { lesson_id: 'lesson1', is_completed: true },
        { lesson_id: 'lesson999', is_completed: true } // Orphaned or other module record
      ]);

      const summary = await progressService.getCourseSummary('student1', 'course1');

      expect(summary.course_id).toBe('course1');
      expect(summary.total_lessons).toBe(10);
      expect(summary.completed_lessons).toBe(2);
      expect(summary.modules).toHaveLength(2);

      // Mod 1 should have progress for lesson1
      expect(summary.modules[0].module_id).toBe('mod1');
      expect(summary.modules[0].lesson_progress).toHaveLength(1);
      expect(summary.modules[0].lesson_progress[0].lesson_id).toBe('lesson1');

      // Mod 2 should be completely empty
      expect(summary.modules[1].module_id).toBe('mod2');
      expect(summary.modules[1].lesson_progress).toHaveLength(0);
    });
  });
});
