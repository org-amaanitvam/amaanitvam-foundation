import { Router } from 'express';
import { getAnnouncements, createAnnouncement } from './announcement.controller.js';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', createAnnouncement);

export default router;