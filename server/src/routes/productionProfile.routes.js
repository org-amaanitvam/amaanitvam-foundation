import express from "express";
import mongoose from "mongoose";

import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const normalizeRole = (value) =>
  clean(value).toLowerCase().replace(/[\s-]+/g, "_");

const configuredAdminEmails = () =>
  clean(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const adminRoles = new Set([
  "admin",
  "administrator",
  "super_admin",
  "superadmin",
  "owner",
]);

const publicProfile = (document = {}, decodedToken = {}) => {
  const value =
    document && typeof document.toObject === "function"
      ? document.toObject()
      : { ...document };

  if (value._id) {
    value._id = String(value._id);
    value.id = value.id || value._id;
  }

  return {
    ...value,
    uid:
      value.uid ||
      value.firebaseUid ||
      value.firebaseUID ||
      decodedToken.uid ||
      "",
    email:
      value.email ||
      decodedToken.email ||
      "",
    name:
      value.name ||
      decodedToken.name ||
      decodedToken.email ||
      "Administrator",
    role:
      value.role ||
      decodedToken.role ||
      "admin",
  };
};

const responsePayload = (document, decodedToken) => {
  const profile = publicProfile(document, decodedToken);

  return {
    success: true,
    profile,
    user: profile,
    admin: profile,
    data: profile,
  };
};

const getDb = () => {
  if (!mongoose.connection?.db) {
    const error = new Error("MongoDB is not connected");
    error.statusCode = 503;
    throw error;
  }

  return mongoose.connection.db;
};

async function candidateCollections() {
  const rows = await getDb()
    .listCollections({}, { nameOnly: true })
    .toArray();

  return rows
    .map((row) => row.name)
    .map((name) => ({
      name,
      score:
        (/^users?$/i.test(name) ? 1200 : 0) +
        (/^admins?$/i.test(name) ? 1150 : 0) +
        (/admin/i.test(name) ? 900 : 0) +
        (/member/i.test(name) ? 500 : 0) +
        (/profile/i.test(name) ? 400 : 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);
}

function identityConditions(decodedToken) {
  const uid = clean(decodedToken?.uid);
  const email = clean(decodedToken?.email).toLowerCase();
  const conditions = [];

  if (uid) {
    conditions.push(
      { firebaseUid: uid },
      { firebaseUID: uid },
      { uid },
      { authUid: uid },
      { userId: uid },
    );
  }

  if (email) {
    const exactEmail = new RegExp(
      `^${escapeRegex(email)}$`,
      "i",
    );

    conditions.push(
      { email: exactEmail },
      { username: exactEmail },
      { workEmail: exactEmail },
    );
  }

  return conditions;
}

async function findProfileRecord(decodedToken) {
  const conditions = identityConditions(decodedToken);

  if (!conditions.length) {
    return null;
  }

  for (const entry of await candidateCollections()) {
    const document = await getDb()
      .collection(entry.name)
      .findOne({ $or: conditions });

    if (document) {
      return {
        collectionName: entry.name,
        document,
      };
    }
  }

  return null;
}

function recordIsAdmin(decodedToken, record) {
  const email = clean(decodedToken?.email).toLowerCase();

  if (
    email &&
    configuredAdminEmails().includes(email)
  ) {
    return true;
  }

  if (
    decodedToken?.admin === true ||
    decodedToken?.isAdmin === true ||
    adminRoles.has(normalizeRole(decodedToken?.role))
  ) {
    return true;
  }

  const document = record?.document;
  if (!document) return false;

  if (/admin/i.test(record.collectionName || "")) {
    return true;
  }

  return (
    document.admin === true ||
    document.isAdmin === true ||
    [
      document.role,
      document.type,
      document.userType,
      document.accessLevel,
      document.accountType,
    ].some((value) =>
      adminRoles.has(normalizeRole(value)),
    )
  );
}

async function requireOwnAdminProfile(req, res, next) {
  try {
    let record = await findProfileRecord(req.user);

    if (!record) {
      const email = clean(req.user?.email).toLowerCase();

      if (
        !email ||
        !configuredAdminEmails().includes(email)
      ) {
        return res.status(403).json({
          success: false,
          message: "Administrator access is required",
        });
      }

      const uid = clean(req.user?.uid);
      const users = getDb().collection("users");

      const filter = uid
        ? {
            $or: [
              { firebaseUid: uid },
              { email },
            ],
          }
        : { email };

      await users.updateOne(
        filter,
        {
          $set: {
            firebaseUid: uid,
            email,
            status: "active",
            role: "admin",
            updatedAt: new Date(),
          },
          $setOnInsert: {
            name:
              clean(req.user?.name) ||
              email.split("@")[0] ||
              "Administrator",
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );

      record = {
        collectionName: "users",
        document: await users.findOne(filter),
      };
    }

    if (!recordIsAdmin(req.user, record)) {
      return res.status(403).json({
        success: false,
        message: "Administrator access is required",
      });
    }

    req.productionProfileRecord = record;
    return next();
  } catch (error) {
    return next(error);
  }
}

async function getProfile(req, res) {
  return res.json(
    responsePayload(
      req.productionProfileRecord.document,
      req.user,
    ),
  );
}

async function updateProfile(req, res, next) {
  try {
    const record = req.productionProfileRecord;
    const allowedFields = [
      "name",
      "phone",
      "department",
      "designation",
      "domain",
      "profileImage",
    ];

    const update = {};

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        update[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (
      typeof update.profileImage === "string" &&
      update.profileImage.length > 8 * 1024 * 1024
    ) {
      return res.status(413).json({
        success: false,
        message: "Profile image is too large",
      });
    }

    update.updatedAt = new Date();

    await getDb()
      .collection(record.collectionName)
      .updateOne(
        { _id: record.document._id },
        { $set: update },
      );

    const refreshed = await getDb()
      .collection(record.collectionName)
      .findOne({ _id: record.document._id });

    return res.json({
      ...responsePayload(refreshed, req.user),
      message: "Profile updated successfully",
    });
  } catch (error) {
    return next(error);
  }
}

// Public deployment marker. It exposes no credentials or user data.
router.get("/deployment/profile-route", (_req, res) => {
  res.json({
    success: true,
    mounted: true,
    route: "/api/profile/me",
    methods: ["GET", "PATCH", "PUT"],
  });
});

router.get(
  ["/profile/me", "/admin/me", "/admin/profile"],
  authenticate,
  requireOwnAdminProfile,
  getProfile,
);

router.patch(
  ["/profile/me", "/admin/me", "/admin/profile"],
  express.json({ limit: "8mb" }),
  authenticate,
  requireOwnAdminProfile,
  updateProfile,
);

router.put(
  ["/profile/me", "/admin/me", "/admin/profile"],
  express.json({ limit: "8mb" }),
  authenticate,
  requireOwnAdminProfile,
  updateProfile,
);

export default router;
