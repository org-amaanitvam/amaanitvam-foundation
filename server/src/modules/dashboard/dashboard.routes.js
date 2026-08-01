import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller.js';

const router = Router();

// GET: Fetch all aggregated stats for the frontend charts
router.get('/', getDashboardStats);

export default router;