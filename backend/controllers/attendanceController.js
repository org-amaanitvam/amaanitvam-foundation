import Attendance from '../models/attendance.js';
import Department from '../models/department.js';
import User from '../models/user.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isAdmin = (user) =>
  user?.role === 'admin' || user?.role === 'super_admin';

/** Find the department where this user is the head */
const findHeadDepartment = (userId, departments) => {
  const id = userId?.toString();
  return departments.find(
    (d) => d.departmentHead && d.departmentHead.toString() === id
  ) || null;
};

// ─── markAttendance  POST /attendance/mark ────────────────────────────────────
export const markAttendance = async (req, res) => {
  try {
    const { departmentId, userId, date, status, title, remark } = req.body;

    if (!departmentId || !userId || !date || !status || !title) {
      return res
        .status(400)
        .json({ success: false, message: 'departmentId, userId, date, status, and title are required.' });
    }

    // Validate departmentId is a real ObjectId (not 'all')
    if (departmentId === 'all') {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot mark attendance for "all" departments. Select a specific department.' });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const requesterIsAdmin = isAdmin(req.user);
    if (!requesterIsAdmin) {
      // Must be dept head of this department
      const headId = department.departmentHead?.toString();
      const requesterId = req.user._id?.toString();
      if (!headId || headId !== requesterId) {
        return res
          .status(403)
          .json({ success: false, message: 'You do not have permission to mark attendance for this department.' });
      }
      // Dept head cannot mark their own attendance
      if (userId.toString() === requesterId) {
        return res
          .status(403)
          .json({ success: false, message: 'Department heads cannot mark their own attendance.' });
      }
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      department: departmentId,
      user: userId,
      date: attendanceDate,
    });

    if (existing) {
      existing.status = status;
      existing.title = title;
      existing.remark = remark || '';
      existing.markedBy = req.user._id;
      await existing.save();
      return res.json({ success: true, message: 'Attendance updated.', attendance: existing });
    }

    const attendance = await Attendance.create({
      department: departmentId,
      user: userId,
      date: attendanceDate,
      status,
      title,
      markedBy: req.user._id,
      remark: remark || '',
    });

    res.status(201).json({ success: true, message: 'Attendance marked.', attendance });
  } catch (error) {
    console.error('markAttendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── getDepartmentAttendance  GET /attendance/department/:departmentId ─────────
export const getDepartmentAttendance = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { date } = req.query;

    const requesterIsAdmin = isAdmin(req.user);

    if (departmentId === 'all') {
      if (!requesterIsAdmin) {
        return res.status(403).json({ success: false, message: 'Only admins can view all departments.' });
      }

      // Fetch all departments, collect dept head IDs
      const departments = await Department.find({}).select('departmentHead');
      const headIds = departments.map((d) => d.departmentHead).filter(Boolean);

      const query = { user: { $in: headIds } };
      if (date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        query.date = d;
      }

      const attendance = await Attendance.find(query)
        .populate('user', 'name email role department')
        .populate('markedBy', 'name email')
        .populate('department', 'departmentName')
        .sort({ date: -1, createdAt: -1 });

      return res.json({ success: true, attendance });
    }

    // Specific department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    if (!requesterIsAdmin) {
      const headId = department.departmentHead?.toString();
      const requesterId = req.user._id?.toString();
      if (!headId || headId !== requesterId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const query = { department: departmentId };
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }



    const attendance = await Attendance.find(query)
      .populate('user', 'name email role department')
      .populate('markedBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('getDepartmentAttendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── getAttendanceUsers  GET /attendance/users ────────────────────────────────
export const getAttendanceUsers = async (req, res) => {
  try {
    const requesterIsAdmin = isAdmin(req.user);
    const { departmentId } = req.query;

    if (requesterIsAdmin) {
      // Fetch all departments with their heads populated
      const departments = await Department.find({})
        .sort({ departmentName: 1 })
        .populate('departmentHead', 'name email role');

      // Build the department dropdown options
      const departmentOptions = departments.map((dept) => ({
        departmentId: dept._id,
        departmentName: dept.departmentName,
        head: dept.departmentHead
          ? { _id: dept.departmentHead._id, name: dept.departmentHead.name, email: dept.departmentHead.email }
          : null,
      }));

      // No departmentId param → just return departments, no users
      if (!departmentId) {
        return res.json({ success: true, isAdmin: true, users: [], departments: departmentOptions });
      }

      // "All Departments" → return all department heads
      if (departmentId === 'all') {
        const users = [];
        for (const dept of departments) {
          if (dept.departmentHead) {
            users.push({
              _id: dept.departmentHead._id,
              name: dept.departmentHead.name,
              email: dept.departmentHead.email,
              role: dept.departmentHead.role,
              departmentId: dept._id,
              departmentName: dept.departmentName,
            });
          }
        }
        return res.json({ success: true, isAdmin: true, users, departments: departmentOptions });
      }

      // Specific department → return all members of that department + its head
      const dept = await Department.findById(departmentId).populate('departmentHead', 'name email role');
      if (!dept) {
        return res.status(404).json({ success: false, message: 'Department not found.' });
      }

      const dbUsers = await User.find({
        department: dept.departmentName,
        status: 'active',
      }).select('name email role department');

      const userMap = new Map();

      // Add head first
      if (dept.departmentHead) {
        userMap.set(dept.departmentHead._id.toString(), {
          _id: dept.departmentHead._id,
          name: dept.departmentHead.name,
          email: dept.departmentHead.email,
          role: dept.departmentHead.role,
          departmentId: dept._id,
          departmentName: dept.departmentName,
        });
      }

      // Add members
      for (const u of dbUsers) {
        const id = u._id.toString();
        if (!userMap.has(id)) {
          userMap.set(id, {
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            departmentId: dept._id,
            departmentName: dept.departmentName,
          });
        }
      }

      return res.json({
        success: true,
        isAdmin: true,
        users: Array.from(userMap.values()),
        departments: departmentOptions,
      });
    }

    // ── Department Head flow ──────────────────────────────────────────────────
    const myDept = await Department.findOne({ departmentHead: req.user._id });
    if (!myDept) {
      return res.json({ success: true, isAdmin: false, isDepartmentHead: false, users: [] });
    }

    const members = await User.find({
      department: myDept.departmentName,
      status: 'active',
      _id: { $ne: req.user._id },
    }).select('name email role department');

    const users = members.map((u) => ({
      _id: u._id,
      name: u.name || 'N/A',
      email: u.email || 'N/A',
      role: u.role || 'member',
      departmentId: myDept._id,
      departmentName: myDept.departmentName,
    }));

    res.json({
      success: true,
      isAdmin: false,
      isDepartmentHead: true,
      users,
      departmentId: myDept._id,
      departmentName: myDept.departmentName,
    });
  } catch (error) {
    console.error('getAttendanceUsers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── getMyAttendance  GET /attendance/me ──────────────────────────────────────
export const getMyAttendance = async (req, res) => {
  try {
    // Return ALL attendance records for the user — no date filter.
    // The frontend filters by selected date for display.
    const attendance = await Attendance.find({ user: req.user._id })
      .populate('department', 'departmentName')
      .sort({ date: -1 });

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('getMyAttendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
