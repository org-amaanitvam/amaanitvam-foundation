const normalize = (input) =>
  String(input || "").trim().toLowerCase();

const DEFAULTS = {
  department_head: [
    "tasks.read",
    "tasks.manage",
    "projects.read",
    "projects.manage",
    "meetings.read",
    "meetings.manage",
    "announcements.read",
    "announcements.manage",
    "reports.read",
    "reports.manage",
    "departments.read",
    "attendance.read",
    "attendance.read.all",
    "attendance.write",
  ],
  team_member: [
    "tasks.read",
    "projects.read",
    "meetings.read",
    "announcements.read",
    "reports.read",
    "departments.read",
    "attendance.read",
    "attendance.write",
  ],
};

const effectivePermissions = (profile) => {
  const role = normalize(
    profile?.role ||
    profile?.accessRole ||
    profile?.userRole,
  );

  if (
    role === "super_admin" ||
    role === "admin"
  ) {
    return new Set(["*"]);
  }

  return new Set(
    [
      ...(DEFAULTS[role] || []),
      ...(Array.isArray(profile?.permissions)
        ? profile.permissions
        : []),
    ]
      .map(normalize)
      .filter(Boolean),
  );
};

export const canAccessPermission = (
  profile,
  ...required
) => {
  const granted =
    effectivePermissions(profile);

  if (granted.has("*")) return true;

  return required
    .map(normalize)
    .filter(Boolean)
    .some((permission) => {
      if (granted.has(permission)) {
        return true;
      }

      const pieces = permission.split(".");

      while (pieces.length > 1) {
        pieces.pop();

        if (
          granted.has(
            `${pieces.join(".")}.*`,
          )
        ) {
          return true;
        }
      }

      return false;
    });
};

const RULES = [
  ["/member-reports", ["reports.manage"]],
  ["/reports", ["reports.read", "reports.manage"]],
  ["/attendance", ["attendance.read", "attendance.write"]],
  ["/meetings", ["meetings.read", "meetings.manage"]],
  ["/tasks", ["tasks.read", "tasks.manage"]],
  ["/announcements", ["announcements.read", "announcements.manage"]],
  ["/projects", ["projects.read", "projects.manage"]],
  ["/departments", ["departments.read", "departments.manage"]],
];

export const canAccessPath = (
  profile,
  pathname,
) => {
  const path = normalize(pathname || "/");

  if (
    path === "/" ||
    path === "/dashboard" ||
    path.startsWith("/profile")
  ) {
    return true;
  }

  const rule = RULES.find(
    ([prefix]) =>
      path === prefix ||
      path.startsWith(`${prefix}/`),
  );

  if (!rule) return true;

  return canAccessPermission(
    profile,
    ...rule[1],
  );
};
