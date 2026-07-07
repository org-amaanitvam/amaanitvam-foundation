import express from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { departmentAccess } from "../middleware/departmentAccess.js";
import {
  markAttendance,
  getDepartmentAttendance,
  getMyAttendance,
  getAttendanceUsers,
} from '../controllers/attendanceController.js';

const router = express.Router();

router.use(verifyFirebaseToken);

router.post('/mark', markAttendance);
router.get('/department/:departmentId', getDepartmentAttendance);
router.get('/me', getMyAttendance);
router.get('/users', getAttendanceUsers);

export default router;
