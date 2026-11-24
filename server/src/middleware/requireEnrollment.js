import * as lessonRepo from '../modules/lessons/lesson.repository.js';
import * as quizRepo from '../modules/quizzes/quiz.repository.js';
import * as assignmentRepo from '../modules/assignments/assignment.repository.js';
import * as enrollmentService from '../modules/enrollments/enrollment.service.js';
import { NotFoundError } from '../shared/errors/index.js';

/**
 * Middleware that verifies the authenticated student has an active,
 * non-expired enrollment in the course that owns the requested resource.
 *
 * Course resolution order:
 *   1. req.params.courseId   (direct)
 *   2. req.params.lessonId   → lesson.course_id
 *   3. req.params.quizId     → quiz.course_id
 *   4. req.params.assignmentId → assignment.course_id
 *
 * Assumes `authenticate` has already run (uses req.user.id).
 */
export const requireEnrollment = async (req, res, next) => {
  try {
    let courseId = null;

    // 1. Direct courseId param
    if (req.params.courseId) {
      courseId = req.params.courseId;

    // 2. Resolve from lessonId
    } else if (req.params.lessonId) {
      const lesson = await lessonRepo.findById(req.params.lessonId);
      if (!lesson) {
        throw new NotFoundError('Lesson not found');
      }
      courseId = lesson.course_id;

    // 3. Resolve from quizId
    } else if (req.params.quizId) {
      const quiz = await quizRepo.findById(req.params.quizId);
      if (!quiz) {
        throw new NotFoundError('Quiz not found');
      }
      courseId = quiz.course_id;

    // 4. Resolve from assignmentId
    } else if (req.params.assignmentId) {
      const assignment = await assignmentRepo.findById(req.params.assignmentId);
      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }
      courseId = assignment.course_id;
    }

    if (!courseId) {
      throw new NotFoundError('Unable to determine course for enrollment check');
    }

    // Delegate expiry + active checks to the enrollment service
    await enrollmentService.getMyEnrollment(req.user.id, courseId);

    next();
  } catch (error) {
    next(error);
  }
};
