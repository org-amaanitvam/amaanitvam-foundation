import Faculty from './faculty.model.js';
import Doubt from '../doubts/doubt.model.js';
import Course from '../courses/course.model.js';
import { sendSuccess, sendList } from '../../shared/response/index.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { is_active: true };
    if (req.query.department) filter.department = req.query.department;
    if (req.query.subject) filter.subjects = req.query.subject;
    if (req.query.search) {
      filter.$or = [
        { employee_id: { $regex: req.query.search, $options: 'i' } },
        { department: { $regex: req.query.search, $options: 'i' } },
        { qualification: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Faculty.countDocuments(filter);
    const faculty = await Faculty.find(filter)
      .populate('user_id', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ joined_at: -1 });

    sendList(res, 200, faculty, total, { page, limit });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const isMe = req.params.facultyId === 'me';
    let faculty = null;
    if (isMe) {
      faculty = await Faculty.findOne({ user_id: req.user.id })
        .populate('user_id', 'name email phone bio department');
      if (!faculty) {
        faculty = await Faculty.create({
          user_id: req.user.id,
          employee_id: req.user.memberId || undefined,
          department: req.user.department || 'Academic',
        });
        faculty = await Faculty.findById(faculty._id).populate('user_id', 'name email phone bio department');
      }
    } else {
      faculty = await Faculty.findById(req.params.facultyId).populate('user_id', 'name email phone bio');
      if (!faculty) {
        faculty = await Faculty.findOne({ user_id: req.params.facultyId }).populate('user_id', 'name email phone bio');
      }
    }

    if (!faculty) throw new NotFoundError('Faculty not found');
    sendSuccess(res, 200, { profile: faculty, faculty }, 'Faculty retrieved');
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const faculty = await Faculty.create(req.body);
    sendSuccess(res, 201, { faculty }, 'Faculty created');
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const targetId = req.params.facultyId === 'me' ? (await Faculty.findOne({ user_id: req.user.id }))?._id : req.params.facultyId;
    const faculty = await Faculty.findByIdAndUpdate(
      targetId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!faculty) throw new NotFoundError('Faculty not found');
    sendSuccess(res, 200, { profile: faculty, faculty }, 'Faculty updated');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.facultyId);
    if (!faculty) throw new NotFoundError('Faculty not found');
    faculty.is_active = req.body.is_active;
    await faculty.save();
    sendSuccess(res, 200, { faculty }, 'Faculty status updated');
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const isMe = req.params.facultyId === 'me';
    let faculty = isMe
      ? await Faculty.findOne({ user_id: req.user.id })
      : await Faculty.findById(req.params.facultyId);

    if (!faculty && !isMe) {
      faculty = await Faculty.findOne({ user_id: req.params.facultyId });
    }

    if (!faculty && isMe) {
      faculty = await Faculty.create({
        user_id: req.user.id,
        employee_id: req.user.memberId || undefined,
        department: req.user.department || 'Academic',
      });
    }

    if (!faculty) throw new NotFoundError('Faculty not found');

    const coursesCount = await Course.countDocuments({
      _id: { $in: faculty.assigned_courses || [] },
      is_deleted: false,
    });

    const doubtsResolved = await Doubt.countDocuments({
      assigned_faculty_id: faculty._id,
      status: 'resolved',
    });

    const doubtsAssigned = await Doubt.countDocuments({
      assigned_faculty_id: faculty._id,
      status: { $ne: 'resolved' },
    });

    const totalDoubts = await Doubt.countDocuments({
      assigned_faculty_id: faculty._id,
    });

    sendSuccess(res, 200, {
      faculty,
      stats: {
        courses_count: coursesCount,
        doubts_resolved: doubtsResolved,
        doubts_assigned: doubtsAssigned,
        total_doubts: totalDoubts,
        experience_years: faculty.experience_years || 0,
        engagementRate: 94.2,
        completionRate: 88.5,
        doubtResolutionRate: totalDoubts > 0 ? Math.round((doubtsResolved / totalDoubts) * 100) : 100,
      },
    }, 'Faculty stats');
  } catch (error) {
    next(error);
  }
};

export const bulkImport = async (req, res, next) => {
  try {
    const { facultyData } = req.body;
    if (!Array.isArray(facultyData)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'facultyData must be an array',
          details: [],
        },
      });
    }
    const result = await Faculty.insertMany(facultyData, { ordered: false });
    sendSuccess(res, 201, { count: result.length, faculty: result }, 'Bulk import completed');
  } catch (error) {
    next(error);
  }
};
