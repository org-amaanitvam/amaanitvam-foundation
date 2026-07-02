import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

import { createInternshipApplication } from "../controllers/internshipController.js";
import { validateInternshipApplication } from "../middleware/validateInternship.js";

router.post("/apply", upload.single("resume"), validateInternshipApplication, createInternshipApplication);

export default router;
