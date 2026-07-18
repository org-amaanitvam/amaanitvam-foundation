import express from "express";
import mongoose from "mongoose";
import { authenticate } from "./middleware/authenticate.js";

const router = express.Router();

const DEFAULT_CMS = {
  homepage: {
    heroTitle: "",
    heroSubtitle: "",
    aboutSummary: "",
  },
  aboutUs: {
    mission: "",
    vision: "",
    history: "",
  },
};

const safeObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const normalizeName = (value = "") =>
  String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

const idString = (value) => String(value ?? "");

const db = () => {
  const connectionDb = mongoose.connection?.db;
  if (!connectionDb) {
    const error = new Error("MongoDB is not connected");
    error.statusCode = 503;
    throw error;
  }
  return connectionDb;
};

let collectionCache = {
  expiresAt: 0,
  names: [],
};

async function collectionNames() {
  const now = Date.now();

  if (collectionCache.expiresAt > now && collectionCache.names.length) {
    return collectionCache.names;
  }

  const collections = await db().listCollections({}, { nameOnly: true }).toArray();
  const names = collections.map((item) => item.name);

  collectionCache = {
    expiresAt: now + 30_000,
    names,
  };

  return names;
}

async function resolveCollections(aliases, keywords = []) {
  const names = await collectionNames();
  const aliasSet = new Set(aliases.map(normalizeName));

  const exact = names.filter((name) => aliasSet.has(normalizeName(name)));
  if (exact.length) return exact;

  return names.filter((name) => {
    const normalized = normalizeName(name);
    return keywords.some((keyword) => normalized.includes(normalizeName(keyword)));
  });
}

async function readCollections({
  aliases,
  keywords = [],
  query = {},
  limit = 5000,
  sort = { createdAt: -1, _id: -1 },
}) {
  const names = await resolveCollections(aliases, keywords);
  const documents = [];

  for (const name of names) {
    try {
      const rows = await db()
        .collection(name)
        .find(query)
        .sort(sort)
        .limit(limit)
        .toArray();

      rows.forEach((row) => {
        documents.push({
          ...row,
          __sourceCollection: name,
        });
      });
    } catch (error) {
      console.warn(`[ADMIN DATA BRIDGE] Could not read ${name}:`, error.message);
    }
  }

  const seen = new Set();

  return documents.filter((document) => {
    const key =
      idString(document._id) ||
      `${document.email || ""}:${document.createdAt || ""}:${document.name || ""}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function firstDocument(aliases, keywords = []) {
  const rows = await readCollections({
    aliases,
    keywords,
    limit: 20,
  });

  return rows[0] || null;
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function normalizeCandidate(item) {
  return {
    ...item,
    name:
      item.name ||
      item.fullName ||
      item.candidateName ||
      [item.firstName, item.lastName].filter(Boolean).join(" "),
    email: item.email || item.emailAddress || "",
    phone: item.phone || item.phoneNumber || item.mobile || "",
    applicationType:
      item.applicationType ||
      item.type ||
      (item.volunteerRole ? "volunteer" : "internship"),
    track:
      item.track ||
      item.domain ||
      item.department ||
      item.internshipDomain ||
      item.role ||
      "",
    status: item.status || "pending",
    resumeUrl:
      item.resumeUrl ||
      item.resume ||
      item.cv_link ||
      item.cv ||
      item.documentUrl ||
      item.resumePath ||
      "",
  };
}

function normalizeMember(item) {
  return {
    ...item,
    name:
      item.name ||
      item.fullName ||
      item.displayName ||
      [item.firstName, item.lastName].filter(Boolean).join(" "),
    email: item.email || item.emailAddress || "",
    phone: item.phone || item.phoneNumber || item.mobile || "",
    role: item.role || item.userRole || "member",
    status:
      item.status ||
      (item.isActive === false || item.active === false ? "inactive" : "active"),
    department:
      item.department?.name ||
      item.department ||
      item.domain ||
      item.team ||
      "",
  };
}

function normalizeDonation(item) {
  return {
    ...item,
    name: item.name || item.donorName || item.fullName || "Anonymous",
    donorName: item.donorName || item.name || item.fullName || "Anonymous",
    email: item.email || item.donorEmail || "",
    amount: Number(item.amount || item.amountPaid || item.totalAmount || 0),
    status: item.status || item.paymentStatus || "paid",
    paymentId:
      item.paymentId ||
      item.razorpayPaymentId ||
      item.razorpay_payment_id ||
      item.transactionId ||
      "",
    razorpayPaymentId:
      item.razorpayPaymentId ||
      item.razorpay_payment_id ||
      item.paymentId ||
      item.transactionId ||
      "",
  };
}

function normalizeCampaign(item) {
  return {
    ...item,
    title: item.title || item.name || item.campaignName || "Campaign",
    description: item.description || item.summary || "",
    goalAmount: Number(
      item.goalAmount || item.targetAmount || item.goal || item.target || 0
    ),
    raisedAmount: Number(item.raisedAmount || item.raised || 0),
    status: item.status || (item.isActive === false ? "inactive" : "active"),
    category: item.category || "General",
  };
}

function normalizeCertificate(item) {
  return {
    ...item,
    certificateId:
      item.certificateId ||
      item.certificateNumber ||
      item.certId ||
      idString(item._id),
    issuedTo:
      item.issuedTo ||
      item.internName ||
      item.name ||
      item.recipientName ||
      item.userName ||
      "",
    internName:
      item.internName ||
      item.issuedTo ||
      item.name ||
      item.recipientName ||
      "",
    domain: item.domain || item.department || item.track || item.type || "",
    duration: item.duration || item.tenure || item.period || "",
    tenure: item.tenure || item.duration || item.period || "",
    issueDate: item.issueDate || item.issuedAt || item.createdAt,
    status:
      item.status ||
      (item.isValid === false || item.revoked === true ? "revoked" : "active"),
  };
}

function normalizeMedia(item) {
  return {
    ...item,
    title:
      item.title ||
      item.name ||
      item.originalName ||
      item.filename ||
      "Gallery media",
    imageUrl:
      item.imageUrl ||
      item.url ||
      item.secure_url ||
      item.secureUrl ||
      item.path ||
      "",
    mediaType:
      item.mediaType ||
      (String(item.contentType || item.mimeType || "").startsWith("video/")
        ? "video"
        : "image"),
    contentType: item.contentType || item.mimeType || "",
    size: Number(item.size || item.bytes || 0),
  };
}

async function loadCandidates() {
  const rows = await readCollections({
    aliases: [
      "candidates",
      "candidateapplications",
      "internshipapplications",
      "volunteerapplications",
      "applications",
      "internships",
    ],
    keywords: ["candidate", "application"],
  });

  return rows
    .filter((row) => row.email || row.emailAddress || row.name || row.fullName)
    .map(normalizeCandidate);
}

async function loadMembers() {
  const rows = await readCollections({
    aliases: ["members", "users", "userprofiles", "employees"],
    keywords: ["member", "user"],
  });

  return rows
    .filter((row) => row.email || row.emailAddress || row.name || row.fullName)
    .filter((row) => !row.applicationType && !row.resumeUrl)
    .map(normalizeMember);
}

async function loadDonations() {
  const rows = await readCollections({
    aliases: ["donations", "payments", "transactions", "donationpayments"],
    keywords: ["donation", "payment", "transaction"],
  });

  return rows
    .filter(
      (row) =>
        row.amount !== undefined ||
        row.amountPaid !== undefined ||
        row.razorpayPaymentId ||
        row.razorpay_payment_id ||
        row.paymentId
    )
    .map(normalizeDonation);
}

async function loadCampaigns() {
  const rows = await readCollections({
    aliases: ["campaigns", "donationcampaigns", "fundraisingcampaigns"],
    keywords: ["campaign"],
  });

  return rows.map(normalizeCampaign);
}

async function loadCertificates() {
  const rows = await readCollections({
    aliases: ["certificates", "internshipcertificates", "issuedcertificates"],
    keywords: ["certificate"],
  });

  return rows.map(normalizeCertificate);
}

async function loadDepartments() {
  const rows = await readCollections({
    aliases: ["departments", "domains", "teams"],
    keywords: ["department", "domain"],
  });

  const values = rows
    .flatMap((row) => [
      row.name,
      row.title,
      row.department,
      row.domain,
      ...(Array.isArray(row.departments) ? row.departments : []),
    ])
    .filter(Boolean)
    .map(String);

  if (!values.length) {
    const candidates = await loadCandidates();
    const members = await loadMembers();

    values.push(
      ...candidates.map((item) => item.track),
      ...members.map((item) => item.department)
    );
  }

  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

async function loadCms() {
  const row = await firstDocument(
    [
      "cms",
      "cmscontents",
      "sitecontents",
      "websitecontents",
      "contents",
      "websitecontent",
    ],
    ["cms", "content"]
  );

  const source = safeObject(row?.content || row?.data || row);

  return {
    homepage: {
      ...DEFAULT_CMS.homepage,
      ...safeObject(source.homepage || source.home || source.landingPage),
    },
    aboutUs: {
      ...DEFAULT_CMS.aboutUs,
      ...safeObject(source.aboutUs || source.about || source.aboutPage),
    },
  };
}

async function cmsCollection() {
  const names = await resolveCollections(
    [
      "cms",
      "cmscontents",
      "sitecontents",
      "websitecontents",
      "contents",
      "websitecontent",
    ],
    ["cms", "content"]
  );

  return names[0] || "cmscontents";
}

async function loadSettings() {
  const row = await firstDocument(
    ["settings", "systemsettings", "sitesettings", "appsettings"],
    ["setting"]
  );

  const source = safeObject(row?.settings || row?.data || row);

  return {
    orgName:
      source.orgName ||
      source.organizationName ||
      process.env.ORG_NAME ||
      "Amaanitvam Foundation",
    orgEmail:
      source.orgEmail ||
      source.email ||
      process.env.ORG_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "admin@amaanitvam.org",
    orgPhone:
      source.orgPhone ||
      source.phone ||
      process.env.ORG_PHONE ||
      "",
    smtpHost: source.smtpHost || process.env.SMTP_HOST || "",
    smtpPort: Number(source.smtpPort || process.env.SMTP_PORT || 587),
    smtpUser: source.smtpUser || process.env.SMTP_USER || "",
    // Never send stored passwords/secrets back to the browser.
    smtpPass: "",
    paymentGatewayKey:
      source.paymentGatewayKey ||
      source.razorpayKeyId ||
      process.env.RAZORPAY_KEY_ID ||
      "",
    paymentGatewaySecret: "",
    enable2FA: Boolean(
      source.enable2FA ??
        (String(process.env.ENABLE_2FA || "").toLowerCase() === "true")
    ),
    maintenanceMode: Boolean(source.maintenanceMode),
  };
}

async function settingsCollection() {
  const names = await resolveCollections(
    ["settings", "systemsettings", "sitesettings", "appsettings"],
    ["setting"]
  );

  return names[0] || "settings";
}

async function loadGalleryMedia() {
  const rows = await readCollections({
    aliases: [
      "gallerymedia",
      "galleryimages",
      "galleries",
      "media",
      "images",
      "galleryitems",
    ],
    keywords: ["gallery", "media", "image"],
  });

  return rows
    .filter(
      (row) =>
        row.imageUrl ||
        row.url ||
        row.secure_url ||
        row.secureUrl ||
        row.path ||
        row.contentType ||
        row.mimeType
    )
    .map(normalizeMedia);
}

async function loadGalleryFolders() {
  const explicit = await readCollections({
    aliases: ["galleryfolders", "folders", "galleryalbums", "albums"],
    keywords: ["galleryfolder", "galleryalbum"],
  });

  const media = await loadGalleryMedia();

  if (explicit.length) {
    return explicit.map((folder) => {
      const folderId = idString(folder._id);
      const items = media.filter((item) => {
        const itemFolderId =
          idString(item.folderId?._id || item.folderId || item.folder?._id) ||
          "";
        const itemFolderName =
          typeof item.folder === "string"
            ? item.folder
            : item.folder?.name || item.album || item.category;

        return (
          itemFolderId === folderId ||
          (folder.name && itemFolderName === folder.name)
        );
      });

      return {
        ...folder,
        name: folder.name || folder.title || folder.folderName || "Gallery",
        description: folder.description || folder.summary || "",
        mediaCount: items.length || Number(folder.mediaCount || 0),
        coverMedia: folder.coverMedia || items[0] || null,
      };
    });
  }

  const groups = new Map();

  for (const item of media) {
    const folderName =
      (typeof item.folder === "string" && item.folder) ||
      item.folder?.name ||
      item.album ||
      item.category ||
      item.project ||
      "Gallery";

    if (!groups.has(folderName)) groups.set(folderName, []);
    groups.get(folderName).push(item);
  }

  return [...groups.entries()].map(([name, items]) => ({
    _id: `legacy-folder:${encodeURIComponent(name)}`,
    name,
    description: "Existing gallery media",
    mediaCount: items.length,
    coverMedia: items[0] || null,
    createdAt: items[0]?.createdAt,
    __synthetic: true,
  }));
}

async function loadFolderMedia(folderId) {
  const media = await loadGalleryMedia();

  if (folderId.startsWith("legacy-folder:")) {
    const folderName = decodeURIComponent(
      folderId.slice("legacy-folder:".length)
    );

    const images = media.filter((item) => {
      const itemFolderName =
        (typeof item.folder === "string" && item.folder) ||
        item.folder?.name ||
        item.album ||
        item.category ||
        item.project ||
        "Gallery";

      return itemFolderName === folderName;
    });

    return {
      folder: {
        _id: folderId,
        name: folderName,
        description: "Existing gallery media",
        mediaCount: images.length,
      },
      images,
    };
  }

  const folders = await loadGalleryFolders();
  const folder = folders.find((item) => idString(item._id) === folderId) || null;

  const images = media.filter((item) => {
    const itemFolderId = idString(
      item.folderId?._id || item.folderId || item.folder?._id
    );

    return (
      itemFolderId === folderId ||
      (folder?.name &&
        ((typeof item.folder === "string" && item.folder === folder.name) ||
          item.folder?.name === folder.name ||
          item.album === folder.name ||
          item.category === folder.name))
    );
  });

  return {
    folder: folder
      ? {
          ...folder,
          mediaCount: images.length,
        }
      : null,
    images,
  };
}

/* Public departments must remain public. */
router.get(
  "/api/public/departments",
  asyncRoute(async (_req, res) => {
    const departments = await loadDepartments();
    res.json({ success: true, departments });
  })
);

/* Protected admin read endpoints. */
router.get(
  "/api/admin/candidates",
  authenticate,
  asyncRoute(async (_req, res) => {
    const candidates = await loadCandidates();
    const domains = [
      ...new Set(candidates.map((item) => item.track).filter(Boolean)),
    ].sort();

    res.json({
      success: true,
      candidates,
      domains,
      source: "mongo-admin-data-bridge",
    });
  })
);

router.get(
  "/api/admin/members",
  authenticate,
  asyncRoute(async (_req, res) => {
    const members = await loadMembers();
    res.json({
      success: true,
      members,
      source: "mongo-admin-data-bridge",
    });
  })
);

router.get(
  "/api/admin/donations",
  authenticate,
  asyncRoute(async (_req, res) => {
    const donations = await loadDonations();
    res.json({
      success: true,
      donations,
      source: "mongo-admin-data-bridge",
    });
  })
);

router.get(
  "/api/admin/campaigns",
  authenticate,
  asyncRoute(async (_req, res) => {
    const campaigns = await loadCampaigns();
    res.json({
      success: true,
      campaigns,
      source: "mongo-admin-data-bridge",
    });
  })
);

router.get(
  "/api/admin/certificates",
  authenticate,
  asyncRoute(async (_req, res) => {
    const certificates = await loadCertificates();
    res.json({
      success: true,
      certificates,
      source: "mongo-admin-data-bridge",
    });
  })
);

router.get(
  "/api/admin/gallery/folders",
  authenticate,
  asyncRoute(async (_req, res) => {
    const folders = await loadGalleryFolders();
    res.json({
      success: true,
      folders,
      source: "mongo-admin-data-bridge",
    });
  })
);

router.get(
  "/api/admin/gallery/folders/:folderId/media",
  authenticate,
  asyncRoute(async (req, res) => {
    const result = await loadFolderMedia(req.params.folderId);
    res.json({
      success: true,
      ...result,
      source: "mongo-admin-data-bridge",
    });
  })
);

router.get(
  "/api/admin/settings",
  authenticate,
  asyncRoute(async (_req, res) => {
    const settings = await loadSettings();
    res.json({
      success: true,
      settings,
      source: "mongo-admin-data-bridge",
    });
  })
);

/* CMS read is public because the website also consumes it. */
router.get(
  "/api/cms",
  asyncRoute(async (_req, res) => {
    const content = await loadCms();
    res.json({
      success: true,
      content,
      source: "mongo-admin-data-bridge",
    });
  })
);

router.put(
  "/api/cms",
  authenticate,
  asyncRoute(async (req, res) => {
    const content = {
      homepage: {
        ...DEFAULT_CMS.homepage,
        ...safeObject(req.body?.homepage),
      },
      aboutUs: {
        ...DEFAULT_CMS.aboutUs,
        ...safeObject(req.body?.aboutUs),
      },
    };

    const name = await cmsCollection();

    await db().collection(name).updateOne(
      {},
      {
        $set: {
          content,
          homepage: content.homepage,
          aboutUs: content.aboutUs,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      content,
      message: "CMS content saved",
    });
  })
);

router.put(
  "/api/admin/settings",
  authenticate,
  asyncRoute(async (req, res) => {
    const current = await loadSettings();
    const incoming = safeObject(req.body);

    const settings = {
      ...current,
      ...incoming,
      smtpPass: undefined,
      paymentGatewaySecret: undefined,
      updatedAt: new Date(),
    };

    delete settings.smtpPass;
    delete settings.paymentGatewaySecret;

    const name = await settingsCollection();

    await db().collection(name).updateOne(
      {},
      {
        $set: settings,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      settings: {
        ...settings,
        smtpPass: "",
        paymentGatewaySecret: "",
      },
      message: "Settings saved",
    });
  })
);

router.get(
  "/api/recovery/admin-data-bridge",
  asyncRoute(async (_req, res) => {
    const names = await collectionNames();

    res.json({
      success: true,
      mounted: true,
      mongoConnected: mongoose.connection.readyState === 1,
      collectionCount: names.length,
    });
  })
);

export default router;
