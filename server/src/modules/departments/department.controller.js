import Department from "./department.model.js";
import User from "../users/user.model.js";

// ─── Helper: Enforce Super Admin ──────────────────────────────────────────────
const requireAdminUser = (req, res) => {
  if (req.userAccess?.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      code: "INSUFFICIENT_ROLE",
      message: "Super Admin access required.",
    });
  }
  return null;
};

// ─── Helper: Check if user can access this department ────────────────────────
// LOGIC: Admins/super_admins → access to all departments
// Everyone else → access to only their own assigned department
const canAccessDepartment = (req, department) => {
  if (req.userAccess?.role === "super_admin") return true;

  const ownDepartment = String(req.dbUser?.department || "").trim().toLowerCase();
  const targetDepartment = String(department?.departmentName || "").trim().toLowerCase();

  return Boolean(ownDepartment && targetDepartment && ownDepartment === targetDepartment);
};

// CREATE Department
export const createDepartment = async (req, res) => {
  try {
    const { departmentName, description, departmentHead, members } = req.body;

    const existing = await Department.findOne({ departmentName });
    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    let headUser = null;
    if (departmentHead) {
      headUser = await User.findById(departmentHead);
      if (!headUser) return res.status(404).json({ message: "Department head not found" });
    }

    let formattedMembers = [];
    if (members && members.length > 0) {
      for (let m of members) {
        const userExists = await User.findById(m.user);
        if (!userExists) return res.status(404).json({ message: `User not found: ${m.user}` });
        
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

// GET ALL DEPARTMENTS (SCOPED)
export const getDepartments = async (req, res) => {
  try {
    let query = {};

    // SECURITY LOGIC: If the user is NOT a super admin, restrict the database query 
    // to only return the department that matches their user profile.
    if (req.userAccess?.role !== "super_admin") {
      if (!req.dbUser?.department) {
        // User is not assigned to a department, return empty array safely
        return res.json({ departments: [] }); 
      }
      query = { departmentName: req.dbUser.department };
    }

    const departments = await Department.find(query)
      .populate("departmentHead", "name email")
      .populate("members.user", "name email role");

    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET DEPARTMENT BY ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("departmentHead", "name email")
      .populate("members.user", "name email role");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (!canAccessDepartment(req, department)) {
      return res.status(403).json({ message: "Access denied to this department" });
    }

    res.json({ department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT DEPARTMENT
export const editDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const { departmentName, description, departmentHead } = req.body;

    if (departmentName) department.departmentName = departmentName;
    if (description !== undefined) department.description = description;
    if (departmentHead !== undefined) department.departmentHead = departmentHead;

    await department.save();
    res.json({ message: "Department updated successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE DEPARTMENT
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ASSIGN MEMBER
export const assignMember = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const { userId, role } = req.body;
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingMember = department.members.find(
      (m) => m.user.toString() === userId.toString()
    );

    if (existingMember) {
      existingMember.role = role || existingMember.role;
    } else {
      department.members.push({ user: userId, role: role || "member", joinedAt: new Date() });
      department.totalMembers = department.members.length;
    }

    await department.save();
    res.json({ message: "Member assigned successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PERFORMANCE
export const updatePerformance = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (!canAccessDepartment(req, department)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { metrics } = req.body;
    if (metrics) department.metrics = { ...department.metrics, ...metrics };

    await department.save();
    res.json({ message: "Performance updated successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET DEPARTMENT REPORT
export const getDepartmentReport = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("departmentHead", "name email")
      .populate("members.user", "name email role");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (!canAccessDepartment(req, department)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      report: {
        departmentName: department.departmentName,
        totalMembers: department.totalMembers,
        metrics: department.metrics,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};