import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
  revokedAt: {
    type: Date,
  },
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);