import Department from "../models/department.js";

export const departmentAccess = async (req, res, next) => {
    try {

        // Admins can access everything
        if (
            req.user.role === "admin" ||
            req.user.role === "super_admin"
        ) {
            return next();
        }

        if (!req.user.department) {
            return res.status(403).json({
                success: false,
                message: "No department assigned."
            });
        }

        const department = await Department.findOne({
            departmentName: req.user.department
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        req.department = department;

        next();

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};