import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_MESSAGES = 50;

export const SUGGESTED_PROMPTS = [
  "Explain Newton's laws of motion",
  'How do I improve my course progress?',
  'Difference between mitosis and meiosis?',
  'How can I ask a faculty for help?',
];

const RULES = [
  {
    pattern: /\b(hi|hello|hey|namaste|good\s+(morning|afternoon|evening))\b/i,
    reply:
      "Hello! I'm the Amaanitvam AI Assistant. Ask me anything from your courses — concepts, revisions, or how to use the platform — and I'll do my best to help.",
  },
  {
    pattern: /\b(progress|progress%|how am i doing|analytics|performance)\b/i,
    reply:
      'You can track your progress in two places:\n\n1. **My Courses** — open any course to see module-wise completion.\n2. **Analytics** — the sidebar shows your overall progress, doubt resolution rate and assessment trends.\n\nTip: consistent short sessions beat marathon study days!',
  },
  {
    pattern: /\b(doubt|faculty|teacher|ask a human|escalate|not helpful)\b/i,
    reply:
      "Need a human? Two options:\n\n1. Hover over any of my answers and press **Raise as faculty doubt** — it creates a doubt with our conversation attached.\n2. Go to **Ask Doubts** in the sidebar to raise one yourself.\n\nA faculty member is usually assigned within a day.",
  },
  {
    pattern: /\b(assignment|submission|homework|submit)\b/i,
    reply:
      'Find assignments under **Assignments** in the sidebar. Open an assignment to view its brief, due date and requirements, then submit under the **Submissions** tab. You can track every submission status from the same page.',
  },
  {
    pattern: /\b(attendance|present|absent|punch)\b/i,
    reply:
      'Your attendance is recorded when you punch in for a session using the button in the top header, and the full record lives under **Attendance** in the sidebar — including per-session present/absent status and overall percentage.',
  },
  {
    pattern: /\b(session|class|live|schedule|timetable)\b/i,
    reply:
      'Upcoming and past sessions are listed under **My Sessions** in the sidebar. Each card shows the course, date/time and joining details. Remember to punch in when a session starts so your attendance is counted.',
  },
  {
    pattern: /\b(password|login|sign ?in|account|locked out)\b/i,
    reply:
      'Login issues are handled on the Help & Support page (**Help & Support** in the sidebar). If your account is locked or you cannot access a course, raise a doubt there or email support and the team will reset access for you.',
  },
  {
    pattern: /\b(quiz|test|exam|assessment|score|grade)\b/i,
    reply:
      'Assessment results appear under **Analytics**, where you can review scores and identify weak topics. For exam prep: revisit the module notes first, then attempt the practice questions, and finally raise a doubt for anything that still feels unclear.',
  },
  {
    pattern: /\b(thanks|thank you|thanks a lot|great|awesome)\b/i,
    reply: "You're welcome! Good luck with your studies — ask me anything else that comes up.",
  },
  {
    pattern: /\b(study\s+plan|how\s+to\s+study|tips|prepare|revision)\b/i,
    reply:
      'A simple framework that works well:\n\n1. **Plan** — block 2–3 focused slots a week on your calendar.\n2. **Understand** — watch/read one concept, then explain it back in your own words.\n3. **Practice** — solve the module questions immediately.\n4. **Review** — revisit notes weekly and raise doubts for anything you keep forgetting.',
  },
];

const FALLBACKS = [
  "Here's how I'd approach that: break the problem into smaller parts, revisit the relevant module notes, then try one practice question. If anything is still unclear, raise it as a faculty doubt and a teacher will walk you through it.",
  'Good question! Start with the course material for this topic, note down the parts that confuse you, and use **Raise as faculty doubt** on this answer if you would like a faculty member to explain it in more depth.',
  "I've shared what I can based on your courses. For a detailed, subject-specific explanation, raise this as a faculty doubt and it will be assigned to the right teacher.",
];

let sequence = 0;
let fallbackIndex = 0;

const nextId = () => {
  sequence += 1;
  return `msg_${Date.now()}_${sequence}`;
};

// TODO: replace pickReply with POST /api/conversations/:id/messages once the backend mounts the proxy routes
const pickReply = (text) => {
  const match = RULES.find((rule) => rule.pattern.test(text));
  if (match) return match.reply;
  const reply = FALLBACKS[fallbackIndex % FALLBACKS.length];
  fallbackIndex += 1;
  return reply;
};

export default function useChatSession() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const sendMessage = useCallback((text) => {
    const content = String(text || '').trim();
    if (!content) return;

    setMessages((prev) =>
      [...prev, { id: nextId(), role: 'user', content, createdAt: Date.now() }].slice(-MAX_MESSAGES),
    );

    const typingTimer = setTimeout(() => setTyping(true), 300);
    const replyTimer = setTimeout(() => {
      setTyping(false);
      setMessages((prev) =>
        [
          ...prev,
          { id: nextId(), role: 'assistant', content: pickReply(content), createdAt: Date.now() },
        ].slice(-MAX_MESSAGES),
      );
    }, 900 + Math.floor(Math.random() * 600));

    timersRef.current.push(typingTimer, replyTimer);
  }, []);

  const clearChat = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setTyping(false);
    setMessages([]);
  }, []);

  return { messages, typing, sendMessage, clearChat, suggestions: SUGGESTED_PROMPTS };
}
