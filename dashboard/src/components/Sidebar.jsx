import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ClipboardList, Megaphone, FolderKanban, CalendarCheck, Shield, UserCircle, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../config/api';

export default function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('Amaanitvam');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.settings?.orgName) {
          setOrgName(res.data.settings.orgName);
        }
      } catch (err) {
        console.error('Failed to load org name');
      }
    };
    fetchSettings();
  }, []);

  const navLinkClass = ({ isActive }) =>
    `sidebar-nav-link ${isActive ? 'active' : ''}`;

  const role = userProfile?.role;
  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <aside className="w-64 bg-slate-900 fixed top-0 left-0 h-screen flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#56051a] rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {orgName.split(' ')[0] || 'Amaanitvam'}
              <span className="inline-block w-1.5 h-1.5 bg-[#56051a] rounded-full ml-0.5 -translate-y-1"></span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium -mt-0.5">
              {orgName.split(' ').slice(1).join(' ') || 'Dashboard'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="px-4 pt-2 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Overview
        </p>
        <NavLink to="/" end className={navLinkClass}>
          <LayoutDashboard className="w-[18px] h-[18px] opacity-70" />
          Dashboard
        </NavLink>

        {/* Team sections visible to ALL */}
        <p className="px-4 pt-5 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Team
        </p>
        <NavLink to="/meetings" className={navLinkClass}>
          <CalendarDays className="w-[18px] h-[18px] opacity-70" />
          Meetings
        </NavLink>
        <NavLink to="/tasks" className={navLinkClass}>
          <ClipboardList className="w-[18px] h-[18px] opacity-70" />
          Tasks
        </NavLink>
        <NavLink to="/announcements" className={navLinkClass}>
          <Megaphone className="w-[18px] h-[18px] opacity-70" />
          Announcements
        </NavLink>
        <NavLink to="/projects" className={navLinkClass}>
          <FolderKanban className="w-[18px] h-[18px] opacity-70" />
          Projects
        </NavLink>

        {/* Member/Intern workspace */}
        {!isAdmin && (
          <>
            <p className="px-4 pt-5 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Workspace
            </p>
            <NavLink to="/attendance" className={navLinkClass}>
              <CalendarCheck className="w-[18px] h-[18px] opacity-70" />
              Attendance
            </NavLink>
            <NavLink to="/my-certificates" className={navLinkClass}>
              <Shield className="w-[18px] h-[18px] opacity-70" />
              My Certificates
            </NavLink>
          </>
        )}

        {/* Admin reports */}
        {isAdmin && (
          <>
            <p className="px-4 pt-5 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reports
            </p>
            <NavLink to="/intern-reports" className={navLinkClass}>
              <BarChart3 className="w-[18px] h-[18px] opacity-70" />
              Intern Reports
            </NavLink>
          </>
        )}

        <p className="px-4 pt-5 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Account
        </p>
        <NavLink to="/profile" className={navLinkClass}>
          <UserCircle className="w-[18px] h-[18px] opacity-70" />
          Profile
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#56051a] rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate" title={userProfile?.name}>
              {userProfile?.name?.split(' ')[0] || 'User'}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-slate-700/60 text-slate-300 rounded-full">
              {userProfile?.role || 'member'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
