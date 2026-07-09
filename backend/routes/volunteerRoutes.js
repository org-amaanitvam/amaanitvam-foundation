import express from "express";
import { createVolunteerApplication } from "../controllers/volunteerController.js";
import { validateVolunteerApplication } from "../middleware/validateVolunteer.js";
import upload from "../middleware/upload.js"; // Import the multer config

const router = express.Router();

// Inject the upload middleware BEFORE the validation and controller
router.post("/apply", upload.single('resume'), validateVolunteerApplication, createVolunteerApplication);

export default router;