import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Heart, Award, Globe, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `sidebar-nav-link ${isActive ? 'active' : ''}`;

  return (
    <aside className="w-64 bg-slate-900 fixed top-0 left-0 h-screen flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#56051a] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Amaanitvam
              <span className="inline-block w-1.5 h-1.5 bg-[#56051a] rounded-full ml-0.5 -translate-y-1"></span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium -mt-0.5">Foundation</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {/* OVERVIEW (For everyone) */}
        <p className="px-4 pt-2 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Overview
        </p>
        <NavLink to="/" end className={navLinkClass}>
          <LayoutDashboard className="w-[18px] h-[18px] opacity-70" />
          Dashboard
        </NavLink>

        {/* ADMIN ONLY SECTIONS */}
        {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
          <>
            <p className="px-4 pt-5 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Management
            </p>
            <NavLink to="/candidates" className={navLinkClass}>
              <Users className="w-[18px] h-[18px] opacity-70" />
              Candidates
            </NavLink>
            <NavLink to="/members" className={navLinkClass}>
              <UserCog className="w-[18px] h-[18px] opacity-70" />
              Members
            </NavLink>
            <NavLink to="/donations" className={navLinkClass}>
              <Heart className="w-[18px] h-[18px] opacity-70" />
              Donations
            </NavLink>

            <p className="px-4 pt-5 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tools
            </p>
            <NavLink to="/certificates" className={navLinkClass}>
              <Award className="w-[18px] h-[18px] opacity-70" />
              Certificates
            </NavLink>
            <NavLink to="/content" className={navLinkClass}>
              <Globe className="w-[18px] h-[18px] opacity-70" />
              Website Content
            </NavLink>
          </>
        )}

        {/* MEMBER/INTERN ONLY SECTIONS */}
        {(userProfile?.role === 'member' || userProfile?.role === 'intern') && (
          <>
            <p className="px-4 pt-5 pb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Workspace
            </p>
            <NavLink to="/tasks" className={navLinkClass}>
              <Award className="w-[18px] h-[18px] opacity-70" />
              My Tasks
            </NavLink>
            <NavLink to="/attendance" className={navLinkClass}>
              <Users className="w-[18px] h-[18px] opacity-70" />
              Attendance
            </NavLink>
            <NavLink to="/my-certificates" className={navLinkClass}>
              <Shield className="w-[18px] h-[18px] opacity-70" />
              My Certificates
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer — User Info */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#56051a] rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {userProfile?.name || 'Admin'}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-slate-700/60 text-slate-300 rounded-full">
              {userProfile?.role || 'admin'}
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
