import InternshipApplication from "../models/internshipApplication.js";
import VolunteerApplication from "../models/volunteerApplication.js";
import { 
    sendInternshipConfirmationEmail, sendInternshipAdminEmail, sendVolunteerConfirmationEmail, sendVolunteerAdminEmail 
}
 from "../services/emailService.js";

export const handleGoogleFormWebhook = async (req, res) => {

    try {
        const { formType, name, email, phone } = req.body;

        if (formType === "internship") {

            const { track, university, currentYear, motivation, portfolioUrl, duration } = req.body;

            const newApplication = new InternshipApplication({
                name,
                email,
                phone,
                track,
                university,
                currentYear,
                motivation,
                portfolioUrl,
                duration,
                submissionTimestamp: new Date()
            });

            await newApplication.save();

            // Send emails in the background
            Promise.all([
                sendInternshipConfirmationEmail({ application: newApplication }),
                sendInternshipAdminEmail({ application: newApplication })
            ]).catch((emailErr) => {
                console.error("Webhook internship email delivery failed:", emailErr);
            });

            res.status(201).json({
                success: true,
                message: "Internship application processed."
            });

        } else if (formType === "volunteer") {

            const { role, availability, skills, motivation } = req.body;

            const newApplication = new VolunteerApplication({
                name,
                email,
                phone,
                role,
                availability,
                skills,
                motivation,
                submissionTimestamp: new Date()
            });

            await newApplication.save();

            // Send emails in the background
            Promise.all([
                sendVolunteerConfirmationEmail({ application: newApplication }),
                sendVolunteerAdminEmail({ application: newApplication })
            ]).catch((emailErr) => {
                console.error("Webhook volunteer email delivery failed:", emailErr);
            });

            res.status(201).json({
                success: true,
                message: "Volunteer registration processed."
            });

        } else {

            res.status(400).json({
                success: false,
                message: "Invalid or missing formType. Expected 'internship' or 'volunteer'."
            });
            return;
        }

    } catch (error) {

        console.error("Webhook submission failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to process webhook submission."
        });
    }
};
