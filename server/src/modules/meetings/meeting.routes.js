import { Router } from 'express';
import { getMeetings, createMeeting } from './meeting.controller.js';

const router = Router();

router.get('/', getMeetings);
router.post('/', createMeeting);

export default router;