import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { proxyToAI } from './conversation.proxy.js';

const router = express.Router();

// GET /api/ai-notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const firebase_uid = req.user.uid || req.user.firebase_uid;
    
    if (!firebase_uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await proxyToAI(
      `/api/ai-notifications?page=${page}&limit=${limit}&unread_only=${unread_only}&firebase_uid=${firebase_uid}`,
      'GET'
    );
    res.json(data);
  } catch (err) {
    if (err.success === false) {
      return res.status(400).json(err);
    }
    next(err);
  }
});

// PATCH /api/ai-notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const firebase_uid = req.user.uid || req.user.firebase_uid;
    if (!firebase_uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await proxyToAI(
      `/api/ai-notifications/${req.params.id}/read?firebase_uid=${firebase_uid}`,
      'PATCH'
    );
    res.json(data);
  } catch (err) {
    if (err.success === false) {
      return res.status(err.error?.code === 'NOTIFICATION_NOT_FOUND' ? 404 : 400).json(err);
    }
    next(err);
  }
});

// PATCH /api/ai-notifications/read-all
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    const firebase_uid = req.user.uid || req.user.firebase_uid;
    if (!firebase_uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await proxyToAI(
      `/api/ai-notifications/read-all?firebase_uid=${firebase_uid}`,
      'PATCH'
    );
    res.json(data);
  } catch (err) {
    if (err.success === false) {
      return res.status(400).json(err);
    }
    next(err);
  }
});

export default router;
