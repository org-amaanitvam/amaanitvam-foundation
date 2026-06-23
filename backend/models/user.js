import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'member', 'intern'],
        default: 'intern'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    department: {
        type: String,
        trim: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
