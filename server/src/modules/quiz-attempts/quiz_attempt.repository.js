import QuizAttempt from './quiz_attempt.model.js';

export const create = async (attemptData) => {
  const attempt = new QuizAttempt(attemptData);
  return attempt.save();
};

export const findById = async (attemptId) => {
  return QuizAttempt.findById(attemptId);
};

export const countByStudentAndQuiz = async (studentId, quizId) => {
  return QuizAttempt.countDocuments({ student_id: studentId, quiz_id: quizId });
};

export const findAllByStudentAndQuiz = async (studentId, quizId) => {
  return QuizAttempt.find({ student_id: studentId, quiz_id: quizId }).sort({ attempt_number: -1 });
};
