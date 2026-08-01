import express from "express";
import { getMeetings, createMeeting, uploadMinutes } from "./meeting.controller.js";
import { upload } from "../../middleware/upload.middleware.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireDashboardAccess, requirePermission } from "../../middleware/dashboardAccess.js";

const router = express.Router();

// Requirement: Secure all meeting routes with dashboard token validation
router.use(authenticate, requireDashboardAccess);

// GET meetings with permissions check
router.get(
  "/",
  requirePermission("meetings.read", "meetings.manage"),
  getMeetings
);

// POST create meeting
router.post(
  "/",
  requirePermission("meetings.manage"),
  createMeeting
);

// ─── Local Addition: Meeting Minutes File Upload ──────────────────────────
// Requirement: Allows uploading document files (PDF/Word) for meeting minutes using Multer middleware.
router.post(
  "/:id/minutes",
  requirePermission("meetings.manage"),
  upload.single("minutes"),
  uploadMinutes
);

export default router;