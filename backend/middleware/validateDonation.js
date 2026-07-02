import mongoose from "mongoose";

const trimValue = (value) => String(value ?? "").replace(/\u0000/g, "").trim();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

const normalizeCampaignId = (body) => {
  const raw = body?.campaignId ?? body?.campaign ?? body?.campaign_id ?? body?.donationTarget ?? null;
  const value = trimValue(raw);
  if (!value || ["null", "undefined", "organization", "general", "direct"].includes(value.toLowerCase())) {
    return null;
  }
  return value;
};

export const validateDonation = (req, res, next) => {
  const name = trimValue(req.body?.name);
  const email = trimValue(req.body?.email).toLowerCase();
  const phone = trimValue(req.body?.phone);
  const amount = Number(req.body?.amount);
  const campaignId = normalizeCampaignId(req.body);

  if (!name || !email || !amount) {
    return res.status(400).json({ success: false, message: "Name, email, and amount are required." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address." });
  }

  if (!Number.isFinite(amount) || amount < 10) {
    return res.status(400).json({ success: false, message: "Minimum donation amount is ₹10." });
  }

  if (amount > 500000) {
    return res.status(400).json({ success: false, message: "Maximum donation amount is ₹5,00,000." });
  }

  if (campaignId && !mongoose.Types.ObjectId.isValid(campaignId)) {
    return res.status(400).json({ success: false, message: "Invalid campaign selected." });
  }

  req.validatedDonation = { name, email, phone, amount, campaignId };
  next();
};
