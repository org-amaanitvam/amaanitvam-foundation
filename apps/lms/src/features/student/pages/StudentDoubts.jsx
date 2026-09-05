import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, Star, MessageSquarePlus, ArrowUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMyDoubts, createDoubt, rateDoubt, fetchDoubtById } from '../../../config/api';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StudentChatPanel from '../components/StudentChatPanel';

const STATUS_STYLES = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  reopened: 'bg-rose-50 text-rose-700 border-rose-200',
};

const PRIORITY_STYLES = {
  low: 'text-gray-500',
  medium: 'text-amber-600',
  high: 'text-rose-600',
  urgent: 'text-red-700 font-bold',
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getDoubtId = (doubt) => doubt?.id || doubt?._id;

export default function StudentDoubts() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    priority: 'medium',
  });
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [rating, setRating] = useState(0);

  const reload = async () => {
    try {
      const token = await user?.getIdToken();
      const data = await fetchMyDoubts(token);
      setDoubts(data.items);
    } catch (error) {
      toast.error(error?.message || 'Failed to load your doubts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await user?.getIdToken();
        const data = await fetchMyDoubts(token);
        if (!cancelled) setDoubts(data.items);
      } catch (error) {
        if (!cancelled) toast.error(error?.message || 'Failed to load your doubts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (event) => {
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
      toast.success('Doubt submitted successfully');
      setForm({ title: '', description: '', subject: '', topic: '', priority: 'medium' });
      setLoading(true);
      await reload();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpand = async (doubt) => {
    const doubtId = getDoubtId(doubt);
    if (!doubtId) {
      toast.error('This doubt has no valid ID.');
      return;
    }

    if (expandedId === doubtId) {
      setExpandedId(null);
      setDetail(null);
      setRating(0);
      return;
    }
    setExpandedId(doubtId);
    setRating(0);
    try {
      const token = await user?.getIdToken();
      const data = await fetchDoubtById(doubtId, token);
      setDetail(data);
    } catch (error) {
      toast.error(error?.message || 'Could not load doubt details');
    }
  };

  const handleRate = async (doubtId) => {
    if (rating < 1 || rating > 5) return;
    try {
      const token = await user?.getIdToken();
      await rateDoubt(doubtId, { rating }, token);
      toast.success('Rating submitted');
      setDetail((prev) => ({ ...prev, rating: { ...(prev?.rating || {}), rating } }));
    } catch (error) {
      toast.error(error?.message || 'Failed to record rating');
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState label="Loading your doubts..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Ask Doubts"
        subtitle="Get help from faculty on any topic you are learning"
        image="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&q=70"
      />

      <StudentChatPanel />

      <form
        onSubmit={handleCreate}
        className="card-premium space-y-4"
      >
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-[#8a164b]" />
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
            Raise a New Doubt
          </h3>
        </div>

        <input
          type="text"
          placeholder="Title (e.g. 'Stuck on integration by parts')"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-premium"
          required
        />

        <textarea
          placeholder="Describe your doubt in detail..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-premium min-h-[110px] resize-y"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Subject (optional)"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="input-premium"
          />
          <input
            type="text"
            placeholder="Topic (optional)"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="input-premium"
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="input-premium"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <button type="submit" disabled={submitting} className="btn-maroon text-sm disabled:opacity-50">
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Doubt'}
        </button>
      </form>

      <div>
        <h3 className="mb-4 font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
          Your Doubts
        </h3>
        {doubts.length === 0 ? (
          <EmptyState title="No doubts yet" message="Submit your first doubt above to get help from faculty." />
        ) : (
          <div className="space-y-4">
            {doubts.map((doubt) => {
              const doubtId = getDoubtId(doubt);
              return (
              <div key={doubtId} className="card-premium">
                <button
                  type="button"
                  onClick={() => handleExpand(doubt)}
                  className="w-full flex flex-wrap items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5d0f2d]">
                        {doubt.title}
                      </p>
                      <Link
                        to={`/student/doubts/${doubtId}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#5d0f2d]/5 px-2.5 py-1 text-[11px] font-bold text-[#8a164b] hover:bg-[#5d0f2d] hover:text-white transition-colors"
                        title="Open thread"
                      >
                        Thread <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 font-medium">
                      {[doubt.subject, doubt.topic].filter(Boolean).join(' · ') || 'General'} · {formatDate(doubt.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_STYLES[doubt.status] || 'bg-gray-100 text-gray-600'}`}>
                      {doubt.status}
                    </span>
                    <span className={`text-xs font-bold capitalize ${PRIORITY_STYLES[doubt.priority] || 'text-gray-500'}`}>
                      {doubt.priority}
                    </span>
                  </div>
                </button>

                {expandedId === doubtId && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{doubt.description}</p>

                    {detail?.responses?.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-[family-name:var(--font-ui)] font-bold uppercase tracking-wider text-gray-400">
                          Responses
                        </p>
                        {detail.responses.map((response) => (
                          <div
                            key={response._id}
                            className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3"
                          >
                            <p className="text-xs font-semibold text-[#8a164b]">
                              {response.is_faculty_response ? 'Faculty response' : response.is_ai_generated ? 'AI Assistant' : 'You'}
                              {response.is_solution && (
                                <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                  Solution
                                </span>
                              )}
                            </p>
                            {response.is_ai_generated ? (
                              <div className="mt-1 text-sm text-gray-700">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm, remarkMath]}
                                  rehypePlugins={[rehypeKatex]}
                                >
                                  {response.message}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{response.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {doubt.status === 'resolved' && (!detail?.rating?.rating) && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">Rate this resolution:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setRating(value)}
                              className="cursor-pointer"
                            >
                              <Star
                                className={`h-5 w-5 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                        {rating > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRate(doubtId)}
                            className="rounded-lg bg-[#5d0f2d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8a164b] cursor-pointer"
                          >
                            Submit Rating
                          </button>
                        )}
                      </div>
                    )}

                    {detail?.rating?.rating && (
                      <p className="mt-4 text-xs font-semibold text-emerald-700">
                        Your rating: {'★'.repeat(detail.rating.rating)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}