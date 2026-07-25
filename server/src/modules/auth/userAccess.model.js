import mongoose from "mongoose";

const userAccessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    uniqueId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "department_head", "team_member"],
      default: "team_member",
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    team: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    temporaryPasswordIssuedAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.UserAccess ||
  mongoose.model("UserAccess", userAccessSchema);
