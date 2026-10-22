import { useState } from 'react';
import toast from 'react-hot-toast';
import { Bot, Copy, MessageSquarePlus, ThumbsDown, ThumbsUp } from 'lucide-react';

const formatTime = (value) =>
  new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const renderContent = (content) =>
  String(content)
    .split(/\*\*(.+?)\*\*/g)
    .map((part, index) =>
      index % 2 === 1 ? (
        <strong key={index} className="font-semibold text-[#5d0f2d]">
          {part}
        </strong>
      ) : (
        part
      ),
    );

export default function ChatMessage({ message, onRaiseDoubt }) {
  const [feedback, setFeedback] = useState(null);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('Answer copied');
    } catch {
      toast.error('Could not copy answer');
    }
  };

  const handleFeedback = (value) => {
    setFeedback((prev) => (prev === value ? null : value));
    if (value === 'up') toast.success('Thanks for the feedback!');
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%]">
          <div className="rounded-2xl rounded-br-md bg-[#5d0f2d] px-4 py-3 text-sm leading-relaxed text-white whitespace-pre-wrap">
            {message.content}
          </div>
          <div className="mt-1 text-right text-[11px] text-gray-400">{formatTime(message.createdAt)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] shadow">
        <Bot className="h-4 w-4 text-[#d8a15f]" aria-hidden="true" />
      </div>
      <div className="max-w-[85%] min-w-0">
        <div className="rounded-2xl rounded-tl-md border border-[#d8a15f]/30 bg-[#d8a15f]/5 px-4 py-3 text-sm leading-relaxed text-[#3d2b2b] whitespace-pre-wrap">
          {renderContent(message.content)}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="mr-1 text-[11px] text-gray-400">{formatTime(message.createdAt)}</span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy answer"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-[#5d0f2d]/5 hover:text-[#8a164b]"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFeedback('up')}
            aria-label="Helpful answer"
            aria-pressed={feedback === 'up'}
            className={`rounded-lg p-1.5 transition hover:bg-[#5d0f2d]/5 ${
              feedback === 'up' ? 'text-emerald-600' : 'text-gray-400 hover:text-[#8a164b]'
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFeedback('down')}
            aria-label="Unhelpful answer"
            aria-pressed={feedback === 'down'}
            className={`rounded-lg p-1.5 transition hover:bg-[#5d0f2d]/5 ${
              feedback === 'down' ? 'text-rose-600' : 'text-gray-400 hover:text-[#8a164b]'
            }`}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRaiseDoubt?.(message)}
            className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-[#5d0f2d]/20 bg-[#5d0f2d]/5 px-2.5 py-1 text-[11px] font-semibold text-[#5d0f2d] transition hover:bg-[#5d0f2d] hover:text-white"
          >
            <MessageSquarePlus className="h-3 w-3" />
            Raise as faculty doubt
          </button>
        </div>
      </div>
    </div>
  );
}
