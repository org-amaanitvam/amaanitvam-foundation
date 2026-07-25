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

router.use(authenticate, requireDashboardAccess);
const requireSuperAdmin = requireRole("super_admin");

router.post("/create", requireSuperAdmin, createDepartment);
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.put("/:id", requireSuperAdmin, editDepartment);
router.patch("/:id", requireSuperAdmin, editDepartment);
router.delete("/:id", requireSuperAdmin, deleteDepartment);
router.put("/:id/performance", updatePerformance);
router.patch("/:id/performance", updatePerformance);
router.get("/:id/report", getDepartmentReport);
router.post("/:id/members", requireSuperAdmin, assignMember);

export default router;
