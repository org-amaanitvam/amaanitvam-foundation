import Course from './course.model.js';

export const findAll = async (query = {}) => {
  return Course.find({ ...query, is_deleted: false }).sort({ created_at: -1 });
};

export const findById = async (id) => {
  return Course.findOne({ _id: id, is_deleted: false });
};

export const findBySlug = async (slug) => {
  return Course.findOne({ slug, is_deleted: false });
};

export const create = async (courseData) => {
  const course = new Course(courseData);
  return course.save();
};

export const update = async (id, updateData) => {
  return Course.findOneAndUpdate(
    { _id: id, is_deleted: false },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const softDelete = async (id) => {
  return Course.findOneAndUpdate(
    { _id: id },
    { $set: { is_deleted: true } },
    { new: true }
  );
};
