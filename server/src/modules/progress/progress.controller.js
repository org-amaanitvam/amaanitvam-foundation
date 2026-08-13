import * as progressService from './progress.service.js';

export const completeLesson = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const progress = await progressService.completeLesson(studentId, req.params.lessonId);
    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

export const updatePosition = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const progress = await progressService.updatePosition(studentId, req.params.lessonId, req.body);
    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

export const getCourseSummary = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const summary = await progressService.getCourseSummary(studentId, req.params.courseId);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
