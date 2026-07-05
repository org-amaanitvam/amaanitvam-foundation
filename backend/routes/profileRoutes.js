import express from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { getMyProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", verifyFirebaseToken, getMyProfile);

export default router;