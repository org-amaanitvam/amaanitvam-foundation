import { Router } from 'express';
import { getRecentActivity } from './activity.controller.js';

const router = Router();

// GET: Fetch the latest 50 logs for the Black Box UI
router.get('/', getRecentActivity);

export default router;