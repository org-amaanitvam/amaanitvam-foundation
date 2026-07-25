import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
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
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
      index: true,
    },
    source: { type: String, default: "website" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "contacts" },
);

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactSchema);
