import mongoose from "mongoose";
 
const contactOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "contact_otps" },
);
 
// TTL index: MongoDB automatically deletes the document once expiresAt passes,
// so stale/expired OTPs never pile up and never remain guessable in the DB.
contactOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
 
export default mongoose.models.ContactOtp ||
  mongoose.model("ContactOtp", contactOtpSchema);
