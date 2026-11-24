import * as quizAttemptService from './quiz_attempt.service.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export const submitAttempt = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const quizId = req.params.quizId;
    
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || !Array.isArray(req.body.answers)) {
      throw new BadRequestError('Request body must be a plain object with an answers array');
    }

    const attempt = await quizAttemptService.submitAttempt(studentId, quizId, req.body.answers);
    
    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

export const getMyAttempts = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const quizId = req.params.quizId;
    
    const attempts = await quizAttemptService.getMyAttempts(studentId, quizId);
    
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    next(error);
  }
};
