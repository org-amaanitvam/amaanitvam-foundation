import Attendance from './attendance.model.js';

// 1. PUNCH IN
export const punchIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0]; // Gets 'YYYY-MM-DD'

    // Check if already punched in today
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already punched in today!' });
    }

    const newRecord = await Attendance.create({
      userId,
      date: today,
      punchIn: new Date()
    });

    res.status(201).json({ success: true, record: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. PUNCH OUT
export const punchOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const record = await Attendance.findOne({ userId, date: today });
    if (!record) {
      return res.status(404).json({ success: false, message: 'No punch-in record found for today.' });
    }
    if (record.punchOut) {
      return res.status(400).json({ success: false, message: 'Already punched out today!' });
    }

    const punchOutTime = new Date();
    // Calculate total hours worked
    const diffInMs = punchOutTime - new Date(record.punchIn);
    const totalHours = (diffInMs / (1000 * 60 * 60)).toFixed(2);

    record.punchOut = punchOutTime;
    record.totalHours = totalHours;
    await record.save();

    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET ATTENDANCE HISTORY
export const getMyAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Attendance.find({ userId }).sort({ date: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};