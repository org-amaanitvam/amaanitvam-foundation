import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, BellRing } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  fetchUnreadCount,
} from '../../../config/api';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const TYPE_STYLES = {
  doubt_assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  doubt_responded: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  doubt_resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  announcement: 'bg-amber-50 text-amber-700 border-amber-200',
  session: 'bg-purple-50 text-purple-700 border-purple-200',
  system: 'bg-gray-100 text-gray-600 border-gray-200',
};

const formatTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const reload = async () => {
    const token = await user?.getIdToken();
    const [items, count] = await Promise.all([
      fetchNotifications(token),
      fetchUnreadCount(token),
    ]);
    setNotifications(items);
    setUnread(count);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await user?.getIdToken();
        const [items, count] = await Promise.all([
          fetchNotifications(token),
          fetchUnreadCount(token),
        ]);
        if (!cancelled) {
          setNotifications(items);
          setUnread(count);
        }
      } catch (error) {
        if (!cancelled) toast.error(error?.message || 'Failed to load notifications');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRead = async (notification) => {
    if (notification.is_read) return;
    await markNotificationRead(notification._id, await user?.getIdToken());
    setNotifications((prev) =>
      prev.map((n) => (n._id === notification._id ? { ...n, is_read: true } : n)),
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const handleReadAll = async () => {
    if (marking) return;
    setMarking(true);
    try {
      await markAllNotificationsRead(await user?.getIdToken());
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error(error?.message || 'Failed to mark notifications');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState label="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Notifications"
        subtitle="Updates on doubts, sessions, and announcements"
        image="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=70"
        action={
          unread > 0 ? (
            <button
              type="button"
              onClick={handleReadAll}
              disabled={marking}
              className="inline-flex items-center gap-2 rounded-xl border border-white/70 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-white hover:text-[#5d0f2d] transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          ) : undefined
        }
      />

      {unread > 0 && (
        <div className="rounded-xl bg-[#5d0f2d] px-5 py-3 text-sm font-bold text-white flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[#d8a15f]" />
          You have {unread} unread notification{unread === 1 ? '' : 's'}
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState title="No notifications yet" message="Activity alerts will appear here as your learning journey progresses." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => handleRead(notification)}
              className={`w-full text-left card-premium flex items-start gap-4 transition-opacity cursor-pointer ${
                notification.is_read ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <div className="rounded-xl bg-[#5d0f2d]/5 p-3 shrink-0">
                <Bell className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-[#8a164b]'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-base">
                    {notification.title}
                  </h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_STYLES[notification.type] || TYPE_STYLES.system}`}>
                    {notification.type || 'system'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 font-medium leading-relaxed">
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-gray-400 font-medium">
                  {formatTime(notification.created_at || notification.createdAt)}
                </p>
              </div>
              {!notification.is_read && (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}