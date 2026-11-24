import { LifeBuoy, BookOpen, MessageCircleQuestion, FileText, Mail } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const faqs = [
  {
    question: 'How do I log my attendance?',
    answer:
      'Open the Attendance page in the sidebar and press "Punch In Now". Punch out at the end of your session to record your total hours.',
  },
  {
    question: 'How do I ask a doubt?',
    answer:
      'Go to "Ask Doubts", fill in the title and description of your question, and submit it. Faculty will respond on the same thread, and you can rate the resolution afterwards.',
  },
  {
    question: 'How do I join a live session?',
    answer:
      'Open "My Sessions" and click the "Join Session" button on any upcoming session that has a meeting link. The linked video call opens in a new tab.',
  },
  {
    question: 'Where are my grades and assignments?',
    answer:
      'Assignments shared by your faculty appear on the Assignments page. Submission and grade tracking are coming as faculty publish coursework.',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'Use the "Forgot Password?" link on the login page. A password reset email will be sent to your registered email address.',
  },
  {
    question: 'Who do I contact for account issues?',
    answer:
      'Contact the Amaanitvam Foundation administration at the email below with your name and Unique ID.',
  },
];

export default function StudentHelpDesk() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Help & Support"
        subtitle="Find answers to common questions or reach out to the IT help desk"
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=70"
      />

      <div className="card-premium bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white/10 p-3 shrink-0">
            <LifeBuoy className="h-8 w-8 text-[#d8a15f]" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">
              IT Help Desk
            </h3>
            <p className="text-sm text-rose-100/80 mt-1">
              For account, login, or portal issues, email the administration team.
            </p>
            <a
              href="mailto:support@amaanitvam.org"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#5d0f2d] hover:bg-[#d8a15f] transition-colors"
            >
              <Mail className="w-4 h-4" /> support@amaanitvam.org
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium">
          <BookOpen className="h-6 w-6 text-[#8a164b]" />
          <h3 className="mt-3 font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
            Learner Manual
          </h3>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            A step-by-step guide to browsing courses, joining sessions, and managing your profile.
          </p>
        </div>
        <div className="card-premium">
          <MessageCircleQuestion className="h-6 w-6 text-[#8a164b]" />
          <h3 className="mt-3 font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
            Community Forum
          </h3>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Connect with peers and mentors for collaborative learning and peer support.
          </p>
        </div>
        <div className="card-premium">
          <FileText className="h-6 w-6 text-[#8a164b]" />
          <h3 className="mt-3 font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
            Report an Issue
          </h3>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Found a bug or broken link? Submit a ticket to the IT administration team.
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details key={index} className="card-premium group">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-[#5d0f2d]">
                <span>{faq.question}</span>
                <span className="text-[#8a164b] transition-transform group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-gray-500 font-medium leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}