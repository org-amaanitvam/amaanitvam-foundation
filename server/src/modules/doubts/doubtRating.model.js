import mongoose from 'mongoose';

const doubtRatingSchema = new mongoose.Schema({
  doubt_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doubt',
    required: true,
    index: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, { timestamps: true });

doubtRatingSchema.index({ doubt_id: 1, student_id: 1 }, { unique: true });

doubtRatingSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('DoubtRating', doubtRatingSchema);
