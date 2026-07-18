import express from 'express';
import { punchIn, punchOut, getMyAttendance } from './attendance.controller.js';

const router = express.Router();

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/member/:userId', getMyAttendance);

export default router;