import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firebase_uid: {
        type: String,
        unique: true,
        sparse: true,
        index: true
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
        enum: ['super_admin', 'admin', 'faculty', 'student', 'content_manager'],
        default: 'student'
    },
    auth_provider: {
        type: String,
        enum: ['firebase', 'local', 'google', 'github'],
        default: 'firebase'
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    phone_verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    department: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true,
        default: ''
    },
    domain: {
        type: String,
        trim: true,
        default: ''
    },
    member_id: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    profile_image: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        trim: true,
        default: ''
    },
    last_login: {
        type: Date
    },
    joined_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);
