import express from 'express';
import { createVolunteerApplication } from '../controllers/volunteerController.js';
import { uploadCloud } from '../config/cloudinary.js';
import { validateVolunteerApplication } from '../middleware/validateVolunteer.js'; // Check this exact file/function name!

const router = express.Router();

// Changed '/' to '/apply' to match your frontend fetch request
router.post('/apply', uploadCloud.single('resume'), validateVolunteerApplication, createVolunteerApplication);

export default router;