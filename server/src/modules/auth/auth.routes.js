import express from 'express';
import rateLimit from 'express-rate-limit';
import User from '../users/user.model.js';
import TokenBlacklist from './auth.model.js';
import Session from './session.model.js';
import { sendSuccess } from '../../shared/response/index.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';
import { authenticate } from '../../middleware/authenticate.js';
import admin, { firebaseReady } from '../../config/firebase.js';

import accountAccessRoutes from "./accountAccess.routes.js";
const router = express.Router();

// Authentication and User Access additive authentication/user-management routes.
router.use("/", accountAccessRoutes);

const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again later.',
  },
});

router.post('/verify-email', verifyEmailLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({
      email,
      status: 'active',
    }).select('_id email role status');

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'This email is not registered or active.',
      });
    }

    return sendSuccess(res, 200, { user }, 'Email is allowed.');
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify account access.',
    });
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (token) {
      await TokenBlacklist.create({
        token: token,
        userId: req.user.id,
        type: 'access',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
    }

    const { refreshToken } = req.body || {};
    if (refreshToken) {
      await Session.updateOne(
        { userId: req.user.id, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
      );
    }

    sendSuccess(res, 200, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
});

router.get('/session', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return sendSuccess(res, 200, { user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

export default router;