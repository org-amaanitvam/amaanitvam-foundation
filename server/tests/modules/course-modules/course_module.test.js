import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/course-modules/course_module.repository.js', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAllByCourseId: jest.fn(),
  findMaxOrder: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/courses/course.repository.js', () => ({
  findById: jest.fn()
}));

const courseModuleRepo = await import('../../../src/modules/course-modules/course_module.repository.js');
const courseRepo = await import('../../../src/modules/courses/course.repository.js');
const courseModuleService = await import('../../../src/modules/course-modules/course_module.service.js');
const courseModuleController = await import('../../../src/modules/course-modules/course_module.controller.js');
const { 
  createCourseModuleSchema, 
  updateCourseModuleSchema, 
  reorderModulesSchema 
} = await import('../../../src/modules/course-modules/course_module.validation.js');

describe('Course Module Entity Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should validate a valid module creation payload', () => {
      const payload = {
        title: 'Module 1: Getting Started',
        description: 'Basic introduction'
      };
      const { error } = createCourseModuleSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail validation if required title is missing', () => {
      const payload = {
        description: 'Missing title'
      };
      const { error } = createCourseModuleSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('"title" is required');
    });

    it('should validate valid reorder payload', () => {
      const payload = {
        moduleIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
      };
      const { error } = reorderModulesSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should validate a valid module update payload', () => {
      const payload = { title: 'Updated Title' };
      const { error } = updateCourseModuleSchema.validate(payload);
      expect(error).toBeUndefined();
    });
  });

  describe('Service Business Rules', () => {
    const courseId = 'course_123';
    const userId = 'user_123';

    it('should create a module and auto-assign next order', async () => {
      courseRepo.findById.mockResolvedValue({ _id: courseId });
      courseModuleRepo.findMaxOrder.mockResolvedValue(2);
      courseModuleRepo.create.mockResolvedValue({ 
        _id: 'mod_1', 
        title: 'New Module', 
        course_id: courseId, 
        order: 3, 
        created_by_id: userId, 
        is_deleted: false 
      });

      const result = await courseModuleService.createModule(courseId, { title: 'New Module' }, userId);

      expect(courseRepo.findById).toHaveBeenCalledWith(courseId);
      expect(courseModuleRepo.findMaxOrder).toHaveBeenCalledWith(courseId);
      expect(courseModuleRepo.create).toHaveBeenCalledWith({
        title: 'New Module',
        course_id: courseId,
        order: 3,
        created_by_id: userId,
        is_deleted: false
      });
      expect(result.order).toBe(3);
    });

    it('should throw Course not found error when creating module for non-existent course', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(courseModuleService.createModule(courseId, { title: 'New Module' }, userId))
        .rejects
        .toThrow('Course not found');
    });

    it('should throw Module not found error when updating non-existent module', async () => {
      courseModuleRepo.update.mockResolvedValue(null);

      await expect(courseModuleService.updateModule('invalid_mod', courseId, { title: 'Updated' }))
        .rejects
        .toThrow('Module not found');
    });

    it('should throw Module not found error when soft deleting non-existent module', async () => {
      courseModuleRepo.softDelete.mockResolvedValue(null);

      await expect(courseModuleService.softDeleteModule('invalid_mod', courseId))
        .rejects
        .toThrow('Module not found');
    });

    it('should reorder modules successfully', async () => {
      const mod1Id = '507f1f77bcf86cd799439011';
      const mod2Id = '507f1f77bcf86cd799439012';

      courseRepo.findById.mockResolvedValue({ _id: courseId });
      courseModuleRepo.findAllByCourseId.mockResolvedValue([
        { _id: mod1Id, order: 1 },
        { _id: mod2Id, order: 2 }
      ]);
      courseModuleRepo.update.mockResolvedValue({});

      const result = await courseModuleService.reorderModules(courseId, [mod2Id, mod1Id]);

      expect(result).toBe(true);
      expect(courseModuleRepo.update).toHaveBeenCalledWith(mod2Id, { order: 1 }, courseId);
      expect(courseModuleRepo.update).toHaveBeenCalledWith(mod1Id, { order: 2 }, courseId);
    });

    it('should fail reorder when a module ID is missing from payload', async () => {
      const mod1Id = '507f1f77bcf86cd799439011';
      const mod2Id = '507f1f77bcf86cd799439012';

      courseRepo.findById.mockResolvedValue({ _id: courseId });
      courseModuleRepo.findAllByCourseId.mockResolvedValue([
        { _id: mod1Id },
        { _id: mod2Id }
      ]);

      await expect(courseModuleService.reorderModules(courseId, [mod1Id]))
        .rejects
        .toThrow('All existing module IDs must be provided exactly once.');
    });

    it('should fail reorder when duplicate module IDs are provided', async () => {
      const mod1Id = '507f1f77bcf86cd799439011';
      const mod2Id = '507f1f77bcf86cd799439012';

      courseRepo.findById.mockResolvedValue({ _id: courseId });
      courseModuleRepo.findAllByCourseId.mockResolvedValue([
        { _id: mod1Id },
        { _id: mod2Id }
      ]);

      await expect(courseModuleService.reorderModules(courseId, [mod1Id, mod1Id]))
        .rejects
        .toThrow('All existing module IDs must be provided exactly once.');
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

    it('should return 201 on module creation success', async () => {
      req.params = { courseId: 'c1' };
      req.body = { title: 'Test Module' };

      courseRepo.findById.mockResolvedValue({ _id: 'c1' });
      courseModuleRepo.findMaxOrder.mockResolvedValue(0);
      courseModuleRepo.create.mockResolvedValue({ _id: 'm1', title: 'Test Module' });

      await courseModuleController.createModule(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ _id: 'm1' })
      });
    });

    it('should return 400 on controller validation error', async () => {
      req.body = {}; // missing required title

      await courseModuleController.createModule(req, res, next);

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
