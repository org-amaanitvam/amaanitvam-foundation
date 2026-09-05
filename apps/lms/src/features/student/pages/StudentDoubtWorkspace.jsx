import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, Loader2, MessageSquare, CheckCircle2, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchDoubtById, rateDoubt } from '../../../config/api';

const STATUS_META = {
  open: { label: 'Open', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  assigned: { label: 'Assigned', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  resolved: { label: 'Resolved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Closed', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  reopened: { label: 'Reopened', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const PRIORITY_META = {
  low: { label: 'Low', cls: 'text-gray-500' },
  medium: { label: 'Medium', cls: 'text-amber-600' },
  high: { label: 'High', cls: 'text-rose-600' },
  urgent: { label: 'Urgent', cls: 'text-red-700 font-bold' },
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function StudentDoubtWorkspace() {
  const { doubtId } = useParams();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingBusy, setRatingBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pollTimer;
    let pollAttempts = 0;

    const loadDoubt = async (showLoading = false) => {
      try {
        const token = await user?.getIdToken();
        const data = await fetchDoubtById(doubtId, token);
        if (cancelled) return;
        if (!data) {
          setError(true);
          return;
        }
        setDoubt(data);
        setRating(data.rating?.rating || 0);

        const hasAiResponse = data.responses?.some((response) => response.is_ai_generated);
        if (!hasAiResponse && !cancelled && pollAttempts < 8) {
          pollAttempts += 1;
          pollTimer = window.setTimeout(() => loadDoubt(false), 2500);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[student] Doubt load error:', err?.message || err);
          setError(true);
        }
      } finally {
        if (!cancelled && showLoading) setLoading(false);
      }
    };

    loadDoubt(true);
    return () => {
      cancelled = true;
      window.clearTimeout(pollTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doubtId]);

  const handleRate = async (value) => {
    if (ratingBusy || value < 1 || value > 5) return;
    setRating(value);
    setRatingBusy(true);
    try {
      const token = await user?.getIdToken();
      await rateDoubt(doubtId, { rating: value }, token);
      toast.success('Rating submitted');
      setDoubt((prev) => ({ ...prev, rating: { ...(prev?.rating || {}), rating: value } }));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to record rating');
      setRating(doubt?.rating?.rating || 0);
    } finally {
      setRatingBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="w-10 h-10 text-[#d8a15f] animate-spin" aria-hidden="true" />
          <span className="text-sm font-semibold text-gray-500">Loading doubt thread...</span>
        </div>
      </div>
    );
  }

  if (error || !doubt) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="card-premium flex flex-col items-center justify-center gap-3 py-20 text-center">
          <MessageSquare className="w-10 h-10 text-[#c46b87]" aria-hidden="true" />
          <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">Doubt not found</h2>
          <p className="text-sm text-gray-500">This doubt is unavailable or you don't have access to it.</p>
          <Link to="/student/doubts" className="btn-maroon">
            <ArrowLeft className="w-4 h-4" /> Back to My Doubts
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_META[doubt.status] || STATUS_META.open;
  const priority = PRIORITY_META[doubt.priority] || PRIORITY_META.medium;
  const responses = Array.isArray(doubt.responses) ? doubt.responses : [];
  const rated = Boolean(doubt.rating?.rating);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <Link
        to="/student/doubts"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8a164b] hover:text-[#56051a] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Doubts
      </Link>

      {/* Thread */}
      <div className="card-premium overflow-hidden p-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${status.cls}`}>
              {status.label}
            </span>
            <span className={`text-xs font-bold capitalize ${priority.cls}`}>{priority.label} priority</span>
            {(doubt.subject || doubt.topic) && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase text-gray-600">
                {[doubt.subject, doubt.topic].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
            {doubt.title}
          </h1>
          <p className="mt-1 text-xs text-gray-400 font-medium">
            Opened {formatDate(doubt.created_at)}
          </p>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-gray-100 bg-slate-50/60 px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <User className="w-3.5 h-3.5" /> Your Question
            </div>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">{doubt.description}</p>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Responses ({responses.length})
            </p>

            {responses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
                <p className="mt-2 text-sm text-gray-500">
                  No responses yet. Your faculty will respond to this doubt shortly.
                </p>
              </div>
            ) : (
              responses.map((response) => (
                <div
                  key={response.id || response._id}
                  className={`rounded-2xl border px-5 py-4 ${
                    response.is_faculty_response
                      ? 'border-[#d8a15f]/30 bg-[#d8a15f]/5'
                      : response.is_ai_generated
                        ? 'border-[#8a164b]/20 bg-[#8a164b]/5'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#8a164b]">
                      {response.is_faculty_response ? 'Faculty' : response.is_ai_generated ? 'AI Assistant' : 'You'}
                    </p>
                    {response.is_solution && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                        Solution
                      </span>
                    )}
                  </div>
                  {response.is_ai_generated ? (
                    <div className="mt-1.5 text-sm text-gray-700 leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {response.message}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{response.message}</p>
                  )}
                  {response.created_at && (
                    <p className="mt-2 text-[11px] text-gray-400">{formatDate(response.created_at)}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Rating */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#5d0f2d]">Was your doubt resolved?</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {rated ? 'Your rating has been recorded.' : 'Rate the resolution to help us improve.'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRate(value)}
                    disabled={rated || ratingBusy}
                    className="cursor-pointer disabled:cursor-not-allowed"
                    aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {rated && (
                  <CheckCircle2 className="ml-2 h-5 w-5 text-emerald-600" aria-hidden="true" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}