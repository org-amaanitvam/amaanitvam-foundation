import Notification from './notification.model.js';

export const getUserNotifications = async (req, res) => {
  try {
    const { user_id } = req.params;
    const notifications = await Notification.find({ user_id }).sort({ created_at: -1 });
    res.json({ success: true, data: notifications, meta: { unread_count: notifications.filter(n => !n.is_read).length }});
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, { is_read: true }, { returnDocument: 'after' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};