import Lesson from './lesson.model.js';

export const findAllByModuleId = async (moduleId, query = {}) => {
  return Lesson.find({ module_id: moduleId, ...query, is_deleted: false }).sort({ order: 1 });
};

export const findById = async (id, moduleId = null) => {
  const query = { _id: id, is_deleted: false };
  if (moduleId) query.module_id = moduleId;
  return Lesson.findOne(query);
};

export const findMaxOrder = async (moduleId) => {
  const lastLesson = await Lesson.findOne({ module_id: moduleId, is_deleted: false })
    .sort({ order: -1 })
    .select('order');
  return lastLesson ? lastLesson.order : 0;
};

export const create = async (lessonData) => {
  const lesson = new Lesson(lessonData);
  return lesson.save();
};

export const update = async (id, updateData, moduleId = null) => {
  const query = { _id: id, is_deleted: false };
  if (moduleId) query.module_id = moduleId;

  return Lesson.findOneAndUpdate(
    query,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const softDelete = async (id, moduleId = null) => {
  const query = { _id: id };
  if (moduleId) query.module_id = moduleId;

  return Lesson.findOneAndUpdate(
    query,
    { $set: { is_deleted: true } },
    { new: true }
  );
};
