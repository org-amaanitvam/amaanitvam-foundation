import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Send, X } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { createDoubt } from '../../../../config/api';

const buildInitialForm = (question, answer) => ({
  title: `Doubt: ${question}`.slice(0, 200),
  description: `Question:\n${question}\n\nAI assistant reply:\n${answer}\n\nThe AI assistant could not fully resolve this — please explain further.`,
  subject: '',
  topic: '',
  priority: 'medium',
});

export default function RaiseDoubtModal({ question, answer, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState(() => buildInitialForm(question, answer));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.title.trim().length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please describe your doubt');
      return;
    }
    setSubmitting(true);
    try {
      const token = await user?.getIdToken();
      await createDoubt(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          subject: form.subject.trim() || undefined,
          topic: form.topic.trim() || undefined,
          priority: form.priority,
        },
        token,
      );
      toast.success('Doubt submitted — track it under Ask Doubts');
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Raise as faculty doubt"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg animate-fade-in overflow-y-auto rounded-2xl border border-[#5d0f2d]/10 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5d0f2d]">
              Raise as faculty doubt
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your conversation with the AI assistant is attached for context.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="raise-doubt-title" className="mb-1.5 block text-sm font-semibold text-[#3d2b2b]">
              Title
            </label>
            <input
              id="raise-doubt-title"
              type="text"
              className="input-premium"
              placeholder="Title (e.g. 'Stuck on integration by parts')"
              value={form.title}
              onChange={updateField('title')}
            />
          </div>

          <div>
            <label htmlFor="raise-doubt-description" className="mb-1.5 block text-sm font-semibold text-[#3d2b2b]">
              Description
            </label>
            <textarea
              id="raise-doubt-description"
              className="input-premium min-h-[140px] resize-y"
              placeholder="Describe your doubt in detail..."
              value={form.description}
              onChange={updateField('description')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="raise-doubt-subject" className="mb-1.5 block text-sm font-semibold text-[#3d2b2b]">
                Subject
              </label>
              <input
                id="raise-doubt-subject"
                type="text"
                className="input-premium"
                placeholder="Subject (optional)"
                value={form.subject}
                onChange={updateField('subject')}
              />
            </div>
            <div>
              <label htmlFor="raise-doubt-topic" className="mb-1.5 block text-sm font-semibold text-[#3d2b2b]">
                Topic
              </label>
              <input
                id="raise-doubt-topic"
                type="text"
                className="input-premium"
                placeholder="Topic (optional)"
                value={form.topic}
                onChange={updateField('topic')}
              />
            </div>
            <div>
              <label htmlFor="raise-doubt-priority" className="mb-1.5 block text-sm font-semibold text-[#3d2b2b]">
                Priority
              </label>
              <select
                id="raise-doubt-priority"
                className="input-premium"
                value={form.priority}
                onChange={updateField('priority')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-maroon text-sm disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Submitting...' : 'Submit doubt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
