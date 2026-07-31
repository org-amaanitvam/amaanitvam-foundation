import express from "express";
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
} from "./announcement.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireDashboardAccess, requirePermission } from "../../middleware/dashboardAccess.js";
import { auditDashboardMutation } from "../../middleware/auditDashboardMutation.js";

const router = express.Router();

// SECURITY: All announcement routes require a valid login token AND explicit dashboard access.
router.use(authenticate, requireDashboardAccess);

// GET: Anyone with read OR manage permissions can view announcements.
router.get(
  "/",
  requirePermission("announcements.read", "announcements.manage"),
  getAllAnnouncements,
);

// POST: Handles both '/' and '/create' for backward compatibility with older frontends.
// SECURITY: Only users with 'announcements.manage' permission can trigger this.
for (const path of ["/", "/create"]) {
  router.post(
    path,
    requirePermission("announcements.manage"),
    auditDashboardMutation("ANNOUNCEMENT_CREATED"), // Tracks WHO created this in the DB logs
    createAnnouncement,
  );
}

// PUT/PATCH: Handle updates. 
// SECURITY: Strictly requires manage permissions and logs the modification.
for (const method of ["put", "patch"]) {
  router[method](
    "/:id",
    requirePermission("announcements.manage"),
    auditDashboardMutation("ANNOUNCEMENT_UPDATED"),
    updateAnnouncement,
  );
}

export default router;