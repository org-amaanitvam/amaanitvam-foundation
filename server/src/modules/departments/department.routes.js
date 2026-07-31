import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requireRole,
} from "../../middleware/dashboardAccess.js";

import {
  createDepartment,
  editDepartment,
  deleteDepartment,
  assignMember,
  updatePerformance,
  getDepartmentReport,
  getDepartments,
  getDepartmentById,
} from "./department.controller.js";

const router = express.Router();

// SECURITY: All department routes require authentication and dashboard access verification
router.use(authenticate, requireDashboardAccess);

// Helper to strictly require Super Admin permissions for destructive/creation actions
const requireSuperAdmin = requireRole("super_admin");

// ------------------------------------------------------------------
// ROUTE DEFINITIONS
// ------------------------------------------------------------------

// CREATE: Strictly super admins only
router.post("/create", requireSuperAdmin, createDepartment);

// READ: Handled internally by controller logic (Admins see all, users see their own)
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// UPDATE & DELETE: Strictly super admins only
router.put("/:id", requireSuperAdmin, editDepartment);
router.patch("/:id", requireSuperAdmin, editDepartment);
router.delete("/:id", requireSuperAdmin, deleteDepartment);
router.post("/:id/members", requireSuperAdmin, assignMember);

// PERFORMANCE & REPORTS: Accessible by super admins OR the assigned department head
router.put("/:id/performance", updatePerformance);
router.patch("/:id/performance", updatePerformance);
router.get("/:id/report", getDepartmentReport);

export default router;