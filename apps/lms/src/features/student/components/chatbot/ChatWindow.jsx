import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Bot, Send, Sparkles, Trash2, X } from 'lucide-react';
import useChatSession from './useChatSession';
import ChatMessage from './ChatMessage';
import RaiseDoubtModal from './RaiseDoubtModal';

export default function ChatWindow({
  onClose,
  className = 'rounded-2xl border border-[#5d0f2d]/10 shadow-lg',
}) {
  const { messages, typing, sendMessage, clearChat, suggestions } = useChatSession();
  const [draft, setDraft] = useState('');
  const [raised, setRaised] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    const element = listRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, typing]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || typing) return;
    sendMessage(text);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearChat();
    toast.success('Chat cleared');
  };

  const handleRaiseDoubt = (message) => {
    const index = messages.findIndex((item) => item.id === message.id);
    const question =
      [...messages.slice(0, index)]
        .reverse()
        .find((item) => item.role === 'user')?.content || message.content;
    setRaised({ question, answer: message.content });
  };

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden bg-white ${className}`}>
      <div className="flex shrink-0 items-center justify-between gap-3 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20">
            <Bot className="h-5 w-5 text-[#d8a15f]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-[family-name:var(--font-heading)] text-base font-bold text-white">
              AI Study Assistant
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Online · resolves doubts instantly
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear chat"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fafafa] px-4 py-4">
        {messages.length === 0 && !typing ? (
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <div className="rounded-full bg-[#5d0f2d]/5 p-4">
              <Sparkles className="h-8 w-8 text-[#8a164b]" aria-hidden="true" />
            </div>
            <h4 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-bold text-[#5d0f2d]">
              How can I help you today?
            </h4>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Ask a doubt about your courses, a concept you're stuck on, or how the platform works.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-[#5d0f2d]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#5d0f2d] transition hover:border-[#5d0f2d]/40 hover:bg-[#5d0f2d]/5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} onRaiseDoubt={handleRaiseDoubt} />
            ))}
            {typing && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] shadow">
                  <Bot className="h-4 w-4 text-[#d8a15f]" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[#d8a15f]/30 bg-[#d8a15f]/5 px-4 py-3.5">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8a164b]"
                      style={{ animationDelay: `${dot * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your doubt... (Enter to send)"
            aria-label="Message the AI assistant"
            className="input-premium max-h-28 min-h-[44px] flex-1 resize-none text-sm"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || typing}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5d0f2d] text-white transition hover:bg-[#8a164b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-400">
          AI responses may be inaccurate — use{' '}
          <span className="font-semibold text-[#8a164b]">Raise as faculty doubt</span> for a faculty
          explanation.
        </p>
      </div>

      {raised && (
        <RaiseDoubtModal
          question={raised.question}
          answer={raised.answer}
          onClose={() => setRaised(null)}
        />
      )}
    </div>
  );
}
