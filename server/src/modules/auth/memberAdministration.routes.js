import express from "express";
import { getAuth } from "firebase-admin/auth";
import { authenticate } from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requireRole,
} from "../../middleware/dashboardAccess.js";
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

router.use(
  authenticate,
  requireDashboardAccess,
  requireRole("super_admin"),
);

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
  isActive:
    user.status !== "inactive" &&
    access?.isActive !== false,
});

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

const deactivateMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
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

const activateMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
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

const updateMemberRole = async (req, res, next) => {
  try {
    const requestedRole =
      req.body?.role ??
      req.body?.newRole ??
      req.body?.userRole ??
      "";

    const mapping = resolveRoleMapping(requestedRole);

    if (!mapping) {
      return res.status(400).json({
        success: false,
        message:
          `Unsupported role. Allowed roles: ${SUPPORTED_PROVISION_ROLES.join(", ")}`,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    user.role = mapping.userRole;
    await user.save();

    const access = await getOrCreateAccessForExistingUser(
      user,
      {
        uid: user.firebaseUid || "",
        email: user.email,
        name: user.name,
      },
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
      metadata: {
        requestedRole,
        userRole: mapping.userRole,
        accessRole: mapping.accessRole,
      },
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

const permanentlyDeleteMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
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
      wasActive:
        user.status !== "inactive" &&
        access?.isActive !== false,
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
      message:
        "Member permanently deleted from Firebase Authentication and MongoDB. Audit history was preserved.",
      deleted: {
        id: snapshot.targetUserId,
        email: snapshot.targetEmail,
        uniqueId: snapshot.targetUniqueId,
        firebaseDeleted: Boolean(firebaseUid),
        mongoUserDeleted: true,
        mongoAccessDeleted: true,
        auditHistoryPreserved: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

for (const method of ["patch", "put", "post"]) {
  router[method]("/:id/deactivate", deactivateMember);
  router[method]("/:id/activate", activateMember);
  router[method]("/:id/role", updateMemberRole);
}

router.delete("/:id", permanentlyDeleteMember);

export default router;
