import LearningHub from "../models/LearningHub.js";

// This catches the POST request from the frontend and saves it
export const registerForEvent = async (req, res) => {
    try {
        // Extract data from the request body
        const { name, email, phone, type, event, organization, message } = req.body;

        // Create a new database entry
        const newRegistration = new LearningHub({
            name,
            email,
            phone,
            type,
            event,
            organization,
            message
        });

        // Save to MongoDB
        await newRegistration.save();

        res.status(201).json({ 
            success: true, 
            message: "Registration saved successfully!" 
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during registration.", 
            errorDetails: error.message 
        });
    }
};

// ... your getRegistrations function goes down here ...

// Handle GET request for the Admin Portal
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await LearningHub.find().sort({ registrationDate: -1 });
    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    console.error("Fetch Learning Hub error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data." });
  }
};