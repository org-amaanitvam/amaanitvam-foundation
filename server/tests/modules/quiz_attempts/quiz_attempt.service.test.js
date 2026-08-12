import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/quiz-attempts/quiz_attempt.repository.js', () => ({
  create: jest.fn(),
  countByStudentAndQuiz: jest.fn(),
  findAllByStudentAndQuiz: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/quizzes/quiz.repository.js', () => ({
  findById: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/lessons/lesson.repository.js', () => ({
  findById: jest.fn()
}));

const quizAttemptRepo = await import('../../../src/modules/quiz-attempts/quiz_attempt.repository.js');
const quizRepo = await import('../../../src/modules/quizzes/quiz.repository.js');
const lessonRepo = await import('../../../src/modules/lessons/lesson.repository.js');
const { submitAttempt, getMyAttempts } = await import('../../../src/modules/quiz-attempts/quiz_attempt.service.js');
const { NotFoundError, BadRequestError, AppError } = await import('../../../src/shared/errors/index.js');

describe('Quiz Attempt Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockQuiz = {
    _id: 'quiz_123',
    course_id: 'course_123',
    lesson_id: 'lesson_123',
    max_attempts: 3,
    passing_score: 60,
    questions: [
      { _id: 'q1', options: ['A', 'B'], correct_index: 0 },
      { _id: 'q2', options: ['C', 'D'], correct_index: 1 },
      { _id: 'q3', options: ['E', 'F'], correct_index: 0 }
    ]
  };

  const studentId = 'student_abc';
  const quizId = 'quiz_123';

  describe('submitAttempt', () => {
    beforeEach(() => {
      quizRepo.findById.mockResolvedValue(mockQuiz);
      lessonRepo.findById.mockResolvedValue({ _id: mockQuiz.lesson_id, course_id: mockQuiz.course_id, is_published: true });
      quizAttemptRepo.countByStudentAndQuiz.mockResolvedValue(0);
      quizAttemptRepo.create.mockImplementation(data => Promise.resolve({ _id: 'attempt_1', ...data }));
    });

    it('1.5 Missing lesson -> NotFoundError, create not called', async () => {
      lessonRepo.findById.mockResolvedValue(null);

      const answers = [{ question_id: 'q1', selected_index: 0 }];
      await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(NotFoundError);
      expect(quizAttemptRepo.create).not.toHaveBeenCalled();
    });

    it('1.6 Unpublished lesson -> NotFoundError, create not called', async () => {
      lessonRepo.findById.mockResolvedValue({ _id: mockQuiz.lesson_id, course_id: mockQuiz.course_id, is_published: false });

      const answers = [{ question_id: 'q1', selected_index: 0 }];
      await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(NotFoundError);
      expect(quizAttemptRepo.create).not.toHaveBeenCalled();
    });

    it('1. All answers correct -> score 100, passed', async () => {
      const answers = [
        { question_id: 'q1', selected_index: 0 },
        { question_id: 'q2', selected_index: 1 },
        { question_id: 'q3', selected_index: 0 }
      ];

      const result = await submitAttempt(studentId, quizId, answers);

      expect(result.score).toBe(100);
      expect(result.is_passed).toBe(true);
      expect(quizAttemptRepo.create).toHaveBeenCalledTimes(1);
    });

    it('2. All answers wrong -> score 0, failed', async () => {
      const answers = [
        { question_id: 'q1', selected_index: 1 },
        { question_id: 'q2', selected_index: 0 },
        { question_id: 'q3', selected_index: 1 }
      ];

      const result = await submitAttempt(studentId, quizId, answers);

      expect(result.score).toBe(0);
      expect(result.is_passed).toBe(false);
    });

    it('3. Partial/missing answers -> score uses full denominator', async () => {
      // 1 correct out of 3 total questions = 33%
      const answers = [
        { question_id: 'q1', selected_index: 0 }
      ];

      const result = await submitAttempt(studentId, quizId, answers);

      expect(result.score).toBe(33); // Math.round(1/3 * 100)
      expect(result.is_passed).toBe(false);
    });

    it('4. Duplicate question IDs -> BadRequestError, create not called', async () => {
      const answers = [
        { question_id: 'q1', selected_index: 0 },
        { question_id: 'q1', selected_index: 1 } // duplicate
      ];

      await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(BadRequestError);
      expect(quizAttemptRepo.create).not.toHaveBeenCalled();
    });

    it('5. Unknown question ID -> BadRequestError', async () => {
      const answers = [
        { question_id: 'unknown_q', selected_index: 0 }
      ];

      await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(BadRequestError);
    });

    it('6. Null, primitive, array, or malformed answer entries -> BadRequestError', async () => {
      const badPayloads = [
        [null],
        [42],
        ["string"],
        [[]],
        [{ selected_index: 0 }] // missing question_id
      ];

      for (const answers of badPayloads) {
        await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(BadRequestError);
      }
    });

    it('7. Negative, fractional, out-of-range, or non-finite selected_index -> BadRequestError', async () => {
      const badIndexes = [-1, 0.5, 2, NaN, Infinity];

      for (const idx of badIndexes) {
        const answers = [{ question_id: 'q1', selected_index: idx }];
        await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(BadRequestError);
      }
    });

    it('8. Duplicate payload cannot inflate score above 100', async () => {
      // Because question map strictly iterates server questions, even if they bypassed earlier checks,
      // it grades each server question exactly once. However, our duplicate check prevents it earlier.
      const answers = [
        { question_id: 'q1', selected_index: 0 },
        { question_id: 'q1', selected_index: 0 }
      ];

      await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(BadRequestError);
    });

    it('9. Finite max attempts reached -> status 403', async () => {
      quizAttemptRepo.countByStudentAndQuiz.mockResolvedValue(3); // max is 3

      const answers = [{ question_id: 'q1', selected_index: 0 }];
      const promise = submitAttempt(studentId, quizId, answers);

      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toMatchObject({ statusCode: 403, error: { code: 'QUIZ_MAX_ATTEMPTS_REACHED' } });
    });

    it('10. max_attempts: 0 allows unlimited attempts', async () => {
      quizRepo.findById.mockResolvedValue({ ...mockQuiz, max_attempts: 0 });
      quizAttemptRepo.countByStudentAndQuiz.mockResolvedValue(999); // lots of attempts

      const answers = [{ question_id: 'q1', selected_index: 0 }];
      const result = await submitAttempt(studentId, quizId, answers);

      expect(result.attempt_number).toBe(1000);
      expect(quizAttemptRepo.create).toHaveBeenCalledTimes(1);
    });

    it('11. Negative, fractional, non-finite, or missing max_attempts -> BadRequestError', async () => {
      const badConfigs = [-1, 1.5, NaN, Infinity, undefined, null, "3"];

      for (const max of badConfigs) {
        quizRepo.findById.mockResolvedValue({ ...mockQuiz, max_attempts: max });
        const answers = [{ question_id: 'q1', selected_index: 0 }];
        await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(BadRequestError);
      }
    });

    it('12. Missing passing_score defaults to 60', async () => {
      quizRepo.findById.mockResolvedValue({ ...mockQuiz, passing_score: undefined });
      
      // 2 correct out of 3 = 67%
      const answers = [
        { question_id: 'q1', selected_index: 0 },
        { question_id: 'q2', selected_index: 1 }
      ];

      const result = await submitAttempt(studentId, quizId, answers);

      expect(result.score).toBe(67);
      expect(result.is_passed).toBe(true); // 67 >= 60

      // 1 correct out of 3 = 33%
      const answersFail = [
        { question_id: 'q1', selected_index: 0 }
      ];
      const resultFail = await submitAttempt(studentId, quizId, answersFail);
      
      expect(resultFail.score).toBe(33);
      expect(resultFail.is_passed).toBe(false); // 33 < 60
    });

    it('13. Invalid passing_score outside 0-100 -> BadRequestError', async () => {
      const badScores = [-1, 101, NaN, Infinity, "60"];

      for (const passScore of badScores) {
        quizRepo.findById.mockResolvedValue({ ...mockQuiz, passing_score: passScore });
        const answers = [{ question_id: 'q1', selected_index: 0 }];
        await expect(submitAttempt(studentId, quizId, answers)).rejects.toThrow(BadRequestError);
      }
    });

    it('14. Client-provided score, is_passed, attempt_number, course_id, and is_correct are ignored', async () => {
      const answers = [
        { question_id: 'q1', selected_index: 1, is_correct: true }, // wrong answer, but claims correct
      ];

      // student tries to force attempt 1, score 100, pass true, wrong course_id
      // (though signature doesn't take these, testing if JS passing them by chance causes issues)
      const result = await submitAttempt(studentId, quizId, answers, {
        score: 100,
        is_passed: true,
        attempt_number: 1,
        course_id: 'hacked_course'
      });

      expect(result.score).toBe(0);
      expect(result.is_passed).toBe(false);
      expect(result.attempt_number).toBe(1); // Derived from repo count (0) + 1
      expect(result.course_id).toBe('course_123'); // Derived from quiz
      expect(result.answers[0].is_correct).toBe(false); // graded by server
    });

    it('15. Mongo duplicate-key error -> status 409', async () => {
      const answers = [{ question_id: 'q1', selected_index: 0 }];
      
      const duplicateError = new Error('E11000 duplicate key error');
      duplicateError.code = 11000;
      quizAttemptRepo.create.mockRejectedValue(duplicateError);

      const promise = submitAttempt(studentId, quizId, answers);

      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toMatchObject({ statusCode: 409, error: { code: 'CONFLICT' } });
    });
  });

  describe('getMyAttempts', () => {
    it('16. Validates quiz existence and returns repository results', async () => {
      quizRepo.findById.mockResolvedValue(mockQuiz);
      quizAttemptRepo.findAllByStudentAndQuiz.mockResolvedValue([{ _id: 'attempt1' }]);

      const results = await getMyAttempts(studentId, quizId);

      expect(quizRepo.findById).toHaveBeenCalledWith(quizId);
      expect(quizAttemptRepo.findAllByStudentAndQuiz).toHaveBeenCalledWith(studentId, quizId);
      expect(results).toEqual([{ _id: 'attempt1' }]);
    });

    it('Throws NotFoundError if quiz does not exist', async () => {
      quizRepo.findById.mockResolvedValue(null);

      await expect(getMyAttempts(studentId, quizId)).rejects.toThrow(NotFoundError);
      expect(quizAttemptRepo.findAllByStudentAndQuiz).not.toHaveBeenCalled();
    });
  });
});
