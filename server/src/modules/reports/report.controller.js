import Task from "../tasks/task.model.js";
import User from "../users/user.model.js";

const escapedExact = (input) =>
  new RegExp(`^${String(input || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

// Helper to look up target user by Firebase UID, Member ID, Email, or MongoDB ID
const findUser = async (identifier) => {
  const input = String(identifier || "").trim();
  if (!input) return null;

  const conditions = [
    { firebaseUid: input },
    { memberId: input },
    { email: input.toLowerCase() },
  ];

  if (/^[a-f\d]{24}$/i.test(input)) {
    conditions.push({ _id: input });
  }

  return User.findOne({ $or: conditions });
};

// Security check: Ensures users can only view reports within their authorized hierarchy scope
const targetAllowed = (req, target) => {
  if (req.userAccess?.role === "super_admin") return true;
  if (String(target?._id || "") === String(req.dbUser?._id || "")) return true;

  if (req.userAccess?.role === "department_head") {
    return (
      String(target?.department || "").trim().toLowerCase() ===
      String(req.dbUser?.department || "").trim().toLowerCase()
    );
  }

  return false;
};

// Scoped task query builder for performance reports
const reportTasks = async (req, target) => {
  if (target) {
    return Task.find({ assignedTo: target._id }).sort({ createdAt: -1 });
  }

  if (req.userAccess?.role === "super_admin") {
    return Task.find({}).sort({ createdAt: -1 });
  }

  if (req.userAccess?.role === "department_head") {
    const users = await User.find({
      department: escapedExact(req.dbUser?.department),
    }).select("_id");

    return Task.find({ assignedTo: { $in: users.map((u) => u._id) } }).sort({ createdAt: -1 });
  }

  return Task.find({ assignedTo: req.dbUser._id }).sort({ createdAt: -1 });
};

// GET Performance & Appraisal Report
export const getPerformanceReport = async (req, res) => {
  try {
    const target = req.params?.uid
      ? await findUser(req.params.uid)
      : req.userAccess?.role === "team_member"
        ? req.dbUser
        : null;

    if (req.params?.uid && !target) {
      return res.status(404).json({ success: false, message: "Report user was not found." });
    }

    if (target && !targetAllowed(req, target)) {
      return res.status(403).json({ success: false, message: "You cannot view reports for this user." });
    }

    const tasks = await reportTasks(req, target);

    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "inProgress" || t.status === "open").length;
    const pendingReview = tasks.filter((t) => t.status === "pending_approval").length;

    const percentage = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

    const basicDetails = target
      ? { name: target.name, department: target.department || "Unassigned" }
      : {
          name: req.userAccess?.role === "super_admin" ? "Organisation Overview" : `${req.dbUser?.department || "Department"} Overview`,
          department: req.userAccess?.role === "super_admin" ? "All Departments" : req.dbUser?.department || "Unassigned",
        };

    return res.json({
      success: true,
      data: {
        basicDetails,
        metrics: {
          attendanceRate: "—",
          taskCompletion: `${percentage}%`,
        },
        appraisalSummary: {
          meetings: 0,
          projects: 0,
          certificates: 0,
          tasksAssigned: tasks.length,
        },
        taskBreakdown: {
          completed,
          inProgress,
          pendingReview,
          overdue: 0,
        },
        timeline: tasks.slice(0, 5).map((t) => ({
          event: `Task Assigned: ${t.title}`,
          description: t.description || "No description provided.",
          date: new Date(t.createdAt).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};  