import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    },
    enrolled_at: {
      type: Date,
      default: Date.now
    },
    expires_at: {
      type: Date,
      default: null
    },
    is_active: {
      type: Boolean,
      default: true
    },
    completion_status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress'
    },
    completed_at: {
      type: Date
    },
    certificate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseCertificate'
    }
  },
  {
    collection: 'enrollments',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Compound Unique Index — one enrollment per student per course
enrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

// Transform _id to id in JSON response
enrollmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
