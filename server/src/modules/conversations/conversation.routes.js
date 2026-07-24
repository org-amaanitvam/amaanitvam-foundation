import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { proxyToAI } from './conversation.proxy.js';

const router = express.Router();

// GET /api/conversations
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    // Map req.user.uid (from Firebase verifyIdToken) to firebase_uid
    const firebase_uid = req.user.uid || req.user.firebase_uid;
    
    if (!firebase_uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized: missing firebase_uid' });
    }

    const data = await proxyToAI(
      `/api/conversations?page=${page}&limit=${limit}&firebase_uid=${firebase_uid}`,
      'GET'
    );
    res.json(data);
  } catch (err) {
    if (err.success === false) {
      return res.status(err.error?.code ? 400 : 500).json(err);
    }
    next(err);
  }
});

// GET /api/conversations/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const firebase_uid = req.user.uid || req.user.firebase_uid;
    if (!firebase_uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await proxyToAI(
      `/api/conversations/${req.params.id}?firebase_uid=${firebase_uid}`,
      'GET'
    );
    res.json(data);
  } catch (err) {
    if (err.success === false) {
      return res.status(err.error?.code === 'CONVERSATION_NOT_FOUND' ? 404 : 400).json(err);
    }
    next(err);
  }
});

// PATCH /api/conversations/:id/archive
router.patch('/:id/archive', authenticate, async (req, res, next) => {
  try {
    const firebase_uid = req.user.uid || req.user.firebase_uid;
    if (!firebase_uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await proxyToAI(
      `/api/conversations/${req.params.id}/archive?firebase_uid=${firebase_uid}`,
      'PATCH'
    );
    res.json(data);
  } catch (err) {
    if (err.success === false) {
      return res.status(err.error?.code === 'CONVERSATION_NOT_FOUND' ? 404 : 400).json(err);
    }
    next(err);
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const firebase_uid = req.user.uid || req.user.firebase_uid;
    if (!firebase_uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await proxyToAI(
      `/api/conversations/${req.params.id}/messages?page=${page}&limit=${limit}&firebase_uid=${firebase_uid}`,
      'GET'
    );
    res.json(data);
  } catch (err) {
    if (err.success === false) {
      return res.status(err.error?.code === 'CONVERSATION_NOT_FOUND' ? 404 : 400).json(err);
    }
    next(err);
  }
});

// POST /api/conversations/:id/messages
router.post('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const firebase_uid = req.user.uid || req.user.firebase_uid;
    if (!firebase_uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await proxyToAI('/internal/chat', 'POST', {
      firebase_uid,
      conversation_id: req.params.id,
      message: req.body.content,
      context_type: req.body.context_type || 'general',
      context_id: req.body.context_id || null,
    });
    res.json(data);
  } catch (err) {
    if (err.success === false) {
      return res.status(err.error?.code === 'CONVERSATION_NOT_FOUND' ? 404 : 503).json(err);
    }
    next(err);
  }
});

export default router;
