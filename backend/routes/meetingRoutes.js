import express from 'express';
import {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    uploadMinutes,
    markAttendance,
    bulkMarkAttendance,
    getAttendanceReport,
    getUserAttendanceHistory
} from '../controllers/meetingController.js';
import upload from '../middleware/upload.js';
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';
import { meetingAccess } from "../middleware/meetingAccess.js";

const meetingRouter = express.Router();
meetingRouter.use(verifyFirebaseToken);

// Create — admin only
meetingRouter.post('/create', requireAdmin, createMeeting);

// View — scoped in controller
meetingRouter.get('/', getMeetings);
meetingRouter.get('/user/:userId/attendance', getUserAttendanceHistory);
meetingRouter.get('/:id', getMeetingById);

// Update/Delete — admin only
meetingRouter.put('/:id', meetingAccess, updateMeeting);
meetingRouter.delete('/:id', meetingAccess, deleteMeeting);

meetingRouter.post(
    '/:id/minutes',
    meetingAccess,
    upload.single('minutes'),
    uploadMinutes
);
// Attendance
meetingRouter.put(
    '/:id/attendance',
    meetingAccess,
    markAttendance
);

meetingRouter.put(
    '/:id/attendance/bulk',
    meetingAccess,
    bulkMarkAttendance
);

meetingRouter.get(
    '/:id/attendance/report',
    meetingAccess,
    getAttendanceReport
);
export default meetingRouter;
