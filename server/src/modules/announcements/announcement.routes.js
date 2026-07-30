import { Router } from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement } from './announcement.controller.js';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement); // 👈 Added this route

export default router;