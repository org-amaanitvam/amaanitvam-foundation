import express from "express";
import mongoose from "mongoose";
import { getAuth } from "firebase-admin/auth";

const router = express.Router();

const ADMIN_ROLE_VALUES = new Set([
  "admin",
  "administrator",
  "superadmin",
  "super-admin",
  "super_admin",
  "owner",
]);

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalizeRole(value) {
  return clean(value).toLowerCase();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function plain(document) {
  if (!document) return null;
  return JSON.parse(JSON.stringify(document));
}

async function collectionNames() {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB is not connected");
  }

  const collections = await mongoose.connection.db
    .listCollections({}, { nameOnly: true })
    .toArray();

  return collections.map((entry) => entry.name);
}

function rankCollections(names, patterns) {
  return [...names].sort((left, right) => {
    const leftScore = patterns.reduce(
      (score, pattern, index) =>
        score + (pattern.test(left) ? 1000 - index * 10 : 0),
      0
    );
    const rightScore = patterns.reduce(
      (score, pattern, index) =>
        score + (pattern.test(right) ? 1000 - index * 10 : 0),
      0
    );
    return rightScore - leftScore;
  });
}

async function findAdminDocument(decodedToken) {
  const names = await collectionNames();
  const ranked = rankCollections(names, [
    /^admins?$/i,
    /admin/i,
    /^users?$/i,
    /member/i,
    /profile/i,
  ]);

  const email = clean(decodedToken.email).toLowerCase();
  const emailRegex = email
    ? new RegExp(`^${escapeRegex(email)}$`, "i")
    : null;

  const orConditions = [
    { firebaseUid: decodedToken.uid },
    { firebaseUID: decodedToken.uid },
    { uid: decodedToken.uid },
    { userId: decodedToken.uid },
    { authUid: decodedToken.uid },
  ];

  if (emailRegex) {
    orConditions.push(
      { email: emailRegex },
      { username: emailRegex },
      { workEmail: emailRegex }
    );
  }

  for (const name of ranked) {
    if (!/(admin|user|member|profile)/i.test(name)) continue;

    const document = await mongoose.connection.db
      .collection(name)
      .findOne({ $or: orConditions });

    if (document) {
      return {
        collectionName: name,
        document: plain(document),
      };
    }
  }

  return null;
}

function hasAdminRole(decodedToken, profileResult) {
  const environmentAdmins = clean(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL)
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const tokenEmail = clean(decodedToken.email).toLowerCase();

  if (environmentAdmins.includes(tokenEmail)) return true;
  if (decodedToken.admin === true || decodedToken.isAdmin === true) return true;
  if (ADMIN_ROLE_VALUES.has(normalizeRole(decodedToken.role))) return true;

  if (!profileResult) return false;

  const { collectionName, document } = profileResult;

  if (/^admins?$|admin/i.test(collectionName)) return true;
  if (document.isAdmin === true || document.admin === true) return true;

  const roleCandidates = [
    document.role,
    document.type,
    document.userType,
    document.accessLevel,
    document.accountType,
  ];

  return roleCandidates.some((value) =>
    ADMIN_ROLE_VALUES.has(normalizeRole(value))
  );
}

async function requireAdmin(req, res, next) {
  try {
    const authorization = clean(req.headers.authorization);

    if (!authorization.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authorization.slice(7).trim();
    const decodedToken = await getAuth().verifyIdToken(token);
    const profileResult = await findAdminDocument(decodedToken);

    if (!hasAdminRole(decodedToken, profileResult)) {
      return res.status(403).json({
        success: false,
        message: "Administrator access is required",
      });
    }

    req.firebaseUser = decodedToken;
    req.adminProfileResult = profileResult;
    next();
  } catch (error) {
    console.error("[adminRecoveryRoutes] Authentication failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}

async function profileHandler(req, res, next) {
  try {
    const profileResult =
      req.adminProfileResult || (await findAdminDocument(req.firebaseUser));

    const fallback = {
      uid: req.firebaseUser.uid,
      email: req.firebaseUser.email || "",
      name: req.firebaseUser.name || req.firebaseUser.email || "Administrator",
      role: "admin",
    };

    const profile = {
      ...fallback,
      ...(profileResult?.document || {}),
    };

    return res.json({
      success: true,
      profile,
      user: profile,
      admin: profile,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

async function candidateDocuments() {
  const names = await collectionNames();
  const ranked = rankCollections(names, [
    /^candidates?$/i,
    /candidate/i,
    /internship.*application/i,
    /application/i,
    /intern/i,
  ]).filter((name) => /(candidate|application|intern)/i.test(name));

  const collected = [];

  for (const name of ranked) {
    const documents = await mongoose.connection.db
      .collection(name)
      .find({})
      .sort({ createdAt: -1, appliedAt: -1, updatedAt: -1, _id: -1 })
      .limit(1000)
      .toArray();

    for (const document of documents) {
      collected.push({
        ...plain(document),
        id: clean(document._id),
        _sourceCollection: name,
      });
    }
  }

  const seen = new Set();

  return collected.filter((candidate) => {
    const key =
      clean(candidate._id) ||
      clean(candidate.id) ||
      `${clean(candidate.email).toLowerCase()}::${clean(
        candidate.createdAt || candidate.appliedAt
      )}`;

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function candidatesHandler(_req, res, next) {
  try {
    const candidates = await candidateDocuments();

    return res.json({
      success: true,
      count: candidates.length,
      candidates,
      applications: candidates,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
}

async function settingsDocument() {
  const names = await collectionNames();
  const ranked = rankCollections(names, [
    /^settings?$/i,
    /admin.*setting/i,
    /setting/i,
    /config/i,
  ]).filter((name) => /(setting|config)/i.test(name));

  for (const name of ranked) {
    const document = await mongoose.connection.db
      .collection(name)
      .findOne({});

    if (document) return plain(document);
  }

  return {};
}

async function settingsHandler(_req, res, next) {
  try {
    const stored = await settingsDocument();

    const settings = {
      orgName:
        stored.orgName ||
        stored.organizationName ||
        process.env.ORG_NAME ||
        "Amaanitvam Foundation",
      enable2FA:
        stored.enable2FA ??
        stored.twoFactorEnabled ??
        String(process.env.ENABLE_2FA || "false").toLowerCase() === "true",
      ...stored,
    };

    return res.json({
      success: true,
      settings,
      data: settings,
      ...settings,
    });
  } catch (error) {
    next(error);
  }
}

router.get("/recovery/health", (_req, res) => {
  res.json({
    success: true,
    service: "amaanitvam-admin-recovery-api",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not-connected",
  });
});

router.get(
  ["/profile/me", "/admin/me", "/admin/profile", "/auth/me"],
  requireAdmin,
  profileHandler
);

router.get("/admin/candidates", requireAdmin, candidatesHandler);
router.get("/admin/settings", requireAdmin, settingsHandler);

router.get("/public/settings", async (_req, res, next) => {
  try {
    const stored = await settingsDocument();

    const settings = {
      orgName:
        stored.orgName ||
        stored.organizationName ||
        process.env.ORG_NAME ||
        "Amaanitvam Foundation",
      ...stored,
    };

    delete settings.smtpPassword;
    delete settings.password;
    delete settings.secret;
    delete settings.privateKey;

    res.json({
      success: true,
      settings,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
