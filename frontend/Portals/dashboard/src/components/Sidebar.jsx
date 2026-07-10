import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Megaphone,
  FolderKanban,
  CalendarCheck,
  Shield,
  UserCircle,
  LogOut,
  BarChart3,
  Building2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import api from '../config/api';

export default function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('Amaanitvam Foundation');

  const role = userProfile?.role;
  const isAdmin = role === 'admin' || role === 'super_admin';

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
      } catch {
        console.error('Failed to load org name');
      }
    };

    fetchSettings();
  }, []);

  const navLinkClass = ({ isActive }) =>
    [
      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
      'font-[var(--font-ui)] transition-all duration-300',
      isActive
        ? 'bg-[#f0dfc8] text-[#d89a4a] border-l-4 border-[#d8a15f] shadow-sm'
        : 'text-[#6b5b55] hover:bg-[#f4e8d8] hover:text-[#5d0f2d]',
    ].join(' ');

  const sectionHeadingClass =
    'px-4 pt-5 pb-1 text-xs font-bold text-[#3d2b2b] uppercase tracking-[0.18em] font-[var(--font-ui)]';

  return (
    <aside className="fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-[#3d2b2b]/45 bg-[#f5efe6]">
      {/* Branding */}
      <div className="border-b border-[#3d2b2b]/45 px-6 py-6">
        <div className="flex items-center gap-4">
          <img
            src="/logo.jpg"
            alt="Amaanitvam Foundation"
            className="h-12 w-14 rounded-md bg-white object-contain p-1 shadow-sm"
          />

          <div className="flex min-w-0 flex-col justify-center">
            <h1 className="truncate font-[var(--font-heading)] text-2xl font-bold uppercase leading-none tracking-tight text-[#5d0f2d]">
              {orgName.split(' ')[0] || 'Amaanitvam'}
            </h1>
            <p className="mt-1 truncate font-[var(--font-ui)] text-[11px] font-semibold uppercase leading-none tracking-[0.25em] text-[#ffffff]">
              {orgName.split(' ').slice(1).join(' ') || 'Foundation'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <p className="px-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-white font-[var(--font-ui)]">
          Dashboard Panel
        </p>

        <p className={sectionHeadingClass}>Overview</p>

        <NavLink to="/dashboard" end className={navLinkClass}>
          <LayoutDashboard className="h-[18px] w-[18px]" />
          <span>Dashboard</span>
        </NavLink>

        <p className={sectionHeadingClass}>Team</p>

        <NavLink to="/meetings" className={navLinkClass}>
          <CalendarDays className="h-[18px] w-[18px]" />
          <span>Meetings</span>
        </NavLink>

        <NavLink to="/tasks" className={navLinkClass}>
          <ClipboardList className="h-[18px] w-[18px]" />
          <span>Tasks</span>
        </NavLink>

        <NavLink to="/announcements" className={navLinkClass}>
          <Megaphone className="h-[18px] w-[18px]" />
          <span>Announcements</span>
        </NavLink>

        <NavLink to="/projects" className={navLinkClass}>
          <FolderKanban className="h-[18px] w-[18px]" />
          <span>Projects</span>
        </NavLink>

        <NavLink to="/departments" className={navLinkClass}>
          <Building2 className="h-[18px] w-[18px]" />
          <span>Departments</span>
        </NavLink>

        <p className={sectionHeadingClass}>My Workspace</p>

        {!isAdmin ? (
          <>
            <NavLink to="/attendance" className={navLinkClass}>
              <CalendarCheck className="h-[18px] w-[18px]" />
              <span>Attendance</span>
            </NavLink>

            <NavLink to="/my-certificates" className={navLinkClass}>
              <Shield className="h-[18px] w-[18px]" />
              <span>My Certificates</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/member-reports" className={navLinkClass}>
              <BarChart3 className="h-[18px] w-[18px]" />
              <span>Reports</span>
            </NavLink>

            <NavLink to="/attendance" className={navLinkClass}>
              <CalendarCheck className="h-[18px] w-[18px]" />
              <span>Attendance</span>
            </NavLink>
          </>
        )}

        <p className={sectionHeadingClass}>Account</p>

        <NavLink to="/profile" className={navLinkClass}>
          <UserCircle className="h-[18px] w-[18px]" />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#3d2b2b]/45 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5efe6] text-sm font-bold text-[#3d2b2b]">
            DP
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-bold text-white font-[var(--font-ui)]"
              title="Dashboard Panel"
            >
              Dashboard Panel
            </p>
            <span className="mt-0.5 inline-block text-[10px] font-bold uppercase tracking-wide text-[#3d2b2b] font-[var(--font-ui)]">
              Dashboard
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="rounded-lg p-2 text-[#3d2b2b] transition-colors duration-300 hover:bg-[#f0dfc8] hover:text-[#5d0f2d]"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}