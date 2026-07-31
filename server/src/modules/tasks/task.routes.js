import express from "express";
import {
  getAllTasks,
  createTask,
  updateTask,
  reorderTasks,
  addTaskComment,
  exportTasksToCSV,
  uploadTaskAttachments
} from "./task.controller.js";
import { upload } from "../../middleware/upload.middleware.js";
import { authenticate } from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requirePermission,
} from "../../middleware/dashboardAccess.js";
import {
  auditDashboardMutation,
} from "../../middleware/auditDashboardMutation.js";

const router = express.Router();

// SECURITY: All task routes require authentication and dashboard access validation
router.use(
  authenticate,
  requireDashboardAccess,
);

// GET Tasks with permission checks
router.get(
  "/",
  requirePermission("tasks.read", "tasks.manage"),
  getAllTasks,
);

// Local Feature: CSV Export Route
router.get('/export/csv', exportTasksToCSV);

// POST Create Task with audit tracking
router.post(
  "/",
  requirePermission("tasks.manage"),
  auditDashboardMutation("TASK_CREATED"),
  createTask,
);

// Local Feature: Kanban Board Batch Reordering
router.patch('/reorder', reorderTasks);

// Local Feature: Task Attachments Upload via Cloudinary/Multer
router.post('/:id/attachments', upload.array('files', 5), uploadTaskAttachments);

// Local Feature: Task Comments Thread
router.post('/:id/comments', addTaskComment);

// PUT/PATCH Task Updates
for (const method of ["put", "patch"]) {
  router[method](
    "/:id",
    requirePermission("tasks.manage"),
    auditDashboardMutation("TASK_UPDATED"),
    updateTask,
  );
}

export default router;