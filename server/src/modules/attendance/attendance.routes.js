import express from "express";
import {
  punchIn,
  punchOut,
  getMyAttendance,
} from "./attendance.controller.js";
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

router.post(
  "/punch-in",
  requirePermission("attendance.write"),
  auditDashboardMutation(
    "ATTENDANCE_PUNCH_IN",
  ),
  punchIn,
);

router.post(
  "/punch-out",
  requirePermission("attendance.write"),
  auditDashboardMutation(
    "ATTENDANCE_PUNCH_OUT",
  ),
  punchOut,
);

router.get(
  "/member/:userId",
  requirePermission(
    "attendance.read",
    "attendance.read.all",
  ),
  getMyAttendance,
);

export default router;
