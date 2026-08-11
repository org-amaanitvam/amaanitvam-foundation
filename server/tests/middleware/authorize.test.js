import { jest } from '@jest/globals';
import { authorize, authorizeStrict } from '../../src/middleware/authorize.js';
import { ForbiddenError } from '../../src/shared/errors/AppError.js';

describe('Authorization Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { user: {} };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('Legacy authorize()', () => {
    it('should still allow super_admin even if not in roles', () => {
      mockReq.user.role = 'super_admin';
      const middleware = authorize('student');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); // Called without error
    });
  });

  describe('authorizeStrict()', () => {
    it('should reject super_admin with 403 USER_UNAUTHORIZED if not in roles (student)', () => {
      mockReq.user.role = 'super_admin';
      const middleware = authorizeStrict('student');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.statusCode).toBe(403);
      expect(error.error.code).toBe('USER_UNAUTHORIZED');
    });

    it('should reject super_admin with 403 USER_UNAUTHORIZED if not in roles (faculty)', () => {
      mockReq.user.role = 'super_admin';
      const middleware = authorizeStrict('faculty');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.statusCode).toBe(403);
      expect(error.error.code).toBe('USER_UNAUTHORIZED');
    });

    it('should allow a student when role is student', () => {
      mockReq.user.role = 'student';
      const middleware = authorizeStrict('student');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); // Called without error
    });

    it('should allow a faculty when role is faculty', () => {
      mockReq.user.role = 'faculty';
      const middleware = authorizeStrict('faculty');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); // Called without error
    });

    it('should reject when req.user is missing', () => {
      mockReq.user = undefined;
      const middleware = authorizeStrict('student');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.statusCode).toBe(403);
      expect(error.error.code).toBe('USER_UNAUTHORIZED');
    });

    it('should reject when req.user.role is missing', () => {
      mockReq.user.role = undefined;
      const middleware = authorizeStrict('student');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.statusCode).toBe(403);
      expect(error.error.code).toBe('USER_UNAUTHORIZED');
    });
  });
});
