import api from '../../../services/api';

/**
 * Fetch knowledge base FAQ items
 * @param {string} category
 */
export async function fetchKnowledgeBase(category = 'all') {
  try {
    const res = await api.get('/faculty/support/faq', { params: { category } });
    return {
      success: true,
      faqs: res.data?.faqs || res.data?.data || res.data,
    };
  } catch (error) {
    console.warn('[supportApi] Fetch FAQ fallback (demo mode):', error?.message);
    return {
      success: true,
      faqs: MOCK_FAQS,
      isMock: true,
    };
  }
}

/**
 * Submit an IT / Admin support ticket
 * @param {Object} ticketData
 */
export async function submitSupportTicket(ticketData) {
  try {
    const res = await api.post('/faculty/support/tickets', ticketData);
    return {
      success: true,
      ticket: res.data?.ticket || res.data,
    };
  } catch (error) {
    console.warn('[supportApi] Submit ticket fallback (demo mode):', error?.message);
    return {
      success: true,
      ticket: {
        ...ticketData,
        _id: 'tck-' + Date.now(),
        id: 'tck-' + Date.now(),
        ticketNo: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
        status: 'open',
        createdAt: new Date().toISOString(),
      },
      isMock: true,
    };
  }
}

/**
 * Fetch faculty support ticket history
 */
export async function fetchSupportTickets() {
  try {
    const res = await api.get('/faculty/support/tickets');
    return {
      success: true,
      tickets: res.data?.tickets || res.data?.data || res.data,
    };
  } catch (error) {
    console.warn('[supportApi] Fetch tickets fallback (demo mode):', error?.message);
    return {
      success: true,
      tickets: MOCK_TICKETS,
      isMock: true,
    };
  }
}

export const MOCK_FAQS = [
  {
    id: 'faq-1',
    category: 'Classroom & Live Stream',
    question: 'How do I start and record a Google Meet or Zoom live class session?',
    answer: 'Navigate to Live Sessions, select your upcoming session, and click "Launch Class". To enable automatic recording, ensure your calendar integration is linked or start recording directly in the video meeting controls.',
  },
  {
    id: 'faq-2',
    category: 'Classroom & Live Stream',
    question: 'Where do student meeting recordings get saved after a class ends?',
    answer: 'Cloud recordings are automatically processed within 30 minutes of session closure. You can attach the recording URL in the Live Sessions agenda view under Completed Sessions.',
  },
  {
    id: 'faq-3',
    category: 'Grading & Attendance',
    question: 'How do I mark and export student attendance for my batch?',
    answer: 'Go to Attendance Center > Student Class Marking tab. Select your course batch and session date, toggle attendance statuses for each student, and click "Save & Submit". Use the CSV export button to download monthly reports.',
  },
  {
    id: 'faq-4',
    category: 'IT Systems & LMS',
    question: 'What should I do if my faculty login credentials or password need resetting?',
    answer: 'You can change your password under Faculty Settings > Security & Credentials. If you are locked out, submit an urgent support ticket using the Help Desk form or contact system admin.',
  },
  {
    id: 'faq-5',
    category: 'HR & Payroll',
    question: 'How are shift attendance hours calculated for monthly payroll processing?',
    answer: 'Duty punch hours logged via the Header / Attendance Center clock-in button are calculated daily. Break times are subtracted automatically, and reports are synced to HR every payroll cycle.',
  },
];

export const MOCK_TICKETS = [
  {
    _id: 'tck-901',
    id: 'tck-901',
    ticketNo: 'TICK-4821',
    subject: 'Google Meet link generation failing for Batch 2026-A',
    category: 'Live Classrooms',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-08-09T10:30:00Z',
    description: 'Calendar API returns token expired error when creating recurring meeting link.',
    assignedTo: 'IT Support Team (Rohan)',
  },
  {
    _id: 'tck-902',
    id: 'tck-902',
    ticketNo: 'TICK-3119',
    subject: 'Request for additional cloud storage for course video uploads',
    category: 'LMS Storage',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2026-08-04T14:15:00Z',
    description: 'Faculty drive limit reached 50GB. Need 100GB upgrade for high-res design assets.',
    assignedTo: 'SysAdmin (Deepak)',
  },
];
