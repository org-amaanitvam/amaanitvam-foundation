import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,

    position: String,

    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "rejected",
        "interview_scheduled",
        "interviewed",
        "selected",
        "joined",
      ],
      default: "applied",
    },

    resume: String, // file url
    documents: [String],

    interview: {
      scheduledDate: Date,
      mode: {
        type: String,
        enum: ["online", "offline"],
      },
      status: {
        type: String,
        enum: ["pending", "scheduled", "completed", "cancelled"],
        default: "pending",
      },
      feedback: String,
    },

    joiningLetterSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", candidateSchema);