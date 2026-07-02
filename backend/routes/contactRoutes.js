import express from "express";

const router = express.Router();

import { createContact } from "../controllers/contactController.js";
import { validateContactSubmission } from "../middleware/validateContact.js";

router.post("/", validateContactSubmission, createContact);

export default router;