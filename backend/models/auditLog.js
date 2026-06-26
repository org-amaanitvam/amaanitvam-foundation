import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

const auditLogModel = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export default auditLogModel;
