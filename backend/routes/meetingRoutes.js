import express from 'express';
import {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    uploadMinutes
} from '../controllers/meetingController.js';
import upload from '../middleware/upload.js';

const meetingRouter = express.Router();

// Create Meeting
meetingRouter.post('/create', createMeeting);

// Get All Meetings
meetingRouter.get('/', getMeetings);

// Get Single Meeting by ID
meetingRouter.get('/:id', getMeetingById);

// Update Meeting
meetingRouter.put('/:id', updateMeeting);

// Delete Meeting
meetingRouter.delete('/:id', deleteMeeting);

// Upload Minutes
meetingRouter.post('/:id/minutes', upload.single('minutes'), uploadMinutes);

export default meetingRouter;

