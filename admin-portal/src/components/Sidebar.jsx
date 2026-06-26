import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Heart, Award, Globe, LogOut, Shield, Image, Settings as SettingsIcon } from 'lucide-react';
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

  return (
    <aside className="w-64 bg-primary-dark fixed top-0 left-0 h-screen flex flex-col z-50 border-r border-gold/20">
      {/* Branding */}
      <div className="px-6 py-6 border-b border-gold/10 bg-primary/20">
        <div className="flex flex-col">
          <h1 className="text-xl font-heading font-bold text-gold tracking-tight leading-tight">
            {orgName.split(' ')[0] || 'Amaanitvam'}
          </h1>
          <p className="text-[10px] font-ui text-white/50 uppercase tracking-[0.2em] font-medium">
            {orgName.split(' ').slice(1).join(' ') || 'Foundation'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
        {/* OVERVIEW */}
        <p className="px-4 pb-2 text-[10px] font-ui font-bold text-gold/40 uppercase tracking-widest">
          Overview
        </p>
        <NavLink to="/" end className={navLinkClass}>
          <LayoutDashboard className="w-[18px] h-[18px]" />
          <span className="font-ui">Dashboard</span>
        </NavLink>

        {/* ADMIN ONLY SECTIONS */}
        {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
          <>
            <p className="px-4 pt-6 pb-2 text-[10px] font-ui font-bold text-gold/40 uppercase tracking-widest">
              Management
            </p>
            <NavLink to="/candidates" className={navLinkClass}>
              <Users className="w-[18px] h-[18px]" />
              <span className="font-ui">Candidates</span>
            </NavLink>
            <NavLink to="/members" className={navLinkClass}>
              <UserCog className="w-[18px] h-[18px]" />
              <span className="font-ui">Members</span>
            </NavLink>
            <NavLink to="/donations" className={navLinkClass}>
              <Heart className="w-[18px] h-[18px]" />
              <span className="font-ui">Donations</span>
            </NavLink>

            <p className="px-4 pt-6 pb-2 text-[10px] font-ui font-bold text-gold/40 uppercase tracking-widest">
              Tools
            </p>
            <NavLink to="/certificates" className={navLinkClass}>
              <Award className="w-[18px] h-[18px]" />
              <span className="font-ui">Certificates</span>
            </NavLink>
            <NavLink to="/cms" className={navLinkClass}>
              <Globe className="w-[18px] h-[18px]" />
              <span className="font-ui">Website CMS</span>
            </NavLink>
            <NavLink to="/gallery" className={navLinkClass}>
              <Image className="w-[18px] h-[18px] opacity-70" />
              Gallery Images
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <SettingsIcon className="w-[18px] h-[18px] opacity-70" />
              System Settings
            </NavLink>
          </>
        )}

        {/* MEMBER/INTERN ONLY SECTIONS */}
        {(userProfile?.role === 'member' || userProfile?.role === 'intern') && (
          <>
            <p className="px-4 pt-6 pb-2 text-[10px] font-ui font-bold text-gold/40 uppercase tracking-widest">
              My Workspace
            </p>
            <NavLink to="/tasks" className={navLinkClass}>
              <Award className="w-[18px] h-[18px]" />
              <span className="font-ui">My Tasks</span>
            </NavLink>
            <NavLink to="/attendance" className={navLinkClass}>
              <Users className="w-[18px] h-[18px]" />
              <span className="font-ui">Attendance</span>
            </NavLink>
            <NavLink to="/my-certificates" className={navLinkClass}>
              <Shield className="w-[18px] h-[18px]" />
              <span className="font-ui">My Certificates</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer — User Info */}
      <div className="px-4 py-4 border-t border-gold/10 bg-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/20 border border-gold/30 rounded-full flex items-center justify-center text-gold text-sm font-bold shrink-0">
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-ui font-bold text-white truncate" title={userProfile?.name}>
              {userProfile?.name?.split(' ')[0] || 'Admin'}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-ui font-bold uppercase tracking-wide bg-gold text-primary-dark rounded">
              {userProfile?.role || 'admin'}
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
