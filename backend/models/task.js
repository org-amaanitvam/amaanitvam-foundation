import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["open", "inProgress", "completed", "pending_approval"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    comments: [
      {
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    deadline: {
      type: Date,
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Computed on every fetch — no cron dependency for correctness
taskSchema.virtual("isOverdue").get(function () {
  if (!this.deadline) return false;
  if (this.status === "completed") return false;
  return this.deadline.getTime() < Date.now();
});

const taskModel = mongoose.models.task || mongoose.model("task", taskSchema);
export default taskModel;
