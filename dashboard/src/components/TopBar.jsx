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
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex justify-between items-center mb-6 relative z-40">
      <div className="flex-1 max-w-md">
        <GlobalSearch />
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 rounded-full hover:bg-slate-200/50 transition-colors bg-white border border-slate-200 shadow-sm"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs font-medium text-[#56051a]">{unreadCount} new</span>}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No notifications yet.
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
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-[#56051a] hover:underline"
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
