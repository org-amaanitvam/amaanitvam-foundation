import * as quizService from './quiz.service.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

const validateBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
    throw new BadRequestError('Invalid, missing, or non-object request body');
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    validateBody(req.body);
    
    const quiz = await quizService.createQuiz(req.params.lessonId, req.body);
    
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    validateBody(req.body);
    
    const quiz = await quizService.updateQuiz(req.params.quizId, req.body);
    
    // Status defaults to 200 via .json(), but explicit configuration was requested.
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

export const getQuizForLessonForStudent = async (req, res, next) => {
  try {
    const quiz = await quizService.getQuizForLessonForStudent(req.params.lessonId);
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};
