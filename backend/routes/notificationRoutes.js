import express from 'express';
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';
import Notification from '../models/notification.js';

const router = express.Router();

router.use(verifyFirebaseToken);

// GET /api/notifications (get for current user + global emergency alerts)
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { userId: req.user._id },
                { userId: { $exists: false } }, // Global
                { userId: null }
            ]
        }).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// POST /api/notifications/alert (Admin only - send emergency alert)
router.post('/alert', requireAdmin, async (req, res) => {
    try {
        const { title, message, type } = req.body;
        const notification = new Notification({
            title,
            message,
            type: type || 'emergency'
        });
        await notification.save();
        res.status(201).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create alert' });
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { 
                $or: [{ userId: req.user._id }, { userId: { $exists: false } }, { userId: null }]
            }, 
            { isRead: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
    try {
        await Notification.findOneAndDelete({
            _id: req.params.id,
            $or: [{ userId: req.user._id }, { userId: { $exists: false } }, { userId: null }]
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
});

export default router;
