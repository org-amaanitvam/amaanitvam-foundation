import Meeting from './meeting.model.js';

// 1. GET UPCOMING MEETINGS
export const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ is_deleted: false })
      .populate('organizer_id', 'name email')
      .populate('attendee_ids', 'name email')
      .sort({ meeting_date: 1 }); // Ascending order: closest dates first!
      
    res.json({ 
      success: true, 
      data: meetings, 
      meta: { total: meetings.length }
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to load meetings', details: [] }
    });
  }
};

// 2. CREATE A MEETING
export const createMeeting = async (req, res) => {
  try {
    const newMeeting = await Meeting.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: newMeeting 
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'VALIDATION_ERROR', message: error.message, details: [] }
    });
  }
};

export const generateCalendarInvite = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

    // Format dates to strictly match the iCalendar specification (YYYYMMDDTHHmmssZ)
    const startDate = new Date(meeting.meeting_date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Assumes 1 hour meeting
    
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amaanitvam Foundation//Dashboard//EN
BEGIN:VEVENT
UID:${meeting._id}@amaanitvam.org
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${meeting.title}
DESCRIPTION:${meeting.description || ''} - Join here: ${meeting.meeting_link || ''}
END:VEVENT
END:VCALENDAR`;

    // Tell the browser this is a downloadable calendar file!
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="meeting-${meeting._id}.ics"`);
    res.send(icsContent);

  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// UPLOAD MEETING MINUTES
export const uploadMinutes = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const minutesUrl = req.file.path || req.file.secure_url || req.file.url;

    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { minutesUrl },
      { new: true }
    )
    .populate('organizer_id', 'name email')
    .populate('attendee_ids', 'name email');

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.json({ success: true, message: 'Minutes uploaded successfully', meeting });
  } catch (error) {
    console.error("Error uploading minutes:", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};