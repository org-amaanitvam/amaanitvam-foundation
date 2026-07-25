import {
  findMongoUserFromFirebase,
  getOrCreateAccessForExistingUser,
} from "../modules/auth/authentication.helpers.js";

export const requireDashboardAccess = async (
  req,
  res,
  next,
) => {
  try {
    const user =
      await findMongoUserFromFirebase(req.user);

    if (!user) {
      return res.status(403).json({
        success: false,
        code: "USER_NOT_REGISTERED",
        message:
          "This authenticated Firebase account is not registered in the dashboard database.",
      });
    }

    const access =
      await getOrCreateAccessForExistingUser(
        user,
        req.user,
        {
          mustChangePassword: false,
        },
      );

    if (
      !access.isActive ||
      user.status === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_INACTIVE",
        message:
          "This account has been deactivated.",
      });
    }

    if (access.mustChangePassword === true) {
      return res.status(403).json({
        success: false,
        code: "PASSWORD_CHANGE_REQUIRED",
        message:
          "You must change your temporary password before accessing protected dashboard features.",
      });
    }

    req.dbUser = user;
    req.userAccess = access;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles) => {
  const allowed = new Set(allowedRoles);

  return (req, res, next) => {
    if (!req.userAccess) {
      return res.status(500).json({
        success: false,
        message:
          "Dashboard access middleware must run before role middleware.",
      });
    }

    if (!allowed.has(req.userAccess.role)) {
      return res.status(403).json({
        success: false,
        code: "INSUFFICIENT_ROLE",
        message:
          "You do not have permission to perform this action.",
      });
    }

    next();
  };
};

const normalizePermissionKey = (input) =>
  String(input || "").trim().toLowerCase();

const ROLE_DEFAULT_PERMISSIONS = Object.freeze({
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
});

export const getEffectivePermissions = (req) => {
  if (req.userAccess?.role === "super_admin") {
    return new Set(["*"]);
  }

  const defaults =
    ROLE_DEFAULT_PERMISSIONS[
      req.userAccess?.role
    ] || [];

  const explicit = Array.isArray(
    req.userAccess?.permissions,
  )
    ? req.userAccess.permissions
    : [];

  return new Set(
    [...defaults, ...explicit]
      .map(normalizePermissionKey)
      .filter(Boolean),
  );
};

export const hasPermission = (req, permission) => {
  if (req.userAccess?.role === "super_admin") {
    return true;
  }

  const required =
    normalizePermissionKey(permission);

  if (!required) return false;

  const granted = getEffectivePermissions(req);

  if (
    granted.has("*") ||
    granted.has(required)
  ) {
    return true;
  }

  const pieces = required.split(".");

  while (pieces.length > 1) {
    pieces.pop();

    if (
      granted.has(`${pieces.join(".")}.*`)
    ) {
      return true;
    }
  }

  return false;
};

export const requirePermission = (
  ...requiredPermissions
) => {
  const required = requiredPermissions
    .map(normalizePermissionKey)
    .filter(Boolean);

  return (req, res, next) => {
    if (!req.userAccess) {
      return res.status(500).json({
        success: false,
        message:
          "Dashboard access middleware must run before permission middleware.",
      });
    }

    if (
      req.userAccess.role === "super_admin" ||
      required.some((permission) =>
        hasPermission(req, permission),
      )
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: "INSUFFICIENT_PERMISSION",
      message:
        "You do not have the required permission to perform this action.",
      requiredPermissions: required,
    });
  };
};
