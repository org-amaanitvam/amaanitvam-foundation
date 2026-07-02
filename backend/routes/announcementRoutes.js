import express from 'express';
import {
    createAnnouncement,
    getAnnouncements,
    getAnnouncementsByCategory,
    getAnnouncementsByPriority,
    getAnnouncementById,
    updateAnnouncement,
    deactivateAnnouncement,
    deleteAnnouncement
} from '../controllers/announcementController.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { requireMinRole } from '../middleware/rbac.js';

const announcementRouter = express.Router();

announcementRouter.use(verifyFirebaseToken);

// View — everyone
announcementRouter.get('/', getAnnouncements);
announcementRouter.get('/category/:category', getAnnouncementsByCategory);
announcementRouter.get('/priority/:priority', getAnnouncementsByPriority);
announcementRouter.get('/:id', getAnnouncementById);

// Mutate — admin/super_admin only
announcementRouter.post('/create', requireMinRole('admin'), createAnnouncement);
announcementRouter.put('/:id', requireMinRole('admin'), updateAnnouncement);
announcementRouter.patch('/:id/deactivate', requireMinRole('admin'), deactivateAnnouncement);
announcementRouter.delete('/:id', requireMinRole('admin'), deleteAnnouncement);

export default announcementRouter;
