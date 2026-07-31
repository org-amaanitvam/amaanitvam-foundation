import Faculty from './faculty.model.js';

export const getFacultyList = (filter, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    data: Faculty.find(filter).skip(skip).limit(limit).sort({ created_at: -1 }),
    count: Faculty.countDocuments(filter),
  };
};

export const getFacultyById = (id) => Faculty.findById(id);

export const getFacultyByUserId = (userId) => Faculty.findOne({ user_id: userId });

export const createFaculty = (data) => Faculty.create(data);

export const updateFaculty = (id, data) => Faculty.findByIdAndUpdate(id, data, { new: true });

export const deleteFaculty = (id) => Faculty.findByIdAndDelete(id);

export const getFacultiesBySubject = (subject) => {
  return Faculty.find({ subject: subject.toUpperCase(), status: 'approved' });
};

export const getAvailableForCourse = (courseId) => {
  return Faculty.find({ status: 'approved' });
};