import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requireRole,
} from "../../middleware/dashboardAccess.js";
import {
  getAll,
  updateContent,
} from "./cms.controller.js";

const router = express.Router();

router.get("/", getAll);

router.put(
  "/",
  authenticate,
  requireDashboardAccess,
  requireRole("super_admin"),
  updateContent,
);

router.patch(
  "/",
  authenticate,
  requireDashboardAccess,
  requireRole("super_admin"),
  updateContent,
);

export default router;
