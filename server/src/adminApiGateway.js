import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });
dotenv.config();

const GATEWAY_PORT = Number(process.env.ADMIN_GATEWAY_PORT || 5000);
const UPSTREAM_PORT = Number(process.env.UPSTREAM_API_PORT || 5001);
const UPSTREAM_HOST = process.env.UPSTREAM_API_HOST || "127.0.0.1";

const RESPONSE_MODES = {
  "candidates": "object",
  "members": "object",
  "campaigns": "object",
  "donations": "object",
  "departments": "object",
  "learningHub": "object",
  "contacts": "object",
  "certificates": "object",
  "galleryFolders": "object",
  "galleryMedia": "object"
};

const RESOURCE_SPECS = {
  candidates: {
    key: "candidates",
    aliases: ["candidates", "applications"],
    defaultCollection: "candidates",
    patterns: [/^candidates?$/i, /candidate/i, /internship.*application/i, /application/i, /intern/i],
    exclude: [/campaign/i],
  },
  members: {
    key: "members",
    aliases: ["members", "users", "team"],
    defaultCollection: "members",
    patterns: [/^members?$/i, /member/i, /^users?$/i, /adminusers/i],
    exclude: [/candidate/i, /application/i, /donation/i, /campaign/i, /certificate/i],
  },
  campaigns: {
    key: "campaigns",
    aliases: ["campaigns", "fundraisingCampaigns", "fundraisers"],
    defaultCollection: "campaigns",
    patterns: [/^campaigns?$/i, /campaign/i, /fundraiser/i, /fundraising/i],
    exclude: [/donation/i],
  },
  donations: {
    key: "donations",
    aliases: ["donations", "payments", "orders"],
    defaultCollection: "donations",
    patterns: [/^donations?$/i, /donation/i, /payment/i, /orders?/i, /razorpay/i],
    exclude: [/campaign/i],
  },
  departments: {
    key: "departments",
    aliases: ["departments", "domains"],
    defaultCollection: "departments",
    patterns: [/^departments?$/i, /^domains?$/i, /department/i, /domain/i],
    exclude: [],
  },
  learningHub: {
    key: "learningHub",
    aliases: ["learningHub", "resources", "items", "materials", "library"],
    defaultCollection: "learninghub",
    patterns: [/learning[-_ ]?hub/i, /digital[-_ ]?library/i, /library/i, /resources?/i, /materials?/i],
    exclude: [/certificate/i],
  },
  contacts: {
    key: "contacts",
    aliases: ["contacts", "messages", "inquiries", "contactMessages"],
    defaultCollection: "contacts",
    patterns: [/contact/i, /inquir/i, /messages?/i],
    exclude: [/member/i],
  },
  certificates: {
    key: "certificates",
    aliases: ["certificates"],
    defaultCollection: "certificates",
    patterns: [/^certificates?$/i, /certificate/i],
    exclude: [],
  },
  galleryFolders: {
    key: "galleryFolders",
    aliases: ["folders", "albums", "galleryFolders"],
    defaultCollection: "galleryfolders",
    patterns: [/gallery.*folder/i, /folders?/i, /albums?/i],
    exclude: [/media/i, /image/i],
  },
  galleryMedia: {
    key: "galleryMedia",
    aliases: ["media", "images", "gallery"],
    defaultCollection: "gallerymedia",
    patterns: [/gallery.*media/i, /gallery/i, /media/i, /images?/i],
    exclude: [/folder/i, /album/i],
  },
};

const jsonParser = express.json({ limit: "50mb" });
const urlEncodedParser = express.urlencoded({ extended: true, limit: "50mb" });

function initializeFirebaseAdmin() {
  if (getApps().length) return;

  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(serverRoot, "serviceAccountKey.json"),
    path.join(process.cwd(), "server", "serviceAccountKey.json"),
  ].filter(Boolean);

  const serviceAccountPath = candidates.find((candidatePath) => fs.existsSync(candidatePath));

  if (serviceAccountPath) {
    initializeApp({
      credential: cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))),
    });
    console.log(`[admin-gateway] Firebase Admin initialized using ${serviceAccountPath}`);
    return;
  }

  initializeApp({ credential: applicationDefault() });
  console.log("[admin-gateway] Firebase Admin initialized using application default credentials");
}

initializeFirebaseAdmin();

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  "";

if (!mongoUri) {
  throw new Error("MongoDB connection string not found. Add MONGODB_URI or MONGO_URI to server/.env");
}

await mongoose.connect(mongoUri);
console.log(`[admin-gateway] MongoDB connected: ${mongoose.connection.host}`);

const app = express();
app.disable("x-powered-by");

// FINAL ADMIN CORS START
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowed =
    !origin ||
    /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin) ||
    origin === "https://admin.amaanitvam.org";

  if (origin && allowed) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Credentials",
      "true"
    );
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, Accept, X-Requested-With"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(allowed ? 204 : 403);
  }

  next();
});
// FINAL ADMIN CORS END


// ADMIN GATEWAY CORS FIX START
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const configuredOrigins = String(
    process.env.ADMIN_PORTAL_ORIGIN || ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const originAllowed =
    !origin ||
    /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin) ||
    origin === "https://admin.amaanitvam.org" ||
    configuredOrigins.includes(origin);

  if (origin && originAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, Accept, X-Requested-With"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.sendStatus(originAllowed ? 204 : 403);
  }

  next();
});
// ADMIN GATEWAY CORS FIX END


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

function asPlain(value) {
  if (!value) return value;
  return JSON.parse(JSON.stringify(value));
}

function objectId(value) {
  return mongoose.Types.ObjectId.isValid(clean(value))
    ? new mongoose.Types.ObjectId(clean(value))
    : null;
}

function normalizeDocument(document, sourceCollection = "") {
  const plain = asPlain(document) || {};
  const id = clean(plain._id || plain.id);
  return {
    ...plain,
    id,
    _id: id || plain._id,
    _sourceCollection: sourceCollection || plain._sourceCollection,
  };
}

async function collectionNames() {
  const entries = await mongoose.connection.db
    .listCollections({}, { nameOnly: true })
    .toArray();
  return entries.map((entry) => entry.name);
}

function scoreCollectionName(name, spec) {
  let score = 0;

  for (let index = 0; index < spec.patterns.length; index += 1) {
    if (spec.patterns[index].test(name)) score += 1000 - index * 30;
  }

  for (const pattern of spec.exclude || []) {
    if (pattern.test(name)) score -= 10000;
  }

  return score;
}

async function collectionsFor(spec) {
  const names = await collectionNames();
  return names
    .map((name) => ({ name, score: scoreCollectionName(name, spec) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.name);
}

async function collectionForWrite(spec) {
  const names = await collectionsFor(spec);
  return names[0] || spec.defaultCollection;
}

async function listResource(resourceKey, options = {}) {
  const spec = RESOURCE_SPECS[resourceKey];
  const names = await collectionsFor(spec);
  const documents = [];

  for (const collectionName of names) {
    const query = options.query || {};
    const cursor = mongoose.connection.db
      .collection(collectionName)
      .find(query)
      .sort({
        createdAt: -1,
        appliedAt: -1,
        submittedAt: -1,
        joinedAt: -1,
        updatedAt: -1,
        _id: -1,
      })
      .limit(options.limit || 2000);

    const rows = await cursor.toArray();

    for (const row of rows) {
      documents.push(normalizeDocument(row, collectionName));
    }
  }

  const seen = new Set();

  return documents.filter((document) => {
    const key =
      clean(document._id) ||
      clean(document.id) ||
      `${clean(document.email).toLowerCase()}::${clean(document.createdAt || document.appliedAt || document.name || document.title)}`;

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function findResourceById(resourceKey, id, sourceCollection = "") {
  const spec = RESOURCE_SPECS[resourceKey];
  const oid = objectId(id);

  if (!oid) return null;

  const names = sourceCollection ? [sourceCollection] : await collectionsFor(spec);

  for (const collectionName of names) {
    const document = await mongoose.connection.db
      .collection(collectionName)
      .findOne({ _id: oid });

    if (document) {
      return {
        collectionName,
        document,
      };
    }
  }

  return null;
}

function listPayload(resourceKey, rows) {
  const spec = RESOURCE_SPECS[resourceKey];
  const mode = RESPONSE_MODES[resourceKey] || "object";

  if (mode === "array") return rows;

  const payload = {
    success: true,
    count: rows.length,
    data: rows,
    items: rows,
  };

  for (const alias of spec.aliases) {
    payload[alias] = rows;
  }

  return payload;
}

function itemPayload(resourceKey, row, message = "Success") {
  const spec = RESOURCE_SPECS[resourceKey];
  const payload = {
    success: true,
    message,
    data: row,
    item: row,
  };

  for (const alias of spec.aliases) {
    const singular = alias.endsWith("s") ? alias.slice(0, -1) : alias;
    payload[singular] = row;
  }

  return payload;
}

async function adminProfileFor(decodedToken) {
  const names = await collectionNames();
  const ranked = names
    .map((name) => ({
      name,
      score:
        (/^admins?$/i.test(name) ? 1000 : 0) +
        (/admin/i.test(name) ? 900 : 0) +
        (/^users?$/i.test(name) ? 700 : 0) +
        (/member/i.test(name) ? 500 : 0) +
        (/profile/i.test(name) ? 400 : 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.name);

  const email = clean(decodedToken.email).toLowerCase();
  const emailRegex = email ? new RegExp(`^${escapeRegex(email)}$`, "i") : null;

  const conditions = [
    { firebaseUid: decodedToken.uid },
    { firebaseUID: decodedToken.uid },
    { uid: decodedToken.uid },
    { authUid: decodedToken.uid },
    { userId: decodedToken.uid },
  ];

  if (emailRegex) {
    conditions.push({ email: emailRegex }, { username: emailRegex }, { workEmail: emailRegex });
  }

  for (const collectionName of ranked) {
    const document = await mongoose.connection.db
      .collection(collectionName)
      .findOne({ $or: conditions });

    if (document) {
      return {
        collectionName,
        document: normalizeDocument(document, collectionName),
      };
    }
  }

  return null;
}

function isAdministrator(decodedToken, profileResult) {
  const adminRoles = new Set([
    "admin",
    "administrator",
    "superadmin",
    "super-admin",
    "super_admin",
    "owner",
  ]);

  const configuredEmails = clean(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL)
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const tokenEmail = clean(decodedToken.email).toLowerCase();

  if (configuredEmails.includes(tokenEmail)) return true;
  if (decodedToken.admin === true || decodedToken.isAdmin === true) return true;
  if (adminRoles.has(normalizeRole(decodedToken.role))) return true;

  if (!profileResult) return false;

  const document = profileResult.document;

  if (/^admins?$|admin/i.test(profileResult.collectionName)) return true;
  if (document.admin === true || document.isAdmin === true) return true;

  return [
    document.role,
    document.type,
    document.userType,
    document.accessLevel,
    document.accountType,
  ].some((value) => adminRoles.has(normalizeRole(value)));
}

async function optionalAdministrator(req, _res, next) {
  try {
    const authorization = clean(req.headers.authorization);

    if (authorization.toLowerCase().startsWith("bearer ")) {
      const decodedToken = await getAuth().verifyIdToken(authorization.slice(7).trim());
      const profileResult = await adminProfileFor(decodedToken);
      req.firebaseUser = decodedToken;
      req.adminProfileResult = profileResult;
      req.isAdministrator = isAdministrator(decodedToken, profileResult);
    }
  } catch (_error) {
    req.isAdministrator = false;
  }

  next();
}

async function requireAdministrator(req, res, next) {
  await optionalAdministrator(req, res, () => {});

  if (req.isAdministrator) return next();

  return res.status(req.firebaseUser ? 403 : 401).json({
    success: false,
    message: req.firebaseUser
      ? "Administrator access is required"
      : "Authentication token is required",
  });
}

function publicList(resourceKey) {
  return async (_req, res, next) => {
    try {
      const rows = await listResource(resourceKey);
      res.json(listPayload(resourceKey, rows));
    } catch (error) {
      next(error);
    }
  };
}

function adminList(resourceKey) {
  return async (_req, res, next) => {
    try {
      const rows = await listResource(resourceKey);
      res.json(listPayload(resourceKey, rows));
    } catch (error) {
      next(error);
    }
  };
}

function createResource(resourceKey) {
  return async (req, res, next) => {
    try {
      const spec = RESOURCE_SPECS[resourceKey];
      const collectionName = await collectionForWrite(spec);
      const now = new Date();
      const body = { ...(req.body || {}) };

      delete body._id;
      delete body.id;
      delete body._sourceCollection;

      const insert = {
        ...body,
        createdAt: body.createdAt || now,
        updatedAt: now,
      };

      const result = await mongoose.connection.db
        .collection(collectionName)
        .insertOne(insert);

      const document = await mongoose.connection.db
        .collection(collectionName)
        .findOne({ _id: result.insertedId });

      res.status(201).json(
        itemPayload(
          resourceKey,
          normalizeDocument(document, collectionName),
          "Created successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };
}

function getResource(resourceKey) {
  return async (req, res, next) => {
    try {
      const found = await findResourceById(
        resourceKey,
        req.params.id,
        clean(req.query.collection || req.query.source || req.query._sourceCollection)
      );

      if (!found) {
        return res.status(404).json({
          success: false,
          message: "Record was not found",
        });
      }

      res.json(
        itemPayload(
          resourceKey,
          normalizeDocument(found.document, found.collectionName)
        )
      );
    } catch (error) {
      next(error);
    }
  };
}

function updateResource(resourceKey) {
  return async (req, res, next) => {
    try {
      const found = await findResourceById(
        resourceKey,
        req.params.id,
        clean(req.body?._sourceCollection || req.query.collection || req.query.source)
      );

      if (!found) {
        return res.status(404).json({
          success: false,
          message: "Record was not found",
        });
      }

      const update = { ...(req.body || {}) };
      delete update._id;
      delete update.id;
      delete update._sourceCollection;

      await mongoose.connection.db
        .collection(found.collectionName)
        .updateOne(
          { _id: found.document._id },
          { $set: { ...update, updatedAt: new Date() } }
        );

      const refreshed = await mongoose.connection.db
        .collection(found.collectionName)
        .findOne({ _id: found.document._id });

      res.json(
        itemPayload(
          resourceKey,
          normalizeDocument(refreshed, found.collectionName),
          "Updated successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  };
}

function deleteResource(resourceKey) {
  return async (req, res, next) => {
    try {
      const found = await findResourceById(
        resourceKey,
        req.params.id,
        clean(req.body?._sourceCollection || req.query.collection || req.query.source)
      );

      if (!found) {
        return res.status(404).json({
          success: false,
          message: "Record was not found",
        });
      }

      await mongoose.connection.db
        .collection(found.collectionName)
        .deleteOne({ _id: found.document._id });

      res.json({
        success: true,
        message: "Deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

function registerCrud(resourceKey, paths, options = {}) {
  const getMiddleware = options.publicGet ? [] : [requireAdministrator];
  const writeMiddleware = options.publicWrite
    ? [jsonParser, urlEncodedParser]
    : [requireAdministrator, jsonParser, urlEncodedParser];

  for (const basePath of paths) {
    app.get(basePath, ...getMiddleware, options.listHandler || adminList(resourceKey));
    app.get(`${basePath}/:id`, ...getMiddleware, getResource(resourceKey));
    app.post(basePath, ...writeMiddleware, createResource(resourceKey));
    app.patch(`${basePath}/:id`, ...writeMiddleware, updateResource(resourceKey));
    app.put(`${basePath}/:id`, ...writeMiddleware, updateResource(resourceKey));
    app.delete(`${basePath}/:id`, ...writeMiddleware, deleteResource(resourceKey));
  }
}

async function settingsDocument() {
  const names = await collectionNames();
  const ranked = names
    .map((name) => ({
      name,
      score:
        (/^settings?$/i.test(name) ? 1000 : 0) +
        (/admin.*setting/i.test(name) ? 900 : 0) +
        (/setting/i.test(name) ? 700 : 0) +
        (/config/i.test(name) ? 500 : 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.name);

  for (const collectionName of ranked) {
    const document = await mongoose.connection.db.collection(collectionName).findOne({});
    if (document) {
      return {
        collectionName,
        document: normalizeDocument(document, collectionName),
      };
    }
  }

  return null;
}

function safeSettings(document = {}) {
  const settings = {
    orgName:
      document.orgName ||
      document.organizationName ||
      process.env.ORG_NAME ||
      "Amaanitvam Foundation",
    enable2FA:
      document.enable2FA ??
      document.twoFactorEnabled ??
      String(process.env.ENABLE_2FA || "false").toLowerCase() === "true",
    ...document,
  };

  for (const key of [
    "password",
    "smtpPassword",
    "secret",
    "privateKey",
    "serviceAccount",
    "razorpayKeySecret",
    "apiSecret",
  ]) {
    delete settings[key];
  }

  return settings;
}

async function settingsHandler(_req, res, next) {
  try {
    const result = await settingsDocument();
    const settings = safeSettings(result?.document || {});
    res.json({ success: true, settings, data: settings, ...settings });
  } catch (error) {
    next(error);
  }
}

async function defaultDepartments() {
  const explicit = await listResource("departments");

  if (explicit.length) return explicit;

  const derived = new Set();

  for (const resourceKey of ["candidates", "members"]) {
    const rows = await listResource(resourceKey).catch(() => []);
    for (const row of rows) {
      for (const field of ["department", "domain", "role", "category"]) {
        const value = clean(row[field]);
        if (value) derived.add(value);
      }
    }
  }

  if (!derived.size) {
    [
      "Education",
      "Technology",
      "Human Resources",
      "Marketing",
      "Content",
      "Operations",
      "Finance",
      "Social Media",
      "Fundraising",
    ].forEach((name) => derived.add(name));
  }

  return [...derived].sort().map((name, index) => ({
    id: String(index + 1),
    name,
    title: name,
    label: name,
    value: name,
  }));
}

async function departmentsHandler(_req, res, next) {
  try {
    const rows = await defaultDepartments();
    res.json(listPayload("departments", rows));
  } catch (error) {
    next(error);
  }
}

async function galleryFoldersHandler(_req, res, next) {
  try {
    let rows = await listResource("galleryFolders");

    if (!rows.length) {
      const media = await listResource("galleryMedia").catch(() => []);
      const map = new Map();

      for (const item of media) {
        const name =
          clean(item.folder) ||
          clean(item.folderName) ||
          clean(item.album) ||
          clean(item.albumName) ||
          clean(item.category);

        if (!name) continue;

        if (!map.has(name)) {
          map.set(name, {
            id: name,
            name,
            title: name,
            album: name,
            folder: name,
            count: 0,
          });
        }

        map.get(name).count += 1;
      }

      rows = [...map.values()];
    }

    res.json(listPayload("galleryFolders", rows));
  } catch (error) {
    next(error);
  }
}

async function profileResponse(req, res) {
  const profile = {
    uid: req.firebaseUser.uid,
    email: req.firebaseUser.email || "",
    name:
      req.firebaseUser.name ||
      req.adminProfileResult?.document?.name ||
      req.firebaseUser.email ||
      "Administrator",
    role: "admin",
    ...(req.adminProfileResult?.document || {}),
  };

  res.json({
    success: true,
    profile,
    user: profile,
    admin: profile,
    data: profile,
  });
}

function sendBinaryField(res, document, label) {
  const url =
    document.resumeUrl ||
    document.cvUrl ||
    document.fileUrl ||
    document.pdfUrl ||
    document.certificateUrl ||
    document.imageUrl ||
    document.url ||
    document.resume?.url ||
    document.cv?.url ||
    document.file?.url;

  if (url && /^https?:\/\//i.test(url)) {
    res.redirect(url);
    return true;
  }

  const rawValue =
    document.resumeData ||
    document.cvData ||
    document.fileData ||
    document.pdfData ||
    document.certificateData ||
    document.imageData ||
    document.resumeBase64 ||
    document.cvBase64 ||
    document.fileBase64 ||
    document.pdfBase64 ||
    document.resume?.data ||
    document.cv?.data ||
    document.file?.data;

  if (!rawValue) return false;

  const text = Buffer.isBuffer(rawValue) ? "" : clean(rawValue);
  const contentType = text.startsWith("data:image/")
    ? text.slice(5, text.indexOf(";"))
    : "application/pdf";

  const base64 = text.replace(/^data:[^;]+;base64,/i, "");
  const buffer = Buffer.isBuffer(rawValue) ? rawValue : Buffer.from(base64, "base64");

  res.setHeader("Content-Type", contentType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${clean(document.name || document.title || label || "file")}.pdf"`
  );
  res.send(buffer);
  return true;
}

async function candidateFileHandler(req, res, next) {
  try {
    const found = await findResourceById(
      "candidates",
      req.params.id,
      clean(req.query.collection || req.query.source)
    );

    if (!found || !sendBinaryField(res, found.document, "candidate-resume")) {
      return res.status(404).json({
        success: false,
        message: "File is not available",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function certificateFileHandler(req, res, next) {
  try {
    const found = await findResourceById(
      "certificates",
      req.params.id,
      clean(req.query.collection || req.query.source)
    );

    if (!found || !sendBinaryField(res, found.document, "certificate")) {
      return res.status(404).json({
        success: false,
        message: "Certificate file is not available",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function donationSummaryHandler(_req, res, next) {
  try {
    const donations = await listResource("donations");
    const campaigns = await listResource("campaigns");

    const total = donations.reduce(
      (sum, item) => sum + Number(item.amount || item.total || item.value || 0),
      0
    );

    res.json({
      success: true,
      totalDonations: total,
      total,
      count: donations.length,
      campaignCount: campaigns.length,
      donations,
      campaigns,
      data: {
        totalDonations: total,
        total,
        count: donations.length,
        campaignCount: campaigns.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

app.get("/api/recovery/health", async (_req, res) => {
  let collections = [];

  try {
    collections = await collectionNames();
  } catch (_error) {
    collections = [];
  }

  res.json({
    success: true,
    service: "amaanitvam-admin-api-gateway",
    database: mongoose.connection.readyState === 1 ? "connected" : "not-connected",
    upstream: `http://${UPSTREAM_HOST}:${UPSTREAM_PORT}`,
    sections: [
      "profile",
      "settings",
      "candidates",
      "members",
      "departments",
      "campaigns",
      "donations",
      "learningHub",
      "contacts",
      "gallery",
      "certificates",
    ],
    collectionCount: collections.length,
  });
});

app.get(
  ["/api/profile/me", "/api/admin/me", "/api/admin/profile", "/api/auth/me"],
  requireAdministrator,
  profileResponse
);

app.patch(
  ["/api/profile/me", "/api/admin/me", "/api/admin/profile"],
  requireAdministrator,
  jsonParser,
  async (req, res, next) => {
    try {
      const result = req.adminProfileResult;

      if (!result?.document?._id) {
        return res.status(404).json({ success: false, message: "Admin profile was not found" });
      }

      const update = { ...(req.body || {}) };
      for (const key of ["_id", "id", "role", "admin", "isAdmin", "password"]) delete update[key];

      await mongoose.connection.db
        .collection(result.collectionName)
        .updateOne(
          { _id: objectId(result.document._id) },
          { $set: { ...update, updatedAt: new Date() } }
        );

      const refreshed = await mongoose.connection.db
        .collection(result.collectionName)
        .findOne({ _id: objectId(result.document._id) });

      req.adminProfileResult.document = normalizeDocument(refreshed, result.collectionName);
      return profileResponse(req, res);
    } catch (error) {
      next(error);
    }
  }
);

app.get(["/api/admin/settings", "/api/settings"], requireAdministrator, settingsHandler);
app.get(["/api/public/settings", "/api/api/public/settings"], settingsHandler);

app.patch("/api/admin/settings", requireAdministrator, jsonParser, async (req, res, next) => {
  try {
    const result = await settingsDocument();
    const collectionName = result?.collectionName || "settings";
    const selector = result?.document?._id ? { _id: objectId(result.document._id) } : { key: "admin" };

    const update = { ...(req.body || {}) };
    for (const key of ["_id", "id", "password", "smtpPassword", "privateKey", "serviceAccount"]) delete update[key];

    await mongoose.connection.db.collection(collectionName).updateOne(
      selector,
      { $set: { ...update, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    const refreshed = await mongoose.connection.db.collection(collectionName).findOne(selector);
    const settings = safeSettings(refreshed || update);

    res.json({ success: true, settings, data: settings, ...settings });
  } catch (error) {
    next(error);
  }
});
app.put("/api/admin/settings", requireAdministrator, jsonParser, async (req, res, next) => {
  req.method = "PATCH";
  next();
});

app.get("/api/public/departments", departmentsHandler);
app.get("/api/departments", departmentsHandler);
app.get("/api/admin/departments", requireAdministrator, departmentsHandler);

registerCrud("candidates", ["/api/admin/candidates"]);
registerCrud("members", ["/api/admin/members", "/api/members"]);
registerCrud("campaigns", ["/api/admin/campaigns", "/api/campaigns"]);
registerCrud("donations", ["/api/admin/donations", "/api/donations"]);
registerCrud("learningHub", ["/api/learning-hub", "/api/admin/learning-hub", "/api/digital-library", "/api/admin/digital-library"], { publicGet: false });
registerCrud("contacts", ["/api/contact", "/api/admin/contact", "/api/contact-messages", "/api/admin/contact-messages"], { publicWrite: true });
registerCrud("certificates", ["/api/admin/certificates", "/api/certificates"]);

// GALLERY FOLDER MEDIA ROUTES START
function galleryValueMatchesFolder(value, folderId) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "object") {
    return [
      value._id,
      value.id,
      value.folderId,
      value.albumId,
      value.value,
      value.name,
    ].some(
      (candidate) => clean(candidate) === folderId
    );
  }

  return clean(value) === folderId;
}

async function galleryMediaForFolder(folderId) {
  const media = await listResource("galleryMedia");

  const matched = media.filter((item) =>
    [
      item.folderId,
      item.folder_id,
      item.albumId,
      item.album_id,
      item.folder,
      item.album,
      item.galleryFolderId,
      item.parentFolderId,
      item.categoryId,
    ].some(
      (value) => galleryValueMatchesFolder(value, folderId)
    )
  );

  const folder = await findResourceById(
    "galleryFolders",
    folderId
  ).catch(() => null);

  const embedded = [];

  if (folder?.document) {
    for (
      const key of [
        "media",
        "images",
        "items",
        "files",
        "photos",
      ]
    ) {
      const values = folder.document[key];

      if (!Array.isArray(values)) {
        continue;
      }

      for (const value of values) {
        embedded.push(
          normalizeDocument(
            typeof value === "object"
              ? value
              : { url: value },
            folder.collectionName
          )
        );
      }
    }
  }

  const combined = [...matched, ...embedded];
  const seen = new Set();

  return combined.filter((item, index) => {
    const key =
      clean(item._id) ||
      clean(item.id) ||
      clean(item.url) ||
      clean(item.imageUrl) ||
      clean(item.mediaUrl) ||
      `${folderId}:${index}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

app.get(
  [
    "/api/admin/gallery/folders/:id/media",
    "/api/gallery/folders/:id/media",
    "/api/admin/gallery/folder/:id/media",
    "/api/gallery/folder/:id/media",
    "/api/admin/gallery/media/folder/:id",
  ],
  requireAdministrator,
  async (req, res, next) => {
    try {
      const media = await galleryMediaForFolder(
        clean(req.params.id)
      );

      res.json(
        listPayload("galleryMedia", media)
      );
    } catch (error) {
      next(error);
    }
  }
);
// GALLERY FOLDER MEDIA ROUTES END

registerCrud("galleryFolders", ["/api/admin/gallery/folders", "/api/gallery/folders"], { listHandler: galleryFoldersHandler });
registerCrud("galleryMedia", ["/api/admin/gallery/media", "/api/gallery/media", "/api/admin/gallery", "/api/gallery"]);

app.get("/api/donate/campaigns", publicList("campaigns"));
app.get("/api/donations/summary", requireAdministrator, donationSummaryHandler);
app.get("/api/admin/donations/summary", requireAdministrator, donationSummaryHandler);

app.get(
  [
    "/api/admin/candidates/:id/resume",
    "/api/admin/candidates/:id/cv",
    "/api/admin/candidates/:id/download",
  ],
  requireAdministrator,
  candidateFileHandler
);

app.get(
  [
    "/api/admin/certificates/:id/download",
    "/api/certificates/:id/download",
    "/api/admin/certificates/:id/pdf",
  ],
  requireAdministrator,
  certificateFileHandler
);

app.patch(
  ["/api/admin/candidates/:id/status", "/api/admin/members/:id/status", "/api/admin/certificates/:id/status"],
  requireAdministrator,
  jsonParser,
  async (req, res, next) => {
    const mapping = req.path.includes("/members/")
      ? "members"
      : req.path.includes("/certificates/")
        ? "certificates"
        : "candidates";

    return updateResource(mapping)(req, res, next);
  }
);

app.put(
  ["/api/admin/candidates/:id/status", "/api/admin/members/:id/status", "/api/admin/certificates/:id/status"],
  requireAdministrator,
  jsonParser,
  async (req, res, next) => {
    const mapping = req.path.includes("/members/")
      ? "members"
      : req.path.includes("/certificates/")
        ? "certificates"
        : "candidates";

    return updateResource(mapping)(req, res, next);
  }
);


// FINAL REMAINING ROUTES START

async function sendFinalResourceList(
  resourceKey,
  res,
  next
) {
  try {
    const rows = await listResource(resourceKey);

    return res.json(
      listPayload(resourceKey, rows)
    );
  } catch (error) {
    return next(error);
  }
}

app.get(
  [
    "/api/learning-hub",
    "/api/admin/learning-hub",
    "/api/digital-library",
    "/api/admin/digital-library"
  ],
  requireAdministrator,
  (_req, res, next) =>
    sendFinalResourceList(
      "learningHub",
      res,
      next
    )
);

app.get(
  [
    "/api/contact",
    "/api/admin/contact",
    "/api/contact-messages",
    "/api/admin/contact-messages"
  ],
  requireAdministrator,
  (_req, res, next) =>
    sendFinalResourceList(
      "contacts",
      res,
      next
    )
);

app.get(
  [
    "/api/admin/gallery/folders/:id/media",
    "/api/gallery/folders/:id/media",
    "/api/admin/gallery/folder/:id/media",
    "/api/gallery/folder/:id/media"
  ],
  requireAdministrator,
  async (req, res, next) => {
    try {
      const folderId = clean(req.params.id);

      const allMedia = await listResource(
        "galleryMedia"
      );

      const matchesFolder = (value) => {
        if (
          value === undefined ||
          value === null
        ) {
          return false;
        }

        if (typeof value === "object") {
          return [
            value._id,
            value.id,
            value.folderId,
            value.albumId,
            value.value,
            value.name
          ].some(
            (candidate) =>
              clean(candidate) === folderId
          );
        }

        return clean(value) === folderId;
      };

      const media = allMedia.filter((item) =>
        [
          item.folderId,
          item.folder_id,
          item.albumId,
          item.album_id,
          item.folder,
          item.album,
          item.galleryFolderId,
          item.parentFolderId,
          item.categoryId
        ].some(matchesFolder)
      );

      const folder =
        await findResourceById(
          "galleryFolders",
          folderId
        ).catch(() => null);

      if (folder?.document) {
        for (
          const key of [
            "media",
            "images",
            "items",
            "files",
            "photos"
          ]
        ) {
          const embedded =
            folder.document[key];

          if (!Array.isArray(embedded)) {
            continue;
          }

          for (const value of embedded) {
            media.push(
              normalizeDocument(
                typeof value === "object"
                  ? value
                  : { url: value },
                folder.collectionName
              )
            );
          }
        }
      }

      const seen = new Set();

      const uniqueMedia = media.filter(
        (item, index) => {
          const key =
            clean(item._id) ||
            clean(item.id) ||
            clean(item.url) ||
            clean(item.imageUrl) ||
            clean(item.mediaUrl) ||
            `${folderId}:${index}`;

          if (seen.has(key)) {
            return false;
          }

          seen.add(key);
          return true;
        }
      );

      return res.json(
        listPayload(
          "galleryMedia",
          uniqueMedia
        )
      );
    } catch (error) {
      return next(error);
    }
  }
);

// FINAL REMAINING ROUTES END

function proxyToExistingBackend(req, res) {
  const headers = { ...req.headers };
  headers.host = `${UPSTREAM_HOST}:${UPSTREAM_PORT}`;
  delete headers.connection;

  const proxyRequest = http.request(
    {
      hostname: UPSTREAM_HOST,
      port: UPSTREAM_PORT,
      path: req.originalUrl,
      method: req.method,
      headers,
    },
    (proxyResponse) => {
      res.statusCode = proxyResponse.statusCode || 502;

      for (const [name, value] of Object.entries(proxyResponse.headers)) {
        if (value !== undefined && name.toLowerCase() !== "transfer-encoding") {
          res.setHeader(name, value);
        }
      }

      proxyResponse.pipe(res);
    }
  );

  proxyRequest.on("error", (error) => {
    console.error("[admin-gateway] Upstream proxy error:", error.message);

    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: "The existing backend is unavailable",
      });
    } else {
      res.end();
    }
  });

  req.pipe(proxyRequest);
}

app.use(proxyToExistingBackend);

app.use((error, _req, res, _next) => {
  console.error("[admin-gateway]", error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Admin API gateway error",
  });
});

const server = app.listen(GATEWAY_PORT, "127.0.0.1", () => {
  console.log(`[admin-gateway] Listening on http://127.0.0.1:${GATEWAY_PORT}`);
  console.log(`[admin-gateway] Forwarding unmatched requests to http://${UPSTREAM_HOST}:${UPSTREAM_PORT}`);
});

async function shutdown(signal) {
  console.log(`[admin-gateway] ${signal} received; shutting down`);
  server.close(async () => {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
