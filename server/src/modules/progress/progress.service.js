import * as progressRepo from './progress.repository.js';
import * as lessonRepo from '../lessons/lesson.repository.js';
import * as courseRepo from '../courses/course.repository.js';
import * as courseModuleRepo from '../course-modules/course_module.repository.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';

export const completeLesson = async (studentId, lessonId) => {
  // Validate lesson exists and is published
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson || !lesson.is_published) {
    throw new NotFoundError('Lesson not found or unavailable');
  }

  // Validate the course still exists
  const courseId = lesson.course_id;
  const course = await courseRepo.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  // IMPLEMENTATION GAP (Plan Section 2, Gap #3):
  // Whether completing a lesson should automatically set video_progress_percent to 100
  // is not documented in SRS v1.1 or API_CONVENTIONS.md.
  // Decision: only set is_completed and completed_at. Do not touch video_progress_percent.

  // IMPLEMENTATION GAP (Plan Section 2, Gap #2):
  // Whether time_spent_min can be submitted with the /complete request is undocumented.
  // Decision: service accepts no additional payload fields until the API contract is specified.

  return progressRepo.upsert(studentId, courseId, lessonId, {
    is_completed: true,
    completed_at: new Date()
  });
};

export const updatePosition = async (studentId, lessonId, positionData) => {
  // Validate lesson exists and is published
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson || !lesson.is_published) {
    throw new NotFoundError('Lesson not found or unavailable');
  }

  // Validate the course still exists
  const courseId = lesson.course_id;
  const course = await courseRepo.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  if (!positionData || typeof positionData !== 'object' || Array.isArray(positionData)) {
    throw new BadRequestError('Invalid payload object');
  }

  // Pick only allowed fields
  const { last_position_sec, video_progress_percent, time_spent_min } = positionData;

  const updateData = {};

  if (last_position_sec !== undefined) {
    if (typeof last_position_sec !== 'number' || !Number.isFinite(last_position_sec) || last_position_sec < 0) {
      throw new BadRequestError('last_position_sec must be a positive number');
    }
    updateData.last_position_sec = last_position_sec;
  }

  if (video_progress_percent !== undefined) {
    if (typeof video_progress_percent !== 'number' || !Number.isFinite(video_progress_percent) || video_progress_percent < 0 || video_progress_percent > 100) {
      throw new BadRequestError('video_progress_percent must be a finite number between 0 and 100');
    }
    updateData.video_progress_percent = video_progress_percent;
  }

  if (time_spent_min !== undefined) {
    if (typeof time_spent_min !== 'number' || !Number.isFinite(time_spent_min) || time_spent_min < 0) {
      throw new BadRequestError('time_spent_min must be a positive number');
    }
    updateData.time_spent_min = time_spent_min;
  }

  // IMPLEMENTATION GAP (Plan Section 2, Gap #4):
  // Whether reaching video_progress_percent === 100 via /position should automatically
  // trigger is_completed = true is not documented in SRS v1.1.
  // Decision: do not auto-complete. Completion is only triggered by an explicit /complete call.

  return progressRepo.upsert(studentId, courseId, lessonId, updateData);
};

export const getCourseSummary = async (studentId, courseId) => {
  // Validate course exists
  const course = await courseRepo.findById(courseId);
  if (!course) throw new NotFoundError('Course not found');

  const [lessonProgressList, completedCount, modules] = await Promise.all([
    progressRepo.findByCourse(studentId, courseId),
    progressRepo.countCompleted(studentId, courseId),
    courseModuleRepo.findAllByCourseId(courseId)
  ]);

  const summaryModules = await Promise.all(
    modules.map(async (mod) => {
      const lessonsInModule = await lessonRepo.findAllByModuleId(mod._id);
      const lessonIds = new Set(lessonsInModule.map(l => l._id.toString()));
      
      const moduleProgress = lessonProgressList.filter(p => 
        lessonIds.has(p.lesson_id.toString())
      );

      return {
        module_id: mod._id,
        lesson_progress: moduleProgress
      };
    })
  );

  return {
    course_id: courseId,
    total_lessons: course.total_lessons,
    completed_lessons: completedCount,
    modules: summaryModules
  };
};
