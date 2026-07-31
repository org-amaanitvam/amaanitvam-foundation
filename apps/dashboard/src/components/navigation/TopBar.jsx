import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import api from '../config/api'; // or your relative api path

import SwipeableNotification from './SwipeableNotification';
import GlobalSearch from './TopBar/GlobalSearch';
import { useAuth } from '../contexts/AuthContext'; // 👈 Import auth to get current user ID

export default function TopBar() {
  const { userProfile, user } = useAuth();
  const userId = userProfile?._id || userProfile?.uid || user?.uid || user?._id;

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      // Matches your backend route: router.get('/user/:user_id', getUserNotifications)
      const { data } = await api.get(`/notifications/user/${userId}`);
      const rawList = data.data || data.notifications || [];
      
      // Normalize properties (handling both isRead and is_read)
      const normalized = rawList.map(n => ({
        ...n,
        isRead: n.isRead !== undefined ? n.isRead : n.is_read
      }));

      setNotifications(normalized);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      // Matches your backend route: router.patch('/:id/read', markAsRead)
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Local filter or delete API if available
      setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optional bulk update or loop through unread items
      const unreadItems = notifications.filter(n => !n.isRead);
      await Promise.all(unreadItems.map(n => api.patch(`/notifications/${n._id || n.id}/read`)));
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'emergency':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
      case 'task_assigned':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-gold" />;
    }
  };

  return (
    <header className="flex items-center justify-between gap-6 mb-8">
      <div className="flex-1 max-w-xl">
        <GlobalSearch />
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#d8a15f] hover:-translate-y-0.5"
        >
          <Bell className="w-5 h-5 text-[#5d0f2d]" />
          
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-[#d8a15f] text-[#5d0f2d] text-[10px] font-bold border-2 border-white leading-none">
              {unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-3 w-90 rounded-2xl overflow-hidden bg-surface border border-border-custom shadow-2xl z-50">
            <div className="px-5 py-4 border-b border-border-custom bg-background flex items-center justify-between">
              <h3 className="font-heading text-xl text-primary">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <span className="text-xs font-ui font-semibold text-gold">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-90 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-text-muted text-sm">
                  No notifications available.
                </div>
              ) : (
                notifications.map((notif) => (
                  <SwipeableNotification
                    key={notif._id || notif.id}
                    notif={notif}
                    getIcon={getIcon}
                    handleMarkAsRead={handleMarkAsRead}
                    handleDelete={handleDelete}
                  />
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-border-custom bg-background">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full btn-maroon text-sm py-2 rounded-xl"
              >
                Mark All as Read
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}