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

router.use(verifyFirebaseToken);
// CREATE Department
router.post("/create", requireAdmin, createDepartment);

//   GET Departments
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
//   EDIT Department
router.put("/:id", requireAdmin, editDepartment);

//   DELETE Department
router.delete("/:id", requireAdmin, deleteDepartment);
//   UPDATE PERFORMANCE
router.put("/:id/performance", updatePerformance);
 //  DEPARTMENT REPORT
router.get("/:id/report", getDepartmentReport);

export default router;