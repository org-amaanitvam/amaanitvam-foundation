import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCog,
  Heart,
  Award,
  Globe,
  LogOut,
  Image,
  Settings as SettingsIcon,
  User,
  BookOpen,
  MessageSquare // <-- Added the new icon here
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../config/api.js';

export default function Sidebar() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('Amaanitvam Foundation');
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

  const firstWord = orgName.split(' ')[0] || 'Amaanitvam';
  const restWords = orgName.split(' ').slice(1).join(' ') || 'Foundation';

  return (
    <aside className="admin-sidebar fixed top-0 left-0 z-50 flex h-screen w-64 flex-col">
      <div className="px-6 py-6 border-b border-white/10 bg-white/0">
        <div className="flex items-center gap-4">
          <img
            alt="Amaanitvam Foundation"
            className="h-12 w-12 rounded bg-white object-contain p-1"
            src="/assets/images/logo.jpg"
          />

          <div className="flex flex-col justify-center">
            <h1 className="brand-title text-2xl font-bold tracking-tight leading-none uppercase">
              {firstWord}
            </h1>
            <p className="brand-subtitle text-[11px] uppercase tracking-[0.25em] font-semibold mt-1 leading-none">
              {restWords}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
          <>
            <p className="admin-panel-label px-1 pb-4">Admin Panel</p>

            <p className="sidebar-section-title px-4 pt-2 mb-3">Management</p>

            <NavLink to="/candidates" className={navLinkClass}>
              <Users className="w-[18px] h-[18px]" />
              <span>Candidates</span>
            </NavLink>

            <NavLink to="/members" className={navLinkClass}>
              <UserCog className="w-[18px] h-[18px]" />
              <span>Members</span>
            </NavLink>

            <NavLink to="/donations" className={navLinkClass}>
              <Heart className="w-[18px] h-[18px]" />
              <span>Donations</span>
            </NavLink>

            <NavLink to="/learning-hub" className={navLinkClass}>
              <BookOpen className="w-[18px] h-[18px]" />
              <span>Learning Hub</span>
            </NavLink>

            {/* ---> NEW CONTACT MESSAGES LINK ADDED HERE <--- */}
            <NavLink to="/contact-messages" className={navLinkClass}>
              <MessageSquare className="w-[18px] h-[18px]" />
              <span>Contact Inquiries</span>
            </NavLink>

            <p className="sidebar-section-title px-4 pt-6 mb-3">Tools</p>

            <NavLink to="/certificates" className={navLinkClass}>
              <Award className="w-[18px] h-[18px]" />
              <span>Certificates</span>
            </NavLink>

            <NavLink to="/cms" className={navLinkClass}>
              <Globe className="w-[18px] h-[18px]" />
              <span>Website CMS</span>
            </NavLink>

            <NavLink to="/gallery" className={navLinkClass}>
              <Image className="w-[18px] h-[18px]" />
              <span>Gallery Media</span>
            </NavLink>

            <NavLink to="/settings" className={navLinkClass}>
              <SettingsIcon className="w-[18px] h-[18px]" />
              <span>System Settings</span>
            </NavLink>
          </>
        )}

        {(userProfile?.role === 'member' || userProfile?.role === 'intern') && (
          <>
            <p className="sidebar-section-title px-4 pt-6 mb-3">My Workspace</p>

            <NavLink to="/tasks" className={navLinkClass}>
              <Award className="w-[18px] h-[18px]" />
              <span>My Tasks</span>
            </NavLink>

          </>
        )}

        <p className="sidebar-section-title px-4 pt-6 mb-3">Account</p>

        <NavLink to="/profile" className={navLinkClass}>
          <User className="w-[18px] h-[18px]" />
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="border-t border-white/10 px-4 py-4 bg-white/0">
        <div className="flex items-center gap-3">
          {profileImage && !profileImageFailed ? (
            <img
              src={profileImage}
              alt={displayName}
              onError={() => setProfileImageFailed(true)}
              className="h-10 w-10 shrink-0 rounded-full border border-[#d8a15f]/40 bg-[#d8a15f]/10 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d8a15f] text-sm font-bold text-[#5d0f2d]">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white" title={displayName}>
              {displayName}
            </p>

            {displayEmail && (
              <p className="truncate text-[11px] text-white/55" title={displayEmail}>
                {displayEmail}
              </p>
            )}

            <span className="mt-1 inline-block rounded bg-[#d8a15f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5d0f2d]">
              {displayRole}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="rounded-lg p-2 text-[#d8a15f]/70 transition-colors duration-300 hover:bg-[#d8a15f]/10 hover:text-[#d8a15f]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}