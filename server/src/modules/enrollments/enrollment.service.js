import * as enrollmentRepo from './enrollment.repository.js';
import * as courseRepo from '../courses/course.repository.js';
import { AppError, NotFoundError } from '../../shared/errors/index.js';

export const enrollInFreeCourse = async (studentId, courseId) => {
  const course = await courseRepo.findById(courseId);
  
  if (!course || !course.is_published) {
    throw new NotFoundError('Course not found');
  }

  if (course.is_free !== true) {
    throw new AppError(
      'Paid enrollment is deferred pending Phase 7 payment verification',
      422,
      'PAYMENT_REQUIRED'
    );
  }

  const existing = await enrollmentRepo.findByStudentAndCourse(studentId, courseId);
  if (existing) {
    throw new AppError('Student is already enrolled in this course', 409, 'ENROLLMENT_ALREADY_EXISTS');
  }

  const enrolled_at = new Date();
  let expires_at = null;
  
  if (course.validity_days !== null && course.validity_days !== undefined) {
    expires_at = new Date(enrolled_at.getTime() + course.validity_days * 24 * 60 * 60 * 1000);
  }

  const enrollmentData = {
    student_id: studentId,
    course_id: courseId,
    payment_id: null,
    enrolled_at,
    expires_at,
    is_active: true,
    completion_status: 'in_progress'
  };

  try {
    return await enrollmentRepo.create(enrollmentData);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Student is already enrolled in this course', 409, 'ENROLLMENT_ALREADY_EXISTS');
    }
    throw error;
  }
};

export const getMyEnrollment = async (studentId, courseId) => {
  const enrollment = await enrollmentRepo.findActiveByStudentAndCourse(studentId, courseId);
  
  if (!enrollment) {
    throw new AppError('Active enrollment not found', 404, 'ENROLLMENT_NOT_FOUND');
  }

  if (enrollment.expires_at && enrollment.expires_at <= new Date()) {
    throw new AppError('Enrollment has expired', 403, 'ENROLLMENT_EXPIRED');
  }

  return enrollment;
};

export const getMyEnrollments = async (studentId) => {
  const enrollments = await enrollmentRepo.findAllActiveByStudent(studentId);
  const now = new Date();
  
  return enrollments.filter(e => !e.expires_at || e.expires_at > now);
};
