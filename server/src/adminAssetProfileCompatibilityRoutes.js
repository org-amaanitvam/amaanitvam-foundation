import express from "express";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import mongoose from "mongoose";
import { authenticate } from "./middleware/authenticate.js";

const router = express.Router();
const { ObjectId, GridFSBucket } = mongoose.mongo;

let collectionCache = {
  expiresAt: 0,
  names: [],
};

const normalizeName = (value = "") =>
  String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

const safeFilename = (value, fallback) => {
  const cleaned = String(value || fallback)
    .replace(/[\r\n"]/g, "")
    .replace(/[\\/:*?<>|]+/g, "-")
    .trim();

  return cleaned || fallback;
};

const getDb = () => {
  if (!mongoose.connection?.db) {
    const error = new Error("MongoDB is not connected");
    error.statusCode = 503;
    throw error;
  }

  return mongoose.connection.db;
};

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

async function collectionNames() {
  const now = Date.now();

  if (collectionCache.expiresAt > now && collectionCache.names.length) {
    return collectionCache.names;
  }

  const rows = await getDb()
    .listCollections({}, { nameOnly: true })
    .toArray();

  collectionCache = {
    expiresAt: now + 30_000,
    names: rows.map((row) => row.name),
  };

  return collectionCache.names;
}

async function resolveCollections(aliases, keywords = []) {
  const names = await collectionNames();
  const normalizedAliases = new Set(aliases.map(normalizeName));

  const exact = names.filter((name) =>
    normalizedAliases.has(normalizeName(name))
  );

  if (exact.length) return exact;

  return names.filter((name) => {
    const normalized = normalizeName(name);

    return keywords.some((keyword) =>
      normalized.includes(normalizeName(keyword))
    );
  });
}

function idQueries(id, extraFields = []) {
  const conditions = [];

  if (ObjectId.isValid(id)) {
    conditions.push({ _id: new ObjectId(id) });
  }

  conditions.push({ _id: id });

  for (const field of extraFields) {
    conditions.push({ [field]: id });
  }

  return conditions;
}

async function findDocumentById({
  id,
  aliases,
  keywords,
  extraFields = [],
}) {
  const names = await resolveCollections(aliases, keywords);
  const conditions = idQueries(id, extraFields);

  for (const name of names) {
    const document = await getDb()
      .collection(name)
      .findOne({ $or: conditions });

    if (document) {
      return {
        document,
        collectionName: name,
      };
    }
  }

  return null;
}

function valueToBuffer(value) {
  if (!value) return null;

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (
    value instanceof ArrayBuffer ||
    Object.prototype.toString.call(value) === "[object ArrayBuffer]"
  ) {
    return Buffer.from(value);
  }

  if (value?._bsontype === "Binary") {
    try {
      if (typeof value.value === "function") {
        const raw = value.value(true);
        if (raw) return Buffer.from(raw);
      }
    } catch {
      // Fall through to the other Binary representations.
    }

    if (value.buffer) {
      return Buffer.from(value.buffer);
    }
  }

  if (value?.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }

  if (value?.$binary?.base64) {
    return Buffer.from(value.$binary.base64, "base64");
  }

  if (value?.buffer) {
    const nested = valueToBuffer(value.buffer);
    if (nested) return nested;
  }

  return null;
}

function stringToPayload(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  const dataUri = trimmed.match(
    /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,([\s\S]+)$/i
  );

  if (dataUri) {
    return {
      mimeType: dataUri[1] || "application/octet-stream",
      buffer: Buffer.from(dataUri[2], "base64"),
    };
  }

  if (
    trimmed.length >= 128 &&
    trimmed.length % 4 === 0 &&
    /^[A-Za-z0-9+/=\r\n]+$/.test(trimmed)
  ) {
    try {
      const buffer = Buffer.from(trimmed, "base64");

      if (buffer.length >= 32) {
        return {
          mimeType: null,
          buffer,
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

function sniffMimeType(buffer, fallback) {
  if (!buffer?.length) return fallback;

  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  const header = buffer.subarray(0, 12).toString("ascii");

  if (header.startsWith("GIF87a") || header.startsWith("GIF89a")) {
    return "image/gif";
  }

  if (header.startsWith("RIFF") && header.endsWith("WEBP")) {
    return "image/webp";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(4, 8).toString("ascii") === "ftyp"
  ) {
    return "video/mp4";
  }

  return fallback;
}

function candidateValues(document, keys) {
  const containers = [
    document,
    document?.file,
    document?.image,
    document?.media,
    document?.upload,
    document?.asset,
    document?.certificate,
    document?.pdf,
    document?.document,
  ].filter((item) => item && typeof item === "object");

  const values = [];

  for (const container of containers) {
    for (const key of keys) {
      if (container[key] !== undefined && container[key] !== null) {
        values.push(container[key]);
      }
    }
  }

  return values;
}

function firstString(document, keys) {
  for (const value of candidateValues(document, keys)) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value || "");
}

function isApiSelfReference(value, routePrefix) {
  if (!value) return false;

  try {
    const parsed = new URL(value, "http://local.invalid");
    return parsed.pathname.startsWith(routePrefix);
  } catch {
    return value.startsWith(routePrefix);
  }
}

async function proxyRemoteAsset({
  url,
  res,
  fallbackMime,
  disposition,
  filename,
}) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Amaanitvam-Asset-Proxy/1.0",
    },
  });

  if (!response.ok || !response.body) {
    const error = new Error(
      `Stored remote file returned HTTP ${response.status}`
    );
    error.statusCode = 502;
    throw error;
  }

  res.status(200);
  res.setHeader(
    "Content-Type",
    response.headers.get("content-type") || fallbackMime
  );
  res.setHeader("Cache-Control", "public, max-age=3600");

  if (disposition) {
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${safeFilename(filename, "file")}"`
    );
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }

  Readable.fromWeb(response.body).pipe(res);
}

function resolveExistingLocalFile(storedPath) {
  if (!storedPath || typeof storedPath !== "string") return null;
  if (isRemoteUrl(storedPath) || storedPath.startsWith("data:")) return null;

  const cleaned = storedPath.replace(/^file:\/\//, "");
  const relative = cleaned.replace(/^[/\\]+/, "");

  const candidates = [
    path.resolve(cleaned),
    path.resolve(process.cwd(), cleaned),
    path.resolve(process.cwd(), relative),
    path.resolve(process.cwd(), "server", cleaned),
    path.resolve(process.cwd(), "server", relative),
    path.resolve(process.cwd(), "server", "uploads", relative),
    path.resolve(process.cwd(), "uploads", relative),
    path.resolve(process.cwd(), "public", relative),
  ];

  return candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) || null;
}

async function streamGridFsAsset({
  document,
  res,
  fallbackMime,
  disposition,
  filename,
}) {
  const identifiers = candidateValues(document, [
    "gridFsId",
    "gridfsId",
    "fileId",
    "uploadId",
    "storageId",
  ]);

  const objectIds = identifiers
    .flatMap((value) => {
      const text = String(value?._id || value || "");
      return ObjectId.isValid(text) ? [new ObjectId(text)] : [];
    });

  if (!objectIds.length && ObjectId.isValid(String(document?._id || ""))) {
    objectIds.push(new ObjectId(String(document._id)));
  }

  if (!objectIds.length) return false;

  const names = await collectionNames();
  const filesCollections = names.filter((name) => name.endsWith(".files"));

  for (const filesCollection of filesCollections) {
    const bucketName = filesCollection.slice(0, -".files".length);
    const file = await getDb()
      .collection(filesCollection)
      .findOne({ _id: { $in: objectIds } });

    if (!file) continue;

    res.status(200);
    res.setHeader(
      "Content-Type",
      file.contentType ||
        file.metadata?.contentType ||
        fallbackMime
    );
    res.setHeader("Cache-Control", "public, max-age=3600");

    if (disposition) {
      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${safeFilename(
          file.filename || filename,
          "file"
        )}"`
      );
    }

    const bucket = new GridFSBucket(getDb(), { bucketName });
    const stream = bucket.openDownloadStream(file._id);

    stream.on("error", (error) => {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      } else {
        res.destroy(error);
      }
    });

    stream.pipe(res);
    return true;
  }

  return false;
}

async function serveStoredAsset({
  document,
  res,
  binaryKeys,
  urlKeys,
  pathKeys,
  mimeKeys,
  fallbackMime,
  disposition,
  filename,
  selfRoutePrefix,
}) {
  const declaredMime =
    firstString(document, mimeKeys) || fallbackMime;

  for (const value of candidateValues(document, binaryKeys)) {
    const directBuffer = valueToBuffer(value);

    if (directBuffer?.length) {
      const mimeType = sniffMimeType(directBuffer, declaredMime);

      res.status(200);
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", directBuffer.length);
      res.setHeader("Cache-Control", "public, max-age=3600");

      if (disposition) {
        res.setHeader(
          "Content-Disposition",
          `${disposition}; filename="${safeFilename(filename, "file")}"`
        );
      }

      res.end(directBuffer);
      return true;
    }

    const stringPayload = stringToPayload(value);

    if (stringPayload?.buffer?.length) {
      const mimeType = sniffMimeType(
        stringPayload.buffer,
        stringPayload.mimeType || declaredMime
      );

      res.status(200);
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", stringPayload.buffer.length);
      res.setHeader("Cache-Control", "public, max-age=3600");

      if (disposition) {
        res.setHeader(
          "Content-Disposition",
          `${disposition}; filename="${safeFilename(filename, "file")}"`
        );
      }

      res.end(stringPayload.buffer);
      return true;
    }
  }

  for (const value of candidateValues(document, urlKeys)) {
    if (
      typeof value === "string" &&
      isRemoteUrl(value) &&
      !isApiSelfReference(value, selfRoutePrefix)
    ) {
      await proxyRemoteAsset({
        url: value,
        res,
        fallbackMime: declaredMime,
        disposition,
        filename,
      });
      return true;
    }
  }

  const cloudinaryPublicId = firstString(document, [
    "public_id",
    "publicId",
    "cloudinaryPublicId",
  ]);

  if (cloudinaryPublicId && process.env.CLOUDINARY_CLOUD_NAME) {
    const resourceType =
      fallbackMime === "application/pdf" ? "raw" : "image";

    const cloudinaryUrl =
      `https://res.cloudinary.com/` +
      `${process.env.CLOUDINARY_CLOUD_NAME}/` +
      `${resourceType}/upload/${cloudinaryPublicId}`;

    await proxyRemoteAsset({
      url: cloudinaryUrl,
      res,
      fallbackMime: declaredMime,
      disposition,
      filename,
    });
    return true;
  }

  for (const storedPath of candidateValues(document, pathKeys)) {
    const localFile = resolveExistingLocalFile(storedPath);

    if (localFile) {
      res.status(200);
      res.setHeader("Content-Type", declaredMime);
      res.setHeader("Cache-Control", "public, max-age=3600");

      if (disposition) {
        res.setHeader(
          "Content-Disposition",
          `${disposition}; filename="${safeFilename(filename, "file")}"`
        );
      }

      res.sendFile(localFile);
      return true;
    }
  }

  return streamGridFsAsset({
    document,
    res,
    fallbackMime: declaredMime,
    disposition,
    filename,
  });
}

async function findAuthenticatedUser(decodedToken) {
  const names = await resolveCollections(
    ["users", "userprofiles", "admins", "adminusers", "members"],
    ["user", "admin", "member"]
  );

  const uid = decodedToken?.uid || decodedToken?.sub || "";
  const email = String(decodedToken?.email || "").trim().toLowerCase();

  const conditions = [];

  if (uid) {
    conditions.push(
      { firebaseUid: uid },
      { firebaseUID: uid },
      { uid },
      { authUid: uid }
    );
  }

  if (email) {
    conditions.push(
      { email },
      { emailAddress: email },
      { adminEmail: email }
    );
  }

  if (!conditions.length) return null;

  for (const name of names) {
    const document = await getDb()
      .collection(name)
      .findOne({ $or: conditions });

    if (document) {
      return {
        document,
        collectionName: name,
      };
    }
  }

  return null;
}

function normalizedUser(document, decodedToken) {
  const tokenEmail = decodedToken?.email || "";

  return {
    ...document,
    _id: document?._id,
    firebaseUid:
      document?.firebaseUid ||
      document?.uid ||
      decodedToken?.uid ||
      decodedToken?.sub ||
      "",
    name:
      document?.name ||
      document?.fullName ||
      decodedToken?.name ||
      tokenEmail.split("@")[0] ||
      "Admin",
    email:
      document?.email ||
      document?.emailAddress ||
      tokenEmail,
    phone:
      document?.phone ||
      document?.phoneNumber ||
      document?.mobile ||
      "",
    role:
      document?.role ||
      decodedToken?.role ||
      decodedToken?.adminRole ||
      "admin",
    status: document?.status || "active",
    department:
      document?.department ||
      document?.domain ||
      "",
    designation: document?.designation || "",
    domain: document?.domain || document?.department || "",
    profileImage:
      document?.profileImage ||
      document?.avatar ||
      document?.photoURL ||
      decodedToken?.picture ||
      "",
  };
}

/*
 * Public gallery binary endpoint.
 * It must remain public because an <img> element cannot attach the admin
 * Authorization header.
 */
router.get(
  "/api/gallery/media/:id",
  asyncRoute(async (req, res) => {
    const found = await findDocumentById({
      id: req.params.id,
      aliases: [
        "gallerymedia",
        "galleryimages",
        "galleryitems",
        "images",
        "media",
        "galleries",
      ],
      keywords: ["gallery", "media", "image"],
      extraFields: ["mediaId", "imageId", "assetId"],
    });

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Gallery media record not found",
      });
    }

    const media = found.document;
    const filename =
      firstString(media, [
        "originalName",
        "filename",
        "fileName",
        "name",
        "title",
      ]) || `gallery-${req.params.id}`;

    const served = await serveStoredAsset({
      document: media,
      res,
      binaryKeys: [
        "imageData",
        "mediaData",
        "fileData",
        "buffer",
        "data",
        "content",
        "base64",
        "binary",
        "blob",
      ],
      urlKeys: [
        "secure_url",
        "secureUrl",
        "cloudinaryUrl",
        "mediaUrl",
        "imageUrl",
        "fileUrl",
        "url",
      ],
      pathKeys: [
        "filePath",
        "storagePath",
        "localPath",
        "path",
        "filename",
      ],
      mimeKeys: [
        "contentType",
        "mimeType",
        "mimetype",
        "format",
      ],
      fallbackMime: "image/jpeg",
      disposition: "inline",
      filename,
      selfRoutePrefix: "/api/gallery/media/",
    });

    if (!served && !res.headersSent) {
      return res.status(404).json({
        success: false,
        message:
          "Gallery media metadata exists, but no stored image payload was found",
      });
    }
  })
);

async function downloadCertificate(req, res) {
  const found = await findDocumentById({
    id: req.params.id,
    aliases: [
      "certificates",
      "internshipcertificates",
      "issuedcertificates",
    ],
    keywords: ["certificate"],
    extraFields: ["certificateId", "certId", "certificateNumber"],
  });

  if (!found) {
    return res.status(404).json({
      success: false,
      message: "Certificate not found",
    });
  }

  const certificate = found.document;
  const certificateId =
    certificate.certificateId ||
    certificate.certId ||
    certificate.certificateNumber ||
    req.params.id;

  const filename = safeFilename(
    certificate.pdfOriginalName ||
      certificate.originalName ||
      `${certificateId}.pdf`,
    `${certificateId}.pdf`
  );

  const finalFilename = filename.toLowerCase().endsWith(".pdf")
    ? filename
    : `${filename}.pdf`;

  const served = await serveStoredAsset({
    document: certificate,
    res,
    binaryKeys: [
      "pdfBuffer",
      "pdfData",
      "certificatePdf",
      "certificateData",
      "fileData",
      "buffer",
      "data",
      "content",
      "base64",
      "binary",
      "blob",
    ],
    urlKeys: [
      "pdfUrl",
      "certificateUrl",
      "documentUrl",
      "fileUrl",
      "secure_url",
      "secureUrl",
      "url",
    ],
    pathKeys: [
      "pdfPath",
      "certificatePath",
      "documentPath",
      "filePath",
      "storagePath",
      "path",
    ],
    mimeKeys: [
      "pdfContentType",
      "contentType",
      "mimeType",
      "mimetype",
    ],
    fallbackMime: "application/pdf",
    disposition: "attachment",
    filename: finalFilename,
    selfRoutePrefix: "/api/admin/certificates/",
  });

  if (!served && !res.headersSent) {
    return res.status(404).json({
      success: false,
      message:
        "Certificate record exists, but its PDF file is not stored",
    });
  }
}

router.get(
  "/api/admin/certificates/:id/download",
  authenticate,
  asyncRoute(downloadCertificate)
);

router.get(
  "/api/certificates/:id/download",
  authenticate,
  asyncRoute(downloadCertificate)
);

async function getProfile(req, res) {
  const found = await findAuthenticatedUser(req.user);
  const user = normalizedUser(found?.document || {}, req.user);

  res.json({
    success: true,
    user,
  });
}

router.get(
  "/api/profile/me",
  authenticate,
  asyncRoute(getProfile)
);

router.get(
  "/api/admin/me",
  authenticate,
  asyncRoute(getProfile)
);

router.put(
  "/api/admin/me",
  authenticate,
  asyncRoute(async (req, res) => {
    const allowed = {};

    for (const field of [
      "name",
      "phone",
      "department",
      "designation",
      "domain",
      "profileImage",
    ]) {
      if (req.body?.[field] !== undefined) {
        allowed[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (
      allowed.profileImage &&
      typeof allowed.profileImage === "string" &&
      allowed.profileImage.length > 8 * 1024 * 1024
    ) {
      return res.status(413).json({
        success: false,
        message: "Profile image is too large",
      });
    }

    const found = await findAuthenticatedUser(req.user);
    const uid = req.user?.uid || req.user?.sub || "";
    const email = String(req.user?.email || "").trim().toLowerCase();

    let collectionName = found?.collectionName || "users";
    const collection = getDb().collection(collectionName);

    let saved;

    if (found?.document?._id) {
      await collection.updateOne(
        { _id: found.document._id },
        {
          $set: {
            ...allowed,
            updatedAt: new Date(),
          },
        }
      );

      saved = await collection.findOne({
        _id: found.document._id,
      });
    } else {
      const identityConditions = [];

      if (uid) identityConditions.push({ firebaseUid: uid });
      if (email) identityConditions.push({ email });

      const identityFilter =
        identityConditions.length > 1
          ? { $or: identityConditions }
          : identityConditions[0] || { firebaseUid: uid || email };

      const defaults = {
        firebaseUid: uid,
        email,
        name:
          allowed.name ||
          req.user?.name ||
          email.split("@")[0] ||
          "Admin",
        role:
          req.user?.role ||
          req.user?.adminRole ||
          "admin",
        status: "active",
        createdAt: new Date(),
      };

      await collection.updateOne(
        identityFilter,
        {
          $set: {
            ...allowed,
            firebaseUid: uid,
            email,
            updatedAt: new Date(),
          },
          $setOnInsert: defaults,
        },
        { upsert: true }
      );

      saved = await collection.findOne(identityFilter);
    }

    res.json({
      success: true,
      user: normalizedUser(saved || allowed, req.user),
      message: "Profile updated successfully",
    });
  })
);

router.get(
  "/api/recovery/assets-profile",
  asyncRoute(async (_req, res) => {
    res.json({
      success: true,
      mounted: true,
      mongoConnected: mongoose.connection.readyState === 1,
      fixes: [
        "gallery-binary",
        "certificate-pdf",
        "admin-profile",
      ],
    });
  })
);

export default router;
