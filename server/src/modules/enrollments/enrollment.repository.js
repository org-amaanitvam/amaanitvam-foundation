import Enrollment from './enrollment.model.js';

export const findByStudentAndCourse = async (studentId, courseId) => {
  return Enrollment.findOne({ student_id: studentId, course_id: courseId });
};

export const findActiveByStudentAndCourse = async (studentId, courseId) => {
  return Enrollment.findOne({ student_id: studentId, course_id: courseId, is_active: true });
};

export const findAllActiveByStudent = async (studentId) => {
  return Enrollment.find({ student_id: studentId, is_active: true }).sort({ enrolled_at: -1 });
};

export const create = async (enrollmentData) => {
  const enrollment = new Enrollment(enrollmentData);
  return enrollment.save();
};
