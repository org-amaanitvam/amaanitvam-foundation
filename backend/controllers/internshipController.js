import InternshipApplication from "../models/internshipApplication.js";
import Setting from "../models/setting.js";
import { 
    sendInternshipConfirmationEmail, sendInternshipAdminEmail 
} 
from "../services/emailService.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";

export const createInternshipApplication = async (req, res) => {

    try {
        const settings = await Setting.findOne();
        if (settings && settings.maintenanceMode) {
            return res.status(503).json({ success: false, message: "System is under maintenance. We are currently not accepting new applications. Please try again later." });
        }

        const { name, email, phone, track, university, currentYear, motivation, portfolioUrl, duration } = req.validatedInternship;
        
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

        // Respond to user immediately — don't make them wait for emails
        res.status(201).json({
            success: true,
            message: "Your internship application has been submitted successfully."
        });

        // Send emails and WhatsApp in the background (fire-and-forget)
        Promise.all([
            sendInternshipConfirmationEmail({ application: newApplication }),
            sendInternshipAdminEmail({ application: newApplication, resumeFile: req.file }),
            sendWhatsAppNotification({
                to: process.env.ADMIN_WHATSAPP_NUMBER || "919899923266",
                templateName: "new_internship_application",
                languageCode: "en",
                parameters: [newApplication.name, newApplication.track]
            })
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
