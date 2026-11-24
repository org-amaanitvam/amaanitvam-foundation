import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  HelpCircle,
  FileCheck,
  ClipboardCheck,
  UserCheck,
  Megaphone,
  BarChart3,
  Bell,
  Settings,
  HelpCircle as HelpIcon,
  LogOut,
} from 'lucide-react';

const facultyNavItems = [
  { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'My Courses', path: '/faculty/courses', icon: BookOpen },
  { name: 'My Sessions', path: '/faculty/sessions', icon: Calendar },
  { name: 'Student Doubts', path: '/faculty/doubts', icon: HelpCircle },
  { name: 'Assignments', path: '/faculty/assignments', icon: FileCheck },
  { name: 'Attendance', path: '/faculty/attendance', icon: ClipboardCheck },
  { name: 'Applications', path: '/faculty/applications', icon: UserCheck },
  { name: 'Announcements', path: '/faculty/announcements', icon: Megaphone },
  { name: 'Analytics', path: '/faculty/analytics', icon: BarChart3 },
  { name: 'Notifications', path: '/faculty/notifications', icon: Bell },
  { name: 'Settings', path: '/faculty/settings', icon: Settings },
  { name: 'Help & Support', path: '/faculty/help', icon: HelpIcon },
];

export default function FacultySidebar({ onLogout }) {
  return (
    <aside className="w-64 bg-[#5d0f2d] text-white flex flex-col min-h-screen shadow-2xl border-r border-[#8a164b]/40">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#8a164b]/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8a164b] to-[#d4af37] flex items-center justify-center font-black text-white shadow-lg border border-[#d4af37]/40">
          AF
        </div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight tracking-wide text-white">Faculty Portal</h1>
          <p className="text-xs text-[#d4af37] font-semibold">Amaanitvam LMS</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {facultyNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#8a164b] text-white shadow-md shadow-[#8a164b]/40 border-l-4 border-[#d4af37] font-extrabold'
                    : 'text-rose-100/80 hover:bg-[#8a164b]/30 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 text-[#d4af37]" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#8a164b]/40">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-200 hover:bg-rose-900/50 hover:text-white transition-all duration-200 border border-rose-800/30"
        >
          <LogOut className="w-5 h-5 text-rose-300" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
