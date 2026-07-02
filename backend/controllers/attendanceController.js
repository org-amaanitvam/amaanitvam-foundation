import Attendance from '../models/attendance.js';
import Department from '../models/department.js';
import User from '../models/user.js';

const isAdminUser = (user) => user?.role === 'admin' || user?.role === 'super_admin';

const isDepartmentHeadRole = (role) => ['department_head', 'head', 'departmentHead'].includes(role);

const isDepartmentHead = (user, department) => {
  if (!user || !department) return false;

  const userId = user._id?.toString?.() || user.id?.toString?.() || user.toString?.();
  const headId = department.departmentHead?.toString?.() || department.departmentHead;

  if (!userId || !headId) return false;

  return userId === headId.toString();
};

const isTargetDepartmentHead = (targetUser, department) => {
  if (!targetUser || !department) return false;

  const targetUserId = targetUser._id?.toString?.() || targetUser.id?.toString?.() || targetUser.toString?.();
  const headId = department.departmentHead?.toString?.() || department.departmentHead;

  if (!targetUserId || !headId) return false;

  return targetUserId === headId.toString();
};

const canManageDepartmentAttendance = (reqUser, department, targetUser) => {
  if (!reqUser || !department) return false;
  if (isAdminUser(reqUser)) return true;

  if (!isDepartmentHead(reqUser, department)) return false;
  if (isTargetDepartmentHead(targetUser, department)) return false;

  return true;
};

export const markAttendance = async (req, res) => {
  try {
    const { departmentId, userId, date, status, title, remark } = req.body;

    if (!departmentId || !userId || !date || !status || !title) {
      return res.status(400).json({ success: false, message: 'departmentId, userId, date, status, and title are required.' });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!canManageDepartmentAttendance(req.user, department, user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the department head can manage attendance for members, interns, and volunteers in their department. Department head attendance can only be managed by admin.',
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ department: departmentId, user: userId, date: attendanceDate });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentAttendance = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { date } = req.query;

    if (departmentId === 'all') {
      if (!isAdminUser(req.user)) {
        return res.status(403).json({ success: false, message: 'Only admins can view all departments.' });
      }

      const query = {};
      if (date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        query.date = d;
      }

      const attendance = await Attendance.find(query)
        .populate('user', 'name email role department')
        .populate('markedBy', 'name email')
        .populate('department', 'departmentName')
        .sort({ date: 1, createdAt: 1 });

      return res.json({ success: true, attendance });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    if (!canManageDepartmentAttendance(req.user, department, null)) {
      return res.status(403).json({
        success: false,
        message: 'Only the department head can view attendance for members, interns, and volunteers in their department. Department head attendance can only be viewed by admin.',
      });
    }

    const query = { department: departmentId };
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }

    if (!isAdminUser(req.user) && isDepartmentHead(req.user, department)) {
      const headId = department.departmentHead?.toString?.() || department.departmentHead;
      if (headId) {
        query.user = { $ne: headId.toString() };
      }
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email role department')
      .populate('markedBy', 'name email')
      .sort({ date: 1, createdAt: 1 });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceUsers = async (req, res) => {
  try {
    const isAdmin = isAdminUser(req.user);
    const { departmentId } = req.query;

    if (isAdmin) {
      const departments = await Department.find({}).sort({ departmentName: 1 }).populate('departmentHead', 'name email role department').populate('members.user', 'name email role department');
      const departmentOptions = departments.map((dept) => ({
        departmentId: dept._id,
        departmentName: dept.departmentName,
        head: dept.departmentHead ? {
          _id: dept.departmentHead._id,
          name: dept.departmentHead.name,
          email: dept.departmentHead.email,
        } : null,
      }));

      if (!departmentId) {
        return res.json({ success: true, isAdmin: true, users: [], departments: departmentOptions });
      }

      const department = await Department.findById(departmentId).populate('departmentHead', 'name email role department');
      if (!department) {
        return res.status(404).json({ success: false, message: 'Department not found.' });
      }

      const departmentUsers = await User.find({ department: department.departmentName, status: 'active' }).select('name email role department');
      const userMap = new Map();

      if (department.departmentHead) {
        const head = {
          _id: department.departmentHead._id,
          name: department.departmentHead.name,
          email: department.departmentHead.email,
          role: department.departmentHead.role,
          departmentId: department._id,
          departmentName: department.departmentName,
        };
        userMap.set(head._id.toString(), head);
      }

      departmentUsers.forEach((user) => {
        const id = user._id.toString();
        if (!userMap.has(id)) {
          userMap.set(id, {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: department._id,
            departmentName: department.departmentName,
          });
        }
      });

      const allUsers = Array.from(userMap.values());
      return res.json({ success: true, isAdmin: true, users: allUsers, departments: departmentOptions });
    }

    const department = await Department.findOne({ departmentHead: req.user._id }).populate('members.user', 'name email role department');
    if (!department) {
      return res.status(403).json({ success: false, message: 'Only department heads can access attendance register.' });
    }

    // SAFE FIX: Filter out rows missing unpopulated user profiles to handle removed accounts safely
    const activeMembers = department.members.filter(
      (member) => member.user && member.user._id && member.user._id.toString() !== req.user._id.toString()
    );

    const users = activeMembers.map((member) => ({
      _id: member.user._id,
      name: member.user.name || 'N/A',
      email: member.user.email || 'N/A',
      role: member.role || member.user.role || 'member',
      departmentId: department._id,
      departmentName: department.departmentName,
    }));

    res.json({
      success: true,
      isAdmin: false,
      isDepartmentHead: true,
      users,
      departmentId: department._id,
      departmentName: department.departmentName,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { user: req.user._id };

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }

    const attendance = await Attendance.find(query)
      .populate('department', 'departmentName')
      .sort({ date: -1 });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
