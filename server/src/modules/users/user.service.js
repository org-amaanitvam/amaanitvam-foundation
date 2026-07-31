import User from './user.model.js';

export const findMe = (userId) => {
  return User.findById(userId).select('-password');
};

export const updateUser = (userId, updates) => {
  return User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
};

export const listAllUsers = (filter, page, limit) => {
  const skip = (page - 1) * limit;
  return {
    data: User.find(filter)
      .select('name email role status member_id created_at')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 }),
    count: User.countDocuments(filter),
  };
};

export const findById = (userId) => {
  return User.findById(userId);
};