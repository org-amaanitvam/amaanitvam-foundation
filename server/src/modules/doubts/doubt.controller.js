import Doubt from './doubt.model.js';
import DoubtResponse from './doubtResponse.model.js';
import { sendSuccess, sendList } from '../../shared/response/index.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

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
        filter.$or = [{ assigned_faculty_id: req.user.id }, { student_id: req.user.id }];
      } else if (req.user.role === 'student') {
        filter.student_id = req.user.id;
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

    sendSuccess(res, 200, { doubt, responses }, 'Doubt details');
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
    sendSuccess(res, 201, { doubt }, 'Doubt created');
  } catch (error) {
    next(error);
  }
};

export const respond = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) throw new NotFoundError('Doubt not found');

    const response = await DoubtResponse.create({
      doubt_id: req.params.doubtId,
      user_id: req.user.id,
      message: req.body.message,
      attachments: req.body.attachments || [],
      is_faculty_response: req.user.role === 'faculty',
    });

    sendSuccess(res, 201, { response }, 'Response added');
  } catch (error) {
    next(error);
  }
};

export const resolve = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) throw new NotFoundError('Doubt not found');

    doubt.status = 'resolved';
    if (!doubt.resolved_at) doubt.resolved_at = new Date();
    doubt.resolved_by = req.user.id;
    await doubt.save();

    sendSuccess(res, 200, { doubt }, 'Doubt resolved');
  } catch (error) {
    next(error);
  }
};

export const reopen = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.doubtId);
    if (!doubt) throw new NotFoundError('Doubt not found');

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
    const { rating, feedback } = req.body;
    sendSuccess(res, 200, { rating, feedback }, 'Rating recorded');
  } catch (error) {
    next(error);
  }
};