import express from "express";
import {
  getPerformanceReport,
} from "./report.controller.js";
import {
  authenticate,
} from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requirePermission,
} from "../../middleware/dashboardAccess.js";

const router = express.Router();

router.use(
  authenticate,
  requireDashboardAccess,
);

router.get(
  "/",
  requirePermission(
    "reports.read",
    "reports.manage",
  ),
  getPerformanceReport,
);

router.get(
  "/member/:uid",
  requirePermission(
    "reports.read",
    "reports.manage",
  ),
  getPerformanceReport,
);

export default router;
