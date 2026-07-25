import express from 'express';
import * as notificationController from './notification.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin', 'faculty', 'student'), notificationController.getNotifications);
router.patch('/:notificationId/read', authorize('super_admin', 'admin', 'faculty', 'student'), notificationController.markAsRead);
router.patch('/read-all', authorize('super_admin', 'admin', 'faculty', 'student'), notificationController.markAllAsRead);
router.get('/unread-count', authorize('super_admin', 'admin', 'faculty', 'student'), notificationController.getUnreadCount);

export default router;