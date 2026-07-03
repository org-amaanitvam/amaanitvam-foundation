import express from "express";
import {
  getCampaigns,
  getPublicCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/public", getPublicCampaigns);
router.get("/", getCampaigns);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

export default router;