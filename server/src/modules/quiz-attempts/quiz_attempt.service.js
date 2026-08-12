import * as quizAttemptRepo from './quiz_attempt.repository.js';
import * as quizRepo from '../quizzes/quiz.repository.js';
import * as lessonRepo from '../lessons/lesson.repository.js';
import { NotFoundError, BadRequestError, AppError } from '../../shared/errors/index.js';

/**
 * Submit a quiz attempt.
 *
 * - Verifies the quiz exists.
 * - Derives course_id from the quiz (never trusts client).
 * - Enforces max_attempts (0 = unlimited).
 * - Derives attempt_number server-side.
 * - Grades answers in memory: computes is_correct, score, is_passed.
 * - Saves via repository; handles compound-index duplicate-key race.
 */
export const submitAttempt = async (studentId, quizId, submittedAnswers) => {
  // 1. Load quiz
  const quiz = await quizRepo.findById(quizId);
  if (!quiz) {
    throw new NotFoundError('Quiz not found');
  }

  // 1.5 Verify related lesson exists and is published
  const lesson = await lessonRepo.findById(quiz.lesson_id);
  if (!lesson || !lesson.is_published) {
    throw new NotFoundError('Quiz not found');
  }

  // 2. Validate submitted answers
  if (!Array.isArray(submittedAnswers) || submittedAnswers.length === 0) {
    throw new BadRequestError('Answers are required and must be a non-empty array');
  }

  // 3. Enforce max_attempts (0 = unlimited)
  // Require max_attempts to be exactly 0 or a finite positive integer.
  const maxAttempts = quiz.max_attempts;

  if (
    typeof maxAttempts !== 'number' ||
    !Number.isFinite(maxAttempts) ||
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 0
  ) {
    throw new BadRequestError('Invalid max_attempts configuration on quiz');
  }

  const isUnlimited = maxAttempts === 0;
  const attemptCount = await quizAttemptRepo.countByStudentAndQuiz(studentId, quizId);

  if (!isUnlimited && attemptCount >= maxAttempts) {
    throw new AppError(
      `Maximum attempts (${maxAttempts}) reached for this quiz`,
      403,
      'QUIZ_MAX_ATTEMPTS_REACHED'
    );
  }

  // 4. Derive attempt_number server-side
  const attempt_number = attemptCount + 1;

  // 5. Build question map from server-trusted quiz data
  const questionMap = new Map();
  for (const q of quiz.questions) {
    questionMap.set(q._id.toString(), q);
  }

  // 6. Validate and index submitted answers
  const submissionMap = new Map();
  for (const answer of submittedAnswers) {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      throw new BadRequestError('Each answer must be a valid object');
    }

    if (answer.question_id === undefined || answer.question_id === null) {
      throw new BadRequestError('Each answer must contain a question_id');
    }

    const qIdStr = answer.question_id.toString();

    if (!questionMap.has(qIdStr)) {
      throw new BadRequestError(`Unknown question_id: ${qIdStr}`);
    }

    if (submissionMap.has(qIdStr)) {
      throw new BadRequestError(`Duplicate answer submitted for question_id: ${qIdStr}`);
    }

    const question = questionMap.get(qIdStr);
    const selected_index = answer.selected_index;

    if (
      typeof selected_index !== 'number' ||
      !Number.isFinite(selected_index) ||
      !Number.isInteger(selected_index) ||
      selected_index < 0 ||
      selected_index >= question.options.length
    ) {
      throw new BadRequestError(`Invalid selected_index for question_id: ${qIdStr}`);
    }

    submissionMap.set(qIdStr, selected_index);
  }

  // 7. Grade answers based on server quiz.questions
  let correctCount = 0;
  const gradedAnswers = [];

  for (const question of quiz.questions) {
    const qIdStr = question._id.toString();
    const selected_index = submissionMap.get(qIdStr);

    // If student didn't answer this question, selected_index is undefined.
    const is_correct = selected_index !== undefined && selected_index === question.correct_index;
    if (is_correct) {
      correctCount++;
    }

    gradedAnswers.push({
      question_id: question._id,
      selected_index: selected_index !== undefined ? selected_index : null,
      is_correct
    });
  }

  // 8. Compute score and pass status
  const totalQuestions = quiz.questions.length;
  const score = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;

  let passingScore = quiz.passing_score;
  if (passingScore === undefined || passingScore === null) {
    passingScore = 60;
  } else if (
    typeof passingScore !== 'number' ||
    !Number.isFinite(passingScore) ||
    passingScore < 0 ||
    passingScore > 100
  ) {
    throw new BadRequestError('Invalid passing_score configuration on quiz');
  }

  const is_passed = score >= passingScore;

  // 9. Build server-controlled attempt data
  const now = new Date();
  const attemptData = {
    quiz_id: quizId,
    student_id: studentId,
    course_id: quiz.course_id,
    attempt_number,
    answers: gradedAnswers,
    score,
    is_passed,
    started_at: now,
    submitted_at: now
  };

  // 10. Save with compound-index race protection
  try {
    return await quizAttemptRepo.create(attemptData);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(
        'Duplicate quiz attempt detected',
        409,
        'CONFLICT'
      );
    }
    throw error;
  }
};

/**
 * Retrieve all attempts by a student for a specific quiz.
 */
export const getMyAttempts = async (studentId, quizId) => {
  const quiz = await quizRepo.findById(quizId);
  if (!quiz) {
    throw new NotFoundError('Quiz not found');
  }

  return quizAttemptRepo.findAllByStudentAndQuiz(studentId, quizId);
};
