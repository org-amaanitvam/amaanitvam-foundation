import express from "express";
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';

import {
  createDepartment,
  editDepartment,
  deleteDepartment,
  assignMember,
  updatePerformance,
  getDepartmentReport,
  getDepartments,
  getDepartmentById,
} from "../controllers/departmentController.js";

const router = express.Router();

// ✅ Add this helper — super_admin only guard
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Only super_admin can perform this action." });
  }
  next();
};

router.use(verifyFirebaseToken);

// CREATE Department
router.post("/create", requireAdmin, createDepartment);

// GET Departments (scoped inside controller by role)
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// EDIT Department
router.put("/:id", requireAdmin, editDepartment);

// DELETE — upgraded to super_admin only
router.delete("/:id", requireSuperAdmin, deleteDepartment);

// UPDATE PERFORMANCE
router.put("/:id/performance", updatePerformance);

// DEPARTMENT REPORT
router.get("/:id/report", getDepartmentReport);

// ASSIGN MEMBER
router.post("/:id/members", requireAdmin, assignMember);

export default router;
