import meetingModel from "../models/meeting.js";
import Department from "../models/department.js";
import Notification from "../models/notification.js";
import ActivityService from "../services/activityService.js";

// Create Meeting
export const createMeeting = async (req, res) => {
    try {
        const { title, description, meetingDate, attendees } = req.body;

        if (!title || !meetingDate) {
            return res.status(400).json({
                success: false,
                message: "Title and meetingDate are required"
            });
        }

        let finalAttendees = attendees || [];
        let departmentId = null;

        const headedDept = await Department.findOne({ departmentHead: req.user._id });

        if (headedDept) {
            departmentId = headedDept._id;
            if (!attendees || attendees.length === 0) {
                finalAttendees = headedDept.members.map(m => m.user.toString());
            }
        }

        // Conflict detection
        if (finalAttendees.length > 0) {
            const meetingTime = new Date(meetingDate);
            const windowStart = new Date(meetingTime.getTime() - 30 * 60000);
            const windowEnd = new Date(meetingTime.getTime() + 30 * 60000);

            const conflicting = await meetingModel.find({
                status: "scheduled",
                meetingDate: { $gte: windowStart, $lte: windowEnd },
                attendees: { $in: finalAttendees }
            }).select("title meetingDate attendees");

            if (conflicting.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Scheduling conflict: one or more attendees are already booked within 30 minutes of this time",
                    conflicts: conflicting
                });
            }
        }

        const newMeeting = new meetingModel({
            title,
            description,
            meetingDate,
            attendees: finalAttendees,
            department: departmentId,
            organizer: req.user._id,
            status: "scheduled",
            attendance: finalAttendees.map(userId => ({ user: userId, status: "pending" }))
        });

        const meeting = await newMeeting.save();

        if (finalAttendees.length > 0) {
            const notifications = finalAttendees.map(userId => ({
                userId,
                title: "New Meeting Scheduled",
                message: `You are invited to '${title}' on ${new Date(meetingDate).toLocaleString()}`,
                type: "info",
                link: "/meetings"
            }));
            await Notification.insertMany(notifications);
        }

        await ActivityService.log(
            "Meeting Scheduled",
            `Meeting '${title}' was scheduled`,
            `Scheduled for ${new Date(meetingDate).toLocaleString()}${departmentId ? " (auto-routed to department)" : ""}`,
            req.user?._id
        );

        const populated = await meetingModel.findById(meeting._id)
            .populate("attendees", "name email")
            .populate("department", "departmentName");

        res.status(201).json({ success: true, meeting: populated });
    } catch (error) {
        console.log("Create Meeting Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Meetings — non-admins see only meetings they are invited to
export const getMeetings = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
        const query = isAdmin ? {} : { attendees: req.user._id };
        const meetings = await meetingModel.find(query)
            .populate("attendees", "name email")
            .populate("department", "departmentName");
        res.status(200).json({ success: true, meetings });
    } catch (error) {
        console.log("Get Meetings Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Meeting — non-admins can only see meetings they are invited to
export const getMeetingById = async (req, res) => {
    try {
        const meeting = await meetingModel.findById(req.params.id)
            .populate("attendees", "name email")
            .populate("department", "departmentName");

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
        const isInvited = meeting.attendees.some(a => a._id.toString() === req.user._id.toString());

        if (!isAdmin && !isInvited) {
            return res.status(403).json({ success: false, message: "Access denied. You are not invited to this meeting." });
        }

        res.status(200).json({ success: true, meeting });
    } catch (error) {
        console.log("Get Meeting Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// Update Meeting
export const updateMeeting = async (req, res) => {
    try {
        const meeting = await meetingModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("attendees", "name email");

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        res.status(200).json({ success: true, message: "Meeting updated successfully", meeting });
    } catch (error) {
        console.log("Update Meeting Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Meeting
export const deleteMeeting = async (req, res) => {
    try {
        const meeting = await meetingModel.findByIdAndDelete(req.params.id);

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        res.status(200).json({ success: true, message: "Meeting deleted successfully" });
    } catch (error) {
        console.log("Delete Meeting Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload Minutes
export const uploadMinutes = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const minutesUrl = `/uploads/${req.file.filename}`;

        const meeting = await meetingModel.findByIdAndUpdate(
            req.params.id,
            { minutesUrl },
            { new: true, runValidators: true }
        ).populate("attendees", "name email");

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        await ActivityService.log(
            "Meeting Minutes Uploaded",
            `Minutes uploaded for '${meeting.title}'`,
            "",
            req.user?._id
        );

        res.status(200).json({ success: true, message: "Minutes uploaded successfully", meeting });
    } catch (error) {
        console.log("Upload Minutes Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark Single Attendance
export const markAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, status } = req.body;

        const validStatuses = ["present", "absent", "late"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(", ")}`
            });
        }

        const meeting = await meetingModel.findById(id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
        const isOrganizer = meeting.organizer?.toString() === req.user._id.toString();

        if (!isAdmin && !isOrganizer) {
            return res.status(403).json({
                success: false,
                message: "Only the organizer or an admin can mark attendance"
            });
        }

        const record = meeting.attendance.find(a => a.user.toString() === userId);
        if (!record) {
            return res.status(404).json({ success: false, message: "User is not an attendee of this meeting" });
        }

        record.status = status;
        record.markedAt = new Date();
        record.markedBy = req.user._id;

        await meeting.save();

        res.status(200).json({ success: true, message: "Attendance updated", attendance: meeting.attendance });
    } catch (error) {
        console.log("Mark Attendance Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bulk Mark Attendance
export const bulkMarkAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { records } = req.body; // [{ userId, status }, ...]

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, message: "records array is required" });
        }

        const meeting = await meetingModel.findById(id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
        const isOrganizer = meeting.organizer?.toString() === req.user._id.toString();

        if (!isAdmin && !isOrganizer) {
            return res.status(403).json({
                success: false,
                message: "Only the organizer or an admin can mark attendance"
            });
        }

        const validStatuses = ["present", "absent", "late"];
        for (const { userId, status } of records) {
            if (!validStatuses.includes(status)) continue;
            const record = meeting.attendance.find(a => a.user.toString() === userId);
            if (record) {
                record.status = status;
                record.markedAt = new Date();
                record.markedBy = req.user._id;
            }
        }

        meeting.status = "completed";
        await meeting.save();

        await ActivityService.log(
            "Attendance Marked",
            `Attendance recorded for meeting '${meeting.title}'`,
            "",
            req.user?._id
        );

        res.status(200).json({ success: true, message: "Attendance recorded", meeting });
    } catch (error) {
        console.log("Bulk Mark Attendance Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Attendance Report for a Meeting
export const getAttendanceReport = async (req, res) => {
    try {
        const meeting = await meetingModel.findById(req.params.id)
            .populate("attendance.user", "name email")
            .populate("attendance.markedBy", "name");

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        const total = meeting.attendance.length;
        const present = meeting.attendance.filter(a => a.status === "present").length;
        const absent = meeting.attendance.filter(a => a.status === "absent").length;
        const late = meeting.attendance.filter(a => a.status === "late").length;
        const pending = meeting.attendance.filter(a => a.status === "pending").length;

        res.status(200).json({
            success: true,
            report: {
                meetingTitle: meeting.title,
                meetingDate: meeting.meetingDate,
                total,
                present,
                absent,
                late,
                pending,
                attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
                attendance: meeting.attendance
            }
        });
    } catch (error) {
        console.log("Attendance Report Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// User's Attendance History Across All Meetings
export const getUserAttendanceHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const meetings = await meetingModel.find({ "attendance.user": userId })
            .select("title meetingDate attendance")
            .sort({ meetingDate: -1 });

        const history = meetings.map(m => {
            const record = m.attendance.find(a => a.user.toString() === userId);
            return {
                meetingId: m._id,
                title: m.title,
                meetingDate: m.meetingDate,
                status: record?.status || "pending"
            };
        });

        const attended = history.filter(h => h.status === "present" || h.status === "late").length;
        const totalMarked = history.filter(h => h.status !== "pending").length;

        res.status(200).json({
            success: true,
            attendancePercentage: totalMarked > 0 ? Math.round((attended / totalMarked) * 100) : 0,
            history
        });
    } catch (error) {
        console.log("User Attendance History Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
