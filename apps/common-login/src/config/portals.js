// Portal routing configuration
// Maps user roles to the portal they should be redirected to after login.

const DEV_URLS = {
  admin: 'http://localhost:5173',
  dashboard: 'http://localhost:5174',
  website: 'http://localhost:5175',
  login: 'http://localhost:5176',
  lms: 'http://localhost:5177',
};

const PROD_URLS = {
  admin: 'https://admin.amaanitvam.org',
  dashboard: 'https://dashboard.amaanitvam.org',
  website: 'https://www.amaanitvam.org',
  lms: 'https://lms.amaanitvam.org',
  login: 'https://login.amaanitvam.org',
  lms: 'https://learn.amaanitvam.org',
};

const urls = import.meta.env.DEV ? DEV_URLS : PROD_URLS;

export const PORTAL_CONFIG = {
  admin: {
    name: 'Admin Portal',
    url: import.meta.env.VITE_ADMIN_PORTAL_URL || urls.admin,
    description: 'Foundation management & administration',
    icon: '🛡️',
    roles: ['super_admin', 'admin'],
  },
  dashboard: {
    name: 'Dashboard',
    url: import.meta.env.VITE_DASHBOARD_URL || urls.dashboard,
    description: 'Team workspace, tasks & meetings',
    icon: '📊',
    roles: [
      'coordinator',
      'hod',
      'department_head',
      'team_member',
      'member',
      'staff',
      'intern',
      'volunteer',
    ],
  },
  lms: {
    name: 'Learning Portal',
    url: import.meta.env.VITE_LMS_URL || urls.lms,
    description: 'Courses, resources & assignments',
    icon: '📚',
    roles: ['faculty', 'student', 'content_manager'],
  },
};

// Roles that are allowed to pick a portal from the selector screen.
// Per workflow, only super_admin sees the multi-portal chooser.
export const PORTAL_CHOOSER_ROLES = new Set(['super_admin']);

export const normalizeRole = (role) =>
  String(role || '')
    .trim()
    .toLowerCase();

export function resolvePortalForRole(role) {
  const normalizedRole = normalizeRole(role);
  for (const [key, config] of Object.entries(PORTAL_CONFIG)) {
    if (config.roles.includes(normalizedRole)) {
      return { portalKey: key, ...config };
    }
  }
  // Default fallback: dashboard
  return { portalKey: 'dashboard', ...PORTAL_CONFIG.dashboard };
}

export function shouldShowPortalChooser(role) {
  return PORTAL_CHOOSER_ROLES.has(normalizeRole(role));
}

export function getAllPortals() {
  return Object.entries(PORTAL_CONFIG).map(([key, config]) => ({
    portalKey: key,
    ...config,
  }));
}
