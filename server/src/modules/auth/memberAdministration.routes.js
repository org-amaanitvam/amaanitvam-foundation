import express from "express";
import { getAuth } from "firebase-admin/auth";
import { authenticate } from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requireRole,
} from "../../middleware/dashboardAccess.js";
import Department from "../departments/department.model.js";
import User from "../users/user.model.js";
import UserAccess from "./userAccess.model.js";
import {
  getOrCreateAccessForExistingUser,
  normalizeEmail,
  resolveRoleMapping,
  SUPPORTED_PROVISION_ROLES,
  writeAuthAudit,
} from "./authentication.helpers.js";

const router = express.Router();

// ─── Security Middleware ───────────────────────────────────────────────────
// Requirement: Every route in this module requires valid authentication and active dashboard permissions.
router.use(authenticate, requireDashboardAccess);

// Helper for restricting actions strictly to super administrators
const requireSuperAdmin = requireRole("super_admin");

// ─── Payload Serializer ────────────────────────────────────────────────────
// Requirement: Unifies user database documents and UserAccess credentials into a single clean frontend payload.
const memberPayload = (user, access = null) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  status: user.status,
  department: user.department || "",
  designation: user.designation || "",
  domain: user.domain || "",
  memberId: user.memberId || access?.uniqueId || "",
  firebaseUid: user.firebaseUid || access?.firebaseUid || "",
  accessRole: access?.role || "",
  permissions: Array.isArray(access?.permissions) ? access.permissions : [],
  team: access?.team || "",
  mustChangePassword: access?.mustChangePassword === true,
  isActive: user.status !== "inactive" && access?.isActive !== false,
  createdAt: user.createdAt || null,
  updatedAt: user.updatedAt || null,
});

const normalizeText = (value) => String(value ?? "").trim();

const escapedExact = (value) =>
  new RegExp(
    `^${normalizeText(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i",
  );

// ─── Permission Scope Helper ────────────────────────────────────────────────
// Requirement: Ensures Department Heads can only manage/view members within their own department,
// while Super Admins have global access.
const canReadMember = (req, user) => {
  if (req.userAccess?.role === "super_admin") return true;

  if (String(user?._id || "") === String(req.dbUser?._id || "")) {
    return true;
  }

  if (req.userAccess?.role === "department_head") {
    const ownDepartment = normalizeText(req.dbUser?.department).toLowerCase();
    const targetDepartment = normalizeText(user?.department).toLowerCase();
    return Boolean(
      ownDepartment &&
      targetDepartment &&
      ownDepartment === targetDepartment
    );
  }

  return false;
};

// ─── Controller Functions ───────────────────────────────────────────────────

// 1. List Members (Scoped by role)
const listMembers = async (req, res, next) => {
  try {
    let query = {};

    if (req.userAccess?.role === "department_head") {
      const department = normalizeText(req.dbUser?.department);
      if (!department) {
        return res.json({ success: true, members: [], scope: "department" });
      }
      query = {
        department: escapedExact(department),
        status: { $ne: "inactive" },
      };
    } else if (req.userAccess?.role !== "super_admin") {
      query = { _id: req.dbUser._id };
    }

    const users = await User.find(query).sort({ name: 1, createdAt: -1 });
    const ids = users.map((user) => user._id);
    const accesses = ids.length
      ? await UserAccess.find({ user: { $in: ids } })
      : [];
    const accessByUser = new Map(
      accesses.map((access) => [String(access.user), access]),
    );

    return res.json({
      success: true,
      members: users.map((user) =>
        memberPayload(user, accessByUser.get(String(user._id))),
      ),
      scope:
        req.userAccess?.role === "super_admin"
          ? "all"
          : req.userAccess?.role === "department_head"
            ? "department"
            : "self",
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Single Member
const getMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }
    if (!canReadMember(req, user)) {
      return res.status(403).json({
        success: false,
        code: "MEMBER_SCOPE_DENIED",
        message: "You cannot view this member.",
      });
    }
    const access = await UserAccess.findOne({ user: user._id });
    return res.json({ success: true, member: memberPayload(user, access) });
  } catch (error) {
    next(error);
  }
};

// 3. Sync Department Membership Helper
const syncDepartmentMembership = async (user, requestedDepartment) => {
  const cleanDepartment = normalizeText(requestedDepartment);
  let target = null;

  if (cleanDepartment) {
    target = await Department.findOne({ departmentName: cleanDepartment });
    if (!target) {
      const error = new Error(`Department "${cleanDepartment}" was not found.`);
      error.statusCode = 404;
      throw error;
    }
  }

  const currentDepartments = await Department.find({ "members.user": user._id });
  for (const department of currentDepartments) {
    department.members = department.members.filter(
      (member) => String(member.user) !== String(user._id),
    );
    if (
      department.departmentHead &&
      String(department.departmentHead) === String(user._id) &&
      (!target || String(target._id) !== String(department._id))
    ) {
      department.departmentHead = null;
    }
    department.totalMembers = department.members.length;
    await department.save();
  }

  if (target) {
    const exists = target.members.some(
      (member) => String(member.user) === String(user._id),
    );
    if (!exists) {
      target.members.push({
        user: user._id,
        role: user.role === "department_head" ? "department_head" : "member",
        joinedAt: new Date(),
      });
    }
    target.totalMembers = target.members.length;
    await target.save();
    user.department = target.departmentName;
  } else {
    user.department = "";
  }
};

// 4. Update Member Details
const updateMemberDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const previous = {
      name: user.name,
      phone: user.phone || "",
      department: user.department || "",
      designation: user.designation || "",
      domain: user.domain || "",
    };

    if (Object.prototype.hasOwnProperty.call(req.body || {}, "name")) {
      const name = normalizeText(req.body.name);
      if (!name) {
        return res.status(400).json({ success: false, message: "Name cannot be empty." });
      }
      user.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "phone")) {
      user.phone = normalizeText(req.body.phone);
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "designation")) {
      user.designation = normalizeText(req.body.designation);
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "domain")) {
      user.domain = normalizeText(req.body.domain);
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "department")) {
      await syncDepartmentMembership(user, req.body.department);
    }

    await user.save();

    const access = await getOrCreateAccessForExistingUser(
      user,
      { uid: user.firebaseUid || "", email: user.email, name: user.name },
      { mustChangePassword: false },
    );

    if (Object.prototype.hasOwnProperty.call(req.body || {}, "team")) {
      access.team = normalizeText(req.body.team);
      await access.save();
    }

    await writeAuthAudit({
      req,
      user,
      access,
      action: "MEMBER_PROFILE_UPDATED",
      success: true,
      metadata: {
        previous,
        current: {
          name: user.name,
          phone: user.phone || "",
          department: user.department || "",
          designation: user.designation || "",
          domain: user.domain || "",
          team: access.team || "",
        },
      },
    });

    return res.json({
      success: true,
      message: "Member profile updated successfully.",
      member: memberPayload(user, access),
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// 5. Update Organization (Department & Team)
const updateOrganization = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const access = await getOrCreateAccessForExistingUser(
      user,
      { uid: user.firebaseUid || "", email: user.email, name: user.name },
      { mustChangePassword: false },
    );

    const previous = { department: user.department || "", team: access.team || "" };

    if (Object.prototype.hasOwnProperty.call(req.body || {}, "department")) {
      await syncDepartmentMembership(user, req.body.department);
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "team")) {
      access.team = normalizeText(req.body.team);
    }

    await user.save();
    await access.save();

    await writeAuthAudit({
      req,
      user,
      access,
      action: "MEMBER_ORGANIZATION_UPDATED",
      success: true,
      metadata: {
        previous,
        current: { department: user.department || "", team: access.team || "" },
      },
    });

    return res.json({
      success: true,
      message: "Department and team assignment updated successfully.",
      member: memberPayload(user, access),
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// 6. Update Permissions
const updatePermissions = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body?.permissions)) {
      return res.status(400).json({
        success: false,
        message: "permissions must be an array of permission keys.",
      });
    }

    const permissions = [...new Set(
      req.body.permissions
        .map((value) => normalizeText(value).toLowerCase())
        .filter(Boolean),
    )];

    const invalid = permissions.find(
      (value) => value.length > 80 || !/^[a-z0-9:_.*-]+$/.test(value),
    );
    if (invalid) {
      return res.status(400).json({
        success: false,
        message: `Invalid permission key: ${invalid}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const access = await getOrCreateAccessForExistingUser(
      user,
      { uid: user.firebaseUid || "", email: user.email, name: user.name },
      { mustChangePassword: false },
    );

    const previousPermissions = [...(access.permissions || [])];
    access.permissions = permissions.slice(0, 100);
    await access.save();

    await writeAuthAudit({
      req,
      user,
      access,
      action: "MEMBER_PERMISSIONS_UPDATED",
      success: true,
      metadata: { previousPermissions, permissions: access.permissions },
    });

    return res.json({
      success: true,
      message: "Member permissions updated successfully.",
      member: memberPayload(user, access),
    });
  } catch (error) {
    next(error);
  }
};

const resolveFirebaseUid = async (user, access = null) => {
  const storedUid = String(
    user?.firebaseUid ||
    access?.firebaseUid ||
    "",
  ).trim();

  if (storedUid) return storedUid;

  const email = normalizeEmail(user?.email);
  if (!email) return "";

  try {
    const firebaseUser = await getAuth().getUserByEmail(email);
    return firebaseUser.uid || "";
  } catch (error) {
    if (error?.code === "auth/user-not-found") return "";
    throw error;
  }
};

const updateFirebaseDisabledState = async (user, access, disabled) => {
  const uid = await resolveFirebaseUid(user, access);
  if (!uid) return;

  try {
    await getAuth().updateUser(uid, { disabled });
    if (disabled) {
      await getAuth().revokeRefreshTokens(uid);
    }
  } catch (error) {
    if (error?.code !== "auth/user-not-found") throw error;
  }
};

// 7. Deactivate Member
const deactivateMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    if (
      String(user._id) === String(req.dbUser?._id) ||
      normalizeEmail(user.email) === normalizeEmail(req.user?.email)
    ) {
      return res.status(400).json({
        success: false,
        code: "SELF_DEACTIVATION_BLOCKED",
        message: "You cannot deactivate your own administrator account.",
      });
    }

    const access = await UserAccess.findOne({ user: user._id });
    user.status = "inactive";
    await user.save();

    if (access) {
      access.isActive = false;
      await access.save();
    }

    await updateFirebaseDisabledState(user, access, true);

    await writeAuthAudit({
      req,
      user,
      access,
      action: "MEMBER_DEACTIVATED",
      success: true,
      metadata: {
        targetEmail: normalizeEmail(user.email),
        targetUniqueId: access?.uniqueId || user.memberId || "",
        targetRole: user.role || "",
      },
    });

    return res.json({
      success: true,
      message: "Member deactivated successfully.",
      member: memberPayload(user, access),
    });
  } catch (error) {
    next(error);
  }
};

// 8. Activate Member
const activateMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const access = await UserAccess.findOne({ user: user._id });
    user.status = "active";
    await user.save();

    if (access) {
      access.isActive = true;
      await access.save();
    }

    await updateFirebaseDisabledState(user, access, false);

    await writeAuthAudit({
      req,
      user,
      access,
      action: "MEMBER_ACTIVATED",
      success: true,
      metadata: {
        targetEmail: normalizeEmail(user.email),
        targetUniqueId: access?.uniqueId || user.memberId || "",
        targetRole: user.role || "",
      },
    });

    return res.json({
      success: true,
      message: "Member activated successfully.",
      member: memberPayload(user, access),
    });
  } catch (error) {
    next(error);
  }
};

// 9. Update Member Role
const updateMemberRole = async (req, res, next) => {
  try {
    const requestedRole =
      req.body?.role ?? req.body?.newRole ?? req.body?.userRole ?? "";

    const mapping = resolveRoleMapping(requestedRole);
    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: `Unsupported role. Allowed roles: ${SUPPORTED_PROVISION_ROLES.join(", ")}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    user.role = mapping.userRole;
    await user.save();

    const access = await getOrCreateAccessForExistingUser(
      user,
      { uid: user.firebaseUid || "", email: user.email, name: user.name },
      { mustChangePassword: false },
    );

    access.role = mapping.accessRole;
    await access.save();

    await writeAuthAudit({
      req,
      user,
      access,
      action: "MEMBER_ROLE_UPDATED",
      success: true,
      metadata: { requestedRole, userRole: mapping.userRole, accessRole: mapping.accessRole },
    });

    return res.json({
      success: true,
      message: "Member role updated successfully.",
      member: memberPayload(user, access),
    });
  } catch (error) {
    next(error);
  }
};

// 10. Permanently Delete Member
const permanentlyDeleteMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    if (
      String(user._id) === String(req.dbUser?._id) ||
      normalizeEmail(user.email) === normalizeEmail(req.user?.email)
    ) {
      return res.status(400).json({
        success: false,
        code: "SELF_DELETE_BLOCKED",
        message: "You cannot permanently delete your own administrator account.",
      });
    }

    const access = await UserAccess.findOne({ user: user._id });
    const firebaseUid = await resolveFirebaseUid(user, access);

    const snapshot = {
      targetUserId: String(user._id),
      targetFirebaseUid: firebaseUid,
      targetEmail: normalizeEmail(user.email),
      targetName: user.name || "",
      targetUniqueId: access?.uniqueId || user.memberId || "",
      targetRole: user.role || "",
      targetAccessRole: access?.role || "",
      targetDepartment: user.department || "",
      wasActive: user.status !== "inactive" && access?.isActive !== false,
    };

    if (firebaseUid) {
      try {
        await getAuth().revokeRefreshTokens(firebaseUid);
      } catch (error) {
        if (error?.code !== "auth/user-not-found") throw error;
      }
      try {
        await getAuth().deleteUser(firebaseUid);
      } catch (error) {
        if (error?.code !== "auth/user-not-found") throw error;
      }
    }

    await UserAccess.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });

    await writeAuthAudit({
      req,
      user,
      access,
      action: "MEMBER_PERMANENTLY_DELETED",
      success: true,
      metadata: snapshot,
    });

    return res.json({
      success: true,
      message: "Member permanently deleted from Firebase Auth and MongoDB.",
      deleted: { id: snapshot.targetUserId, email: snapshot.targetEmail, mongoUserDeleted: true },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Route Mappings ────────────────────────────────────────────────────────
router.get("/", listMembers);
router.get("/:id", getMember);

router.put("/:id", requireSuperAdmin, updateMemberDetails);
router.patch("/:id", requireSuperAdmin, updateMemberDetails);
router.put("/:id/organization", requireSuperAdmin, updateOrganization);
router.patch("/:id/organization", requireSuperAdmin, updateOrganization);
router.put("/:id/permissions", requireSuperAdmin, updatePermissions);
router.patch("/:id/permissions", requireSuperAdmin, updatePermissions);

for (const method of ["patch", "put", "post"]) {
  router[method]("/:id/deactivate", requireSuperAdmin, deactivateMember);
  router[method]("/:id/activate", requireSuperAdmin, activateMember);
  router[method]("/:id/role", requireSuperAdmin, updateMemberRole);
}

router.delete("/:id", requireSuperAdmin, permanentlyDeleteMember);

export default router;