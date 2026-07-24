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
  ["department_head", { userRole: "department_head", accessRole: "department_head" }],
  ["departmenthead", { userRole: "department_head", accessRole: "department_head" }],
  ["head", { userRole: "department_head", accessRole: "department_head" }],
  ["team_member", { userRole: "member", accessRole: "team_member" }],
  ["teammember", { userRole: "member", accessRole: "team_member" }],
  ["member", { userRole: "member", accessRole: "team_member" }],
  ["user", { userRole: "member", accessRole: "team_member" }],
  ["intern", { userRole: "intern", accessRole: "team_member" }],
  ["volunteer", { userRole: "volunteer", accessRole: "team_member" }],
]);

export const SUPPORTED_PROVISION_ROLES = ["super_admin", "admin", "department_head", "team_member", "member", "intern", "volunteer"];
export const resolveRoleMapping = (value = "team_member") => ROLE_MAPPINGS.get(canonicalRoleKey(value)) || null;
export const normalizeRole = (value = "team_member") => resolveRoleMapping(value)?.accessRole || "team_member";
export const normalizeUserRole = (value = "team_member") => resolveRoleMapping(value)?.userRole || "member";
export const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

const namePrefix = (name = "") => {
  const firstToken = String(name).trim().split(/\s+/).find(Boolean);
  return String(firstToken || "USER").replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "USER";
};

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

export const findMongoUserFromFirebase = async (firebaseUser) => {
  const uid = String(firebaseUser?.uid || "").trim();
  const email = normalizeEmail(firebaseUser?.email);
  const or = [];
  if (uid) or.push({ firebaseUid: uid }, { firebaseUID: uid }, { userId: uid });
  if (email) or.push({ email });
  return or.length ? User.findOne({ $or: or }) : null;
};

export const getOrCreateAccessForExistingUser = async (user, firebaseUser, { mustChangePassword = false } = {}) => {
  let access = await UserAccess.findOne({ user: user._id });
  if (access) {
    if (!access.firebaseUid && firebaseUser?.uid) { access.firebaseUid = firebaseUser.uid; await access.save(); }
    return access;
  }
  const uniqueId = String(user.memberId || "").trim().toUpperCase() || await generateUniqueUserId(user.name || firebaseUser?.name || "USER");
  access = await UserAccess.create({
    user: user._id,
    firebaseUid: firebaseUser?.uid || user.firebaseUid || undefined,
    uniqueId,
    role: normalizeRole(user.role),
    isActive: user.status !== "inactive",
    mustChangePassword,
  });
  if (!user.memberId) { user.memberId = uniqueId; await user.save(); }
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
