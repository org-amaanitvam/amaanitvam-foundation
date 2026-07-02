import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1200 },
    goalAmount: { type: Number, required: true, min: 1 },
    raisedAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
      index: true,
    },
    category: { type: String, default: "General", trim: true },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, createdAt: -1 });

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
