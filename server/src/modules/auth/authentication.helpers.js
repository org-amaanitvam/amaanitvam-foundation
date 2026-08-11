import crypto from "node:crypto";
import User from "../users/user.model.js";
import UserAccess from "./userAccess.model.js";
import AuthAudit from "./authAudit.model.js";

const canonicalRoleKey = (value = "") => String(value).trim().toLowerCase().replace(/[-\s]+/g, "_");

const ROLE_MAPPINGS = new Map([
  ["super_admin", { userRole: "super_admin", accessRole: "super_admin" }],
  ["superadmin", { userRole: "super_admin", accessRole: "super_admin" }],
  ["admin", { userRole: "admin", accessRole: "super_admin" }],
  ["administrator", { userRole: "admin", accessRole: "super_admin" }],
  ["coordinator", { userRole: "coordinator", accessRole: "department_head" }],
  ["hod", { userRole: "hod", accessRole: "department_head" }],
  ["department_head", { userRole: "department_head", accessRole: "department_head" }],
  ["departmenthead", { userRole: "department_head", accessRole: "department_head" }],
  ["head", { userRole: "department_head", accessRole: "department_head" }],
  ["faculty", { userRole: "faculty", accessRole: "department_head" }],
  ["team_member", { userRole: "member", accessRole: "team_member" }],
  ["teammember", { userRole: "member", accessRole: "team_member" }],
  ["member", { userRole: "member", accessRole: "team_member" }],
  ["user", { userRole: "member", accessRole: "team_member" }],
  ["staff", { userRole: "staff", accessRole: "team_member" }],
  ["student", { userRole: "student", accessRole: "team_member" }],
  ["intern", { userRole: "intern", accessRole: "team_member" }],
  ["volunteer", { userRole: "volunteer", accessRole: "team_member" }],
]);

export const SUPPORTED_PROVISION_ROLES = ["super_admin", "admin", "coordinator", "hod", "department_head", "faculty", "team_member", "member", "staff", "student", "intern", "volunteer"];
export const resolveRoleMapping = (value = "team_member") => ROLE_MAPPINGS.get(canonicalRoleKey(value)) || null;
export const normalizeRole = (value = "team_member") => resolveRoleMapping(value)?.accessRole || "team_member";
export const normalizeUserRole = (value = "team_member") => resolveRoleMapping(value)?.userRole || "member";
export const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

const namePrefix = (name = "") => {
  const firstToken = String(name).trim().split(/\s+/).find(Boolean);
  return String(firstToken || "USER").replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "USER";
};

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const generateUniqueUserId = async (name) => {
  const prefix = namePrefix(name);
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const randomNumber = crypto.randomInt(0, 1000).toString().padStart(3, "0");
    const uniqueId = `${prefix}${randomNumber}`;
    if (!(await UserAccess.exists({ uniqueId }))) return uniqueId;
  }
  throw new Error("Unable to generate a unique user ID after 1000 attempts.");
};

export const generateTemporaryPassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*?";
  const all = `${upper}${lower}${digits}${special}`;
  const pick = (chars) => chars[crypto.randomInt(0, chars.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  while (chars.length < 14) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};

export const validateNewPassword = (password) => {
  const value = String(password || "");
  if (value.length < 10) return "Password must be at least 10 characters long.";
  if (!/[A-Z]/.test(value)) return "Password must include at least one uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must include at least one lowercase letter.";
  if (!/\d/.test(value)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include at least one special character.";
  return null;
};

// FIX: the User schema stores the Firebase UID as `firebase_uid` (snake_case).
// The previous lookup only queried camelCase variants, so every dashboard request
// fell back to an exact-case email match — and returned null whenever the stored
// email casing differed, producing a blanket 403 USER_NOT_REGISTERED.
export const findMongoUserFromFirebase = async (firebaseUser) => {
  const uid = String(firebaseUser?.uid || firebaseUser?.firebase_uid || firebaseUser?.firebaseUid || "").trim();
  const email = normalizeEmail(firebaseUser?.email);
  const or = [];
  if (uid) {
    or.push(
      { firebase_uid: uid },
      { firebaseUid: uid },
      { firebaseUID: uid },
      { uid },
      { userId: uid },
    );
  }
  if (email) {
    const emailRegex = new RegExp(`^${escapeRegex(email)}$`, "i");
    or.push({ email: emailRegex });
  }
  if (!or.length) return null;

  const user = await User.findOne({ $or: or });

  // Backfill the UID so subsequent lookups do not depend on the email at all.
  if (user && uid && !user.firebase_uid) {
    user.firebase_uid = uid;
    try {
      await user.save();
    } catch {
      /* non-fatal: a duplicate-key race just means another request won */
    }
  }

  return user;
};

// FIX: an existing UserAccess row was returned verbatim, so it kept whatever role
// and flags it was created with. Promoting a user in the `users` collection never
// reached UserAccess, and rows provisioned with the default
// `mustChangePassword: true` blocked every dashboard route with a 403 even after
// the password had been changed. Keep the row in sync with the source of truth.
export const getOrCreateAccessForExistingUser = async (user, firebaseUser, { mustChangePassword = false } = {}) => {
  let access = await UserAccess.findOne({ user: user._id });

  if (access) {
    let dirty = false;

    if (!access.firebaseUid && firebaseUser?.uid) {
      access.firebaseUid = firebaseUser.uid;
      dirty = true;
    }

    const expectedRole = normalizeRole(user.role);
    if (expectedRole && access.role !== expectedRole) {
      access.role = expectedRole;
      dirty = true;
    }

    const expectedActive = user.status !== "inactive" && user.status !== "suspended";
    if (access.isActive !== expectedActive) {
      access.isActive = expectedActive;
      dirty = true;
    }

    // A change-password gate is only meaningful while an unused temporary
    // password is outstanding. Stale `true` flags are cleared here.
    if (access.mustChangePassword === true) {
      const temporaryOutstanding =
        Boolean(access.temporaryPasswordIssuedAt) &&
        (!access.passwordChangedAt || access.passwordChangedAt < access.temporaryPasswordIssuedAt);
      if (!temporaryOutstanding) {
        access.mustChangePassword = false;
        dirty = true;
      }
    }

    if (dirty) await access.save();
    return access;
  }

  const uniqueId =
    String(user.memberId || user.member_id || "").trim().toUpperCase() ||
    (await generateUniqueUserId(user.name || firebaseUser?.name || "USER"));

  access = await UserAccess.create({
    user: user._id,
    firebaseUid: firebaseUser?.uid || user.firebase_uid || user.firebaseUid || undefined,
    uniqueId,
    role: normalizeRole(user.role),
    isActive: user.status !== "inactive" && user.status !== "suspended",
    mustChangePassword,
  });

  if (!user.memberId && !user.member_id) {
    user.member_id = uniqueId;
    try {
      await user.save();
    } catch {
      /* non-fatal */
    }
  }

  return access;
};

export const writeAuthAudit = async ({ req, user = null, access = null, action, success = true, metadata = {} }) => {
  try {
    await AuthAudit.create({
      user: user?._id || null,
      firebaseUid: req?.user?.uid || access?.firebaseUid || "",
      uniqueId: access?.uniqueId || "",
      email: normalizeEmail(req?.user?.email || user?.email),
      action,
      success,
      ip: req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || req?.ip || "",
      userAgent: req?.headers?.["user-agent"] || "",
      metadata,
    });
  } catch (error) { console.error("Auth audit write failed:", error.message); }
};
