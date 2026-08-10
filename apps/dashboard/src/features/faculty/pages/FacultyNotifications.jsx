import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  UserCheck,
  Calendar,
  ClipboardCheck,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Candidate Application Submitted',
    desc: 'Aarav Sharma submitted an application for Full Stack Web Development (Batch 2026-A).',
    category: 'applications',
    time: '10 min ago',
    unread: true,
    link: '/faculty/applications',
    type: 'applications',
  },
  {
    id: 2,
    title: 'Live Session Starting in 2 Hours',
    desc: 'React Router & State Architecture class begins at 08:43 PM.',
    category: 'sessions',
    time: '45 min ago',
    unread: true,
    link: '/faculty/sessions',
    type: 'sessions',
  },
  {
    id: 3,
    title: 'Attendance Recorded Successfully',
    desc: 'Your faculty shift duty punch log for today has been recorded.',
    category: 'attendance',
    time: '2 hours ago',
    unread: false,
    link: '/faculty/attendance',
    type: 'attendance',
  },
  {
    id: 4,
    title: 'Faculty Portal System Update',
    desc: 'New applications reviewer, settings workstation, and recorded session player features are now available.',
    category: 'system',
    time: 'Yesterday',
    unread: false,
    link: '/faculty/dashboard',
    type: 'system',
  },
];

export default function FacultyNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState('all');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read.');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('Notifications cleared.');
  };

  const filtered = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'unread') return n.unread;
    return n.category === activeCategory;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-full bg-[#faf7f8] p-5 sm:p-6 lg:p-8 animate-fade-in text-gray-900">
      {/* Header */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5e6ec] text-[#8a164b]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-[#5d0f2d]">
              Notifications Center
            </h1>
            <p className="mt-1 text-xs text-[#756b70]">
              Candidate application alerts, live classroom updates, and duty attendance logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="rounded-xl bg-[#5d0f2d] px-4 py-2 text-xs font-bold text-white hover:bg-[#8a164b] transition-colors shadow-sm"
          >
            Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            className="rounded-xl bg-gray-200 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-rose-100 hover:text-rose-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Notification Summary KPI Cards */}
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-[20px] border border-[#eadfe4] border-t-4 border-t-[#8a164b] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#756b70]">All Notifications</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold text-[#5d0f2d]">{notifications.length}</h2>
            </div>
            <div className="rounded-xl bg-[#f5e6ec] p-3 text-[#8a164b]">
              <Bell className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#eadfe4] border-t-4 border-t-[#d8a15f] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#756b70]">Unread</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold text-[#5d0f2d]">{unreadCount}</h2>
            </div>
            <div className="rounded-xl bg-[#f4e3c1] p-3 text-[#9b6927]">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#eadfe4] border-t-4 border-t-[#10b981] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#756b70]">Resolved / Actioned</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold text-[#5d0f2d]">
                {notifications.length - unreadCount}
              </h2>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Feed */}
      <div className="rounded-[22px] border border-[#eadfe4] bg-white shadow-sm overflow-hidden">
        {/* Category Tabs Header */}
        <div className="flex items-center gap-2 border-b border-[#f0e6ea] p-4 overflow-x-auto bg-gray-50/50">
          {[
            { id: 'all', label: 'All Feed' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'applications', label: 'Applications' },
            { id: 'sessions', label: 'Live Sessions' },
            { id: 'attendance', label: 'Attendance' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#5d0f2d] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-rose-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List items */}
        <div className="divide-y divide-[#f0e6ea]">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">No notifications in this category.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(item.link)}
                className={`flex gap-4 p-5 transition hover:bg-[#fffafb] cursor-pointer group ${
                  item.unread ? 'bg-[#fff7f9]' : 'bg-white'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    item.type === 'applications'
                      ? 'bg-sky-100 text-sky-700'
                      : item.type === 'sessions'
                      ? 'bg-amber-100 text-amber-800'
                      : item.type === 'attendance'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#f5e6ec] text-[#8a164b]'
                  }`}
                >
                  {item.type === 'applications' ? (
                    <UserCheck className="h-5 w-5" />
                  ) : item.type === 'sessions' ? (
                    <Calendar className="h-5 w-5" />
                  ) : item.type === 'attendance' ? (
                    <ClipboardCheck className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[#3d2b2b] text-sm group-hover:text-[#8a164b] transition-colors">
                        {item.title}
                      </h3>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>

                    <span className="text-xs text-[#9a8f94] font-medium">{item.time}</span>
                  </div>

                  <p className="mt-1 text-xs text-[#756b70] leading-relaxed">{item.desc}</p>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#8a164b] group-hover:translate-x-1 transition-all self-center" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}