import express from "express";
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
} from "./announcement.controller.js";
import {
  authenticate,
} from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requirePermission,
} from "../../middleware/dashboardAccess.js";
import {
  auditDashboardMutation,
} from "../../middleware/auditDashboardMutation.js";

const router = express.Router();

router.use(
  authenticate,
  requireDashboardAccess,
);

router.get(
  "/",
  requirePermission(
    "announcements.read",
    "announcements.manage",
  ),
  getAllAnnouncements,
);

for (const path of ["/", "/create"]) {
  router.post(
    path,
    requirePermission("announcements.manage"),
    auditDashboardMutation(
      "ANNOUNCEMENT_CREATED",
    ),
    createAnnouncement,
  );
}

for (const method of ["put", "patch"]) {
  router[method](
    "/:id",
    requirePermission("announcements.manage"),
    auditDashboardMutation(
      "ANNOUNCEMENT_UPDATED",
    ),
    updateAnnouncement,
  );
}

export default router;
