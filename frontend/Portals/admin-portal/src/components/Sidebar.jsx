import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCog,
  Heart,
  Award,
  Globe,
  LogOut,
  Shield,
  Image,
  BarChart3,
  Settings as SettingsIcon,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

export default function Sidebar() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('Amaanitvam');
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  const displayName =
    userProfile?.name ||
    user?.displayName ||
    userProfile?.email?.split('@')[0] ||
    user?.email?.split('@')[0] ||
    'Admin User';

  const displayEmail = userProfile?.email || user?.email || '';
  const profileImage = userProfile?.profileImage || user?.photoURL || '';
  const displayRole = (userProfile?.role || 'admin').replace('_', ' ').toUpperCase();

  const initials = useMemo(() => {
    return (
      displayName
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AP'
    );
  }, [displayName]);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profileImage]);

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

  const navLinkClass = ({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`;

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
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
          <>
            <p className="inline-block px-4 pt-6 mb-[0.85rem] text-[0.82rem] font-ui font-bold text-[var(--gold-dark,#B8860B)] uppercase tracking-[0.18em]">
              Management
            </p>

            <NavLink to="/candidates" className={navLinkClass}>
              <Users className="w-4.5 h-4.5" />
              <span className="font-ui">Candidates</span>
            </NavLink>

            <NavLink to="/members" className={navLinkClass}>
              <UserCog className="w-4.5 h-4.5" />
              <span className="font-ui">Members</span>
            </NavLink>

            <NavLink to="/donations" className={navLinkClass}>
              <Heart className="w-4.5 h-4.5" />
              <span className="font-ui">Donations</span>
            </NavLink>

            <p className="inline-block px-4 pt-6 mb-[0.85rem] text-[0.82rem] font-ui font-bold text-[var(--gold-dark,#B8860B)] uppercase tracking-[0.18em]">
              Tools
            </p>

            <NavLink to="/certificates" className={navLinkClass}>
              <Award className="w-4.5 h-4.5" />
              <span className="font-ui">Certificates</span>
            </NavLink>

            <NavLink to="/cms" className={navLinkClass}>
              <Globe className="w-4.5 h-4.5" />
              <span className="font-ui">Website CMS</span>
            </NavLink>

            <NavLink to="/gallery" className={navLinkClass}>
              <Image className="w-4.5 h-4.5 opacity-70" />
              <span className="font-ui">Gallery Media</span>
            </NavLink>

            <NavLink to="/reports" className={navLinkClass}>
              <BarChart3 className="w-4.5 h-4.5 opacity-70" />
              <span className="font-ui">Reports</span>
            </NavLink>

            <NavLink to="/settings" className={navLinkClass}>
              <SettingsIcon className="w-4.5 h-4.5 opacity-70" />
              <span className="font-ui">System Settings</span>
            </NavLink>
          </>
        )}

        {(userProfile?.role === 'member' || userProfile?.role === 'intern') && (
          <>
            <p className="inline-block px-4 pt-6 mb-[0.85rem] text-[0.82rem] font-ui font-bold text-[var(--gold-dark,#B8860B)] uppercase tracking-[0.18em]">
              My Workspace
            </p>

            <NavLink to="/tasks" className={navLinkClass}>
              <Award className="w-4.5 h-4.5" />
              <span className="font-ui">My Tasks</span>
            </NavLink>

            <NavLink to="/attendance" className={navLinkClass}>
              <Users className="w-4.5 h-4.5" />
              <span className="font-ui">Attendance</span>
            </NavLink>

            <NavLink to="/my-certificates" className={navLinkClass}>
              <Shield className="w-4.5 h-4.5" />
              <span className="font-ui">My Certificates</span>
            </NavLink>
          </>
        )}

        <p className="inline-block px-4 pt-6 mb-[0.85rem] text-[0.82rem] font-ui font-bold text-[var(--gold-dark,#B8860B)] uppercase tracking-[0.18em]">
          Account
        </p>

        <NavLink to="/profile" className={navLinkClass}>
          <User className="w-4.5 h-4.5" />
          <span className="font-ui">My Profile</span>
        </NavLink>
      </nav>

      {/* Footer — Logged-in user */}
      <div className="px-4 py-4 border-t border-gold/10 bg-primary/10">
        <div className="flex items-center gap-3">
          {profileImage && !profileImageFailed ? (
            <img
              src={profileImage}
              alt={displayName}
              onError={() => setProfileImageFailed(true)}
              className="w-10 h-10 rounded-full object-cover border border-gold/30 shrink-0 bg-gold/10"
            />
          ) : (
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-primary-dark font-bold text-sm shrink-0">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-ui font-bold text-white truncate" title={displayName}>
              {displayName}
            </p>
            {displayEmail && (
              <p className="text-[11px] font-ui text-white/50 truncate" title={displayEmail}>
                {displayEmail}
              </p>
            )}
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-ui font-bold uppercase tracking-wide bg-gold text-primary-dark rounded">
              {displayRole}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-gold/60 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors duration-300"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
