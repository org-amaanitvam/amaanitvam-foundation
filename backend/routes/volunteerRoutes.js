import express from "express";

const router = express.Router();

import { createVolunteerApplication } from "../controllers/volunteerController.js";
import { validateVolunteerApplication } from "../middleware/validateVolunteer.js";

router.post("/apply", validateVolunteerApplication, createVolunteerApplication);

export default router;
