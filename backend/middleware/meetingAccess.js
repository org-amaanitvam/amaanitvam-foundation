import Meeting from "../models/meeting.js";
import Department from "../models/department.js";

export const meetingAccess = async (req, res, next) => {
    try {
        // Admins can access everything
        if (req.user.role === "admin" || req.user.role === "super_admin") {
            return next();
        }

        // Find the meeting
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found"
            });
        }

        // Find the meeting's department
        const department = await Department.findById(meeting.department);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        // Is user the Department Head?
        const isHead =
            department.departmentHead &&
            department.departmentHead.toString() === req.user._id.toString();

        // Is user a department member?
        const isMember = department.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isHead && !isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to access this meeting."
            });
        }

        next();

    } catch (error) {
        console.error("Meeting Access Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};