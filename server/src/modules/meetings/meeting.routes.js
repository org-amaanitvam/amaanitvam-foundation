import { Router } from 'express';
import { getMeetings, createMeeting, uploadMinutes } from './meeting.controller.js';
import { upload } from '../../middleware/upload.middleware.js'; // Adjust path to your multer setup if needed

const router = Router();

router.get('/', getMeetings);
router.post('/', createMeeting);
router.post('/:id/minutes', upload.single('minutes'), uploadMinutes); // 👈 Added this route

export default router;