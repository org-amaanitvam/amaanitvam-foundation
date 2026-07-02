import express from 'express';
import { getCMSContent, updateCMSContent } from '../controllers/cmsController.js';
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';

const router = express.Router();

// Public route to fetch CMS content for the website
router.get('/', getCMSContent);

// Protected admin route to update CMS content
router.put('/', verifyFirebaseToken, requireAdmin, updateCMSContent);

export default router;
