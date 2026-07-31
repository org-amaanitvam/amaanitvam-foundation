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

/**
 * POST /api/auth/sso-token
 * Accepts a Firebase ID token (from any authorized portal), verifies it,
 * and returns a Firebase Custom Token. This enables cross-origin SSO —
 * the receiving app uses signInWithCustomToken to establish a real Firebase
 * session on its own origin without the user re-entering credentials.
 */
router.post('/sso-token', async (req, res) => {
  try {
    if (!firebaseReady) {
      return res.status(503).json({ success: false, message: 'Auth service unavailable.' });
    }

    const idToken = String(req.body?.idToken || '').trim();
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required.' });
    }

    // Verify the incoming ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired Firebase token.' });
    }

    // Ensure this UID maps to an active admin/member in our DB
    const user = await User.findOne({ firebase_uid: decodedToken.uid, status: 'active' }).select('_id role');
    if (!user) {
      return res.status(403).json({ success: false, message: 'No authorized account found for this credential.' });
    }

    // Create a custom token for the same UID — the client can use this
    // to signInWithCustomToken on any portal origin
    const customToken = await admin.auth().createCustomToken(decodedToken.uid, {
      role: user.role,
      dbId: String(user._id),
    });

    return res.status(200).json({ success: true, customToken });
  } catch (error) {
    console.error('[sso-token] Error:', error);
    return res.status(500).json({ success: false, message: 'SSO token exchange failed.' });
  }
});

export default router;