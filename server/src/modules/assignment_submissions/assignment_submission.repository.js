import AssignmentSubmission from './assignment_submission.model.js';

export const findById = async (submissionId) => {
  return AssignmentSubmission.findById(submissionId);
};

export const findAllByAssignmentId = async (assignmentId) => {
  return AssignmentSubmission.find({ assignment_id: assignmentId }).sort({ submitted_at: -1 });
};

export const update = async (submissionId, updateData) => {
  return AssignmentSubmission.findByIdAndUpdate(
    submissionId,
    { $set: updateData },
    { returnDocument: 'after', runValidators: true }
  );
};

export const findOwnSubmission = async (studentId, assignmentId) => {
  return AssignmentSubmission.findOne({ student_id: studentId, assignment_id: assignmentId });
};

export const create = async (submissionData) => {
  const submission = new AssignmentSubmission(submissionData);
  return submission.save();
};
