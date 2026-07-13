import express from 'express';
import { createInternshipApplication } from '../controllers/internshipController.js';
import { uploadCloud } from '../config/cloudinary.js';
import { validateInternshipApplication } from '../middleware/validateInternship.js';

const router = express.Router();

router.post('/apply', uploadCloud.single('resume'), validateInternshipApplication, createInternshipApplication);

export default router;