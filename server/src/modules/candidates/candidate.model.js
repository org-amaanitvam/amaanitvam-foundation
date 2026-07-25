import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
      index: true,
    },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    applicationType: {
      type: String,
      enum: ["volunteer", "internship"],
      required: true,
      index: true,
    },
    role: { type: String, trim: true, default: "", maxlength: 120 },
    track: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
      index: true,
    },
    university: { type: String, trim: true, default: "", maxlength: 180 },
    currentYear: { type: String, trim: true, default: "", maxlength: 80 },
    availability: { type: String, trim: true, default: "", maxlength: 180 },
    skills: { type: String, trim: true, default: "", maxlength: 500 },
    duration: { type: String, trim: true, default: "", maxlength: 100 },
    portfolioUrl: { type: String, trim: true, default: "", maxlength: 500 },
    motivation: {
      type: String,
      trim: true,
      required: true,
      maxlength: 4000,
    },
    resumeUrl: { type: String, required: true, trim: true },
    resumePublicId: { type: String, trim: true, default: "" },
    resumeOriginalName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 255,
    },
    resumeMimeType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected"],
      default: "pending",
      index: true,
    },
    source: { type: String, default: "website", trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "candidates" },
);

candidateSchema.index({ applicationType: 1, createdAt: -1 });
candidateSchema.index({ email: 1, applicationType: 1, createdAt: -1 });

export default mongoose.models.Candidate ||
  mongoose.model("Candidate", candidateSchema);
