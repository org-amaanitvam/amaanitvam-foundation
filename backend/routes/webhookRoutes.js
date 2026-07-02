import express from "express";

const router = express.Router();

import { handleGoogleFormWebhook } from "../controllers/webhookController.js";

router.post("/google-form", handleGoogleFormWebhook);

export default router;
