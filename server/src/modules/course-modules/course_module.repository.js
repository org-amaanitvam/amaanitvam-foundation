import CourseModule from './course_module.model.js';

export const findAllByCourseId = async (courseId, query = {}) => {
  return CourseModule.find({ course_id: courseId, ...query, is_deleted: false }).sort({ order: 1 });
};

export const findById = async (id, courseId = null) => {
  const query = { _id: id, is_deleted: false };
  if (courseId) query.course_id = courseId;
  return CourseModule.findOne(query);
};

export const findMaxOrder = async (courseId) => {
  const lastModule = await CourseModule.findOne({ course_id: courseId, is_deleted: false })
    .sort({ order: -1 })
    .select('order');
  return lastModule ? lastModule.order : 0;
};

export const create = async (moduleData) => {
  const courseModule = new CourseModule(moduleData);
  return courseModule.save();
};

export const update = async (id, updateData, courseId = null) => {
  const query = { _id: id, is_deleted: false };
  if (courseId) query.course_id = courseId;

  return CourseModule.findOneAndUpdate(
    query,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const softDelete = async (id, courseId = null) => {
  const query = { _id: id };
  if (courseId) query.course_id = courseId;

  return CourseModule.findOneAndUpdate(
    query,
    { $set: { is_deleted: true } },
    { new: true }
  );
};
