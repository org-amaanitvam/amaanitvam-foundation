import mongoose from "mongoose";

const authAuditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    firebaseUid: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    uniqueId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    success: {
      type: Boolean,
      default: true,
      index: true,
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

authAuditSchema.index({ createdAt: -1 });

export default mongoose.models.AuthAudit ||
  mongoose.model("AuthAudit", authAuditSchema);
