import express from "express";
import upload from "../middleware/upload.js";
import { validateInternshipApplication } from "../middleware/validateInternship.js";
import { createInternshipApplication } from "../controllers/internshipController.js";

const router = express.Router();

// The upload middleware intercepts the resume file before it hits validation
router.post("/apply", upload.single("resume"), validateInternshipApplication, createInternshipApplication);

export default router;
