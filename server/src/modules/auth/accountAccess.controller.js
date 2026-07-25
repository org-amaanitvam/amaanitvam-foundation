import { getAuth } from "firebase-admin/auth";
import User from "../users/user.model.js";
import UserAccess from "./userAccess.model.js";
import {
  SUPPORTED_PROVISION_ROLES,
  findMongoUserFromFirebase,
  generateTemporaryPassword,
  generateUniqueUserId,
  getOrCreateAccessForExistingUser,
  normalizeEmail,
  normalizeRole,
  resolveRoleMapping,
  validateNewPassword,
  writeAuthAudit,
} from "./authentication.helpers.js";
import { sendCredentialEmail } from "./credentialEmail.service.js";

const publicUser = (user, access) => ({
  id: user?._id,
  name: user?.name || "",
  email: user?.email || "",
  department: user?.department || "",
  team: access?.team || user?.team || "",
  uniqueId: access?.uniqueId || user?.memberId || "",
  role: access?.role || normalizeRole(user?.role),
  userRole: user?.role || "",
  permissions: access?.permissions || [],
  isActive: access?.isActive !== false && user?.status !== "inactive",
  mustChangePassword: access?.mustChangePassword === true,
});

const superAdminEmail = () => normalizeEmail(process.env.ADMIN_EMAIL || process.env.DONATION_ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL);

export const resolveLoginIdentifier = async (req, res, next) => {
  try {
    const identifier = String(req.body?.identifier ?? req.body?.username ?? req.body?.email ?? "").trim();
    if (!identifier) return res.status(400).json({ success: false, message: "Email or Unique ID is required." });
    let user = null;
    let access = null;
    if (identifier.includes("@")) {
      user = await User.findOne({ email: normalizeEmail(identifier) });
      if (user) access = await UserAccess.findOne({ user: user._id });
    } else {
      access = await UserAccess.findOne({ uniqueId: identifier.toUpperCase() });
      if (access) user = await User.findById(access.user);
      if (!user) {
        user = await User.findOne({ memberId: identifier.toUpperCase() });
        if (user) access = await UserAccess.findOne({ user: user._id });
      }
    }
    if (!user || user.status === "inactive" || access?.isActive === false) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }
    return res.json({ success: true, email: normalizeEmail(user.email) });
  } catch (error) { next(error); }
};

export const bootstrapSuperAdmin = async (req, res, next) => {
  try {
    const authenticatedEmail = normalizeEmail(req.user?.email);
    const configuredEmail = superAdminEmail();
    if (!configuredEmail) return res.status(503).json({ success: false, message: "ADMIN_EMAIL, DONATION_ADMIN_EMAIL, or SUPER_ADMIN_EMAIL must be configured before bootstrap." });
    if (!authenticatedEmail || authenticatedEmail !== configuredEmail) return res.status(403).json({ success: false, message: "Only the configured administrator account can bootstrap Super Admin access." });
    const user = await findMongoUserFromFirebase(req.user);
    if (!user) return res.status(404).json({ success: false, message: "The configured administrator exists in Firebase but no matching MongoDB User document was found." });
    let access = await UserAccess.findOne({ user: user._id });
    if (!access) {
      const uniqueId = String(user.memberId || "").trim().toUpperCase() || await generateUniqueUserId(user.name || req.user.name || "ADMIN");
      access = await UserAccess.create({ user: user._id, firebaseUid: req.user.uid, uniqueId, role: "super_admin", isActive: true, mustChangePassword: false });
      if (!user.memberId) { user.memberId = uniqueId; await user.save(); }
    } else {
      access.role = "super_admin"; access.isActive = true; access.mustChangePassword = false;
      if (!access.firebaseUid) access.firebaseUid = req.user.uid;
      await access.save();
      if (!user.memberId && access.uniqueId) { user.memberId = access.uniqueId; await user.save(); }
    }
    await writeAuthAudit({ req, user, access, action: "BOOTSTRAP_SUPER_ADMIN", success: true });
    return res.json({ success: true, user: publicUser(user, access) });
  } catch (error) { next(error); }
};

export const getSession = async (req, res, next) => {
  try {
    const user = await findMongoUserFromFirebase(req.user);
    if (!user) {
      await writeAuthAudit({ req, action: "SESSION_REJECTED_UNKNOWN_USER", success: false });
      return res.status(403).json({ success: false, code: "USER_NOT_REGISTERED", message: "Authenticated Firebase user is not registered in MongoDB." });
    }
    const access = await getOrCreateAccessForExistingUser(user, req.user, { mustChangePassword: false });
    if (!access.isActive || user.status === "inactive") {
      await writeAuthAudit({ req, user, access, action: "SESSION_REJECTED_INACTIVE", success: false });
      return res.status(403).json({ success: false, code: "ACCOUNT_INACTIVE", message: "This account is inactive." });
    }
    access.lastLoginAt = new Date(); await access.save();
    await writeAuthAudit({ req, user, access, action: "SESSION_VALIDATED", success: true });
    return res.json({ success: true, authProvider: "firebase", session: { firebaseUid: req.user.uid, emailVerified: req.user.email_verified === true }, user: publicUser(user, access) });
  } catch (error) { next(error); }
};

export const provisionUser = async (req, res, next) => {
  let createdFirebaseUid = null;
  try {
    const { name, email, role = "team_member", department = "", team = "", permissions = [] } = req.body || {};
    const cleanName = String(name || "").trim();
    const cleanEmail = normalizeEmail(email);
    const roleMapping = resolveRoleMapping(role);
    if (!cleanName || !cleanEmail) return res.status(400).json({ success: false, message: "name and email are required." });
    if (!roleMapping) return res.status(400).json({ success: false, message: `Unsupported role. Allowed roles: ${SUPPORTED_PROVISION_ROLES.join(", ")}` });
    const { userRole, accessRole } = roleMapping;
    if (await User.findOne({ email: cleanEmail })) return res.status(409).json({ success: false, message: "A MongoDB user with this email already exists." });
    try {
      const orphanFirebaseUser = await getAuth().getUserByEmail(cleanEmail);

      if (orphanFirebaseUser?.uid === req.user?.uid) {
        return res.status(409).json({
          success: false,
          code: "SELF_FIREBASE_ACCOUNT_CONFLICT",
          message:
            "The requested email belongs to your currently authenticated administrator account and cannot be replaced.",
        });
      }

      await getAuth().deleteUser(orphanFirebaseUser.uid);

      await writeAuthAudit({
        req,
        action: "ORPHAN_FIREBASE_ACCOUNT_REMOVED_BEFORE_PROVISION",
        success: true,
        metadata: {
          targetEmail: cleanEmail,
          orphanFirebaseUid: orphanFirebaseUser.uid,
        },
      });
    } catch (error) {
      if (error?.code !== "auth/user-not-found") {
        throw error;
      }
    }
    const temporaryPassword = generateTemporaryPassword();
    const uniqueId = await generateUniqueUserId(cleanName);
    const firebaseUser = await getAuth().createUser({ email: cleanEmail, password: temporaryPassword, displayName: cleanName, disabled: false });
    createdFirebaseUid = firebaseUser.uid;
    const user = await User.create({ name: cleanName, email: cleanEmail, firebaseUid: firebaseUser.uid, role: userRole, status: "active", department: String(department || "").trim(), memberId: uniqueId });
    const access = await UserAccess.create({
      user: user._id,
      firebaseUid: firebaseUser.uid,
      uniqueId,
      role: accessRole,
      permissions: Array.isArray(permissions) ? permissions.map((v) => String(v).trim()).filter(Boolean) : [],
      team: String(team || "").trim(),
      isActive: true,
      mustChangePassword: true,
      temporaryPasswordIssuedAt: new Date(),
    });
    let emailResult = null;
    try { emailResult = await sendCredentialEmail({ to: cleanEmail, name: cleanName, uniqueId, temporaryPassword }); }
    catch (emailError) { emailResult = { sent: false, error: emailError.message }; }
    await writeAuthAudit({ req, user, access, action: "USER_PROVISIONED", success: true, metadata: { requestedRole: role, userRole, accessRole, department: user.department, team: access.team, credentialEmailSent: emailResult?.sent === true } });
    return res.status(201).json({
      success: true,
      message: "User created in Firebase and MongoDB. Temporary password was not stored in the database.",
      user: publicUser(user, access),
      credentialEmail: { sent: emailResult?.sent === true, skipped: emailResult?.skipped === true, reason: emailResult?.reason || emailResult?.error || null },
    });
  } catch (error) {
    if (createdFirebaseUid) {
      try { await getAuth().deleteUser(createdFirebaseUid); }
      catch (rollbackError) { console.error("Firebase rollback failed after provisioning error:", rollbackError.message); }
    }
    next(error);
  }
};

export const changeFirstLoginPassword = async (req, res, next) => {
  try {
    const newPassword = String(req.body?.newPassword || "");
    const validationError = validateNewPassword(newPassword);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const user = await findMongoUserFromFirebase(req.user);
    if (!user) return res.status(403).json({ success: false, message: "Authenticated user is not registered in MongoDB." });
    const access = await getOrCreateAccessForExistingUser(user, req.user, { mustChangePassword: false });
    if (!access.isActive || user.status === "inactive") return res.status(403).json({ success: false, code: "ACCOUNT_INACTIVE", message: "This account is inactive." });
    if (!access.mustChangePassword) return res.status(409).json({ success: false, code: "FIRST_LOGIN_CHANGE_NOT_REQUIRED", message: "The first-login password change has already been completed." });
    await getAuth().updateUser(req.user.uid, { password: newPassword });
    await getAuth().revokeRefreshTokens(req.user.uid);
    access.mustChangePassword = false; access.passwordChangedAt = new Date(); await access.save();
    await writeAuthAudit({ req, user, access, action: "FIRST_LOGIN_PASSWORD_CHANGED", success: true });
    return res.json({ success: true, message: "Password changed successfully. Existing refresh tokens were revoked; sign in again with the new password.", mustChangePassword: false, reauthenticationRequired: true });
  } catch (error) { next(error); }
};
