import express from "express";
import rateLimit from "express-rate-limit";
import {
  authenticate } from "../../middleware/authenticate.js";
import { requireDashboardAccess,
  requireRole } from "../../middleware/dashboardAccess.js";
import { bootstrapSuperAdmin,
  changeFirstLoginPassword,
  getSession,
  provisionUser,
  resolveLoginIdentifier,
  getAuthAuditHistory,
} from "./accountAccess.controller.js";

const router = express.Router();

const identifierLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many login identifier attempts. Please try again later.",
  },
});

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password-change attempts. Please try again later.",
  },
});

router.post("/resolve-identifier", identifierLimiter, resolveLoginIdentifier);
router.post("/bootstrap-admin", authenticate, bootstrapSuperAdmin);
router.get("/session", authenticate, getSession);
router.get(
  "/audit-history",
  authenticate,
  requireDashboardAccess,
  requireRole("super_admin"),
  getAuthAuditHistory,
);
router.post("/users/provision", authenticate, requireDashboardAccess, requireRole("super_admin"), provisionUser);
router.post("/first-login/change-password", passwordChangeLimiter, authenticate, changeFirstLoginPassword);
export default router;
