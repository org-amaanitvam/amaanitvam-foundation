import crypto from "crypto";
import mongoose from "mongoose";
import Donation from "../models/donation.js";
import Campaign from "../models/campaign.js";
import { getRazorpayInstance, getRazorpayKeyId } from "../config/razorpay.js";
import { sendDonationReceiptEmail, sendDonationAdminEmail } from "../services/emailService.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";

const buildReceiptId = () => `don_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`.slice(0, 40);

const normalizeCampaignId = (value) => {
  const id = String(value ?? "").trim();
  if (!id || ["null", "undefined", "organization", "general", "direct"].includes(id.toLowerCase())) return null;
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
};

export const getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "active" }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (error) {
    console.error("Active campaign fetch failed:", error);
    res.status(500).json({ success: false, message: "Failed to load active campaigns." });
  }
};

export const getPublicCampaigns = getActiveCampaigns;

export const createDonationOrder = async (req, res) => {
  try {
    const validated = req.validatedDonation || {};
    const name = validated.name || String(req.body?.name || "").trim();
    const email = validated.email || String(req.body?.email || "").trim().toLowerCase();
    const phone = validated.phone || String(req.body?.phone || "").trim();
    const amount = Number(validated.amount || req.body?.amount || 0);
    const campaignId = normalizeCampaignId(validated.campaignId ?? req.body?.campaignId ?? req.body?.campaign ?? req.body?.donationTarget);

    let campaign = null;
    if (campaignId) {
      campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({ success: false, message: "Selected campaign was not found." });
      }
      if (String(campaign.status).toLowerCase() !== "active") {
        return res.status(400).json({ success: false, message: "This campaign is not active for donations." });
      }
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: buildReceiptId(),
      notes: {
        donor_name: name,
        donor_email: email,
        donor_phone: phone || "",
        donation_type: campaign ? "campaign" : "organization",
        campaign_id: campaign?._id?.toString() || "",
        campaign_title: campaign?.title || "Organization Donation",
      },
    });

    const donation = await Donation.create({
      name,
      email,
      phone,
      amount,
      currency: "INR",
      donationType: campaign ? "campaign" : "organization",
      campaign: campaign?._id || null,
      campaignTitleSnapshot: campaign?.title || "",
      campaignAmountAdded: false,
      razorpayOrderId: order.id,
      status: "created",
      submissionTimestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      key: getRazorpayKeyId(),
      donor: { name, email, phone },
      donationType: donation.donationType,
      donationId: donation._id,
      campaign: campaign
        ? {
            _id: campaign._id,
            title: campaign.title,
            goalAmount: campaign.goalAmount,
            raisedAmount: campaign.raisedAmount,
          }
        : null,
    });
  } catch (error) {
    console.error("Donation order creation failed:", error);
    res.status(500).json({ success: false, message: "Failed to create donation order. Please try again." });
  }
};

export const verifyDonationPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification details." });
    }

    const donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation record not found." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      donation.status = "failed";
      await donation.save();
      return res.status(400).json({ success: false, message: "Payment verification failed. Signature mismatch." });
    }

    // Backfill campaign if an older frontend sent it during verify, or if Razorpay notes contain it.
    if (!donation.campaign) {
      let campaignId = normalizeCampaignId(req.body?.campaignId ?? req.body?.campaign ?? req.body?.donationTarget);
      if (!campaignId) {
        try {
          const razorpay = getRazorpayInstance();
          const order = await razorpay.orders.fetch(razorpay_order_id);
          campaignId = normalizeCampaignId(order?.notes?.campaign_id);
        } catch (orderFetchError) {
          console.warn("Could not fetch Razorpay order notes for campaign backfill:", orderFetchError.message);
        }
      }

      if (campaignId) {
        const campaign = await Campaign.findById(campaignId);
        if (campaign) {
          donation.campaign = campaign._id;
          donation.donationType = "campaign";
          donation.campaignTitleSnapshot = campaign.title;
        }
      }
    }

    donation.razorpayPaymentId = razorpay_payment_id;
    donation.razorpaySignature = razorpay_signature;
    donation.status = "paid";

    let updatedCampaign = null;
    const shouldAddToCampaign = donation.campaign && !donation.campaignAmountAdded;

    if (shouldAddToCampaign) {
      updatedCampaign = await Campaign.findByIdAndUpdate(
        donation.campaign,
        { $inc: { raisedAmount: Number(donation.amount || 0) } },
        { new: true }
      );
      donation.campaignAmountAdded = true;
    }

    await donation.save();

    res.status(200).json({
      success: true,
      message: donation.campaign
        ? "Payment verified successfully. Campaign funds updated."
        : "Payment verified successfully. Thank you for your donation!",
      donation: {
        id: donation._id,
        amount: donation.amount,
        donationType: donation.donationType,
        campaign: donation.campaign || null,
        campaignAmountAdded: donation.campaignAmountAdded,
      },
      campaign: updatedCampaign,
    });

    Promise.all([
      sendDonationReceiptEmail({ donation }),
      sendDonationAdminEmail({ donation }),
      sendWhatsAppNotification({
        to: process.env.ADMIN_WHATSAPP_NUMBER || "919899923266",
        templateName: "new_donation_received",
        languageCode: "en",
        parameters: [donation.name, donation.amount.toString()],
      }),
    ]).catch((notificationError) => {
      console.error("Background donation notification delivery failed:", notificationError);
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ success: false, message: "Payment verification encountered an error." });
  }
};
