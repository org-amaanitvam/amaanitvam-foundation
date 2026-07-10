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

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [logoError, setLogoError] = useState(false);

  const role = String(userProfile?.role || '').toLowerCase();

  const isAdmin =
    role === 'admin' ||
    role === 'super_admin';

  const displayName =
    userProfile?.name ||
    userProfile?.displayName ||
    userProfile?.email?.split('@')[0] ||
    'Dashboard User';

  const displayEmail = userProfile?.email || '';

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') || 'DU';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `sidebar-nav-link${isActive ? ' active' : ''}`;

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__brand">
        {!logoError ? (
          <img
            src="/logo.jpg"
            alt="Amaanitvam Foundation"
            className="dashboard-sidebar__logo"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="dashboard-sidebar__logo-fallback">
            AF
          </div>
        )}

        <div className="dashboard-sidebar__brand-text">
          <h1>Amaanitvam</h1>
          <p>Foundation</p>
        </div>
      </div>

      <nav className="dashboard-sidebar__nav">
        <p className="dashboard-sidebar__panel-label">
          Dashboard Panel
        </p>

        <p className="dashboard-sidebar__section-title">
          Overview
        </p>

        <NavLink
          to="/dashboard"
          end
          className={navLinkClass}
        >
          <LayoutDashboard />
          <span>Dashboard</span>
        </NavLink>

        <p className="dashboard-sidebar__section-title">
          Team
        </p>

        <NavLink
          to="/meetings"
          className={navLinkClass}
        >
          <CalendarDays />
          <span>Meetings</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={navLinkClass}
        >
          <ClipboardList />
          <span>Tasks</span>
        </NavLink>

        <NavLink
          to="/announcements"
          className={navLinkClass}
        >
          <Megaphone />
          <span>Announcements</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={navLinkClass}
        >
          <FolderKanban />
          <span>Projects</span>
        </NavLink>

        <NavLink
          to="/departments"
          className={navLinkClass}
        >
          <Building2 />
          <span>Departments</span>
        </NavLink>

        <p className="dashboard-sidebar__section-title">
          My Workspace
        </p>

        {isAdmin ? (
          <>
            <NavLink
              to="/member-reports"
              className={navLinkClass}
            >
              <BarChart3 />
              <span>Reports</span>
            </NavLink>

            <NavLink
              to="/attendance"
              className={navLinkClass}
            >
              <CalendarCheck />
              <span>Attendance</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/attendance"
              className={navLinkClass}
            >
              <CalendarCheck />
              <span>Attendance</span>
            </NavLink>

            <NavLink
              to="/my-certificates"
              className={navLinkClass}
            >
              <Shield />
              <span>My Certificates</span>
            </NavLink>
          </>
        )}

        <p className="dashboard-sidebar__section-title">
          Account
        </p>

        <NavLink
          to="/profile"
          className={navLinkClass}
        >
          <UserCircle />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="dashboard-sidebar__footer">
        <div className="dashboard-sidebar__avatar">
          {initials}
        </div>

        <div className="dashboard-sidebar__user">
          <p title={displayName}>
            {displayName}
          </p>

          <span title={displayEmail}>
            {displayEmail ||
              (isAdmin ? 'ADMIN' : 'DASHBOARD')}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="dashboard-sidebar__logout"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut />
        </button>
      </div>
    </aside>
  );
}