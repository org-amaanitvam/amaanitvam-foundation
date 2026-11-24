import mongoose from 'mongoose';
import Quiz from '../../../src/modules/quizzes/quiz.model.js';
import Assignment from '../../../src/modules/assignments/assignment.model.js';
import AssignmentSubmission from '../../../src/modules/assignment_submissions/assignment_submission.model.js';
import Progress from '../../../src/modules/progress/progress.model.js';
import QuizAttempt from '../../../src/modules/quiz-attempts/quiz_attempt.model.js';

describe('Assessment Models Offline Tests', () => {

  describe('Quiz Model', () => {
    it('1. Quiz rejects correct_index outside the options range', () => {
      const quiz = new Quiz({
        course_id: new mongoose.Types.ObjectId(),
        lesson_id: new mongoose.Types.ObjectId(),
        title: 'Sample Quiz',
        questions: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5'],
            correct_index: 3 // outside range [0, 2]
          }
        ]
      });

      const err = quiz.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['questions']).toBeDefined();
      expect(err.errors['questions'].message).toMatch(/correct_index must be an integer >= 0 and < options.length for every question/);
    });

    it('2. Quiz accepts a valid correct_index', () => {
      const quiz = new Quiz({
        course_id: new mongoose.Types.ObjectId(),
        lesson_id: new mongoose.Types.ObjectId(),
        title: 'Sample Quiz',
        questions: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5'],
            correct_index: 1 // Valid
          }
        ]
      });

      const err = quiz.validateSync();
      // Should not have a validation error on 'questions'
      if (err) {
        expect(err.errors['questions']).toBeUndefined();
      } else {
        expect(err).toBeUndefined();
      }
    });
  });

  describe('Assignment Model', () => {
    it('3. Assignment defaults is_deleted to false and deleted_at to null', () => {
      const assignment = new Assignment();
      expect(assignment.is_deleted).toBe(false);
      expect(assignment.deleted_at).toBe(null);
    });
  });

  describe('AssignmentSubmission Model', () => {
    it('4. AssignmentSubmission exposes created_at and updated_at timestamp paths', () => {
      const schemaPaths = AssignmentSubmission.schema.paths;
      expect(schemaPaths).toHaveProperty('created_at');
      expect(schemaPaths).toHaveProperty('updated_at');
    });
  });

  describe('Progress Model', () => {
    it('5. Progress defaults completed_at to null and last_position_sec to 0', () => {
      const progress = new Progress();
      expect(progress.completed_at).toBe(null);
      expect(progress.last_position_sec).toBe(0);
    });

    it('6. Progress rejects video_progress_percent below 0 or above 100', () => {
      const p1 = new Progress({
        student_id: new mongoose.Types.ObjectId(),
        course_id: new mongoose.Types.ObjectId(),
        lesson_id: new mongoose.Types.ObjectId(),
        video_progress_percent: -1
      });
      const err1 = p1.validateSync();
      expect(err1.errors['video_progress_percent']).toBeDefined();

      const p2 = new Progress({
        student_id: new mongoose.Types.ObjectId(),
        course_id: new mongoose.Types.ObjectId(),
        lesson_id: new mongoose.Types.ObjectId(),
        video_progress_percent: 101
      });
      const err2 = p2.validateSync();
      expect(err2.errors['video_progress_percent']).toBeDefined();

      const p3 = new Progress({
        student_id: new mongoose.Types.ObjectId(),
        course_id: new mongoose.Types.ObjectId(),
        lesson_id: new mongoose.Types.ObjectId(),
        video_progress_percent: 50
      });
      const err3 = p3.validateSync();
      if (err3) {
        expect(err3.errors['video_progress_percent']).toBeUndefined();
      }
    });
  });

  describe('QuizAttempt Model', () => {
    it('7. QuizAttempt requires course_id', () => {
      const attempt = new QuizAttempt({
        student_id: new mongoose.Types.ObjectId(),
        quiz_id: new mongoose.Types.ObjectId(),
        attempt_number: 1,
        answers: []
      });

      const err = attempt.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['course_id']).toBeDefined();
      expect(err.errors['course_id'].kind).toBe('required');
    });

    it('8. QuizAttempt exposes the approved three-field unique index', () => {
      // Find the compound unique index on student_id, quiz_id, attempt_number
      const indexes = QuizAttempt.schema.indexes();
      const uniqueIndex = indexes.find(idx => 
        idx[1] && idx[1].unique === true &&
        idx[0].student_id === 1 &&
        idx[0].quiz_id === 1 &&
        idx[0].attempt_number === 1
      );
      
      expect(uniqueIndex).toBeDefined();
    });
  });
});
