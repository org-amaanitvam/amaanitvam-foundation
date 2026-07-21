import express from "express";
import {
  createDonationOrder,
  getActiveCampaigns,
  getAll,
  verifyDonationPayment,
} from "./donation.controller.js";

const router = express.Router();

router.get("/", getAll);
router.get("/campaigns", getActiveCampaigns);
router.get("/public-campaigns", getActiveCampaigns);
router.post("/create-order", createDonationOrder);
router.post("/verify", verifyDonationPayment);

export default router;
