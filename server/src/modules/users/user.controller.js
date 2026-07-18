import User from "./user.model.js"; // Adjust the path if your model is elsewhere

export const getAllUsers = async (req, res) => {
  try {
    // .select() ensures we ONLY send the name and ID, keeping data secure!
    const users = await User.find({}).select('name _id');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new user (for admin/testing purposes)
export const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};