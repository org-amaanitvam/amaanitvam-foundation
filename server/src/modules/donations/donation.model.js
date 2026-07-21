import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR", trim: true },
    donationType: {
      type: String,
      enum: ["organization", "campaign"],
      default: "organization",
      index: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
      index: true,
    },
    campaignTitleSnapshot: { type: String, default: "", trim: true },
    campaignAmountAdded: { type: Boolean, default: false, index: true },
    razorpayOrderId: { type: String, required: true, trim: true, unique: true },
    razorpayPaymentId: { type: String, trim: true, default: "" },
    razorpaySignature: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
    submissionTimestamp: { type: Date, default: Date.now, index: true },
    donorReceiptEmailSentAt: { type: Date, default: null },
    adminDonationEmailSentAt: { type: Date, default: null },
    donorReceiptEmailError: { type: String, default: "" },
    adminDonationEmailError: { type: String, default: "" },
  },
  { timestamps: true },
);

donationSchema.index({ submissionTimestamp: -1 });
donationSchema.index({ campaign: 1, status: 1 });

export default mongoose.models.Donation || mongoose.model("Donation", donationSchema);
