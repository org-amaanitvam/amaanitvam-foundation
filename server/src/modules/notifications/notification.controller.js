import { sendSuccess } from '../../shared/response/index.js';
import * as notificationService from './notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { notifications, meta } = await notificationService.getNotifications(req.user.id, page, limit);
    sendSuccess(res, 200, { notifications, ...meta }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.notificationId, req.user.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found', details: [] } });
    }
    sendSuccess(res, 200, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    sendSuccess(res, 200, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    sendSuccess(res, 200, result, 'Unread count retrieved');
  } catch (error) {
    next(error);
  }
};