import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    submission_text: {
      type: String
    },
    attachment_public_ids: [{
      type: String
    }],
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned'],
      default: 'submitted'
    },
    score: {
      type: Number,
      default: null
    },
    feedback: {
      type: String
    },
    graded_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submitted_at: {
      type: Date,
      default: Date.now
    },
    graded_at: {
      type: Date
    }
  },
  {
    collection: 'assignment_submissions',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Enforce one submission per student per assignment
assignmentSubmissionSchema.index({ student_id: 1, assignment_id: 1 }, { unique: true });

// Transform _id to id in JSON response
assignmentSubmissionSchema.set('toJSON', {
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

export default mongoose.models.AssignmentSubmission ||
  mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
