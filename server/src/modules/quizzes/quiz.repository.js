import Quiz from './quiz.model.js';

export const findById = async (quizId) => {
  return Quiz.findById(quizId);
};

export const findByLessonId = async (lessonId) => {
  return Quiz.findOne({ lesson_id: lessonId });
};

export const create = async (quizData) => {
  const quiz = new Quiz(quizData);
  return quiz.save();
};

export const update = async (quizId, updateData) => {
  return Quiz.findByIdAndUpdate(
    quizId,
    { $set: updateData },
    { returnDocument: 'after', runValidators: true }
  );
};
