import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
    issuedTo: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
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
    issueDate: {
        type: Date,
        default: Date.now
    },
    isValid: {
        type: Boolean,
        default: true
    },
    revokedAt: Date,
    revokedReason: String
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
