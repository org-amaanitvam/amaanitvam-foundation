import Doubt from './doubt.model.js';
import DoubtResponse from './doubtResponse.model.js';

export const getDoubts = (filter, page, limit) => {
  const skip = (page - 1) * limit;
  return {
    data: Doubt.find(filter)
      .populate('student_id', 'name email')
      .populate('assigned_faculty_id', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 }),
    count: Doubt.countDocuments(filter),
  };
};

export const getDoubtById = (doubtId) => {
  return Doubt.findById(doubtId);
};

export const createDoubt = (data) => {
  return Doubt.create(data);
};

export const addResponse = (doubtId, data) => {
  return DoubtResponse.create({ doubt_id: doubtId, ...data });
};

export const resolveDoubt = (doubtId, userId) => {
  return Doubt.findByIdAndUpdate(doubtId, {
    status: 'resolved',
    resolved_at: new Date(),
    resolved_by: userId,
  }, { new: true });
};

export const reopenDoubt = (doubtId) => {
  return Doubt.findByIdAndUpdate(doubtId, {
    status: 'reopened',
    resolved_at: null,
    resolved_by: null,
  }, { new: true });
};