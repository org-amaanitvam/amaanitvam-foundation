import User from './user.model.js';
import { sendSuccess, sendList } from '../../shared/response/index.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import { pick } from '../../shared/utils/index.js';

const ALLOWED_UPDATE_FIELDS = ['name', 'phone', 'bio', 'profile_image'];

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new NotFoundError('User not found');
    sendSuccess(res, 200, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new NotFoundError('User not found');
    const updates = pick(req.body, ALLOWED_UPDATE_FIELDS);
    Object.assign(user, updates);
    await user.save();
    sendSuccess(res, 200, { user }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('name email role status member_id created_at')
      .skip(skip)
      .limit(limit)
      .sort('created_at');

    sendList(res, 200, users, total, { page, limit });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email role status department designation member_id profile_image bio created_at');
    if (!user) throw new NotFoundError('User not found');
    sendSuccess(res, 200, { user }, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) throw new NotFoundError('User not found');

    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(req.body.status)) {
      throw new BadRequestError('Invalid status value. Must be one of: ' + validStatuses.join(', '));
    }

    user.status = req.body.status;
    await user.save();
    sendSuccess(res, 200, { user }, 'User status updated');
  } catch (error) {
    next(error);
  }
};