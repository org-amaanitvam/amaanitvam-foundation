import Project from "./project.model.js";
import Department from "../departments/department.model.js";
import User from "../users/user.model.js";

const escapedExact = (input) =>
  new RegExp(
    `^${String(input || "")
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i",
  );

const getOwnDepartment = async (req) => {
  const name = String(
    req.dbUser?.department || "",
  ).trim();

  if (!name) return null;

  return Department.findOne({
    departmentName: escapedExact(name),
  });
};

const projectQuery = async (req) => {
  if (req.userAccess?.role === "super_admin") {
    return {};
  }

  const directAssignment = {
    assignedMembers: req.dbUser._id,
  };

  const department =
    await getOwnDepartment(req);

  if (req.userAccess?.role === "department_head") {
    if (!department) {
      return directAssignment;
    }

    return {
      $or: [
        {
          department: department._id,
        },
        directAssignment,
      ],
    };
  }

  if (!department) {
    return directAssignment;
  }

  return {
    $or: [
      directAssignment,
      {
        department: department._id,
        $or: [
          {
            assignedMembers: {
              $exists: false,
            },
          },
          {
            assignedMembers: {
              $size: 0,
            },
          },
        ],
      },
    ],
  };
};

const preparePayload = async (req, body) => {
  const payload = { ...body };

  if (req.userAccess?.role === "super_admin") {
    return payload;
  }

  const department =
    await getOwnDepartment(req);

  if (!department) {
    const error = new Error(
      "Your account is not assigned to a department.",
    );
    error.statusCode = 403;
    throw error;
  }

  payload.department = department._id;

  if (Array.isArray(payload.assignedMembers)) {
    const users = await User.find({
      _id: {
        $in: payload.assignedMembers,
      },
      department: escapedExact(
        department.departmentName,
      ),
    }).select("_id");

    if (
      users.length !==
      payload.assignedMembers.length
    ) {
      const error = new Error(
        "One or more assigned members are outside your department.",
      );
      error.statusCode = 403;
      throw error;
    }
  }

  return payload;
};

export const getAllProjects = async (
  req,
  res,
) => {
  try {
    const projects = await Project.find(
      await projectQuery(req),
    )
      .populate(
        "assignedMembers",
        "name email department",
      )
      .populate(
        "department",
        "departmentName",
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error(
      "[Projects] Failed to load projects:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load projects.",
      ...(process.env.NODE_ENV === "development"
        ? {
            error: error.message,
            code: error.name,
          }
        : {}),
    });
  }
};

export const createProject = async (
  req,
  res,
) => {
  try {
    const project = await Project.create(
      await preparePayload(
        req,
        req.body || {},
      ),
    );

    return res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: error.message,
      });
  }
};

export const updateProject = async (
  req,
  res,
) => {
  try {
    const permitted =
      await Project.exists({
        _id: req.params.id,
        ...(await projectQuery(req)),
      });

    if (!permitted) {
      return res.status(403).json({
        success: false,
        message:
          "This project is outside your permitted scope.",
      });
    }

    const project =
      await Project.findByIdAndUpdate(
        req.params.id,
        await preparePayload(
          req,
          req.body || {},
        ),
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

    return res.json({
      success: true,
      project,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: error.message,
      });
  }
};
