import InternshipApplication from "../models/internshipApplication.js";
import Setting from "../models/setting.js";
import { 
    sendInternshipConfirmationEmail, sendInternshipAdminEmail 
} from "../services/emailService.js";

export const createInternshipApplication = async (req, res) => {
    try {
        const settings = await Setting.findOne();
        if (settings && settings.maintenanceMode) {
            return res.status(503).json({ success: false, message: "System is under maintenance. We are currently not accepting new applications. Please try again later." });
        }

        // Pulling sanitized data from the validation middleware
        const { name, email, phone, track, university, currentYear, motivation, portfolioUrl, duration } = req.validatedInternship; 
        
        // Extract the absolute Cloudinary secure URL if a file was successfully uploaded
        let resumeUrl = "";
        if (req.file) {
            resumeUrl = req.file.path; // <-- FIX: Saves the full cloud URL instead of /uploads/
        }

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
            resumeUrl, // Save the absolute cloud link to the database
            submissionTimestamp: new Date()
        });

        await newApplication.save();

        // Respond to user immediately — don't make them wait for emails
        res.status(201).json({
            success: true,
            message: "Your internship application has been submitted successfully."
        });

        // Send emails and WhatsApp in the background (fire-and-forget)
        Promise.all([
            sendInternshipConfirmationEmail({ application: newApplication }),
            sendInternshipAdminEmail({ application: newApplication, resumeFile: req.file })       
        ]).catch((emailErr) => {
            console.error("Background notification delivery failed:", emailErr);
        });

    } catch (error) {
        console.error("Internship application submission failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit application."
        });
    }
};