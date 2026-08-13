import * as quizRepo from './quiz.repository.js';
import * as lessonRepo from '../lessons/lesson.repository.js';
import * as courseRepo from '../courses/course.repository.js';
import { NotFoundError, AppError } from '../../shared/errors/AppError.js';

export const createQuiz = async (lessonId, quizData) => {
  // Load the lesson and verify it exists
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  // Reject a second quiz for the same lesson
  const existingQuiz = await quizRepo.findByLessonId(lessonId);
  if (existingQuiz) {
    // Using the project's generic AppError for 409 conflict
    throw new AppError('A quiz already exists for this lesson', 409, 'CONFLICT');
  }

  // Derive course_id from the lesson
  const courseId = lesson.course_id;
  
  // Verify the parent course still exists
  const course = await courseRepo.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  // Extract only editable fields and force derived references
  const newQuizData = {
    title: quizData.title,
    questions: quizData.questions,
    passing_score: quizData.passing_score,
    max_attempts: quizData.max_attempts,
    time_limit_min: quizData.time_limit_min,
    course_id: courseId,
    lesson_id: lessonId
  };

  try {
    return await quizRepo.create(newQuizData);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('A quiz already exists for this lesson', 409, 'CONFLICT');
    }
    throw error;
  }
};

export const updateQuiz = async (quizId, quizData) => {
  // Verify the quiz exists
  const quiz = await quizRepo.findById(quizId);
  if (!quiz) {
    throw new NotFoundError('Quiz not found');
  }

  // Filter allowed editable fields only
  const updateData = {};
  const editableFields = [
    'title',
    'questions',
    'passing_score',
    'max_attempts',
    'time_limit_min'
  ];

  for (const field of editableFields) {
    if (quizData[field] !== undefined) {
      updateData[field] = quizData[field];
    }
  }

  return quizRepo.update(quizId, updateData);
};

export const getQuizForLessonForStudent = async (lessonId) => {
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson || !lesson.is_published) {
    throw new NotFoundError('Quiz not found for this lesson');
  }

  const quiz = await quizRepo.findByLessonId(lessonId);
  if (!quiz) {
    throw new NotFoundError('Quiz not found for this lesson');
  }

  // Convert to plain object and enforce the schema toJSON transform (_id -> id)
  const plainQuiz = JSON.parse(JSON.stringify(quiz));

  // Strip correct_index and explanation
  if (Array.isArray(plainQuiz.questions)) {
    plainQuiz.questions = plainQuiz.questions.map(q => {
      const { correct_index, explanation, ...safeQuestion } = q;
      return safeQuestion;
    });
  }

  return plainQuiz;
};
