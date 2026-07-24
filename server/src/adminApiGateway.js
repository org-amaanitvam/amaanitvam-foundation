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
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(serverRoot, "serviceAccountKey.json"),
    path.join(process.cwd(), "server", "serviceAccountKey.json"),
  ].filter(Boolean);

  const serviceAccountPath = candidates.find((candidatePath) => fs.existsSync(candidatePath));

  if (serviceAccountPath) {
    const rawServiceAccount = fs.readFileSync(serviceAccountPath, "utf8").replace(/^\uFEFF/, "");
    const serviceAccount = JSON.parse(rawServiceAccount);
    if (typeof serviceAccount.private_key === "string") {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    const authProjectId =
      process.env.FIREBASE_AUTH_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      serviceAccount.project_id;
    initializeApp({
      credential: cert(serviceAccount),
      projectId: authProjectId,
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
  // GRIDFS_CHUNK_COLLECTION_GUARD:
  // GridFS *.chunks collections contain binary file pieces, not media records.
  // Querying/sorting them as normal resources causes large-memory failures.
  if (/\.chunks$/i.test(name) || /^system\./i.test(name)) {
    return Number.NEGATIVE_INFINITY;
  }

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
      .allowDiskUse(true)
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
  } catch (error) {
    req.authError = error;
    req.isAdministrator = false;
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin-gateway] Firebase token verification failed:", error?.code || error?.message || error);
    }
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

// FINAL_CERTIFICATE_DOWNLOAD_LOCAL_PARITY_START
// This route is intentionally registered before the generic certificate routes.
// It restores local parity with the deployed certificate download behavior.

function localCertSafeFilename(value, fallback = "certificate.pdf") {
  const cleaned = clean(value || fallback)
    .replace(/[\r\n"]/g, "_")
    .replace(/[\\/]/g, "_");
  return cleaned || fallback;
}

function localCertAsBuffer(value) {
  if (!value) return null;

  if (Buffer.isBuffer(value)) {
    return value.length ? value : null;
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (text.startsWith("data:application/pdf;base64,")) {
      try {
        const decoded = Buffer.from(text.split(",", 2)[1], "base64");
        return decoded.length ? decoded : null;
      } catch {
        return null;
      }
    }

    if (text.startsWith("%PDF-")) {
      return Buffer.from(text, "binary");
    }

    if (text.length > 100) {
      try {
        const decoded = Buffer.from(text, "base64");
        if (decoded.subarray(0, 5).toString() === "%PDF-") {
          return decoded;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  if (value.type === "Buffer" && Array.isArray(value.data)) {
    const decoded = Buffer.from(value.data);
    return decoded.length ? decoded : null;
  }

  if (value._bsontype === "Binary") {
    try {
      if (typeof value.value === "function") {
        const raw = value.value(true);
        if (raw) {
          const decoded = Buffer.from(raw);
          if (decoded.length) return decoded;
        }
      }
    } catch {
      // Continue with the BSON buffer property.
    }

    if (value.buffer) {
      const decoded = Buffer.from(value.buffer);
      return decoded.length ? decoded : null;
    }
  }

  if (ArrayBuffer.isView(value)) {
    const decoded = Buffer.from(
      value.buffer,
      value.byteOffset,
      value.byteLength
    );
    return decoded.length ? decoded : null;
  }

  if (value instanceof ArrayBuffer) {
    const decoded = Buffer.from(value);
    return decoded.length ? decoded : null;
  }

  if (
    value.buffer &&
    (Buffer.isBuffer(value.buffer) || ArrayBuffer.isView(value.buffer))
  ) {
    const decoded = Buffer.from(value.buffer);
    return decoded.length ? decoded : null;
  }

  return null;
}

function localCertFindPdfBuffer(source, depth = 0, visited = new Set()) {
  if (!source || depth > 5) return null;

  const direct = localCertAsBuffer(source);
  if (direct) return direct;

  if (typeof source !== "object") return null;
  if (visited.has(source)) return null;
  visited.add(source);

  const preferredKeys = [
    "pdfBuffer",
    "certificateBuffer",
    "certificatePdf",
    "certificatePDF",
    "pdfData",
    "certificateData",
    "fileBuffer",
    "documentBuffer",
    "attachmentBuffer",
    "pdf",
    "certificate",
    "certificateFile",
    "file",
    "document",
    "attachment",
    "uploadedFile",
    "storage",
  ];

  for (const key of preferredKeys) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const result = localCertFindPdfBuffer(
      source[key],
      depth + 1,
      visited
    );
    if (result) return result;
  }

  for (const [key, value] of Object.entries(source)) {
    if (!/(pdf|certificate|file|document|attachment|buffer|data)/i.test(key)) {
      continue;
    }
    const result = localCertFindPdfBuffer(
      value,
      depth + 1,
      visited
    );
    if (result) return result;
  }

  return null;
}

function localCertCollectObjectIds(source, depth = 0, results = new Map()) {
  if (!source || depth > 5) return [...results.values()];

  const add = (value) => {
    const id = objectId(value);
    if (id) results.set(String(id), id);
  };

  if (typeof source !== "object") {
    add(source);
    return [...results.values()];
  }

  for (const [key, value] of Object.entries(source)) {
    if (
      /(pdf|certificate|file|document|attachment|upload|storage|gridfs).*id$/i.test(
        key
      ) ||
      /^(pdfFileId|certificateFileId|fileId|gridFsId|gridfsId)$/i.test(key)
    ) {
      if (Array.isArray(value)) {
        value.forEach(add);
      } else if (value && typeof value === "object") {
        add(value._id);
        add(value.id);
        add(value.value);
      } else {
        add(value);
      }
    }

    if (value && typeof value === "object") {
      localCertCollectObjectIds(value, depth + 1, results);
    }
  }

  return [...results.values()];
}

function localCertFindUrl(source, depth = 0, visited = new Set()) {
  if (!source || depth > 5 || typeof source !== "object") return "";

  if (visited.has(source)) return "";
  visited.add(source);

  const preferredKeys = [
    "pdfUrl",
    "certificateUrl",
    "downloadUrl",
    "fileUrl",
    "secure_url",
    "secureUrl",
    "url",
  ];

  for (const key of preferredKeys) {
    const value = source[key];
    if (
      typeof value === "string" &&
      /^https?:\/\//i.test(value.trim())
    ) {
      return value.trim();
    }
  }

  for (const [key, value] of Object.entries(source)) {
    if (
      /(pdf|certificate|file|document|attachment|url)/i.test(key) &&
      typeof value === "string" &&
      /^https?:\/\//i.test(value.trim())
    ) {
      return value.trim();
    }

    if (value && typeof value === "object") {
      const nested = localCertFindUrl(value, depth + 1, visited);
      if (nested) return nested;
    }
  }

  return "";
}

async function localCertFindRecord(rawId) {
  const names = (await collectionNames()).filter(
    (name) =>
      finalCollectionIsReadable(name) &&
      !/\.files$/i.test(name) &&
      (
        /^certificates?$/i.test(name) ||
        /certificate/i.test(name)
      )
  );

  const objectIdValue = objectId(rawId);
  const upper = clean(rawId).toUpperCase();

  const queries = [
    ...(objectIdValue ? [{ _id: objectIdValue }] : []),
    { _id: rawId },
    { id: rawId },
    { certificateId: rawId },
    { certificateId: upper },
    { certId: rawId },
    { certificateNumber: rawId },
  ];

  for (const name of names) {
    const collection = mongoose.connection.db.collection(name);

    for (const query of queries) {
      const record = await collection.findOne(query);
      if (record) {
        return {
          record: finalPlainRecord(record, name),
          collectionName: name,
        };
      }
    }
  }

  return null;
}

async function localCertFindGridFsFile(record, rawId) {
  const names = await collectionNames();
  const filesCollections = names.filter(
    (name) =>
      /\.files$/i.test(name) &&
      !/^system\./i.test(name)
  );

  const candidateIds = new Map();
  const addId = (value) => {
    const id = objectId(value);
    if (id) candidateIds.set(String(id), id);
  };

  addId(rawId);
  addId(record?._id);
  localCertCollectObjectIds(record).forEach(addId);

  const certificateId = clean(
    record?.certificateId ||
      record?.certId ||
      record?.certificateNumber ||
      rawId
  );
  const recordId = objectId(record?._id || rawId);
  const filenames = [
    record?.pdfOriginalName,
    record?.originalName,
    record?.filename,
    record?.fileName,
    record?.certificateFileName,
  ]
    .map(clean)
    .filter(Boolean);

  for (const filesCollection of filesCollections) {
    const collection = mongoose.connection.db.collection(filesCollection);
    const queries = [
      ...[...candidateIds.values()].map((id) => ({ _id: id })),
      ...(recordId
        ? [
            { "metadata.certificateId": recordId },
            { "metadata.certificateRecordId": recordId },
            { "metadata.recordId": recordId },
            { "metadata.sourceId": recordId },
          ]
        : []),
      ...(certificateId
        ? [
            { "metadata.certificateId": certificateId },
            { "metadata.certificateNumber": certificateId },
            { "metadata.certId": certificateId },
          ]
        : []),
      ...filenames.map((filename) => ({ filename })),
    ];

    for (const query of queries) {
      const file = await collection.findOne(query);
      if (file) {
        return {
          bucketName: filesCollection.replace(/\.files$/i, ""),
          file,
        };
      }
    }
  }

  return null;
}

function localCertSendBuffer(res, buffer, record, rawId) {
  const filename = localCertSafeFilename(
    record?.pdfOriginalName ||
      record?.certificateFileName ||
      record?.filename ||
      `${clean(record?.certificateId || rawId) || "certificate"}.pdf`
  );

  const contentType = clean(
    record?.pdfContentType ||
      record?.contentType ||
      record?.mimeType ||
      "application/pdf"
  );

  res.setHeader("Content-Type", contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.setHeader("Content-Length", String(buffer.length));
  res.setHeader("Cache-Control", "private, no-store");
  return res.end(buffer);
}

function localCertStreamGridFs(res, next, bucketName, file, record, rawId) {
  const GridFSBucket = mongoose.mongo?.GridFSBucket;

  if (!GridFSBucket) {
    return res.status(500).json({
      success: false,
      message: "GridFS driver is unavailable",
    });
  }

  const filename = localCertSafeFilename(
    record?.pdfOriginalName ||
      file?.filename ||
      file?.metadata?.originalName ||
      `${clean(record?.certificateId || rawId) || "certificate"}.pdf`
  );

  const contentType = clean(
    record?.pdfContentType ||
      file?.contentType ||
      file?.metadata?.contentType ||
      file?.metadata?.mimeType ||
      "application/pdf"
  );

  res.setHeader("Content-Type", contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.setHeader("Cache-Control", "private, no-store");

  if (Number.isFinite(Number(file?.length))) {
    res.setHeader("Content-Length", String(file.length));
  }

  const stream = new GridFSBucket(mongoose.connection.db, {
    bucketName,
  }).openDownloadStream(file._id);

  stream.on("error", (error) => {
    if (res.headersSent) {
      res.destroy(error);
    } else {
      next(error);
    }
  });

  return stream.pipe(res);
}

async function localCertificateDownloadParityHandler(req, res, next) {
  try {
    const rawId = clean(req.params.id);
    const located = await localCertFindRecord(rawId);

    if (!located) {
      console.warn(
        `[admin-gateway] certificate download: record not found for ${rawId}`
      );
      return res.status(404).json({
        success: false,
        message: "Certificate record was not found",
      });
    }

    const { record, collectionName } = located;
    const pdfBuffer = localCertFindPdfBuffer(record);

    if (pdfBuffer) {
      console.log(
        `[admin-gateway] certificate download: embedded PDF from ${collectionName} (${pdfBuffer.length} bytes)`
      );
      return localCertSendBuffer(res, pdfBuffer, record, rawId);
    }

    const gridFs = await localCertFindGridFsFile(record, rawId);
    if (gridFs) {
      console.log(
        `[admin-gateway] certificate download: GridFS ${gridFs.bucketName}.files`
      );
      return localCertStreamGridFs(
        res,
        next,
        gridFs.bucketName,
        gridFs.file,
        record,
        rawId
      );
    }

    const remoteUrl = localCertFindUrl(record);
    if (remoteUrl) {
      console.log(
        `[admin-gateway] certificate download: redirecting to stored URL`
      );
      return res.redirect(302, remoteUrl);
    }

    console.warn(
      `[admin-gateway] certificate download: PDF storage missing for ${record.certificateId || rawId}; collection=${collectionName}; keys=${Object.keys(record).join(",")}`
    );

    return res.status(404).json({
      success: false,
      message:
        "The certificate record exists, but its uploaded PDF could not be found in local storage",
    });
  } catch (error) {
    next(error);
  }
}

app.get(
  "/api/admin/certificates/:id/download",
  requireAdministrator,
  localCertificateDownloadParityHandler
);
// FINAL_CERTIFICATE_DOWNLOAD_LOCAL_PARITY_END

// FINAL_ADMIN_DATA_RECOVERY_START
// Targeted compatibility layer for certificate and gallery reads.
// It deliberately does not replace any Management-section routes.

const FINAL_LIST_PROJECTION = {
  pdfBuffer: 0,
  certificateData: 0,
  certificateBase64: 0,
  imageData: 0,
  imageBase64: 0,
  fileData: 0,
  fileBase64: 0,
  videoData: 0,
  buffer: 0,
  data: 0,
  "file.data": 0,
  "image.data": 0,
  "media.data": 0,
  "metadata.data": 0,
  "metadata.buffer": 0,
};

function finalPlainRecord(document, sourceCollection = "") {
  const plain = asPlain(document) || {};
  const metadata =
    plain.metadata && typeof plain.metadata === "object" && !Array.isArray(plain.metadata)
      ? plain.metadata
      : {};
  const merged = { ...metadata, ...plain };
  const id = clean(merged._id || merged.id);
  return {
    ...merged,
    metadata,
    id,
    _id: id || merged._id,
    _sourceCollection: sourceCollection || merged._sourceCollection,
  };
}

function finalCollectionIsReadable(name) {
  return Boolean(name) && !/^system\./i.test(name) && !/\.chunks$/i.test(name);
}

async function finalReadCollection(collectionName, query = {}, limit = 5000) {
  if (!finalCollectionIsReadable(collectionName)) return [];
  const rows = await mongoose.connection.db
    .collection(collectionName)
    .find(query, { projection: FINAL_LIST_PROJECTION })
    .sort({ _id: -1 })
    .limit(limit)
    .toArray();
  return rows.map((row) => finalPlainRecord(row, collectionName));
}

function finalDistinctRows(rows, keyBuilder) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = keyBuilder(row);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function finalFirstValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && clean(value)) return value;
  }
  return "";
}

function finalCertificateLooksValid(row) {
  if (/^certificates?$/i.test(clean(row._sourceCollection))) return true;
  return Boolean(
    clean(row.certificateId || row.certificate_id || row.certId) ||
      clean(row.issuedTo || row.recipientName || row.internName) ||
      (
        clean(row.email) &&
        clean(row.type || row.domain || row.duration || row.tenure || row.issueDate)
      )
  );
}

function finalNormalizeCertificate(row) {
  const issuedTo = clean(
    finalFirstValue(
      row.issuedTo,
      row.recipientName,
      row.recipient,
      row.internName,
      row.candidateName,
      row.memberName,
      row.name
    )
  );
  const certificateId = clean(
    finalFirstValue(
      row.certificateId,
      row.certificate_id,
      row.certId,
      row.certificateNumber,
      row.number
    )
  );
  const status = clean(finalFirstValue(row.status, row.certificateStatus));
  const isValid =
    typeof row.isValid === "boolean"
      ? row.isValid
      : !/revoked|invalid|cancelled/i.test(status);

  return {
    ...row,
    certificateId,
    issuedTo,
    type: clean(finalFirstValue(row.type, row.certificateType, row.category)),
    domain: clean(finalFirstValue(row.domain, row.department, row.specialization)),
    duration: clean(finalFirstValue(row.duration, row.tenure, row.period)),
    issueDate: finalFirstValue(
      row.issueDate,
      row.issuedAt,
      row.dateIssued,
      row.createdAt
    ),
    isValid,
    status: status || (isValid ? "Valid" : "Revoked"),
  };
}

async function finalCertificateRows() {
  const names = (await collectionNames()).filter(
    (name) =>
      finalCollectionIsReadable(name) &&
      (/^certificates?$/i.test(name) || /certificate/i.test(name))
  );

  const rows = [];
  for (const name of names) {
    const records = await finalReadCollection(name);
    rows.push(...records.filter(finalCertificateLooksValid));
  }

  return finalDistinctRows(
    rows.map(finalNormalizeCertificate),
    (row) =>
      clean(row.certificateId).toLowerCase() ||
      `${clean(row._sourceCollection)}:${clean(row._id)}`
  );
}

async function finalCertificatesHandler(_req, res, next) {
  try {
    const certificates = await finalCertificateRows();
    console.log(
      `[admin-gateway] certificates: ${certificates.length} record(s) loaded`
    );
    res.json({
      success: true,
      certificates,
      data: certificates,
      count: certificates.length,
    });
  } catch (error) {
    next(error);
  }
}

function finalGalleryFolderCollection(name) {
  return (
    finalCollectionIsReadable(name) &&
    !/\.files$/i.test(name) &&
    (
      /^galleryfolders?$/i.test(name) ||
      /gallery.*folder/i.test(name) ||
      /albums?/i.test(name)
    )
  );
}

function finalGalleryMediaCollection(name) {
  return (
    finalCollectionIsReadable(name) &&
    !/folder/i.test(name) &&
    !/album/i.test(name) &&
    (
      /^galleries$/i.test(name) ||
      /^gallery$/i.test(name) ||
      /gallery.*media/i.test(name) ||
      /media/i.test(name) ||
      /images?/i.test(name)
    )
  );
}

function finalNormalizeGalleryMedia(row) {
  const sourceCollection = clean(row._sourceCollection);
  const isGridFsFile = /\.files$/i.test(sourceCollection);
  const bucketName = isGridFsFile
    ? sourceCollection.replace(/\.files$/i, "")
    : "";
  const id = clean(row._id || row.id);
  const contentType = clean(
    finalFirstValue(
      row.contentType,
      row.mimeType,
      row.mimetype,
      row.fileType,
      row.type
    )
  );

  const existingUrl = clean(
    finalFirstValue(
      row.imageUrl,
      row.secure_url,
      row.secureUrl,
      row.mediaUrl,
      row.fileUrl,
      row.cloudinaryUrl,
      row.url,
      row.path,
      row.image?.url,
      row.file?.url,
      row.media?.url
    )
  );

  const imageUrl =
    isGridFsFile && bucketName && id
      ? `/api/admin/gallery/gridfs/${encodeURIComponent(bucketName)}/${encodeURIComponent(id)}`
      : existingUrl;

  const filename = clean(
    finalFirstValue(
      row.originalName,
      row.filename,
      row.fileName,
      row.name,
      row.title
    )
  );

  return {
    ...row,
    id,
    _id: id || row._id,
    title: clean(finalFirstValue(row.title, row.caption, filename, "Gallery media")),
    originalName: filename,
    contentType,
    mediaType:
      clean(row.mediaType) ||
      (contentType.startsWith("video/") ? "video" : "image"),
    size: Number(finalFirstValue(row.size, row.length, row.fileSize, 0)) || 0,
    imageUrl,
    _gridFsBucket: bucketName,
  };
}

async function finalGalleryRows() {
  const names = (await collectionNames()).filter(finalGalleryMediaCollection);
  const rows = [];
  for (const name of names) {
    rows.push(...(await finalReadCollection(name)));
  }

  return finalDistinctRows(
    rows.map(finalNormalizeGalleryMedia),
    (row) =>
      clean(row.imageUrl) ||
      clean(row.fileId) ||
      `${clean(row._sourceCollection)}:${clean(row._id)}`
  );
}

async function finalGalleryFolderRows() {
  const names = (await collectionNames()).filter(finalGalleryFolderCollection);
  const rows = [];
  for (const name of names) {
    rows.push(...(await finalReadCollection(name)));
  }

  return finalDistinctRows(
    rows.map((row) => ({
      ...row,
      id: clean(row._id || row.id),
      _id: clean(row._id || row.id),
      name: clean(finalFirstValue(row.name, row.title, row.folderName, row.albumName)),
      description: clean(finalFirstValue(row.description, row.details)),
    })),
    (row) =>
      clean(row._id) ||
      clean(row.slug).toLowerCase() ||
      clean(row.name).toLowerCase()
  );
}

function finalAddToken(set, value) {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    for (const item of value) finalAddToken(set, item);
    return;
  }

  if (typeof value === "object") {
    for (const key of [
      "_id",
      "id",
      "value",
      "name",
      "title",
      "slug",
      "folderId",
      "folder_id",
      "albumId",
      "galleryFolderId",
      "parentFolderId",
      "projectFolderId",
      "categoryId",
    ]) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        finalAddToken(set, value[key]);
      }
    }
    return;
  }

  const token = clean(value).toLowerCase();
  if (token) set.add(token);
}

function finalFolderTokens(folder) {
  const tokens = new Set();
  for (const value of [
    folder?._id,
    folder?.id,
    folder?.name,
    folder?.title,
    folder?.slug,
    folder?.folder,
    folder?.album,
  ]) {
    finalAddToken(tokens, value);
  }
  return tokens;
}

function finalMediaFolderTokens(media) {
  const tokens = new Set();
  const metadata =
    media?.metadata && typeof media.metadata === "object"
      ? media.metadata
      : {};

  for (const value of [
    media?.folderId,
    media?.folder_id,
    media?.galleryFolderId,
    media?.galleryFolder,
    media?.parentFolderId,
    media?.projectFolderId,
    media?.projectFolder,
    media?.albumId,
    media?.album_id,
    media?.categoryId,
    media?.folder,
    media?.folderName,
    media?.album,
    media?.albumName,
    media?.category,
    media?.project,
    media?.projectId,
    metadata.folderId,
    metadata.folder_id,
    metadata.galleryFolderId,
    metadata.galleryFolder,
    metadata.parentFolderId,
    metadata.projectFolderId,
    metadata.projectFolder,
    metadata.albumId,
    metadata.album_id,
    metadata.categoryId,
    metadata.folder,
    metadata.folderName,
    metadata.album,
    metadata.albumName,
    metadata.category,
    metadata.project,
    metadata.projectId,
  ]) {
    finalAddToken(tokens, value);
  }
  return tokens;
}

function finalMediaBelongsToFolder(media, folder) {
  const folderTokens = finalFolderTokens(folder);
  const mediaTokens = finalMediaFolderTokens(media);
  if (!folderTokens.size || !mediaTokens.size) return false;
  for (const token of folderTokens) {
    if (mediaTokens.has(token)) return true;
  }
  return false;
}

function finalDisplayRelation(media) {
  for (const value of [
    media.folderName,
    media.albumName,
    media.category,
    media.galleryFolder,
    media.projectFolder,
    media.folder,
    media.album,
    media.folderId,
    media.galleryFolderId,
    media.projectFolderId,
    media.albumId,
  ]) {
    if (value && typeof value === "object") {
      const nested = clean(value.name || value.title || value.slug || value._id || value.id);
      if (nested) return nested;
    } else {
      const text = clean(value);
      if (text) return text;
    }
  }
  return "";
}

function finalDecorateFolders(folders, mediaRows) {
  return folders.map((folder) => {
    const matches = mediaRows.filter((media) =>
      finalMediaBelongsToFolder(media, folder)
    );
    const coverId = clean(folder.coverMediaId || folder.coverId);
    const coverMedia =
      (coverId &&
        matches.find(
          (media) => clean(media._id || media.id || media.fileId) === coverId
        )) ||
      matches[0] ||
      null;

    return {
      ...folder,
      mediaCount: matches.length,
      count: matches.length,
      coverMedia,
    };
  });
}

function finalDerivedFolders(mediaRows) {
  const byName = new Map();
  for (const media of mediaRows) {
    const name = finalDisplayRelation(media);
    if (!name) continue;
    const key = name.toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, {
        id: name,
        _id: name,
        name,
        title: name,
        description: "",
      });
    }
  }
  return [...byName.values()];
}

async function finalGallerySnapshot() {
  const [rawFolders, mediaRows] = await Promise.all([
    finalGalleryFolderRows(),
    finalGalleryRows(),
  ]);
  const folders = finalDecorateFolders(
    rawFolders.length ? rawFolders : finalDerivedFolders(mediaRows),
    mediaRows
  );
  return { folders, mediaRows };
}

async function finalGalleryFoldersReadHandler(_req, res, next) {
  try {
    const { folders, mediaRows } = await finalGallerySnapshot();
    console.log(
      `[admin-gateway] gallery: ${folders.length} folder(s), ${mediaRows.length} media record(s)`
    );
    res.json({
      success: true,
      folders,
      data: folders,
      count: folders.length,
    });
  } catch (error) {
    next(error);
  }
}

async function finalGalleryFolderMediaReadHandler(req, res, next) {
  try {
    const { folders, mediaRows } = await finalGallerySnapshot();
    const requestedId = clean(req.params.folderId);
    const requestedToken = requestedId.toLowerCase();
    const folder =
      folders.find((item) => finalFolderTokens(item).has(requestedToken)) || {
        id: requestedId,
        _id: requestedId,
        name: requestedId,
        title: requestedId,
      };

    const images = mediaRows.filter((media) =>
      finalMediaBelongsToFolder(media, folder)
    );
    const folderWithCount = {
      ...folder,
      mediaCount: images.length,
      count: images.length,
      coverMedia: folder.coverMedia || images[0] || null,
    };

    res.json({
      success: true,
      folder: folderWithCount,
      images,
      media: images,
      data: images,
      count: images.length,
    });
  } catch (error) {
    next(error);
  }
}

async function finalGalleryGridFsHandler(req, res, next) {
  try {
    const bucketName = clean(req.params.bucket);
    const fileId = objectId(req.params.id);

    if (
      !fileId ||
      !/^[A-Za-z0-9_.-]+$/.test(bucketName) ||
      !/(gallery|media|image)/i.test(bucketName) ||
      /\.files$|\.chunks$/i.test(bucketName)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery file reference",
      });
    }

    const filesCollection = `${bucketName}.files`;
    const available = await collectionNames();
    if (!available.includes(filesCollection)) {
      return res.status(404).json({
        success: false,
        message: "Gallery file bucket was not found",
      });
    }

    const file = await mongoose.connection.db
      .collection(filesCollection)
      .findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Gallery file was not found",
      });
    }

    const contentType = clean(
      file.contentType ||
        file.metadata?.contentType ||
        file.metadata?.mimeType ||
        "application/octet-stream"
    );
    const filename = clean(
      file.filename || file.metadata?.originalName || "gallery-file"
    ).replace(/[\r\n"]/g, "_");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    if (Number.isFinite(Number(file.length))) {
      res.setHeader("Content-Length", String(file.length));
    }

    const GridFSBucket = mongoose.mongo?.GridFSBucket;
    if (!GridFSBucket) {
      return res.status(500).json({
        success: false,
        message: "GridFS driver is unavailable",
      });
    }

    const stream = new GridFSBucket(mongoose.connection.db, {
      bucketName,
    }).openDownloadStream(fileId);

    stream.on("error", (error) => {
      if (res.headersSent) {
        res.destroy(error);
      } else {
        next(error);
      }
    });
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
}

app.get(
  "/api/admin/certificates",
  requireAdministrator,
  finalCertificatesHandler
);
app.get(
  "/api/admin/gallery/folders",
  requireAdministrator,
  finalGalleryFoldersReadHandler
);
app.get(
  "/api/admin/gallery/folders/:folderId/media",
  requireAdministrator,
  finalGalleryFolderMediaReadHandler
);
app.get(
  "/api/admin/gallery/gridfs/:bucket/:id",
  finalGalleryGridFsHandler
);
// FINAL_MEDIA_AND_CERTIFICATE_BINARY_DELIVERY_START
// Public gallery media delivery is required because <img>/<video> requests do
// not carry the Axios Authorization header. Certificate downloads remain admin-only.

function finalToBuffer(value) {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value;

  if (value.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }

  if (value._bsontype === "Binary") {
    if (typeof value.value === "function") {
      try {
        const raw = value.value(true);
        if (raw) return Buffer.from(raw);
      } catch {
        // Fall through to the buffer property.
      }
    }
    if (value.buffer) return Buffer.from(value.buffer);
  }

  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }

  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }

  if (value.buffer && (Buffer.isBuffer(value.buffer) || ArrayBuffer.isView(value.buffer))) {
    return Buffer.from(value.buffer);
  }

  return null;
}

function finalNestedValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function finalFirstBinary(source, paths) {
  for (const path of paths) {
    const buffer = finalToBuffer(finalNestedValue(source, path));
    if (buffer?.length) return buffer;
  }
  return null;
}

function finalSafeFilename(value, fallback) {
  const name = clean(value || fallback)
    .replace(/[\r\n"]/g, "_")
    .replace(/[\\/]/g, "_");
  return name || fallback;
}

function finalMimeFromFilename(filename, fallback = "application/octet-stream") {
  const lower = clean(filename).toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  return fallback;
}

function finalSendBuffer(res, buffer, options = {}) {
  const filename = finalSafeFilename(
    options.filename,
    options.download ? "certificate.pdf" : "gallery-file"
  );
  const contentType =
    clean(options.contentType) ||
    finalMimeFromFilename(filename, "application/octet-stream");

  res.setHeader("Content-Type", contentType);
  res.setHeader(
    "Content-Disposition",
    `${options.download ? "attachment" : "inline"}; filename="${filename}"`
  );
  res.setHeader(
    "Cache-Control",
    options.download ? "private, no-store" : "public, max-age=3600"
  );
  res.setHeader("Content-Length", String(buffer.length));
  return res.end(buffer);
}

function finalAbsoluteMediaUrl(record) {
  return clean(
    finalFirstValue(
      record.secure_url,
      record.secureUrl,
      record.cloudinaryUrl,
      record.imageUrl,
      record.mediaUrl,
      record.fileUrl,
      record.downloadUrl,
      record.url,
      record.path,
      record.image?.secure_url,
      record.image?.url,
      record.file?.url,
      record.media?.url,
      record.metadata?.secure_url,
      record.metadata?.url
    )
  );
}

function finalGalleryBinary(record) {
  return finalFirstBinary(record, [
    "buffer",
    "data",
    "imageData",
    "fileData",
    "mediaData",
    "binary",
    "image.buffer",
    "image.data",
    "file.buffer",
    "file.data",
    "media.buffer",
    "media.data",
    "metadata.buffer",
    "metadata.data",
  ]);
}

function finalCertificateBinary(record) {
  return finalFirstBinary(record, [
    "pdfBuffer",
    "certificateBuffer",
    "fileBuffer",
    "pdf.data",
    "pdf.buffer",
    "certificate.data",
    "certificate.buffer",
    "file.data",
    "file.buffer",
  ]);
}

function finalObjectIdCandidates(...values) {
  const ids = [];
  const seen = new Set();

  const add = (value) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }
    if (typeof value === "object" && !value._bsontype) {
      for (const key of ["_id", "id", "fileId", "gridFsId", "gridfsId", "value"]) {
        if (Object.prototype.hasOwnProperty.call(value, key)) add(value[key]);
      }
      return;
    }

    const id = objectId(value);
    if (!id) return;
    const key = String(id);
    if (seen.has(key)) return;
    seen.add(key);
    ids.push(id);
  };

  values.forEach(add);
  return ids;
}

async function finalFindDocument(collectionNamesToSearch, rawId, extraQueries = []) {
  const id = objectId(rawId);
  const queries = [
    ...(id ? [{ _id: id }] : []),
    { _id: rawId },
    { id: rawId },
    ...extraQueries,
  ];

  for (const collectionName of collectionNamesToSearch) {
    if (!finalCollectionIsReadable(collectionName)) continue;
    const collection = mongoose.connection.db.collection(collectionName);
    for (const query of queries) {
      const record = await collection.findOne(query);
      if (record) return finalPlainRecord(record, collectionName);
    }
  }
  return null;
}

async function finalFindGridFsFile(record, requestedId) {
  const allNames = await collectionNames();
  const filesCollections = allNames.filter(
    (name) =>
      /\.files$/i.test(name) &&
      finalCollectionIsReadable(name) &&
      /(gallery|media|image|upload|file)/i.test(name)
  );

  const sourceCollection = clean(record?._sourceCollection);
  if (/\.files$/i.test(sourceCollection)) {
    return {
      bucketName: sourceCollection.replace(/\.files$/i, ""),
      file: record,
    };
  }

  const candidateIds = finalObjectIdCandidates(
    requestedId,
    record?._id,
    record?.fileId,
    record?.gridFsId,
    record?.gridfsId,
    record?.mediaFileId,
    record?.imageFileId,
    record?.storageId,
    record?.uploadId,
    record?.metadata?.fileId,
    record?.metadata?.gridFsId,
    record?.metadata?.gridfsId,
    record?.metadata?.uploadId
  );

  const recordId = objectId(record?._id || requestedId);
  const filename = clean(
    finalFirstValue(
      record?.originalName,
      record?.filename,
      record?.fileName,
      record?.name,
      record?.metadata?.filename,
      record?.metadata?.originalName
    )
  );

  for (const filesCollection of filesCollections) {
    const collection = mongoose.connection.db.collection(filesCollection);
    const queries = [
      ...candidateIds.map((candidateId) => ({ _id: candidateId })),
      ...(recordId
        ? [
            { "metadata.mediaId": recordId },
            { "metadata.galleryId": recordId },
            { "metadata.sourceId": recordId },
            { "metadata.recordId": recordId },
          ]
        : []),
      ...(filename ? [{ filename }] : []),
    ];

    for (const query of queries) {
      const file = await collection.findOne(query);
      if (file) {
        return {
          bucketName: filesCollection.replace(/\.files$/i, ""),
          file,
        };
      }
    }
  }

  return null;
}

function finalStreamGridFs(res, next, bucketName, file, options = {}) {
  const GridFSBucket = mongoose.mongo?.GridFSBucket;
  if (!GridFSBucket) {
    return res.status(500).json({
      success: false,
      message: "GridFS driver is unavailable",
    });
  }

  const filename = finalSafeFilename(
    options.filename ||
      file.filename ||
      file.metadata?.originalName ||
      file.metadata?.filename,
    options.download ? "certificate.pdf" : "gallery-file"
  );
  const contentType =
    clean(
      options.contentType ||
        file.contentType ||
        file.metadata?.contentType ||
        file.metadata?.mimeType
    ) || finalMimeFromFilename(filename);

  res.setHeader("Content-Type", contentType);
  res.setHeader(
    "Content-Disposition",
    `${options.download ? "attachment" : "inline"}; filename="${filename}"`
  );
  res.setHeader(
    "Cache-Control",
    options.download ? "private, no-store" : "public, max-age=3600"
  );
  if (Number.isFinite(Number(file.length))) {
    res.setHeader("Content-Length", String(file.length));
  }

  const stream = new GridFSBucket(mongoose.connection.db, {
    bucketName,
  }).openDownloadStream(file._id);

  stream.on("error", (error) => {
    if (res.headersSent) {
      res.destroy(error);
    } else {
      next(error);
    }
  });
  stream.pipe(res);
}

async function finalGalleryMediaDeliveryHandler(req, res, next) {
  try {
    const requestedId = clean(req.params.id);
    const names = (await collectionNames()).filter(
      (name) =>
        finalCollectionIsReadable(name) &&
        !/folder|album/i.test(name) &&
        (finalGalleryMediaCollection(name) || /\.files$/i.test(name))
    );

    const record = await finalFindDocument(names, requestedId, [
      { mediaId: requestedId },
      { fileId: requestedId },
      { "metadata.mediaId": requestedId },
    ]);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Gallery media was not found",
      });
    }

    const binary = finalGalleryBinary(record);
    if (binary) {
      const filename = finalFirstValue(
        record.originalName,
        record.filename,
        record.fileName,
        record.name,
        record.title,
        "gallery-file"
      );
      const contentType = finalFirstValue(
        record.contentType,
        record.mimeType,
        record.mimetype,
        record.fileType,
        record.metadata?.contentType,
        record.metadata?.mimeType
      );
      return finalSendBuffer(res, binary, {
        filename,
        contentType,
        download: false,
      });
    }

    const gridFsFile = await finalFindGridFsFile(record, requestedId);
    if (gridFsFile) {
      return finalStreamGridFs(
        res,
        next,
        gridFsFile.bucketName,
        gridFsFile.file,
        { download: false }
      );
    }

    const url = finalAbsoluteMediaUrl(record);
    if (url && url !== req.originalUrl) {
      return res.redirect(302, url);
    }

    return res.status(404).json({
      success: false,
      message: "Gallery media file is missing from storage",
    });
  } catch (error) {
    next(error);
  }
}

async function finalCertificateDownloadHandler(req, res, next) {
  try {
    const requestedId = clean(req.params.id);
    const names = (await collectionNames()).filter(
      (name) =>
        finalCollectionIsReadable(name) &&
        (/^certificates?$/i.test(name) || /certificate/i.test(name))
    );

    const record = await finalFindDocument(names, requestedId, [
      { certificateId: requestedId },
      { certificateId: requestedId.toUpperCase() },
      { certId: requestedId },
    ]);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Certificate was not found",
      });
    }

    const certificateName = finalSafeFilename(
      `${clean(record.certificateId || requestedId) || "certificate"}.pdf`,
      "certificate.pdf"
    );

    const pdf = finalCertificateBinary(record);
    if (pdf) {
      return finalSendBuffer(res, pdf, {
        filename: finalFirstValue(record.pdfOriginalName, certificateName),
        contentType: finalFirstValue(
          record.pdfContentType,
          record.contentType,
          "application/pdf"
        ),
        download: true,
      });
    }

    const gridFsFile = await finalFindGridFsFile(record, requestedId);
    if (gridFsFile) {
      return finalStreamGridFs(
        res,
        next,
        gridFsFile.bucketName,
        gridFsFile.file,
        {
          filename: finalFirstValue(record.pdfOriginalName, certificateName),
          contentType: "application/pdf",
          download: true,
        }
      );
    }

    const url = clean(
      finalFirstValue(
        record.pdfUrl,
        record.certificateUrl,
        record.downloadUrl,
        record.fileUrl,
        record.secure_url,
        record.url,
        record.file?.url,
        record.pdf?.url
      )
    );
    if (url && url !== req.originalUrl) {
      return res.redirect(302, url);
    }

    return res.status(404).json({
      success: false,
      message: "No PDF is stored for this certificate. Use Replace PDF once.",
    });
  } catch (error) {
    next(error);
  }
}

app.get(
  "/api/gallery/media/:id",
  finalGalleryMediaDeliveryHandler
);
app.get(
  "/api/admin/certificates/:id/download",
  requireAdministrator,
  finalCertificateDownloadHandler
);
// FINAL_MEDIA_AND_CERTIFICATE_BINARY_DELIVERY_END


// FINAL_ADMIN_DATA_RECOVERY_END

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
