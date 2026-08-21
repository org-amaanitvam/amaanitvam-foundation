import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requireRole,
} from "../../middleware/dashboardAccess.js";
import {
  deleteCandidate,
  downloadResume,
  getAll,
  updateStatus,
} from "./candidate.controller.js";

const router = express.Router();

router.use(
  authenticate,
  requireDashboardAccess,
  requireRole("super_admin"),
);

router.get("/", getAll);
router.get("/:id/resume", downloadResume);
router.put("/:id/status", updateStatus);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteCandidate);

export default router;
