import express from "express";

import candidateRoutes from "./modules/candidates/candidate.routes.js";
import memberRoutes from "./modules/members/member.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import donationRoutes from "./modules/donations/donation.routes.js";
import certificateRoutes from "./modules/certificates/certificate.routes.js";
import galleryRoutes from "./modules/gallery/gallery.routes.js";
import cmsRoutes from "./modules/cms/cms.routes.js";
import libraryRoutes from "./modules/digital-library/library.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

const router = express.Router();

const settingsPayload = {
  orgName: process.env.ORG_NAME || "Amaanitvam Foundation",
  foundationName: process.env.ORG_NAME || "Amaanitvam Foundation",
  maintenanceMode: false,
  allowRegistration: false,
  enable2FA: String(process.env.ENABLE_2FA || "false").toLowerCase() === "true",
};

function okArray(res) {
  return res.status(200).json([]);
}

function okObject(res, data = {}) {
  return res.status(200).json({
    success: true,
    data,
  });
}

router.get("/admin-compat/health", (_req, res) => {
  res.json({
    success: true,
    message: "Admin lifetime compatibility routes active",
  });
});

/**
 * Profile/settings aliases used by old admin portal builds.
 * These must stay object-shaped.
 */
router.get("/profile/me", (_req, res) => {
  res.json({
    success: true,
    data: {
      _id: "local-admin",
      name: "Local Admin",
      email: "admin@amaanitvam.org",
      role: "super_admin",
      status: "active",
      profileImage: "",
    },
  });
});

router.get("/admin/settings", (_req, res) => okObject(res, settingsPayload));
router.get("/public/settings", (_req, res) => okObject(res, settingsPayload));

/**
 * Old admin route aliases.
 * These map old frontend URLs to the current modular backend routers.
 */
router.use("/admin/candidates", candidateRoutes);
router.use("/admin/members", memberRoutes);
router.use("/admin/users", memberRoutes);

router.use("/admin/departments", departmentRoutes);
router.use("/public/departments", departmentRoutes);

router.use("/admin/donations", donationRoutes);
router.use("/admin/campaigns", donationRoutes);
router.use("/donate/campaigns", donationRoutes);

router.use("/admin/certificates", certificateRoutes);
router.use("/certificates", certificateRoutes);

router.use("/admin/gallery", galleryRoutes);
router.use("/gallery", galleryRoutes);

router.use("/admin/cms", cmsRoutes);
router.use("/cms", cmsRoutes);

router.use("/admin/learning-hub", libraryRoutes);
router.use("/learning-hub", libraryRoutes);

/**
 * Fix accidental frontend double-prefix:
 * api client baseURL = /api
 * endpoint = /api/learning-hub
 * final result = /api/api/learning-hub
 */
router.use("/api/learning-hub", libraryRoutes);
router.use("/api/admin/learning-hub", libraryRoutes);

router.use("/admin/reports", reportRoutes);
router.use("/reports", reportRoutes);

router.use("/admin/notifications", notificationRoutes);
router.use("/notifications", notificationRoutes);

/**
 * Known old child endpoints that may not exist in newer routers.
 * Return arrays so React .map() pages never crash.
 */
router.get("/admin/gallery/folders", (_req, res) => okArray(res));
router.get("/admin/gallery/albums", (_req, res) => okArray(res));
router.get("/admin/campaigns", (_req, res) => okArray(res));

/**
 * Final development-safe fallback for old admin GET list routes.
 * This avoids repeated "Can't find /api/admin/..." crashes after future UI changes.
 * It does not hide write errors: POST/PUT/PATCH/DELETE still fail properly.
 */
router.get(/^\/admin(?:\/.*)?$/, (req, res, next) => {
  if (process.env.NODE_ENV === "production") return next();

  const requestPath = req.path.toLowerCase();

  if (
    requestPath.includes("settings") ||
    requestPath.includes("profile") ||
    requestPath.includes("me")
  ) {
    return okObject(res, {});
  }

  return okArray(res);
});

router.get(/^\/api\/admin(?:\/.*)?$/, (_req, res, next) => {
  if (process.env.NODE_ENV === "production") return next();
  return okArray(res);
});

export default router;
