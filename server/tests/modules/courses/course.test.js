import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/courses/course.repository.js', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn()
}));

const courseRepo = await import('../../../src/modules/courses/course.repository.js');
const courseService = await import('../../../src/modules/courses/course.service.js');
const { createCourseSchema } = await import('../../../src/modules/courses/course.validation.js');

describe('Course Entity Tests', () => {
  describe('Validation', () => {
    it('should validate a valid course creation payload', () => {
      const payload = {
        title: 'Introduction to JavaScript',
        category: 'academic',
        grade_level: 'ug',
        price: 199,
        is_free: false
      };
      const { error } = createCourseSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail validation if required fields are missing', () => {
      const payload = {
        title: 'Missing Category'
      };
      const { error } = createCourseSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('"category" is required');
    });
  });

  describe('Service Business Rules', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should generate a slug and create a course', async () => {
      const payload = { title: 'Test Course', category: 'skill' };
      const userId = '12345';
      
      courseRepo.create.mockResolvedValue({ _id: 'mock_id', ...payload, slug: 'test-course-abc', created_by_id: userId, is_published: false, is_deleted: false });
      
      const course = await courseService.createCourse(payload, userId);
      
      expect(courseRepo.create).toHaveBeenCalledTimes(1);
      const passedToRepo = courseRepo.create.mock.calls[0][0];
      
      expect(passedToRepo.slug).toMatch(/^test-course-[a-f0-9]{6}$/);
      expect(passedToRepo.created_by_id).toBe(userId);
      expect(passedToRepo.is_published).toBe(false);
      expect(course.title).toBe('Test Course');
    });

    it('should publish a course by flipping is_published to true', async () => {
      courseRepo.findById.mockResolvedValue({ _id: 'mock_id', is_published: false });
      courseRepo.update.mockResolvedValue({ _id: 'mock_id', is_published: true });
      
      const updatedCourse = await courseService.publishCourse('mock_id');
      
      expect(courseRepo.findById).toHaveBeenCalledWith('mock_id');
      expect(courseRepo.update).toHaveBeenCalledWith('mock_id', { is_published: true });
      expect(updatedCourse.is_published).toBe(true);
    });

    it('should soft delete a course', async () => {
      courseRepo.findById.mockResolvedValue({ _id: 'mock_id' });
      courseRepo.softDelete.mockResolvedValue({ _id: 'mock_id', is_deleted: true });
      
      const deletedCourse = await courseService.softDeleteCourse('mock_id');
      
      expect(courseRepo.findById).toHaveBeenCalledWith('mock_id');
      expect(courseRepo.softDelete).toHaveBeenCalledWith('mock_id');
      expect(deletedCourse.is_deleted).toBe(true);
    });
  });
});
