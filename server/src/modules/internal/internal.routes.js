import express from 'express';
import User from '../../modules/users/user.model.js';
import { sendSuccess } from '../../shared/response/index.js';

const INTERNAL_SECRET = process.env.INTERNAL_SHARED_SECRET;

const internalAuth = (req, res, next) => {
  const secret = req.headers['x-internal-secret'];
  if (!secret || secret !== INTERNAL_SECRET) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_TOKEN_INVALID', message: 'Invalid internal secret', details: [] },
    });
  }
  next();
};

const router = express.Router();

router.use(internalAuth);

router.get('/users/:firebaseUid/permissions', async (req, res, next) => {
  try {
    const user = await User.findOne({ firebase_uid: req.params.firebaseUid }).select('role _id');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found', details: [] },
      });
    }

    let enrolledCourseIds = [];
    if (user.role === 'student') {
      try {
        const { default: Enrollment } = await import('../../modules/enrollments/enrollment.model.js');
        const enrollments = await Enrollment.find({
          student_id: user._id,
          is_active: true,
        }).select('course_id');
        enrolledCourseIds = enrollments.map((e) => e.course_id);
      } catch { /* enrollments module not available */ }
    }

    sendSuccess(res, 200, {
      role: user.role,
      enrolled_course_ids: enrolledCourseIds,
      accessible_resource_ids: [],
    }, 'Permissions retrieved');
  } catch (error) {
    next(error);
  }
});

export default router;