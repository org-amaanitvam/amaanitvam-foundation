import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
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
    event: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    organization: { type: String, trim: true, default: "", maxlength: 200 },
    message: { type: String, trim: true, default: "", maxlength: 3000 },
    status: {
      type: String,
      enum: ["registered", "attended", "cancelled"],
      default: "registered",
      index: true,
    },
    source: { type: String, default: "website" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "eventregistrations" },
);

eventRegistrationSchema.index(
  { email: 1, event: 1 },
  { unique: true },
);

export default mongoose.models.EventRegistration ||
  mongoose.model("EventRegistration", eventRegistrationSchema);
