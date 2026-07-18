import { verifyFirebaseIdToken } from "./config/firebaseTokenVerifier.js";
import express from "express";
import adminApiShapeNormalizer from "./adminApiShapeNormalizer.js";
import { getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import User from "./modules/users/user.model.js";

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

router.use(adminApiShapeNormalizer);

const buildSettings = () => ({
  orgName: process.env.ORG_NAME || "Amaanitvam Foundation",
  foundationName: process.env.ORG_NAME || "Amaanitvam Foundation",
  enable2FA: String(process.env.ENABLE_2FA || "false").toLowerCase() === "true",
  allowRegistration: false,
  maintenanceMode: false,
});

router.get("/recovery/health", (_req, res) => {
  res.json({
    success: true,
    service: "amaanitvam-api",
    message: "Admin compatibility routes are active",
  });
});

router.get("/admin/settings", (_req, res) => {
  const settings = buildSettings();

  res.json({
    success: true,
    data: settings,
    settings,
  });
});

router.get("/public/settings", (_req, res) => {
  const settings = buildSettings();

  res.json({
    success: true,
    data: settings,
    settings,
  });
});

router.get("/profile/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    let decoded = null;

    if (token && getApps().length) {
      try {
        decoded = await verifyFirebaseIdToken(token);
      } catch {
        decoded = null;
      }
    }

    let user = null;

    if (decoded?.email || decoded?.uid) {
      user = await User.findOne({
        $or: [
          decoded.email ? { email: String(decoded.email).toLowerCase() } : null,
          decoded.uid ? { firebaseUid: decoded.uid } : null,
        ].filter(Boolean),
      }).lean();
    }

    if (!user && process.env.NODE_ENV !== "production") {
      user = await User.findOne({
        role: { $in: ["super_admin", "admin"] },
        status: "active",
      }).lean();
    }

    const profile =
      user ||
      {
        _id: "local-admin",
        name: decoded?.name || "Local Admin",
        email: decoded?.email || "local-admin@amaanitvam.org",
        role: "super_admin",
        status: "active",
        profileImage: "",
      };

    res.json({
      success: true,
      data: profile,
      user: profile,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load profile",
      error: error.message,
    });
  }
});

router.use("/admin/candidates", candidateRoutes);
router.use("/admin/members", memberRoutes);
router.use("/admin/users", memberRoutes);
router.use("/admin/departments", departmentRoutes);
router.use("/public/departments", departmentRoutes);
router.use("/admin/donations", donationRoutes);
router.use("/admin/certificates", certificateRoutes);
router.use("/admin/gallery", galleryRoutes);
router.use("/admin/cms", cmsRoutes);
router.use("/admin/learning-hub", libraryRoutes);
router.use("/learning-hub", libraryRoutes);
router.use("/admin/reports", reportRoutes);
router.use("/admin/notifications", notificationRoutes);

export default router;
