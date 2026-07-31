import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, CheckCheck, Loader2, Info, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SwipeableNotification from './SwipeableNotification';
import toast from 'react-hot-toast';

export default function NotificationDropdown() {
  const { userProfile, user } = useAuth();
  const userId = userProfile?._id || userProfile?.uid || user?.uid || user?._id;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Helper function to render icons based on type
  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'mention':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/notifications/user/${userId}`);
      if (data.success) {
        setNotifications(data.data || []);
        // Account for both property naming conventions (is_read vs isRead)
        setUnreadCount(data.meta?.unread_count || data.data.filter(n => !n.is_read && !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id || n.id === id ? { ...n, is_read: true, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      // If a delete endpoint exists, call it here; otherwise filter locally
      setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification cleared');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-600 hover:text-[#56051a] hover:bg-slate-100 rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
            <span className="text-xs bg-[#56051a]/10 text-[#56051a] font-semibold px-2.5 py-0.5 rounded-full">
              {unreadCount} Unread
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 text-[#56051a] animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No notifications right now. You're all caught up! ✨
              </div>
            ) : (
              notifications.map((notif) => {
                // Normalize properties to match what SwipeableNotification expects
                const normalizedNotif = {
                  ...notif,
                  isRead: notif.isRead !== undefined ? notif.isRead : notif.is_read,
                  createdAt: notif.createdAt || notif.created_at
                };

                return (
                  <SwipeableNotification
                    key={notif._id || notif.id}
                    notif={normalizedNotif}
                    getIcon={getIcon}
                    handleMarkAsRead={handleMarkAsRead}
                    handleDelete={handleDelete}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}