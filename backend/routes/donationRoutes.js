import express from "express";
import {
  createDonationOrder,
  verifyDonationPayment,
  getActiveCampaigns,
} from "../controllers/donationController.js";
import { validateDonation } from "../middleware/validateDonation.js";

const router = express.Router();

router.get("/campaigns", getActiveCampaigns);
router.get("/public-campaigns", getActiveCampaigns);
router.post("/create-order", validateDonation, createDonationOrder);
router.post("/verify", verifyDonationPayment);

export default router;
