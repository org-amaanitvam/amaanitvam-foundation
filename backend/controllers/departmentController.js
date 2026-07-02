import Department from "../models/department.js";
import User from "../models/user.js";

const requireAdminUser = (req, res) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return null;
};

// ─── Helper: check if user can access this department ────────────────────────
// Admins/super_admins → all departments
// Everyone else → only their own department
const canAccessDepartment = (req, department) => {
  if (["admin", "super_admin"].includes(req.user?.role)) return true;
  return department.departmentName === req.user?.department;
};

//CREATE Department
export const createDepartment = async (req, res) => {
  const authError = requireAdminUser(req, res);
  if (authError) return authError;

  try {
    const {
      departmentName,
      description,
      departmentHead,
      members,
    } = req.body;

    const existing = await Department.findOne({ departmentName });
    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    let headUser = null;
    if (departmentHead) {
      headUser = await User.findById(departmentHead);
      if (!headUser) {
        return res.status(404).json({ message: "Department head not found" });
      }
    }

    let formattedMembers = [];
    if (members && members.length > 0) {
      for (let m of members) {
        const userExists = await User.findById(m.user);
        if (!userExists) {
          return res.status(404).json({ message: `User not found: ${m.user}` });
        }
        formattedMembers.push({
          user: m.user,
          role: m.role || "member",
          joinedAt: new Date(),
        });
      }
    }

    const department = await Department.create({
      departmentName,
      description: description || "",
      departmentHead: departmentHead || null,
      members: formattedMembers,
      totalMembers: formattedMembers.length,
    });

    res.status(201).json({ message: "Department created successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//edit
export const editDepartment = async (req, res) => {
  const authError = requireAdminUser(req, res);
  if (authError) return authError;

  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const { departmentName, description, departmentHead } = req.body;

    if (departmentName && departmentName !== department.departmentName) {
      const duplicate = await Department.findOne({ departmentName });
      if (duplicate && duplicate._id.toString() !== id) {
        return res.status(400).json({ message: "Department name already exists" });
      }
      department.departmentName = departmentName;
    }

    if (typeof description === "string") {
      department.description = description;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "departmentHead")) {
      if (departmentHead) {
        const userExists = await User.findById(departmentHead);
        if (!userExists) {
          return res.status(404).json({ message: "User not found" });
        }
        department.departmentHead = departmentHead;
      } else {
        department.departmentHead = null;
      }
    }

    await department.save();

    res.json({ message: "Department updated successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Departments — scoped by role
// admin/super_admin → all | others → only their own department
export const getDepartments = async (req, res) => {
  try {
    let query = {};

    if (!["admin", "super_admin"].includes(req.user?.role)) {
      if (!req.user?.department) {
        return res.json({ departments: [] });
      }
      query = { departmentName: req.user.department };
    }

    const departments = await Department.find(query)
      .populate("departmentHead", "name email")
      .populate("members.user", "name email role");

    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get single department — scoped by role
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate("departmentHead", "name email")
      .populate("members.user", "name email role");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // 🔒 Non-admins can only view their own department
    if (!canAccessDepartment(req, department)) {
      return res.status(403).json({
        message: "Access denied. You can only view your own department.",
      });
    }

    res.json({ department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete — super_admin only
export const deleteDepartment = async (req, res) => {
  //  Only super_admin can delete departments
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Only super_admin can delete departments." });
  }

  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await department.deleteOne();

    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  assign member — admin only, syncs department field on User
export const assignMember = async (req, res) => {
  const authError = requireAdminUser(req, res);
  if (authError) return authError;

  try {
    const departmentId = req.params.id || req.body.departmentId;
    const { userId, role } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyMember = department.members.find(
      (m) => m.user.toString() === userId
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User already in department" });
    }

    department.members.push({
      user: userId,
      role: role || "member",
      joinedAt: new Date(),
    });
    department.totalMembers = department.members.length;
    await department.save();

    //  Sync department name onto the User document
    await User.findByIdAndUpdate(userId, { department: department.departmentName });

    res.json({ message: "Member assigned successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// department performance
const canUpdatePerformance = (req, department) => {
  if (req.user?.role === "admin" || req.user?.role === "super_admin") return true;
  if (
    department.departmentHead &&
    req.user?._id?.toString() === department.departmentHead.toString()
  ) return true;
  return false;
};

export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { performance } = req.body;

    if (performance < 0 || performance > 100) {
      return res.status(400).json({ message: "Performance must be between 0 and 100" });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    //  Non-admins can only update performance for their own department
    if (!canAccessDepartment(req, department) && !canUpdatePerformance(req, department)) {
      return res.status(403).json({
        message: "Only the department head or an admin can update department performance.",
      });
    }

    if (!canUpdatePerformance(req, department)) {
      return res.status(403).json({
        message: "Only the department head or an admin can update department performance.",
      });
    }

    department.performance = performance;
    await department.save();

    res.json({ message: "Performance updated successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  department report — scoped by role
export const getDepartmentReport = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate("departmentHead", "name email")
      .populate("members.user", "name email role");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    //  Non-admins can only see their own department report
    if (!canAccessDepartment(req, department)) {
      return res.status(403).json({
        message: "Access denied. You can only view your own department report.",
      });
    }

    const report = {
      departmentName: department.departmentName,
      description: department.description,
      head: department.departmentHead,
      totalMembers: department.totalMembers,
      performance: department.performance,
      members: department.members,
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
