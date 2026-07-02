import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    actionType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const activityModel = mongoose.models.Activity || mongoose.model("Activity", activitySchema);
export default activityModel;
