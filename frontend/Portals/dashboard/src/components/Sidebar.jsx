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
import { useState, useEffect } from 'react';
import api from '../config/api';

export default function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('Amaanitvam');

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
      } catch (err) {
        console.error('Failed to load org name');
      }
    };

    fetchSettings();
  }, []);

  const navLinkClass = ({ isActive }) =>
    `sidebar-nav-link ${isActive ? 'active' : ''}`;

  return (
    <aside className="w-64 bg-primary-dark fixed top-0 left-0 h-screen flex flex-col z-50 border-r border-gold/20 shadow-xl">
      {/* Logo */}
        {/* Branding */}
     <div className="px-6 py-6 border-b border-gold/10 bg-primary/20">
  <div className="flex items-center gap-4">
    {/* Brand Logo */}
    <img 
      alt="Amaanitvam Foundation" 
      className="brand-logo h-12 w-auto object-contain bg-white p-1 rounded-sm" 
      src="assets/images/logo.jpg" 
    />
    
    {/* Brand Typography */}
    <div className="flex flex-col justify-center">
      <h1 className="text-2xl font-heading font-bold text-gold tracking-tight leading-none uppercase">
        {orgName.split(' ')[0] || 'Amaanitvam'}
      </h1>
      <p className="text-[11px] font-ui text-white/70 uppercase tracking-[0.25em] font-semibold mt-1 leading-none">
        {orgName.split(' ').slice(1).join(' ') || 'Foundation'}
      </p>
    </div>
  </div>
</div>
      {/* <div className="px-6 py-5 border-b border-gold/10 bg-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-primary-dark" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-heading font-bold text-gold tracking-tight leading-tight truncate">
              {orgName.split(' ')[0] || 'Amaanitvam'}
            </h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.22em] font-ui">
              Dashboard Panel
            </p>
          </div>
        </div>
      </div> */}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
       <p className="text-[10px] text-white/50 uppercase tracking-[0.22em] font-ui">
              Dashboard Panel
            </p>
        <p className="px-4 pt-2 pb-1 text-xs font-ui font-bold text-gold/70 uppercase tracking-[0.18em]">
          Overview
        </p>

        <NavLink to="/dashboard" end className={navLinkClass}>
          <LayoutDashboard className="w-[18px] h-[18px]" />
          <span>Dashboard</span>
        </NavLink>

        <p className="px-4 pt-5 pb-1 text-xs font-ui font-bold text-gold/70 uppercase tracking-[0.18em]">
          Team
        </p>

        <NavLink to="/meetings" className={navLinkClass}>
          <CalendarDays className="w-[18px] h-[18px]" />
          <span>Meetings</span>
        </NavLink>

        <NavLink to="/tasks" className={navLinkClass}>
          <ClipboardList className="w-[18px] h-[18px]" />
          <span>Tasks</span>
        </NavLink>

        <NavLink to="/announcements" className={navLinkClass}>
          <Megaphone className="w-[18px] h-[18px]" />
          <span>Announcements</span>
        </NavLink>

        <NavLink to="/projects" className={navLinkClass}>
          <FolderKanban className="w-[18px] h-[18px]" />
          <span>Projects</span>
        </NavLink>

        <NavLink to="/departments" className={navLinkClass}>
          <Building2 className="w-[18px] h-[18px]" />
          <span>Departments</span>
        </NavLink>

        {!isAdmin && (
          <>
            <p className="px-4 pt-5 pb-1 text-xs font-ui font-bold text-gold/70 uppercase tracking-[0.18em]">
              My Workspace
            </p>

            <NavLink to="/attendance" className={navLinkClass}>
              <CalendarCheck className="w-[18px] h-[18px]" />
              <span>Attendance</span>
            </NavLink>

            <NavLink to="/my-certificates" className={navLinkClass}>
              <Shield className="w-[18px] h-[18px]" />
              <span>My Certificates</span>
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <p className="px-4 pt-5 pb-1 text-xs font-ui font-bold text-gold/70 uppercase tracking-[0.18em]">
              My Workspace
            </p>

            <NavLink to="/member-reports" className={navLinkClass}>
              <BarChart3 className="w-[18px] h-[18px]" />
              <span>Reports</span>
            </NavLink>

            <NavLink to="/attendance" className={navLinkClass}>
              <CalendarCheck className="w-[18px] h-[18px]" />
              <span>Attendance</span>
            </NavLink>
          </>
        )}

        <p className="px-4 pt-5 pb-1 text-xs font-ui font-bold text-gold/70 uppercase tracking-[0.18em]">
          Account
        </p>

        <NavLink to="/profile" className={navLinkClass}>
          <UserCircle className="w-[18px] h-[18px]" />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gold/10 bg-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-primary-dark text-sm font-bold shrink-0">
            DP
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-ui font-bold text-white truncate" title="Dashboard Panel">
              Dashboard Panel
            </p>

            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-ui font-bold uppercase tracking-wide bg-gold text-primary-dark rounded">
              DASHBOARD
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-gold/60 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors duration-300"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
