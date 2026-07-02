import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    certificateId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    issuedTo: {
        type: String,
        required: true,
        trim: true
    },
   pdfBuffer: { type: Buffer },
pdfContentType: { type: String, default: 'application/pdf' },
pdfOriginalName: { type: String },
pdfUploadedAt: { type: Date },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['Internship', 'Volunteer', 'Appreciation', 'Achievement'],
        required: true
    },
    domain: {
        type: String,
        trim: true
    },
    duration: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    issuedBy: {
        type: String,
        default: 'Amaanitvam Foundation'
    },
    isValid: {
        type: Boolean,
        default: true
    },
    revokedAt: Date,
    revokedReason: String
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
