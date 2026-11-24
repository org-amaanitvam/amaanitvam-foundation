import mongoose from 'mongoose';

const doubtResponseSchema = new mongoose.Schema({
  doubt_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doubt',
    required: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  attachments: [{ type: String }],
  is_faculty_response: {
    type: Boolean,
    default: false,
  },
  is_ai_generated: {
    type: Boolean,
    default: false,
  },
  is_solution: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

doubtResponseSchema.index({ doubt_id: 1, created_at: 1 });
doubtResponseSchema.index({ user_id: 1, doubt_id: 1 });

doubtResponseSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('DoubtResponse', doubtResponseSchema);