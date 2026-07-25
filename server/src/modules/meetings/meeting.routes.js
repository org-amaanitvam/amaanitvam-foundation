import express from "express";
import {
  getAll,
} from "./meeting.controller.js";
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
    "meetings.read",
    "meetings.manage",
  ),
  getAll,
);

export default router;
