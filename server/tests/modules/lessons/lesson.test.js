import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/lessons/lesson.repository.js', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAllByModuleId: jest.fn(),
  findMaxOrder: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/course-modules/course_module.repository.js', () => ({
  findById: jest.fn()
}));

jest.unstable_mockModule('../../../src/config/cloudinary.js', () => ({
  default: {
    url: jest.fn()
  }
}));

const lessonRepo = await import('../../../src/modules/lessons/lesson.repository.js');
const courseModuleRepo = await import('../../../src/modules/course-modules/course_module.repository.js');
const cloudinary = (await import('../../../src/config/cloudinary.js')).default;
const lessonService = await import('../../../src/modules/lessons/lesson.service.js');
const lessonController = await import('../../../src/modules/lessons/lesson.controller.js');
const { 
  createLessonSchema, 
  updateLessonSchema 
} = await import('../../../src/modules/lessons/lesson.validation.js');

describe('Lesson Entity Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should validate a valid lesson creation payload', () => {
      const payload = {
        title: 'Lesson 1: Introduction to Node.js',
        lesson_type: 'video',
        content_public_id: 'amaanitvam/lessons/vid_01',
        duration_min: 15,
        is_preview: true,
        is_published: true
      };
      const { error } = createLessonSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail validation if required title is missing', () => {
      const payload = {
        lesson_type: 'text',
        content_text: 'Welcome to the lesson!'
      };
      const { error } = createLessonSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('"title" is required');
    });

    it('should validate a valid lesson update payload', () => {
      const payload = { title: 'Updated Lesson Title', duration_min: 20 };
      const { error } = updateLessonSchema.validate(payload);
      expect(error).toBeUndefined();
    });
  });

  describe('Service Business Rules', () => {
    const courseId = 'course_123';
    const moduleId = 'mod_123';
    const lessonId = 'lesson_123';

    it('should create a lesson and auto-assign next order when order is omitted (Approved Decision 1)', async () => {
      courseModuleRepo.findById.mockResolvedValue({ _id: moduleId, course_id: courseId });
      lessonRepo.findMaxOrder.mockResolvedValue(4);
      lessonRepo.create.mockResolvedValue({ 
        _id: lessonId, 
        title: 'New Lesson', 
        course_id: courseId, 
        module_id: moduleId, 
        order: 5, 
        is_deleted: false 
      });

      const result = await lessonService.createLesson(courseId, moduleId, { title: 'New Lesson' });

      expect(courseModuleRepo.findById).toHaveBeenCalledWith(moduleId, courseId);
      expect(lessonRepo.findMaxOrder).toHaveBeenCalledWith(moduleId);
      expect(lessonRepo.create).toHaveBeenCalledWith({
        title: 'New Lesson',
        course_id: courseId,
        module_id: moduleId,
        order: 5,
        is_deleted: false
      });
      expect(result.order).toBe(5);
    });

    it('should throw Module not found error when creating lesson for non-existent module', async () => {
      courseModuleRepo.findById.mockResolvedValue(null);

      await expect(lessonService.createLesson(courseId, moduleId, { title: 'New Lesson' }))
        .rejects
        .toThrow('Module not found');
    });

    it('should throw Lesson not found error when updating non-existent lesson', async () => {
      lessonRepo.update.mockResolvedValue(null);

      await expect(lessonService.updateLesson('invalid_lesson', { title: 'Updated' }))
        .rejects
        .toThrow('Lesson not found');
    });

    it('should throw Lesson not found error when soft deleting non-existent lesson', async () => {
      lessonRepo.softDelete.mockResolvedValue(null);

      await expect(lessonService.softDeleteLesson('invalid_lesson'))
        .rejects
        .toThrow('Lesson not found');
    });

    it('should return text content when lesson_type is text (Approved Decision 4)', async () => {
      lessonRepo.findById.mockResolvedValue({
        _id: lessonId,
        lesson_type: 'text',
        content_text: 'Here is the lesson text notes.',
        is_preview: true
      });

      const result = await lessonService.getLessonContent(lessonId, { id: 'user_1' });

      expect(result).toEqual({
        lesson_type: 'text',
        content_text: 'Here is the lesson text notes.'
      });
    });

    it('should return signed Cloudinary URL when lesson_type is video or pdf (Approved Decision 4)', async () => {
      const mockSignedUrl = 'https://res.cloudinary.com/demo/video/upload/v1234/sample.mp4?signature=abc&expires=9999999999';
      lessonRepo.findById.mockResolvedValue({
        _id: lessonId,
        lesson_type: 'video',
        content_public_id: 'amaanitvam/lessons/vid_01',
        is_preview: true
      });
      cloudinary.url.mockReturnValue(mockSignedUrl);

      const result = await lessonService.getLessonContent(lessonId, { id: 'user_1' });

      expect(cloudinary.url).toHaveBeenCalledWith('amaanitvam/lessons/vid_01', expect.objectContaining({
        sign_url: true
      }));
      expect(result).toEqual({
        lesson_type: 'video',
        content_url: mockSignedUrl
      });
    });

    it('should throw error when media content identifier is missing for video/pdf lesson', async () => {
      lessonRepo.findById.mockResolvedValue({
        _id: lessonId,
        lesson_type: 'pdf',
        content_public_id: null,
        is_preview: false
      });

      await expect(lessonService.getLessonContent(lessonId, { id: 'user_1' }))
        .rejects
        .toThrow('Media content identifier is missing');
    });
  });

  describe('Controller Responses', () => {
    let req, res, next;

    beforeEach(() => {
      req = { params: {}, body: {}, query: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    it('should return 201 on lesson creation success', async () => {
      req.params = { courseId: 'c1', moduleId: 'm1' };
      req.body = { title: 'Test Lesson', lesson_type: 'text' };

      courseModuleRepo.findById.mockResolvedValue({ _id: 'm1', course_id: 'c1' });
      lessonRepo.findMaxOrder.mockResolvedValue(0);
      lessonRepo.create.mockResolvedValue({ _id: 'l1', title: 'Test Lesson' });

      await lessonController.createLesson(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ _id: 'l1' })
      });
    });

    it('should return 400 on controller validation error', async () => {
      req.body = {}; // missing required title

      await lessonController.createLesson(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input provided.',
          details: expect.any(Array)
        }
      });
    });
  });
});
