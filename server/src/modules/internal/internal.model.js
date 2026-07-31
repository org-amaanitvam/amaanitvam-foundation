import mongoose from 'mongoose';

const internalSchema = new mongoose.Schema({
  firebase_uid: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
  },
  enrolled_course_ids: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  accessible_resource_ids: [{
    type: String,
  }],
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('InternalPermission', internalSchema);