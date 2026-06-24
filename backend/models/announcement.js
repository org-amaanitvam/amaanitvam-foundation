import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Meeting",
        "Deadline",
        "Recruitment",
        "Policy",
        "Deployment",
        "Event",
        "General"
      ],
      default: "General",
    },

    priority:{
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiryDate: {
      type: Date,
    },
},
{ 
  timestamps: true 
});

const announcementModel = mongoose.models.announcement || mongoose.model("announcement", announcementSchema);
export default announcementModel;
