import Notification from './notification.model.js';

export const getNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await Notification.countDocuments({ user_id: userId });
  const notifications = await Notification.find({ user_id: userId })
    .skip(skip)
    .limit(limit)
    .sort({ created_at: -1 });
  const unreadCount = await Notification.countDocuments({ user_id: userId, is_read: false });
  return { notifications, meta: { page, limit, total, unreadCount } };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, user_id: userId });
  if (!notification) return null;
  notification.is_read = true;
  notification.read_at = new Date();
  await notification.save();
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user_id: userId, is_read: false },
    { is_read: true, read_at: new Date() }
  );
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ user_id: userId, is_read: false });
  return { unread_count: count };
};

export const createNotification = async (data) => {
  return Notification.create(data);
};

export const notifyUser = async (userId, type, title, message, data = {}) => {
  return Notification.create({
    user_id: userId,
    type,
    title,
    message,
    data,
  });
};