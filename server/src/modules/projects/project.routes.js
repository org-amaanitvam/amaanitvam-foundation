import express from "express";
import {
  getAllProjects,
  createProject,
  updateProject,
} from "./project.controller.js";
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
    "projects.read",
    "projects.manage",
  ),
  getAllProjects,
);

for (const path of ["/", "/create"]) {
  router.post(
    path,
    requirePermission("projects.manage"),
    auditDashboardMutation("PROJECT_CREATED"),
    createProject,
  );
}

for (const method of ["put", "patch"]) {
  router[method](
    "/:id",
    requirePermission("projects.manage"),
    auditDashboardMutation("PROJECT_UPDATED"),
    updateProject,
  );
}

export default router;
