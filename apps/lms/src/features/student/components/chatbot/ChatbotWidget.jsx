import { useEffect, useState } from 'react';
import { Bot, MessageCircle } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !document.querySelector('[role="dialog"]')) setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI study assistant"
        className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#5d0f2d] text-white shadow-xl transition hover:scale-105 hover:bg-[#8a164b]"
      >
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#d8a15f]" />
        <MessageCircle className="h-6 w-6 transition group-hover:hidden" aria-hidden="true" />
        <Bot className="hidden h-6 w-6 transition group-hover:block" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 h-[min(560px,calc(100vh-6rem))] w-[min(380px,calc(100vw-2.5rem))] animate-fade-in">
      <ChatWindow onClose={() => setOpen(false)} className="h-full rounded-2xl shadow-2xl ring-1 ring-black/5" />
    </div>
  );
}
