import Faculty from './faculty.model.js';

export const getFacultyList = (filter, page, limit) => {
  const skip = (page - 1) * limit;
  return {
    data: Faculty.find(filter)
      .populate('user_id', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ joined_at: -1 }),
    count: Faculty.countDocuments(filter),
  };
};

export const getById = (facultyId) => {
  return Faculty.findById(facultyId).populate('user_id', 'name email phone bio');
};

export const createFaculty = (data) => {
  return Faculty.create(data);
};

export const updateFaculty = (facultyId, data) => {
  return Faculty.findByIdAndUpdate(facultyId, data, { new: true, runValidators: true });
};

export const getStats = (facultyId) => {
  return Faculty.findById(facultyId);
};

export const bulkCreate = (dataArray) => {
  return Faculty.insertMany(dataArray);
};