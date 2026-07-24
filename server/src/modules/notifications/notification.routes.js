import { Router } from 'express';
import { getUserNotifications, markAsRead } from './notification.controller.js';

const router = Router();

// GET all notifications for a specific user
router.get('/user/:user_id', getUserNotifications);

// PATCH mark a specific notification as read
router.patch('/:id/read', markAsRead);

export default router;