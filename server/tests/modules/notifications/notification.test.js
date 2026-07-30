import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/notifications/notification.model.js', () => ({
  default: {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    updateMany: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([]),
  },
}));

const Notification = (await import('../../../src/modules/notifications/notification.model.js')).default;
const notificationService = await import('../../../src/modules/notifications/notification.service.js');
const { createSchema } = await import('../../../src/modules/notifications/notification.validation.js');

describe('Notifications Module', () => {
  describe('Validation', () => {
    it('should validate a valid notification creation payload', () => {
      const payload = {
        type: 'doubt_responded',
        title: 'New Response',
        message: 'Your doubt has a response',
        priority: 'high',
        channel: 'in_app',
      };
      const { error } = createSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should fail if type is missing', () => {
      const payload = { title: 'Test', message: 'Test msg' };
      const { error } = createSchema.validate(payload);
      expect(error).toBeDefined();
    });

    it('should fail if invalid priority is provided', () => {
      const payload = {
        type: 'test',
        title: 'Test',
        message: 'Test msg',
        priority: 'urgent',
      };
      const { error } = createSchema.validate(payload);
      expect(error).toBeDefined();
    });
  });

  describe('Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should get notifications for a user with pagination', async () => {
      const mockNotifications = [
        { _id: 'notif1', user_id: 'user123', title: 'Test 1' },
        { _id: 'notif2', user_id: 'user123', title: 'Test 2' },
      ];

      Notification.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockNotifications),
      });
      Notification.countDocuments.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

      const result = await notificationService.getNotifications('user123', 1, 10);

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.meta.total).toBe(2);
      expect(result.meta.unreadCount).toBe(1);
    });

    it('should mark a notification as read', async () => {
      const mockNotif = {
        _id: 'notif1',
        user_id: 'user123',
        is_read: false,
        save: jest.fn().mockResolvedValue(true),
      };

      Notification.findOne.mockResolvedValue(mockNotif);

      const result = await notificationService.markAsRead('notif1', 'user123');
      expect(result.is_read).toBe(true);
      expect(result.read_at).toBeDefined();
    });

    it('should return null if notification not found for markAsRead', async () => {
      Notification.findOne.mockResolvedValue(null);

      const result = await notificationService.markAsRead('nonexistent', 'user123');
      expect(result).toBeNull();
    });

    it('should mark all notifications as read for a user', async () => {
      Notification.updateMany.mockResolvedValue({ modifiedCount: 5 });

      await notificationService.markAllAsRead('user123');
      expect(Notification.updateMany).toHaveBeenCalledWith(
        { user_id: 'user123', is_read: false },
        { is_read: true, read_at: expect.any(Date) }
      );
    });

    it('should get unread count for a user', async () => {
      Notification.countDocuments.mockResolvedValue(3);

      const result = await notificationService.getUnreadCount('user123');
      expect(result.unread_count).toBe(3);
    });

    it('should create a notification', async () => {
      const data = {
        user_id: 'user123',
        type: 'test',
        title: 'Test Title',
        message: 'Test message',
      };
      const expected = { _id: 'notif1', ...data };

      Notification.create.mockResolvedValue(expected);

      const result = await notificationService.createNotification(data);
      expect(result).toEqual(expected);
    });

    it('should notify a user with all fields', async () => {
      const expected = {
        _id: 'notif1',
        user_id: 'user123',
        type: 'doubt_responded',
        title: 'New Response',
        message: 'Your doubt has a response',
        data: { doubt_id: 'doubt123' },
      };

      Notification.create.mockResolvedValue(expected);

      const result = await notificationService.notifyUser(
        'user123',
        'doubt_responded',
        'New Response',
        'Your doubt has a response',
        { doubt_id: 'doubt123' }
      );

      expect(Notification.create).toHaveBeenCalledWith({
        user_id: 'user123',
        type: 'doubt_responded',
        title: 'New Response',
        message: 'Your doubt has a response',
        data: { doubt_id: 'doubt123' },
      });
      expect(result).toEqual(expected);
    });
  });
});
