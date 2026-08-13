import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length >= 2 && v.length <= 6;
        },
        message: 'A question must have between 2 and 6 options.'
      }
    },
    correct_index: { type: Number, required: true },
    explanation: { type: String }
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true
    },
    title: { type: String, required: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: function (questions) {
          if (!Array.isArray(questions)) return true;
          return questions.every(q =>
            Number.isInteger(q.correct_index) &&
            q.correct_index >= 0 &&
            Array.isArray(q.options) &&
            q.correct_index < q.options.length
          );
        },
        message: 'correct_index must be an integer >= 0 and < options.length for every question.'
      }
    },
    passing_score: { 
      type: Number, 
      default: 60,
      min: 0,
      max: 100,
      validate: {
        validator: Number.isFinite,
        message: '{VALUE} is not a finite number'
      }
    },
    max_attempts: { 
      type: Number, 
      default: 3,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    time_limit_min: { 
      type: Number,
      min: 0,
      validate: {
        validator: function(v) {
          return v == null || Number.isFinite(v);
        },
        message: '{VALUE} is not a finite number'
      }
    }
  },
  {
    collection: 'quizzes',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Transform _id to id in JSON response
quizSchema.set('toJSON', {
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

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
