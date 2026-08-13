import Assignment from './assignment.model.js';

export const findAllByCourseId = async (courseId, query = {}) => {
  return Assignment.find({ ...query, course_id: courseId, is_deleted: false }).sort({ created_at: -1 });
};

export const findById = async (assignmentId) => {
  return Assignment.findOne({ _id: assignmentId, is_deleted: false });
};

export const create = async (assignmentData) => {
  const assignment = new Assignment(assignmentData);
  return assignment.save();
};

export const update = async (assignmentId, updateData) => {
  return Assignment.findOneAndUpdate(
    { _id: assignmentId, is_deleted: false },
    { $set: updateData },
    { returnDocument: 'after', runValidators: true }
  );
};

export const softDelete = async (assignmentId) => {
  // We can include is_deleted: false in the query so we don't redundantly delete
  return Assignment.findOneAndUpdate(
    { _id: assignmentId, is_deleted: false },
    { $set: { is_deleted: true, deleted_at: new Date() } },
    { returnDocument: 'after' }
  );
};
