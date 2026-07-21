import crypto from "node:crypto";
import mongoose from "mongoose";
import Donation from "./donation.model.js";
import Campaign from "./campaign.model.js";
import { createSchema } from "./donation.validation.js";
import {
  getRazorpayInstance,
  getRazorpayKeyId,
} from "../../config/razorpay.js";
import {
  sendDonationAdminEmail,
  sendDonationReceiptEmail,
} from "../../services/donation-email.service.js";

const buildReceiptId = () =>
  `don_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`.slice(0, 40);

const normalizeCampaignId = (value) => {
  const id = String(value ?? "").trim();
  if (
    !id ||
    ["null", "undefined", "organization", "general", "direct"].includes(
      id.toLowerCase(),
    )
  ) {
    return null;
  }
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
};

const errorText = (result) =>
  result?.error || result?.reason || (result?.skipped ? "skipped" : "");

export const getAll = async (_req, res) => {
  // Keep the legacy root endpoint non-sensitive. Admin-specific donation listing
  // should remain behind authenticated admin routes.
  return res.json({ success: true, data: [] });
};

export const getActiveCampaigns = async (_req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "active" }).sort({ createdAt: -1 });
    return res.json({ success: true, campaigns });
  } catch (error) {
    console.error("Active campaign fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load active campaigns.",
    });
  }
};

export const createDonationOrder = async (req, res) => {
  try {
    const { value, error } = createSchema.validate(req.body || {}, {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((item) => item.message).join(", "),
      });
    }

    const name = String(value.name).trim();
    const email = String(value.email).trim().toLowerCase();
    const phone = String(value.phone || "").trim();
    const amount = Number(value.amount);
    const campaignId = normalizeCampaignId(
      value.campaignId ?? value.campaign ?? value.donationTarget,
    );

    let campaign = null;
    if (campaignId) {
      campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Selected campaign was not found.",
        });
      }
      if (String(campaign.status).toLowerCase() !== "active") {
        return res.status(400).json({
          success: false,
          message: "This campaign is not active for donations.",
        });
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
        donor_phone: phone,
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

    return res.status(201).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
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
    return res.status(500).json({
      success: false,
      message: "Failed to create donation order. Please try again.",
    });
  }
};

export const verifyDonationPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details.",
      });
    }

    const donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation record not found.",
      });
    }

    const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!keySecret) {
      throw new Error("RAZORPAY_KEY_SECRET is missing on the backend service.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(String(razorpay_signature));
    const signatureValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureValid) {
      donation.status = "failed";
      await donation.save();
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Signature mismatch.",
      });
    }

    // Campaign backfill for old/retried orders.
    if (!donation.campaign) {
      let campaignId = normalizeCampaignId(
        req.body?.campaignId ?? req.body?.campaign ?? req.body?.donationTarget,
      );

      if (!campaignId) {
        try {
          const order = await getRazorpayInstance().orders.fetch(razorpay_order_id);
          campaignId = normalizeCampaignId(order?.notes?.campaign_id);
        } catch (orderFetchError) {
          console.warn(
            "Could not fetch Razorpay order notes for campaign backfill:",
            orderFetchError?.message || orderFetchError,
          );
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

    const wasAlreadyPaid = donation.status === "paid";
    donation.razorpayPaymentId = razorpay_payment_id;
    donation.razorpaySignature = razorpay_signature;
    donation.status = "paid";

    let updatedCampaign = null;
    if (donation.campaign && !donation.campaignAmountAdded) {
      updatedCampaign = await Campaign.findByIdAndUpdate(
        donation.campaign,
        { $inc: { raisedAmount: Number(donation.amount || 0) } },
        { new: true },
      );
      donation.campaignAmountAdded = true;
    } else if (donation.campaign) {
      updatedCampaign = await Campaign.findById(donation.campaign);
    }

    if (updatedCampaign?.title && !donation.campaignTitleSnapshot) {
      donation.campaignTitleSnapshot = updatedCampaign.title;
    }

    await donation.save();

    // Do not turn a successful payment into a failed payment when SMTP has a problem.
    // We DO await the attempts so Render logs/result explicitly show whether the donor email was sent.
    const emailDonation = donation.toObject();
    const emailTasks = [];
    const emailTaskNames = [];

    if (!donation.donorReceiptEmailSentAt) {
      emailTasks.push(sendDonationReceiptEmail({ donation: emailDonation }));
      emailTaskNames.push("donor");
    }
    if (!donation.adminDonationEmailSentAt) {
      emailTasks.push(sendDonationAdminEmail({ donation: emailDonation }));
      emailTaskNames.push("admin");
    }

    await donation.save();

const donationId = donation._id;
const emailDonation = donation.toObject();

setImmediate(async () => {
  try {
    const [donorResult, adminResult] = await Promise.allSettled([
      sendDonationReceiptEmail({
        donation: emailDonation,
      }),

      sendDonationAdminEmail({
        donation: emailDonation,
      }),
    ]);

    const update = {};

    if (
      donorResult.status === "fulfilled" &&
      donorResult.value?.success === true
    ) {
      update.donorReceiptEmailSentAt = new Date();
      update.donorReceiptEmailError = "";
    } else {
      update.donorReceiptEmailError =
        donorResult.status === "rejected"
          ? donorResult.reason?.message
          : donorResult.value?.error || "Email failed";
    }

    if (
      adminResult.status === "fulfilled" &&
      adminResult.value?.success === true
    ) {
      update.adminDonationEmailSentAt = new Date();
      update.adminDonationEmailError = "";
    } else {
      update.adminDonationEmailError =
        adminResult.status === "rejected"
          ? adminResult.reason?.message
          : adminResult.value?.error || "Email failed";
    }

    await Donation.findByIdAndUpdate(donationId, {
      $set: update,
    });
  } catch (error) {
    console.error(
      "[email] Background donation email processing failed:",
      error
    );
  }
});

return res.status(200).json({
  success: true,
  message: "Payment verified successfully. Thank you for your donation!",

  wasAlreadyPaid,

  email: {
    queued: true,
  },

  donation: {
    id: donation._id,
    amount: donation.amount,
    donationType: donation.donationType,
    campaign: donation.campaign || null,
    campaignTitle: donation.campaignTitleSnapshot || "",
    campaignAmountAdded: donation.campaignAmountAdded,
  },

  campaign: updatedCampaign,
});
    let donorReceiptSent = Boolean(donation.donorReceiptEmailSentAt);
    let adminNotificationSent = Boolean(donation.adminDonationEmailSentAt);

    results.forEach((settled, index) => {
      const type = emailTaskNames[index];
      const result =
        settled.status === "fulfilled"
          ? settled.value
          : { success: false, error: settled.reason?.message || String(settled.reason) };

      if (type === "donor") {
        donorReceiptSent = result?.success === true;
        if (donorReceiptSent) {
          donation.donorReceiptEmailSentAt = new Date();
          donation.donorReceiptEmailError = "";
        } else {
          donation.donorReceiptEmailError = errorText(result);
        }
      }

      if (type === "admin") {
        adminNotificationSent = result?.success === true;
        if (adminNotificationSent) {
          donation.adminDonationEmailSentAt = new Date();
          donation.adminDonationEmailError = "";
        } else {
          donation.adminDonationEmailError = errorText(result);
        }
      }
    });

    await donation.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Thank you for your donation!",
      wasAlreadyPaid,
      email: {
        donorReceiptSent,
        adminNotificationSent,
        donorReceiptError: donorReceiptSent
          ? null
          : donation.donorReceiptEmailError || null,
        adminNotificationError: adminNotificationSent
          ? null
          : donation.adminDonationEmailError || null,
      },
      donation: {
        id: donation._id,
        amount: donation.amount,
        donationType: donation.donationType,
        campaign: donation.campaign || null,
        campaignTitle: donation.campaignTitleSnapshot || "",
        campaignAmountAdded: donation.campaignAmountAdded,
      },
      campaign: updatedCampaign,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification encountered an error.",
    });
  }
};
