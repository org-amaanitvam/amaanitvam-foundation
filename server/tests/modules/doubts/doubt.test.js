import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/doubts/doubt.model.js', () => ({
  default: {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
  },
}));

jest.unstable_mockModule('../../../src/modules/doubts/doubtResponse.model.js', () => ({
  default: {
    find: jest.fn().mockReturnThis(),
    create: jest.fn(),
    sort: jest.fn().mockResolvedValue([]),
    populate: jest.fn().mockReturnThis(),
  },
}));

jest.unstable_mockModule('../../../src/modules/doubts/doubtRating.model.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.unstable_mockModule('../../../src/modules/notifications/notification.service.js', () => ({
  notifyUser: jest.fn().mockResolvedValue({}),
}));

const Doubt = (await import('../../../src/modules/doubts/doubt.model.js')).default;
const DoubtResponse = (await import('../../../src/modules/doubts/doubtResponse.model.js')).default;
const DoubtRating = (await import('../../../src/modules/doubts/doubtRating.model.js')).default;
const { createSchema, respondSchema, resolveSchema, rateSchema, assignSchema } = await import('../../../src/modules/doubts/doubt.validation.js');

describe('Doubts Module', () => {
  describe('Validation', () => {
    it('should validate a valid doubt creation payload', () => {
      const payload = {
        title: 'How to solve this math problem?',
        description: 'I am stuck on question 5',
        subject: 'Mathematics',
        topic: 'Algebra',
        grade: 'grade_10',
        priority: 'high',
      };
      const { error } = createSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail if title is too short', () => {
      const payload = {
        title: 'Hi',
        description: 'Help',
      };
      const { error } = createSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('title');
    });

    it('should validate a valid respond payload', () => {
      const payload = {
        message: 'Here is the step-by-step solution...',
        mark_as_solution: true,
      };
      const { error } = respondSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail respond if message is missing', () => {
      const payload = {};
      const { error } = respondSchema.validate(payload);
      expect(error).toBeDefined();
    });

    it('should validate a valid rating payload', () => {
      const payload = { rating: 5, feedback: 'Great explanation!' };
      const { error } = rateSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail rating if rating is out of range', () => {
      const payload = { rating: 6 };
      const { error } = rateSchema.validate(payload);
      expect(error).toBeDefined();
    });

    it('should fail rating if rating is below minimum', () => {
      const payload = { rating: 0 };
      const { error } = rateSchema.validate(payload);
      expect(error).toBeDefined();
    });

    it('should validate a valid assign payload', () => {
      const payload = { faculty_id: '507f1f77bcf86cd799439011' };
      const { error } = assignSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail assign if faculty_id is missing', () => {
      const payload = {};
      const { error } = assignSchema.validate(payload);
      expect(error).toBeDefined();
    });
  });

  describe('Doubt Status Workflow', () => {
    it('should create a doubt with default open status', async () => {
      const mockDoubt = {
        _id: 'doubt123',
        title: 'Test Doubt',
        status: 'open',
        student_id: 'student123',
      };
      Doubt.create.mockResolvedValue(mockDoubt);

      const doubtService = await import('../../../src/modules/doubts/doubt.service.js');
      const result = await doubtService.createDoubt({ title: 'Test Doubt', student_id: 'student123' });

      expect(Doubt.create).toHaveBeenCalled();
    });

    it('should resolve a doubt with resolved status', async () => {
      const mockResolved = {
        _id: 'doubt123',
        status: 'resolved',
        resolved_by: 'user456',
      };
      Doubt.findByIdAndUpdate.mockResolvedValue(mockResolved);

      const doubtService = await import('../../../src/modules/doubts/doubt.service.js');
      const result = await doubtService.resolveDoubt('doubt123', 'user456');

      expect(Doubt.findByIdAndUpdate).toHaveBeenCalledWith(
        'doubt123',
        expect.objectContaining({ status: 'resolved', resolved_by: 'user456' }),
        { new: true }
      );
      expect(result.status).toBe('resolved');
      expect(result.resolved_by).toBe('user456');
    });

    it('should reopen a resolved doubt with reopened status', async () => {
      const mockReopened = {
        _id: 'doubt123',
        status: 'reopened',
        resolved_at: null,
        resolved_by: null,
      };
      Doubt.findByIdAndUpdate.mockResolvedValue(mockReopened);

      const doubtService = await import('../../../src/modules/doubts/doubt.service.js');
      const result = await doubtService.reopenDoubt('doubt123');

      expect(Doubt.findByIdAndUpdate).toHaveBeenCalledWith(
        'doubt123',
        expect.objectContaining({ status: 'reopened', resolved_at: null, resolved_by: null }),
        { new: true }
      );
      expect(result.status).toBe('reopened');
      expect(result.resolved_at).toBeNull();
      expect(result.resolved_by).toBeNull();
    });

    it('should add a response to a doubt', async () => {
      const responseData = {
        message: 'Here is the solution',
        is_faculty_response: true,
      };
      const mockResponse = {
        _id: 'resp123',
        doubt_id: 'doubt123',
        ...responseData,
      };
      DoubtResponse.create.mockResolvedValue(mockResponse);

      const doubtService = await import('../../../src/modules/doubts/doubt.service.js');
      const result = await doubtService.addResponse('doubt123', responseData);

      expect(DoubtResponse.create).toHaveBeenCalledWith({
        doubt_id: 'doubt123',
        ...responseData,
      });
    });
  });
});
