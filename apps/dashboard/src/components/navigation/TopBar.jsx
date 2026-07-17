import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import api from '../config/api';

import SwipeableNotification from './SwipeableNotification';
import GlobalSearch from './TopBar/GlobalSearch';

export default function TopBar() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
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
  className="
    relative
    flex
    items-center
    justify-center
    w-12
    h-12
    rounded-2xl
    bg-white
    border
    border-slate-200
    shadow-sm
    transition-all
    duration-300
    hover:shadow-md
    hover:border-[#d8a15f]
    hover:-translate-y-0.5
  "
>
  <Bell className="w-5 h-5 text-[#5d0f2d]" />
  
  {unreadCount > 0 && (
    <span
      className="
        absolute
        top-1
        right-1
        flex
        items-center
        justify-center
              min-w-4.5
        h-4.5
        px-1
        rounded-full
        bg-[#d8a15f]
        text-[#5d0f2d]
        text-[10px]
        font-bold
        border-2
        border-white
        leading-none
      "
    >
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
                <div className="py-10 text-center text-text-muted">
                  No notifications available.
                </div>
              ) : (
                notifications.map((notif) => (
                  <SwipeableNotification
                    key={notif._id}
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
                className="w-full btn-maroon"
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