import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireDashboardAccess, requireRole } from "../../middleware/dashboardAccess.js";
import { bootstrapSuperAdmin, changeFirstLoginPassword, getSession, provisionUser, resolveLoginIdentifier } from "./accountAccess.controller.js";

const router = express.Router();
router.post("/resolve-identifier", resolveLoginIdentifier);
router.post("/bootstrap-admin", authenticate, bootstrapSuperAdmin);
router.get("/session", authenticate, getSession);
router.post("/users/provision", authenticate, requireDashboardAccess, requireRole("super_admin"), provisionUser);
router.post("/first-login/change-password", authenticate, changeFirstLoginPassword);
export default router;
