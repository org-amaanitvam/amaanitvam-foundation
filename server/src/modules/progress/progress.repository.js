import Progress from './progress.model.js';

export const findByLesson = async (studentId, courseId, lessonId) => {
  return Progress.findOne({ student_id: studentId, course_id: courseId, lesson_id: lessonId });
};

export const findByCourse = async (studentId, courseId) => {
  return Progress.find({ student_id: studentId, course_id: courseId });
};

export const upsert = async (studentId, courseId, lessonId, updateData) => {
  return Progress.findOneAndUpdate(
    { student_id: studentId, course_id: courseId, lesson_id: lessonId },
    { $set: { ...updateData, last_accessed: new Date() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

export const countCompleted = async (studentId, courseId) => {
  return Progress.countDocuments({ student_id: studentId, course_id: courseId, is_completed: true });
};
