import Notification from './notification.model.js';

export const findAll = async (filter, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter).skip(skip).limit(limit).sort({ created_at: -1 });
  return { notifications, meta: { page, limit, total } };
};

export const findById = (id) => Notification.findById(id);

export const create = (data) => Notification.create(data);

export const update = (id, data) => Notification.findByIdAndUpdate(id, data, { new: true });

export const deleteNotification = (id) => Notification.findByIdAndDelete(id);

export const findByUserId = (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return Notification.find({ user_id: userId }).skip(skip).limit(limit).sort({ created_at: -1 });
};

export const markAsRead = (id, userId) => {
  return Notification.findOneAndUpdate(
    { _id: id, user_id: userId },
    { is_read: true, read_at: new Date() },
    { new: true }
  );
};

export const markAllAsRead = (userId) => {
  return Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true, read_at: new Date() });
};

export const getUnreadCount = (userId) => {
  return Notification.countDocuments({ user_id: userId, is_read: false });
};
