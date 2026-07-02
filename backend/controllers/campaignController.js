import Campaign from "../models/campaign.js";

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "active" }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { title, description, goalAmount, raisedAmount = 0, status = "active", category = "General" } = req.body;
    if (!title || !goalAmount) {
      return res.status(400).json({ success: false, message: "Title and goal amount are required." });
    }

    const campaign = await Campaign.create({
      title,
      description,
      goalAmount: Number(goalAmount),
      raisedAmount: Number(raisedAmount || 0),
      status,
      category,
    });

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.goalAmount !== undefined) payload.goalAmount = Number(payload.goalAmount);
    if (payload.raisedAmount !== undefined) payload.raisedAmount = Number(payload.raisedAmount || 0);

    const campaign = await Campaign.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found." });
    }

    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found." });
    }

    res.json({ success: true, message: "Campaign deactivated successfully.", campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
