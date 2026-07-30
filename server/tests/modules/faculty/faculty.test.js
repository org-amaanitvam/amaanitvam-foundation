import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/faculty/faculty.model.js', () => ({
  default: {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    insertMany: jest.fn(),
    countDocuments: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    findOne: jest.fn(),
  },
}));

const Faculty = (await import('../../../src/modules/faculty/faculty.model.js')).default;
const facultyService = await import('../../../src/modules/faculty/faculty.service.js');
const { createSchema, updateSchema, statusSchema, bulkImportSchema } = await import('../../../src/modules/faculty/faculty.validation.js');

describe('Faculty Module', () => {
  describe('Validation', () => {
    it('should validate a valid faculty creation payload', () => {
      const payload = {
        user_id: '507f1f77bcf86cd799439011',
        employee_id: 'FAC001',
        department: 'Computer Science',
        specialization: ['Web Development', 'Database'],
        qualification: 'M.Tech',
        experience_years: 5,
        subjects: ['JavaScript', 'Python'],
      };
      const { error } = createSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail validation if user_id is missing', () => {
      const payload = {
        department: 'Computer Science',
      };
      const { error } = createSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('user_id');
    });

    it('should validate a valid status update payload', () => {
      const payload = { is_active: false };
      const { error } = statusSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail status update if is_active is not boolean', () => {
      const payload = { is_active: 'yes' };
      const { error } = statusSchema.validate(payload);
      expect(error).toBeDefined();
    });

    it('should validate bulk import schema with valid array', () => {
      const payload = {
        facultyData: [
          { user_id: '507f1f77bcf86cd799439011', employee_id: 'FAC001', department: 'CS' },
          { user_id: '507f1f77bcf86cd799439012', employee_id: 'FAC002', department: 'EE' },
        ],
      };
      const { error } = bulkImportSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail bulk import if facultyData is not array', () => {
      const payload = { facultyData: 'not-an-array' };
      const { error } = bulkImportSchema.validate(payload);
      expect(error).toBeDefined();
    });
  });

  describe('Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a faculty member', async () => {
      const data = { user_id: '507f1f77bcf86cd799439011', department: 'CS' };
      const expected = { _id: 'mock_id', ...data };

      Faculty.create.mockResolvedValue(expected);

      const result = await facultyService.createFaculty(data);
      expect(Faculty.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(expected);
    });

    it('should get faculty by ID', async () => {
      const mockFaculty = { _id: 'fac123', department: 'CS' };
      Faculty.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockFaculty),
      });

      const result = await facultyService.getById('fac123');
      expect(Faculty.findById).toHaveBeenCalledWith('fac123');
      expect(result).toEqual(mockFaculty);
    });

    it('should get faculty list with pagination', async () => {
      const mockList = [{ _id: 'fac1' }, { _id: 'fac2' }];
      Faculty.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockList),
      });
      Faculty.countDocuments.mockResolvedValue(2);

      const result = await facultyService.getFacultyList({ is_active: true }, 1, 10);
      const data = await result.data;
      const count = await result.count;

      expect(data).toEqual(mockList);
      expect(count).toBe(2);
    });

    it('should update a faculty member', async () => {
      const update = { department: 'New Dept' };
      const expected = { _id: 'fac123', department: 'New Dept' };

      Faculty.findByIdAndUpdate.mockResolvedValue(expected);

      const result = await facultyService.updateFaculty('fac123', update);
      expect(Faculty.findByIdAndUpdate).toHaveBeenCalledWith('fac123', update, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(expected);
    });

    it('should bulk create faculty members', async () => {
      const dataArray = [
        { user_id: 'id1', employee_id: 'F001' },
        { user_id: 'id2', employee_id: 'F002' },
      ];

      Faculty.insertMany.mockResolvedValue(dataArray);

      const result = await facultyService.bulkCreate(dataArray);
      expect(Faculty.insertMany).toHaveBeenCalledWith(dataArray);
      expect(result).toEqual(dataArray);
    });
  });
});
