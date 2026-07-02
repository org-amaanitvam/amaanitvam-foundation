import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'alert', 'emergency', 'success'], default: 'info' },
    isRead: { type: Boolean, default: false },
    link: { type: String }
}, { timestamps: true });

const notificationModel = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default notificationModel;
