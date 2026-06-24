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

const announcementRouter = express.Router();

// Create Announcement
announcementRouter.post('/create', createAnnouncement);

// Get All Announcements
announcementRouter.get('/', getAnnouncements);

// Get Announcements by Category
announcementRouter.get('/category/:category', getAnnouncementsByCategory);

// Get Announcements by Priority
announcementRouter.get('/priority/:priority', getAnnouncementsByPriority);

// Get Single Announcement by ID
announcementRouter.get('/:id', getAnnouncementById);

// Update Announcement
announcementRouter.put('/:id', updateAnnouncement);

// Deactivate Announcement
announcementRouter.patch('/:id/deactivate', deactivateAnnouncement);

// Delete Announcement
announcementRouter.delete('/:id', deleteAnnouncement);

export default announcementRouter;
