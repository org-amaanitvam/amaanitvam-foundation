import Doubt from './doubt.model.js';
import DoubtResponse from './doubtResponse.model.js';
import DoubtRating from './doubtRating.model.js';
import Faculty from '../faculty/faculty.model.js';
import { sendSuccess, sendList } from '../../shared/response/index.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import { notifyUser } from '../notifications/notification.service.js';
import { triggerAiDoubtResolution } from './aiDoubt.service.js';

export const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.student_id) filter.student_id = req.query.student_id;

    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      if (req.user.role === 'faculty') {
        const faculty = await Faculty.findOne({ user_id: req.user.id });
        filter.$or = [
          { assigned_faculty_id: faculty ? faculty._id : null },
          { student_id: req.user.id },
        ].filter(Boolean);
      } else if (req.user.role === 'student') {
        filter.student_id = req.user.id;
      }
    }

    if (req.query.assigned_to_me === 'true' && req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user_id: req.user.id });
      if (faculty) {
        filter.assigned_faculty_id = faculty._id;
      }
    }

    const total = await Doubt.countDocuments(filter);
    const doubts = await Doubt.find(filter)
      .populate('student_id', 'name email')
      .populate('assigned_faculty_id', 'name')
      .populate('course_id', 'title')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    sendList(res, 200, doubts, total, { page, limit });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId)
      .populate('student_id', 'name email')
      .populate('assigned_faculty_id', 'name')
      .populate('course_id', 'title');
    if (!doubt) throw new NotFoundError('Doubt not found');

    const responses = await DoubtResponse.find({ doubt_id: req.params.doubtId })
      .populate('user_id', 'name role')
      .sort('created_at');

    const rating = await DoubtRating.findOne({ doubt_id: req.params.doubtId });

    sendSuccess(res, 200, { doubt, responses, rating }, 'Doubt details');
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const doubt = await Doubt.create({
      ...req.body,
      student_id: req.user.id,
    });
    void triggerAiDoubtResolution(doubt, req.user);
    sendSuccess(res, 201, { doubt }, 'Doubt created');
  } catch (error) {
    next(error);
  }
};

export const assign = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) throw new NotFoundError('Doubt not found');

    const { faculty_id } = req.body;
    if (!faculty_id) throw new BadRequestError('faculty_id is required');

    const faculty = await Faculty.findById(faculty_id);
    if (!faculty) throw new NotFoundError('Faculty not found');

    doubt.assigned_faculty_id = faculty._id;
    if (doubt.status === 'open') {
      doubt.status = 'assigned';
    }
    await doubt.save();

    await notifyUser(
      faculty.user_id,
      'doubt_assigned',
      'New Doubt Assigned',
      `A new doubt "${doubt.title}" has been assigned to you.`,
      { doubt_id: doubt._id, priority: doubt.priority }
    );

    sendSuccess(res, 200, { doubt }, 'Doubt assigned to faculty');
  } catch (error) {
    next(error);
  }
};

export const respond = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) throw new NotFoundError('Doubt not found');

    const isFaculty = req.user.role === 'faculty';
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin';

    if (isFaculty && !isAdmin) {
      const faculty = await Faculty.findOne({ user_id: req.user.id });
      if (!faculty) throw new BadRequestError('Faculty profile not found');
      if (doubt.assigned_faculty_id && !doubt.assigned_faculty_id.equals(faculty._id)) {
        throw new BadRequestError('This doubt is assigned to another faculty member');
      }
    }

    const response = await DoubtResponse.create({
      doubt_id: req.params.doubtId,
      user_id: req.user.id,
      message: req.body.message,
      attachments: req.body.attachments || [],
      is_faculty_response: isFaculty || isAdmin,
    });

    if (isFaculty && !response.is_solution && req.body.mark_as_solution) {
      response.is_solution = true;
      await response.save();
    }

    if ((isFaculty || isAdmin) && doubt.status !== 'resolved') {
      if (doubt.status === 'open' && !doubt.assigned_faculty_id && isFaculty) {
        const faculty = await Faculty.findOne({ user_id: req.user.id });
        if (faculty) doubt.assigned_faculty_id = faculty._id;
      }
      if (doubt.status !== 'in_progress') {
        doubt.status = 'in_progress';
      }
      await doubt.save();
    }

    if (isFaculty || isAdmin) {
      await notifyUser(
        doubt.student_id,
        'doubt_responded',
        'New Response to Your Doubt',
        `Your doubt "${doubt.title}" has received a response.`,
        { doubt_id: doubt._id, response_id: response._id }
      );
    }

    await notifyUser(
      response.user_id,
      'doubt_response_added',
      'Response Recorded',
      `Your response to "${doubt.title}" has been recorded.`,
      { doubt_id: doubt._id, response_id: response._id }
    );

    sendSuccess(res, 201, { response }, 'Response added');
  } catch (error) {
    next(error);
  }
};

export const resolve = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) throw new NotFoundError('Doubt not found');

    if (doubt.status === 'resolved') {
      throw new BadRequestError('Doubt is already resolved', 'DOUBT_ALREADY_RESOLVED');
    }

    doubt.status = 'resolved';
    doubt.resolved_at = new Date();
    doubt.resolved_by = req.user.id;
    await doubt.save();

    await notifyUser(
      doubt.student_id,
      'doubt_resolved',
      'Your Doubt Has Been Resolved',
      `Your doubt "${doubt.title}" has been marked as resolved.`,
      { doubt_id: doubt._id, resolved_by: req.user.id }
    );

    sendSuccess(res, 200, { doubt }, 'Doubt resolved');
  } catch (error) {
    next(error);
  }
};

export const reopen = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) throw new NotFoundError('Doubt not found');

    if (doubt.status !== 'resolved' && doubt.status !== 'closed') {
      throw new BadRequestError('Only resolved or closed doubts can be reopened');
    }

    doubt.status = 'reopened';
    doubt.resolved_at = null;
    doubt.resolved_by = null;
    await doubt.save();

    sendSuccess(res, 200, { doubt }, 'Doubt reopened');
  } catch (error) {
    next(error);
  }
};

export const rate = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) throw new NotFoundError('Doubt not found');

    if (doubt.student_id.toString() !== req.user.id && req.user.role === 'student') {
      throw new BadRequestError('You can only rate your own doubts');
    }

    const { rating, feedback } = req.body;

    const existing = await DoubtRating.findOne({
      doubt_id: req.params.doubtId,
      student_id: req.user.id,
    });

    if (existing) {
      existing.rating = rating;
      existing.feedback = feedback || existing.feedback;
      await existing.save();
      sendSuccess(res, 200, { rating: existing }, 'Rating updated');
    } else {
      const doubtRating = await DoubtRating.create({
        doubt_id: req.params.doubtId,
        student_id: req.user.id,
        rating,
        feedback,
      });
      sendSuccess(res, 201, { rating: doubtRating }, 'Rating recorded');
    }
  } catch (error) {
    next(error);
  }
};
