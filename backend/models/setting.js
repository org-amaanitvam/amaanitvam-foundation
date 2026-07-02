import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    orgName: { type: String, default: 'Amaanitvam Foundation' },
    orgEmail: { type: String, default: 'info@amaanitvam.org' },
    orgPhone: { type: String, default: '+91 1234567890' },
    smtpHost: { type: String, default: 'smtp.gmail.com' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    paymentGatewayKey: { type: String, default: '' },
    paymentGatewaySecret: { type: String, default: '' },
    allowedIPs: [{ type: String }],
    enable2FA: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

const settingModel = mongoose.models.Setting || mongoose.model("Setting", settingSchema);
export default settingModel;
