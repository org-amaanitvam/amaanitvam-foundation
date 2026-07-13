import Department from "../models/department.js";

const trimValue = (value) => String(value ?? "").replace(/\u0000/g, "").trim();

const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

export const validateVolunteerApplication = async (req, res, next) => {
    const name = trimValue(req.body?.name);
    const email = trimValue(req.body?.email).toLowerCase();
    const phone = trimValue(req.body?.phone);
    const role = trimValue(req.body?.role);
    const availability = trimValue(req.body?.availability);
    const motivation = trimValue(req.body?.motivation);

    const skills = trimValue(req.body?.skills);

    if (!name || !email || !phone || !role || !availability || !motivation) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be filled."
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format."
        });
    }


    try {
        const validRoles = await Department.distinct("departmentName");
        // Convert everything to lowercase to eliminate strict casing mismatches
        const isRoleValid = validRoles.some(
            (r) => r.toLowerCase() === role.toLowerCase()
        );

        if (!isRoleValid) {
            return res.status(400).json({
                success: false,
                message: `Invalid role selected: ${role}. Please select a valid role.`
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error during validation."
        });
     }

    req.validatedVolunteer = {
        name,
        email,
        phone,
        role,
        availability,
        motivation,
        skills
    };

    req.clientIp =
        String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        "Unknown";

    next();
};
