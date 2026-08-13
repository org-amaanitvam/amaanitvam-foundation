import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/modules/assignment_submissions/assignment_submission.repository.js', () => ({
  findAllByAssignmentId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  findOwnSubmission: jest.fn(),
  create: jest.fn()
}));

jest.unstable_mockModule('../../../src/modules/assignments/assignment.repository.js', () => ({
  findById: jest.fn()
}));

const submissionRepo = await import('../../../src/modules/assignment_submissions/assignment_submission.repository.js');
const assignmentRepo = await import('../../../src/modules/assignments/assignment.repository.js');
const { submitAssignment } = await import('../../../src/modules/assignment_submissions/assignment_submission.service.js');
const { NotFoundError, BadRequestError, AppError } = await import('../../../src/shared/errors/AppError.js');

describe('Assignment Submission Service - submitAssignment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const studentId = 'student_123';
  const assignmentId = 'assignment_123';
  const mockAssignment = { _id: assignmentId, course_id: 'course_123', is_published: true };

  it('1. Missing assignment -> NotFoundError', async () => {
    assignmentRepo.findById.mockResolvedValue(null);

    await expect(submitAssignment(studentId, assignmentId, 'text', ['valid'])).rejects.toThrow(NotFoundError);
    expect(submissionRepo.create).not.toHaveBeenCalled();
  });

  it('1.5. Unpublished assignment -> NotFoundError', async () => {
    assignmentRepo.findById.mockResolvedValue({ _id: assignmentId, course_id: 'course_123', is_published: false });

    await expect(submitAssignment(studentId, assignmentId, 'text', ['valid'])).rejects.toThrow(NotFoundError);
    expect(submissionRepo.create).not.toHaveBeenCalled();
  });

  it('2. Existing student submission -> 409 ASSIGNMENT_ALREADY_SUBMITTED', async () => {
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue({ _id: 'sub_123' });

    const promise = submitAssignment(studentId, assignmentId, 'text', ['valid']);
    
    await expect(promise).rejects.toThrow(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      error: { code: 'ASSIGNMENT_ALREADY_SUBMITTED' }
    });
    expect(submissionRepo.create).not.toHaveBeenCalled();
  });

  it('3. Valid text and attachments create a submission with server-derived fields', async () => {
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue(null);
    submissionRepo.create.mockImplementation(data => Promise.resolve({ _id: 'new_sub', ...data }));

    const text = 'My assignment';
    const attachments = ['img_1', 'img_2'];

    const result = await submitAssignment(studentId, assignmentId, text, attachments);

    expect(submissionRepo.create).toHaveBeenCalledTimes(1);
    const createArg = submissionRepo.create.mock.calls[0][0];

    // Verify server-derived fields
    expect(createArg.student_id).toBe(studentId);
    expect(createArg.assignment_id).toBe(assignmentId);
    expect(createArg.course_id).toBe(mockAssignment.course_id);
    expect(createArg.status).toBe('submitted');
    expect(createArg.submission_text).toBe(text);
    expect(createArg.attachment_public_ids).toEqual(attachments);
    
    expect(result).toMatchObject(createArg);
  });

  it('4. Client grading fields and IDs are ignored', async () => {
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue(null);
    submissionRepo.create.mockResolvedValue({ _id: 'new_sub' });

    // Since the service method takes explicit scalar parameters for text and attachments,
    // it's structurally impossible to inject additional fields into the create payload.
    // We demonstrate this by verifying the exact object sent to the repository.
    await submitAssignment(studentId, assignmentId, 'text', ['valid']);

    const createArg = submissionRepo.create.mock.calls[0][0];
    expect(createArg).not.toHaveProperty('score');
    expect(createArg).not.toHaveProperty('feedback');
    expect(createArg).not.toHaveProperty('graded_by_id');
    expect(createArg).not.toHaveProperty('graded_at');
    expect(createArg).not.toHaveProperty('_id');
  });

  it('5. Invalid submission_text type or empty -> BadRequestError', async () => {
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue(null);

    const badTexts = [123, {}, [], '', '   '];

    for (const badText of badTexts) {
      await expect(submitAssignment(studentId, assignmentId, badText, ['valid'])).rejects.toThrow(BadRequestError);
    }
    
    expect(submissionRepo.create).not.toHaveBeenCalled();
  });

  it('6. Invalid attachment_public_ids type or contents or empty -> BadRequestError', async () => {
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue(null);

    const badAttachments = [
      'not_an_array',
      {},
      123,
      [123], // array of non-strings
      ['valid', null],
      [] // empty array
    ];

    for (const badAttachment of badAttachments) {
      await expect(submitAssignment(studentId, assignmentId, 'text', badAttachment)).rejects.toThrow(BadRequestError);
    }
    
    expect(submissionRepo.create).not.toHaveBeenCalled();
  });

  it('7. MongoDB duplicate-key error -> 409 ASSIGNMENT_ALREADY_SUBMITTED', async () => {
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue(null); // Pass pre-check
    
    const duplicateError = new Error('Mongo Error');
    duplicateError.code = 11000;
    submissionRepo.create.mockRejectedValue(duplicateError);

    const promise = submitAssignment(studentId, assignmentId, 'text', ['valid']);
    
    await expect(promise).rejects.toThrow(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      error: { code: 'ASSIGNMENT_ALREADY_SUBMITTED' }
    });
  });

  it('8. Verify repository create is not called on rejected inputs', async () => {
    // Tests 1, 2, 5, and 6 already check this individually.
    // This is a consolidated check showing early returns prevent repo calls.
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue(null);
    
    // Will fail text validation
    await expect(submitAssignment(studentId, assignmentId, 123, ['valid'])).rejects.toThrow(BadRequestError);
    
    // Will fail attachment validation
    await expect(submitAssignment(studentId, assignmentId, 'valid', ['ok', 123])).rejects.toThrow(BadRequestError);
    
    expect(submissionRepo.create).not.toHaveBeenCalled();
  });

  it('9. Neither text nor attachments provided -> BadRequestError', async () => {
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue(null);

    await expect(submitAssignment(studentId, assignmentId, undefined, undefined)).rejects.toThrow(BadRequestError);
    await expect(submitAssignment(studentId, assignmentId, null, null)).rejects.toThrow(BadRequestError);

    expect(submissionRepo.create).not.toHaveBeenCalled();
  });

  it('10. Text-only and attachments-only submissions are accepted', async () => {
    assignmentRepo.findById.mockResolvedValue(mockAssignment);
    submissionRepo.findOwnSubmission.mockResolvedValue(null);
    submissionRepo.create.mockResolvedValue({ _id: 'new_sub' });

    // Text only
    await submitAssignment(studentId, assignmentId, 'Valid text', undefined);
    expect(submissionRepo.create).toHaveBeenCalledTimes(1);

    // Attachments only
    await submitAssignment(studentId, assignmentId, undefined, ['valid_id']);
    expect(submissionRepo.create).toHaveBeenCalledTimes(2);
  });
});
