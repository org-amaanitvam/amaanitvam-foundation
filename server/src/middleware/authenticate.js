import { getAuth } from 'firebase-admin/auth';
import { firebaseReady } from '../config/firebase.js';
import { UnauthorizedError } from '../shared/errors/AppError.js';

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    if (!firebaseReady) {
      throw new UnauthorizedError('Firebase Admin is not configured');
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
