import {
  findMongoUserFromFirebase,
  getOrCreateAccessForExistingUser,
  normalizeRole,
} from "../modules/auth/authentication.helpers.js";

const deny = (res, req, code, message, extra = {}) => {
  console.warn(
    `[dashboardAccess] DENY ${code} ` +
      JSON.stringify({
        path: req.originalUrl || req.path,
        uid: req.user?.uid,
        email: req.user?.email,
        role: req.userAccess?.role ?? null,
        uniqueId: req.userAccess?.uniqueId ?? null,
      }),
  );

  return res.status(403).json({ success: false, code, message, ...extra });
};

export const requireDashboardAccess = async (req, res, next) => {
  try {
    const user = await findMongoUserFromFirebase(req.user);

    if (!user) {
      return deny(
        res,
        req,
        "USER_NOT_REGISTERED",
        "This authenticated account is not registered in the dashboard database.",
      );
    }

    const access = await getOrCreateAccessForExistingUser(user, req.user, {
      mustChangePassword: false,
    });

    // Older / partially provisioned records can have role === null, which made
    // every permission check fail. Backfill it from the user document.
    if (!access.role) {
      access.role = normalizeRole(user.role);
      await access.save();
    }

    if (!access.firebaseUid && req.user?.uid) {
      access.firebaseUid = req.user.uid;
      await access.save();
    }

    req.userAccess = access;
    req.dbUser = user;

    if (access.isActive === false || user.status === "inactive") {
      return deny(res, req, "ACCOUNT_INACTIVE", "This account has been deactivated.");
    }

    if (access.mustChangePassword === true) {
      return deny(
        res,
        req,
        "PASSWORD_CHANGE_REQUIRED",
        "You must change your temporary password before accessing the dashboard.",
      );
    }

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
        message: "Dashboard access middleware must run before role middleware.",
      });
    }

    if (req.userAccess.role === "super_admin" || allowed.has(req.userAccess.role)) {
      return next();
    }

    return deny(res, req, "INSUFFICIENT_ROLE", "You do not have permission to perform this action.");
  };
};

const normalizePermissionKey = (input) => String(input || "").trim().toLowerCase();

const ROLE_DEFAULT_PERMISSIONS = Object.freeze({
  department_head: [
    "tasks.read", "tasks.manage",
    "projects.read", "projects.manage",
    "meetings.read", "meetings.manage",
    "announcements.read", "announcements.manage",
    "reports.read", "reports.manage",
    "departments.read",
    "attendance.read", "attendance.read.all", "attendance.write",
  ],
  team_member: [
    "tasks.read",
    "projects.read",
    "meetings.read",
    "announcements.read",
    "reports.read",
    "departments.read",
    "attendance.read", "attendance.write",
  ],
});

export const getEffectivePermissions = (req) => {
  if (req.userAccess?.role === "super_admin") return new Set(["*"]);

  const defaults = ROLE_DEFAULT_PERMISSIONS[req.userAccess?.role] || [];
  const explicit = Array.isArray(req.userAccess?.permissions) ? req.userAccess.permissions : [];

  return new Set([...defaults, ...explicit].map(normalizePermissionKey).filter(Boolean));
};

export const hasPermission = (req, permission) => {
  if (req.userAccess?.role === "super_admin") return true;

  const required = normalizePermissionKey(permission);
  if (!required) return false;

  const granted = getEffectivePermissions(req);
  if (granted.has("*") || granted.has(required)) return true;

  const pieces = required.split(".");
  while (pieces.length > 1) {
    pieces.pop();
    if (granted.has(`${pieces.join(".")}.*`)) return true;
  }

  return false;
};

export const requirePermission = (...requiredPermissions) => {
  const required = requiredPermissions.map(normalizePermissionKey).filter(Boolean);

  return (req, res, next) => {
    if (!req.userAccess) {
      return res.status(500).json({
        success: false,
        message: "Dashboard access middleware must run before permission middleware.",
      });
    }

    if (
      req.userAccess.role === "super_admin" ||
      required.some((permission) => hasPermission(req, permission))
    ) {
      return next();
    }

    return deny(
      res,
      req,
      "INSUFFICIENT_PERMISSION",
      "You do not have the required permission to perform this action.",
      { requiredPermissions: required },
    );
  };
};
