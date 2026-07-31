import Project from "./project.model.js";
import Department from "../departments/department.model.js";
import User from "../users/user.model.js";

// ─── Helper: Exact Regex Escaper for Database Scoping ──────────────────────
const escapedExact = (input) =>
  new RegExp(
    `^${String(input || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i",
  );

// ─── Helper: Retrieve Logged-in User's Department Document ─────────────────
const getOwnDepartment = async (req) => {
  const name = String(req.dbUser?.department || "").trim();
  if (!name) return null;
  return Department.findOne({ departmentName: escapedExact(name) });
};

// ─── Security Scoping Middleware Logic ─────────────────────────────────────
// Requirement: Super admins see all projects. Department heads see projects belonging 
// to their department or assigned directly. Team members see assigned projects only.
const projectQuery = async (req) => {
  if (req.userAccess?.role === "super_admin") {
    return { is_deleted: false };
  }

  const directAssignment = { assignedMembers: req.dbUser._id };
  const department = await getOwnDepartment(req);

  if (req.userAccess?.role === "department_head") {
    if (!department) return { is_deleted: false, ...directAssignment };
    return {
      is_deleted: false,
      $or: [{ department: department._id }, directAssignment],
    };
  }

  if (!department) return { is_deleted: false, ...directAssignment };

  return {
    is_deleted: false,
    $or: [
      directAssignment,
      {
        department: department._id,
        $or: [{ assignedMembers: { $exists: false } }, { assignedMembers: { $size: 0 } }],
      },
    ],
  };
};

// ─── Payload Sanitizer & Validator ─────────────────────────────────────────
// Requirement: Ensures non-super admins cannot assign projects outside their department scope.
const preparePayload = async (req, body) => {
  const payload = { ...body };

  if (req.userAccess?.role === "super_admin") {
    return payload;
  }

  const department = await getOwnDepartment(req);
  if (!department) {
    const error = new Error("Your account is not assigned to a department.");
    error.statusCode = 403;
    throw error;
  }

  payload.department = department._id;

  if (Array.isArray(payload.assignedMembers)) {
    const users = await User.find({
      _id: { $in: payload.assignedMembers },
      department: escapedExact(department.departmentName),
    }).select("_id");

    if (users.length !== payload.assignedMembers.length) {
      const error = new Error("One or more assigned members are outside your department.");
      error.statusCode = 403;
      throw error;
    }
  }

  return payload;
};

// 1. GET ALL PROJECTS (With Role Scoping, Search, and Filters)
export const getAllProjects = async (req, res) => {
  try {
    const baseQuery = await projectQuery(req);

    // Local Feature: Dynamic URL Query Filters & Regex Search
    if (req.query.status) baseQuery.status = req.query.status;
    if (req.query.search) {
      baseQuery.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.department_id) {
      baseQuery.department = req.query.department_id;
    }

    const projects = await Project.find(baseQuery)
      .populate("assignedMembers", "name email department")
      .populate("department", "departmentName")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: projects,       // Legacy frontend support
      projects: projects,   // Upstream frontend support
      meta: { total: projects.length }
    });
  } catch (error) {
    console.error("[Projects] Failed to load projects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load projects.",
      error: error.message,
    });
  }
};

// 2. CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const project = await Project.create(
      await preparePayload(req, req.body || {})
    );

    return res.status(201).json({
      success: true,
      data: project,
      project,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. UPDATE PROJECT
export const updateProject = async (req, res) => {
  try {
    const permitted = await Project.exists({
      _id: req.params.id,
      ...(await projectQuery(req)),
    });

    if (!permitted) {
      return res.status(403).json({
        success: false,
        message: "This project is outside your permitted scope.",
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      await preparePayload(req, req.body || {}),
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    return res.json({
      success: true,
      data: project,
      project,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};