import Task from "./task.model.js";
import User from "../users/user.model.js";

const escapedExact = (input) =>
  new RegExp(
    `^${String(input || "")
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i",
  );

const allowedUserIds = async (req) => {
  if (req.userAccess?.role === "super_admin") {
    return null;
  }

  if (req.userAccess?.role === "department_head") {
    const department = String(
      req.dbUser?.department || "",
    ).trim();

    if (!department) return [];

    const users = await User.find({
      department: escapedExact(department),
    }).select("_id");

    return users.map((user) => user._id);
  }

  return [req.dbUser._id];
};

const assertAssigneeAllowed = async (
  req,
  assignedTo,
) => {
  if (req.userAccess?.role === "super_admin") {
    return;
  }

  const ids = await allowedUserIds(req);

  if (
    !ids.some(
      (id) => String(id) === String(assignedTo),
    )
  ) {
    const error = new Error(
      "The selected assignee is outside your permitted scope.",
    );
    error.statusCode = 403;
    throw error;
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const ids = await allowedUserIds(req);
    const query =
      ids === null
        ? {}
        : { assignedTo: { $in: ids } };

    const tasks = await Task.find(query)
      .populate(
        "assignedTo",
        "name email role department",
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to load tasks from the database.",
    });
  }
};

export const createTask = async (req, res) => {
  try {
    await assertAssigneeAllowed(
      req,
      req.body?.assignedTo,
    );

    const task = await Task.create(req.body);

    return res.status(201).json({
      success: true,
      task,
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

export const updateTask = async (req, res) => {
  try {
    const existing =
      await Task.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    await assertAssigneeAllowed(
      req,
      req.body?.assignedTo ||
        existing.assignedTo,
    );

    const task =
      await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

    return res.json({
      success: true,
      task,
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
