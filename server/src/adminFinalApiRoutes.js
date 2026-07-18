import express from "express";
import mongoose from "mongoose";
import Department from "./modules/departments/department.model.js";
import User from "./modules/users/user.model.js";
import { authenticate } from "./middleware/authenticate.js";

const router = express.Router();

const preferredContactCollection =
  process.env.CONTACT_COLLECTION?.trim() || "contacts";

const contactCollectionCandidates = Array.from(
  new Set([
    preferredContactCollection,
    "contacts",
    "contactmessages",
    "contact_messages",
  ]),
);

const safeText = (value, maxLength = 5000) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const serializeContact = (document) => ({
  _id: document._id?.toString?.() || String(document._id || ""),
  name: document.name || document.fullName || "",
  email: document.email || "",
  phone: document.phone || document.phoneNumber || "",
  subject: document.subject || "",
  message: document.message || document.query || document.description || "",
  status: document.status || "unread",
  createdAt: document.createdAt || document.date || document.timestamp || null,
  updatedAt: document.updatedAt || null,
});

const listContactMessages = async () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB is not connected");
  }

  const available = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map(
      (entry) => entry.name,
    ),
  );

  const collections = contactCollectionCandidates.filter((name) =>
    available.has(name),
  );

  if (collections.length === 0) {
    return [];
  }

  const batches = await Promise.all(
    collections.map((name) =>
      db
        .collection(name)
        .find({})
        .sort({ createdAt: -1, date: -1, _id: -1 })
        .limit(500)
        .toArray(),
    ),
  );

  const seen = new Set();
  const messages = [];

  for (const document of batches.flat()) {
    const item = serializeContact(document);
    const dedupeKey = [
      item.email.toLowerCase(),
      item.message,
      item.createdAt ? new Date(item.createdAt).toISOString() : item._id,
    ].join("|");

    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      messages.push(item);
    }
  }

  return messages.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
};

const requireAdminFromDatabase = async (req, res, next) => {
  try {
    const tokenUser = req.user || {};
    const lookup = [];

    if (tokenUser.uid) lookup.push({ firebaseUid: tokenUser.uid });
    if (tokenUser.email) lookup.push({ email: tokenUser.email.toLowerCase() });

    const databaseUser = lookup.length
      ? await User.findOne({ $or: lookup }).lean()
      : null;

    const role = databaseUser?.role || tokenUser.role;
    const status = databaseUser?.status || "active";

    if (!['admin', 'super_admin'].includes(role) || status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.user = { ...tokenUser, ...databaseUser, role };
    next();
  } catch (error) {
    next(error);
  }
};

// Public endpoint: intentionally does not pass through departmentRoutes,
// because that router applies Firebase authentication to every route.
router.get("/api/public/departments", async (_req, res, next) => {
  try {
    const departments = await Department.find({})
      .select("departmentName name description departmentHead totalMembers")
      .populate("departmentHead", "name email")
      .sort({ departmentName: 1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: departments,
      departments,
    });
  } catch (error) {
    next(error);
  }
});

// Public website submission endpoint.
router.post("/api/contact", async (req, res, next) => {
  try {
    const name = safeText(req.body?.name || req.body?.fullName, 150);
    const email = safeText(req.body?.email, 320).toLowerCase();
    const phone = safeText(req.body?.phone || req.body?.phoneNumber, 40);
    const subject = safeText(req.body?.subject, 250);
    const message = safeText(
      req.body?.message || req.body?.query || req.body?.description,
      10000,
    );

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const now = new Date();
    const result = await mongoose.connection.db
      .collection(preferredContactCollection)
      .insertOne({
        name,
        email,
        phone,
        subject,
        message,
        status: "unread",
        createdAt: now,
        updatedAt: now,
      });

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully.",
      data: {
        _id: result.insertedId.toString(),
        name,
        email,
        phone,
        subject,
        message,
        status: "unread",
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
});

const getContactMessages = async (_req, res, next) => {
  try {
    const messages = await listContactMessages();
    return res.status(200).json({
      success: true,
      data: messages,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// Admin reads remain protected. Both paths are supported for compatibility.
router.get(
  "/api/contact",
  authenticate,
  requireAdminFromDatabase,
  getContactMessages,
);
router.get(
  "/api/admin/contact",
  authenticate,
  requireAdminFromDatabase,
  getContactMessages,
);

router.get("/api/recovery/final-admin-api", (_req, res) => {
  res.status(200).json({
    success: true,
    routes: {
      publicDepartments: "/api/public/departments",
      contact: "/api/contact",
    },
  });
});

export default router;
