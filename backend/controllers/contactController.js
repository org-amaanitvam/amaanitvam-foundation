import Contact from "../models/contact.js";
import { 
    sendAdminNotificationEmail, sendUserAutoReplyEmail 
} from "../services/emailService.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";

export const createContact = async (req, res) => {

    try {
        const { name, email, subject, message } = req.validatedContact;

        const newContact = new Contact({
            name,
            email,
            subject,
            message,
            submissionTimestamp: new Date()
        });

        await newContact.save();

        // Respond immediately
        res.status(201).json({
            success: true,
            message: "Your message has been received successfully."
        });

        // Send emails and WhatsApp in the background
        Promise.all([
            sendUserAutoReplyEmail({ contact: newContact }),
            sendAdminNotificationEmail({ contact: newContact }),
            sendWhatsAppNotification({
                to: process.env.ADMIN_WHATSAPP_NUMBER || "919899923266",
                templateName: "new_contact_message",
                languageCode: "en",
                parameters: [newContact.name]
            })
        ]).catch((emailErr) => {
            console.error("Background notification delivery failed:", emailErr);
        });

    } catch (error) {

        console.error("Contact submission failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send message."
        });
    }
};