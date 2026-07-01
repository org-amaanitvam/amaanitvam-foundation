import express from 'express';
import { departmentAccess } from "../middleware/departmentAccess.js";
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

const meetingRouter = express.Router();
meetingRouter.use(verifyFirebaseToken);

meetingRouter.post('/create', requireAdmin, createMeeting);
meetingRouter.get('/', getMeetings);
meetingRouter.get('/user/:userId/attendance', getUserAttendanceHistory);
meetingRouter.get('/:id', getMeetingById);
meetingRouter.put('/:id', updateMeeting);
meetingRouter.delete('/:id', deleteMeeting);
meetingRouter.post('/:id/minutes', upload.single('minutes'), uploadMinutes);
meetingRouter.put('/:id/attendance', markAttendance);
meetingRouter.put('/:id/attendance/bulk', bulkMarkAttendance);
meetingRouter.get('/:id/attendance/report', getAttendanceReport);

export default meetingRouter;
