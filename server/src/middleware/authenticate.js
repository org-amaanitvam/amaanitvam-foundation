import { getAuth } from 'firebase-admin/auth';
import { firebaseReady } from '../config/firebase.js';
import { UnauthorizedError } from '../shared/errors/AppError.js';

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // In development mode, allow dev fallback if Firebase is not configured or if dev-token is passed
    if (process.env.NODE_ENV !== 'production') {
      if (authHeader === 'Bearer dev-token' || !firebaseReady) {
        req.user = {
          id: '000000000000000000000000',
          role: 'admin',
          firebase_uid: 'dev_user_uid'
        };
        return next();
      }
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    try {
      req.user = await getAuth().verifyIdToken(token);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[auth] Firebase token verification failed:', error?.code || error?.message || error);
      }
      throw new UnauthorizedError('Invalid or expired token');
    }

    next();
  } catch (error) {
    next(error);
  }
};
