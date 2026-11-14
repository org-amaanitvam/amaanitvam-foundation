import PageHeader from '../components/PageHeader';
import ChatWindow from '../components/chatbot/ChatWindow';

export default function StudentAssistant() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="AI Study Assistant"
        subtitle="Instant, AI-powered answers to your course doubts — anytime, anywhere."
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=70"
      />
      <div className="h-[calc(100vh-17rem)] min-h-[440px]">
        <ChatWindow className="h-full rounded-2xl border border-[#5d0f2d]/10 shadow-lg" />
      </div>
    </div>
  );
}
