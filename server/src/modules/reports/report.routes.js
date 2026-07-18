import express from 'express';
import { getPerformanceReport } from './report.controller.js'; 

const router = express.Router();

// Both Admin and Intern routes use the same dynamic aggregator
router.get('/', getPerformanceReport);
router.get('/member/:uid', getPerformanceReport);

export default router;