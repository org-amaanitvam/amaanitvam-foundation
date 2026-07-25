import express from "express";
import {
  getAllTasks,
  createTask,
  updateTask,
} from "./task.controller.js";
import {
  authenticate,
} from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requirePermission,
} from "../../middleware/dashboardAccess.js";
import {
  auditDashboardMutation,
} from "../../middleware/auditDashboardMutation.js";

const router = express.Router();

router.use(
  authenticate,
  requireDashboardAccess,
);

router.get(
  "/",
  requirePermission(
    "tasks.read",
    "tasks.manage",
  ),
  getAllTasks,
);

router.post(
  "/",
  requirePermission("tasks.manage"),
  auditDashboardMutation("TASK_CREATED"),
  createTask,
);

for (const method of ["put", "patch"]) {
  router[method](
    "/:id",
    requirePermission("tasks.manage"),
    auditDashboardMutation("TASK_UPDATED"),
    updateTask,
  );
}

export default router;
