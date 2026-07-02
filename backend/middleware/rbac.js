// middleware/rbac.js
// Role hierarchy: super_admin > admin > member > intern > volunteer

const ROLE_HIERARCHY = {
  super_admin: 5,
  admin: 4,
  member: 3,
  intern: 2,
  volunteer: 1,
};

// ─── 1. Require minimum role level ───────────────────────────────────────────
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

// ─── 2. Require minimum role by hierarchy level ───────────────────────────────
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    const userLevel = ROLE_HIERARCHY[req.user?.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Minimum role required: ${minRole}.`,
      });
    }
    next();
  };
};

// ─── 3. Restrict to own department only (interns/volunteers) ─────────────────
// Admins/super_admins bypass this check automatically
export const requireSameDepartment = (getDepartmentFromReq) => {
  return async (req, res, next) => {
    try {
      // Admins and super_admins can access all departments
      if (['super_admin', 'admin'].includes(req.user.role)) {
        return next();
      }

      const resourceDepartment = await getDepartmentFromReq(req);

      if (!resourceDepartment) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
      }

      const userDept = req.user.department?.toLowerCase().trim();
      const resourceDept = resourceDepartment?.toLowerCase().trim();

      if (!userDept || userDept !== resourceDept) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access resources within your department.',
        });
      }

      next();
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
};

// ─── 4. Attach department filter to req for list queries ─────────────────────
// Use this on GET /list routes — automatically scopes data by department
export const attachDepartmentFilter = (req, res, next) => {
  if (['super_admin', 'admin'].includes(req.user.role)) {
    // Admins see everything — no filter
    req.departmentFilter = {};
  } else {
    // Members/interns/volunteers only see their department
    req.departmentFilter = req.user.department
      ? { department: req.user.department }
      : { department: '__none__' }; // no department = see nothing
  }
  next();
};

// ─── 5. Only allow users to modify their own resource (or admins) ─────────────
export const requireOwnerOrAdmin = (getOwnerIdFromReq) => {
  return async (req, res, next) => {
    try {
      if (['super_admin', 'admin'].includes(req.user.role)) return next();

      const ownerId = await getOwnerIdFromReq(req);
      if (!ownerId) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
      }

      if (ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own resources.',
        });
      }

      next();
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
};
