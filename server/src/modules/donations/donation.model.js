import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    amount: {
      type: Number,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    donationType: {
      type: String,
      default: "organization",
    },

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
    },

    campaignTitleSnapshot: {
      type: String,
      default: "",
    },

    campaignAmountAdded: {
      type: Boolean,
      default: false,
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      index: true,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      index: true,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "created",
      index: true,
    },

    submissionTimestamp: {
      type: Date,
      default: Date.now,
    },

    donorReceiptEmailSentAt: {
      type: Date,
      default: null,
    },

    donorReceiptEmailError: {
      type: String,
      default: "",
    },

    adminDonationEmailSentAt: {
      type: Date,
      default: null,
    },

    adminDonationEmailError: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,

    // Preserve compatibility with historical/legacy donation records
    // without silently deleting fields older code may use.
    strict: false,
  },
);

donationSchema.index({ createdAt: -1 });
donationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Donation ||
  mongoose.model("Donation", donationSchema);
