import { useEffect, useMemo, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, Ticket, User, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { createDoubt } from '../../../config/api';
import { createConversation, sendChatMessage } from '../../../services/chatApi';

export default function StudentChatPanel({
  contextType = 'general',
  contextId = null,
  contextLabel = '',
  escalationSubject = '',
}) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setConversationId(null);
    setMessages([]);
    setEscalated(false);
  }, [contextId, contextLabel]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const displayContext = useMemo(
    () => contextLabel || 'General academic support',
    [contextLabel],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      let id = conversationId;
      if (!id) {
        const conversation = await createConversation({ contextType, contextId });
        id = conversation.id;
        setConversationId(id);
      }

      setMessages((current) => [
        ...current,
        { id: `pending-${Date.now()}`, role: 'user', content },
      ]);
      setDraft('');

      const reply = await sendChatMessage(id, {
        content,
        contextType,
        contextId,
        contextLabel: displayContext,
      });
      setMessages((current) => [...current, reply]);
    } catch (error) {
      toast.error(error.message || 'Could not send your question.');
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async () => {
    const question = [...messages].reverse().find((message) => message.role === 'user');
    const answer = [...messages].reverse().find((message) => message.role === 'assistant');
    if (!question || escalating || escalated) return;

    setEscalating(true);
    try {
      const token = await user?.getIdToken();
      await createDoubt({
        title: escalationSubject || `AI help needed: ${question.content.slice(0, 70)}`,
        description: `I tried the AI assistant for ${displayContext}.\n\nMy question:\n${question.content}\n\nAI response:\n${answer?.content || 'No useful response was received.'}`,
        subject: contextType === 'course' ? displayContext : undefined,
        topic: 'AI-assisted doubt escalation',
        priority: 'medium',
      }, token);
      setEscalated(true);
      toast.success('Your question was sent to faculty.');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Could not create a faculty doubt.');
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-60 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="student-chat-title"
          className="card-premium flex h-[min(620px,calc(100vh-7rem))] w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden p-0 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-slate-50/70 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#8a164b]" aria-hidden="true" />
            <h2 id="student-chat-title" className="font-(family-name:--font-heading) text-lg font-bold text-[#5d0f2d]">Ask the AI tutor</h2>
          </div>
          <p className="mt-1 text-xs text-gray-500">Context: {displayContext}</p>
        </div>
          <div className="flex items-center gap-2">
            {messages.some((message) => message.role === 'assistant') && (
              <button
                type="button"
                onClick={handleEscalate}
                disabled={escalating || escalated}
                className="inline-flex items-center gap-2 rounded-lg border border-[#8a164b] px-3 py-2 text-xs font-bold text-[#8a164b] disabled:opacity-50"
              >
                {escalating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                <span className="hidden sm:inline">{escalated ? 'Sent to faculty' : 'Ask faculty'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#5d0f2d]"
              aria-label="Close AI tutor"
              title="Close AI tutor"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">Ask a question about this learning material.</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role !== 'user' && <Bot className="mt-1 h-4 w-4 shrink-0 text-[#8a164b]" aria-hidden="true" />}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.role === 'user' ? 'bg-[#5d0f2d] text-white' : 'bg-slate-100 text-gray-700'}`}>
              {message.role === 'assistant' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ children }) => <h3 className="mb-2 text-base font-bold">{children}</h3>,
                    h2: ({ children }) => <h3 className="mb-2 text-base font-bold">{children}</h3>,
                    h3: ({ children }) => <h3 className="mb-2 text-sm font-bold">{children}</h3>,
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    blockquote: ({ children }) => <blockquote className="my-2 border-l-2 border-[#8a164b] pl-3 italic">{children}</blockquote>,
                    code: ({ children, className }) => (
                      <code className={className || 'rounded bg-black/10 px-1 py-0.5 text-[0.9em]'}>{children}</code>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
            {message.role === 'user' && <User className="mt-1 h-4 w-4 shrink-0 text-[#8a164b]" aria-hidden="true" />}
          </div>
        ))}
        {sending && <Loader2 className="h-4 w-4 animate-spin text-[#8a164b]" aria-label="AI is responding" />}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-100 p-4">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about this topic..."
          className="input-premium min-w-0 flex-1"
          disabled={sending}
        />
        <button type="submit" disabled={!draft.trim() || sending} className="btn-maroon shrink-0 px-4" aria-label="Send question">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
        </form>
      </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5d0f2d] text-white shadow-xl ring-4 ring-white transition hover:bg-[#8a164b] focus:outline-none focus:ring-4 focus:ring-[#d8a15f]/60"
        aria-label={open ? 'Close AI tutor' : 'Open AI tutor'}
        aria-expanded={open}
        title={open ? 'Close AI tutor' : 'Open AI tutor'}
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
