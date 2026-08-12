import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    selected_index: {
      type: Number
    },
    is_correct: {
      type: Boolean
    }
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
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
    attempt_number: {
      type: Number,
      required: true
    },
    answers: {
      type: [answerSchema]
    },
    score: {
      type: Number
    },
    is_passed: {
      type: Boolean
    },
    started_at: {
      type: Date
    },
    submitted_at: {
      type: Date
    }
  },
  {
    collection: 'quiz_attempts',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

quizAttemptSchema.index({ student_id: 1, quiz_id: 1, attempt_number: 1 }, { unique: true });

// Transform _id to id in JSON response
quizAttemptSchema.set('toJSON', {
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

export default mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);
