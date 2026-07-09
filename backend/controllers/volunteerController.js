import VolunteerApplication from "../models/volunteerApplication.js";
import Setting from "../models/setting.js";
import { 
    sendVolunteerConfirmationEmail, sendVolunteerAdminEmail 
} from "../services/emailService.js";

export const createVolunteerApplication = async (req, res) => {
    try {
        const settings = await Setting.findOne();
        if (settings && settings.maintenanceMode) {
            return res.status(503).json({ success: false, message: "System is under maintenance. We are currently not accepting new applications. Please try again later." });
        }

        const { name, email, phone, role, availability, skills, motivation } = req.validatedVolunteer;

        // Extract the resume URL if a file was successfully uploaded
        let resumeUrl = "";
        if (req.file) {
            resumeUrl = `/uploads/${req.file.filename}`;
        }

        const newApplication = new VolunteerApplication({
            name,
            email,
            phone,
            role,
            availability,
            skills,
            motivation,
            resumeUrl, // Save the file path to the database
            submissionTimestamp: new Date()
        });

        await newApplication.save();

        // Respond immediately
        res.status(201).json({
            success: true,
            message: "Your volunteer registration has been submitted successfully."
        });

        // Send emails and WhatsApp in the background
        Promise.all([
            sendVolunteerConfirmationEmail({ application: newApplication }),
            // Passing the resume file so the admin gets the attachment directly
            sendVolunteerAdminEmail({ application: newApplication, resumeFile: req.file })        
        ]).catch((emailErr) => {
            console.error("Background notification delivery failed:", emailErr);
        });

    } catch (error) {
        console.error("Volunteer registration submission failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit registration."
        });
    }
};