import express from "express";
const router = express.Router();

import User from "../models/user.js";
import Attendance from "../models/attendance.js";
import taskModel from "../models/task.js";
import Meeting from "../models/meeting.js";
import Project from "../models/project.js";
import Certificate from "../models/certificate.js";

// GET: Unified Member Aggregation Pipeline (Full Logic Preserved)
router.get("/member/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Fetch Core Member Profile
    const member = await User.findById(userId).select("-firebaseUid");
    if (!member) {
      return res.status(404).json({ success: false, message: "Member record not found." });
    }

    // 2. Fetch parallel database subsets concurrently (Preserved original + added new criteria)
    const [attendanceRecords, taskRecords, meetings, projects, certificates] = await Promise.all([
      Attendance.find({ user: userId }).sort({ date: 1 }),
      taskModel.find({ assignedTo: userId }).sort({ createdAt: 1 }),
      Meeting.find({ attendees: userId }),
      Project.find({ team: userId }),
      Certificate.find({ user: userId })
    ]);

    // 3. Compute Attendance Breakdown Records (Original Logic Preserved)
    const attendanceBreakdown = {
      totalLogs: attendanceRecords.length,
      present: attendanceRecords.filter((a) => a.status === "present").length,
      late: attendanceRecords.filter((a) => a.status === "late").length,
      halfDay: attendanceRecords.filter((a) => a.status === "half-day").length,
      absent: attendanceRecords.filter((a) => a.status === "absent").length,
      leave: attendanceRecords.filter((a) => a.status === "leave").length,
    };

    let attendanceRate = 100;
    if (attendanceBreakdown.totalLogs > 0) {
      const activeDays = attendanceBreakdown.present + attendanceBreakdown.late + (attendanceBreakdown.halfDay * 0.5);
      attendanceRate = (activeDays / attendanceBreakdown.totalLogs) * 100;
    }

    // 4. Compute Task Metrics (Original Logic Preserved)
    const taskBreakdown = {
      totalAssigned: taskRecords.length,
      completed: taskRecords.filter((t) => t.status === "completed").length,
      open: taskRecords.filter((t) => t.status === "open").length,
      inProgress: taskRecords.filter((t) => t.status === "inProgress").length,
      pendingApproval: taskRecords.filter((t) => t.status === "pending_approval").length,
      overdue: taskRecords.filter((t) => t.isOverdue).length,
    };

    const taskCompletionRate = taskBreakdown.totalAssigned > 0
      ? (taskBreakdown.completed / taskBreakdown.totalAssigned) * 100
      : 100;

    // 5. Generate Timeline (Original Logic Preserved)
    const timeline = [];
    timeline.push({
      date: member.joinedAt || member.createdAt,
      type: "milestone",
      title: "Joined Organization",
      description: `Successfully onboarded as an ${member.role} within the ${member.department || "Unassigned"} department/domain.`
    });

    taskRecords.forEach((task) => {
      timeline.push({
        date: task.createdAt,
        type: "task_assigned",
        title: `Task Assigned: ${task.title}`,
        description: task.description || "No description provided."
      });
      if (task.status === "completed") {
        timeline.push({
          date: task.updatedAt,
          type: "task_completed",
          title: `Task Completed: ${task.title}`,
          description: "Task cross-verified, resolved, and documented successfully."
        });
      }
    });
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 6. Return Structured Unified JSON Payload (Original + New Appraisal Fields)
    return res.status(200).json({
      success: true,
      data: {
        basicDetails: {
          id: member._id,
          name: member.name,
          email: member.email,
          role: member.role,
          department: member.department || "N/A",
          joiningDate: member.joinedAt || member.createdAt,
          status: member.status,
          memberId: member.memberId || `AM-${member._id.toString().slice(-4).toUpperCase()}`
        },
        metrics: {
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
          attendanceBreakdown,
          taskBreakdown
        },
        // NEW: Manager's Appraisal Criteria
        appraisalSummary: {
          meetingsAttended: meetings.length,
          projectsWorkedOn: projects.length,
          certificatesEarned: certificates.length,
          workUpdatesCount: taskRecords.length // Example mapping
        },
        timeline
      }
    });

  } catch (error) {
    console.error("Aggregation engine error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

export default router;