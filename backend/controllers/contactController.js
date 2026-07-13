import Contact from "../models/contact.js";
import { 
    sendAdminNotificationEmail, sendUserAutoReplyEmail 
} from "../services/emailService.js";

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

        // Send emails in the background
        Promise.all([
            sendUserAutoReplyEmail({ contact: newContact }),
            sendAdminNotificationEmail({ contact: newContact })
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

export const getContactMessages = async (req, res) => {
    try {
        // Fetch all messages, newest first using your schema's exact timestamp field
        const messages = await Contact.find().sort({ submissionTimestamp: -1 });
        
        res.status(200).json({ 
            success: true, 
            data: messages 
        });
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch contacts." 
        });
    }
};