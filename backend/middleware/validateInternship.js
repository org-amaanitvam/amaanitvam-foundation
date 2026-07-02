const trimValue = (value) => String(value ?? "").replace(/\u0000/g, "").trim();

const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

const VALID_TRACKS = [
    "Creative",
    "Graphics",
    "Social media",
    "Marketing",
    "Frontend",
    "Backend",
    "Full stack",
    "HR",
    "Project Manager",
    "Content"
];

export const validateInternshipApplication = (req, res, next) => {
    const name = trimValue(req.body?.name);
    const email = trimValue(req.body?.email).toLowerCase();
    const phone = trimValue(req.body?.phone);
    const track = trimValue(req.body?.track);
    const motivation = trimValue(req.body?.motivation);

    const university = trimValue(req.body?.university);
    const currentYear = trimValue(req.body?.currentYear);
    const portfolioUrl = trimValue(req.body?.portfolioUrl);
    const duration = trimValue(req.body?.duration);

    if (!name || !email || !phone || !track || !motivation) {
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

    if (!VALID_TRACKS.includes(track)) {
        return res.status(400).json({
            success: false,
            message: `Invalid internship domain selected: ${track}. Please select a valid domain.`
        });
    }

    req.validatedInternship = {
        name,
        email,
        phone,
        track,
        motivation,
        university,
        currentYear,
        portfolioUrl,
        duration
    };



    next();
};
