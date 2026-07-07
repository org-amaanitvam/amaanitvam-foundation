import express from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/user.js';

const router = express.Router();

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

const PORTAL_ALLOWED_ROLES = {
  admin: ['super_admin', 'admin'],
  dashboard: ['super_admin', 'admin', 'department_head', 'member', 'intern', 'volunteer'],
};

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

router.post('/verify-email', verifyEmailLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const portal = req.body?.portal === 'admin' ? 'admin' : 'dashboard';
    const allowedRoles = PORTAL_ALLOWED_ROLES[portal];

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({
      email,
      status: 'active',
      role: { $in: allowedRoles },
    }).select('_id email role status');

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'This email is not registered or active for this portal.',
      });
    }

    return res.json({ success: true, message: 'Email is allowed.' });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify account access.',
    });
  }
});

export default router;