import * as enrollmentService from './enrollment.service.js';

export const enroll = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const courseId = req.params.courseId;
    
    const enrollment = await enrollmentService.enrollInFreeCourse(studentId, courseId);
    
    return res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEnrollment = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const courseId = req.params.courseId;
    
    const enrollment = await enrollmentService.getMyEnrollment(studentId, courseId);
    
    return res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEnrollments = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    
    const enrollments = await enrollmentService.getMyEnrollments(studentId);
    
    return res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};
