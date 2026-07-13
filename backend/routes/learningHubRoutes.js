import express from "express";
import { registerForEvent, getRegistrations } from "../controllers/learningHubController.js";

const router = express.Router();

// We are adding multiple path variations here so Express CANNOT miss it, 
// whether the frontend sends a trailing slash or not.
router.get('/', getRegistrations);
router.get('/all', getRegistrations); 

// Your public form submission route
router.post('/register', registerForEvent);

export default router;