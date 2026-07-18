import express from 'express';
import { 
  getAllAnnouncements, 
  createAnnouncement, 
  updateAnnouncement 
} from './announcement.controller.js';

const router = express.Router();

router.get('/', getAllAnnouncements);

// Catch BOTH the Dashboard widget and the AnnouncementsPage form
router.post('/', createAnnouncement); 
router.post('/create', createAnnouncement); 

// Catch the Edit button
router.put('/:id', updateAnnouncement);

export default router;