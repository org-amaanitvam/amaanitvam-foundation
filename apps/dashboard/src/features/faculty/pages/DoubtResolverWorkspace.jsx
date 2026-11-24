import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { fetchDoubtById, postDoubtResponse, updateDoubtStatus } from '../services/doubtsApi';
import toast from 'react-hot-toast';

export default function DoubtResolverWorkspace() {
  const { doubtId } = useParams();
  const navigate = useNavigate();
  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    loadDoubt();
  }, [doubtId]);

  const loadDoubt = async () => {
    setLoading(true);
    try {
      const res = await fetchDoubtById(doubtId);
      if (res.success && res.doubt) {
        setDoubt(res.doubt);
      }
    } catch (err) {
      toast.error('Could not load doubt details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await postDoubtResponse(doubtId, {
        message: replyText,
        is_solution: true,
      });
      if (res.success) {
        toast.success('Response posted to student thread!');
        const newResponse = res.response || {
          _id: 'resp-' + Date.now(),
          authorName: 'Prof. ABC (Faculty)',
          message: replyText,
          created_at: new Date().toISOString(),
          is_faculty_response: true,
        };
        setDoubt((prev) => ({
          ...prev,
          responses: [...(prev?.responses || []), newResponse],
          status: 'in_progress',
        }));
        setReplyText('');
      }
    } catch (err) {
      toast.error('Failed to post response.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleResolveToggle = async () => {
    const next = doubt?.status === 'resolved' ? 'open' : 'resolved';
    try {
      const res = await updateDoubtStatus(doubtId, next);
      if (res.success) {
        toast.success(`Thread status updated to ${next.toUpperCase()}!`);
        setDoubt((prev) => (prev ? { ...prev, status: next } : null));
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3 max-w-5xl mx-auto">
        <div className="w-8 h-8 border-3 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-medium">Loading doubt discussion workspace...</p>
      </div>
    );
  }

  if (!doubt) {
    return (
      <div className="p-16 text-center space-y-4 max-w-5xl mx-auto">
        <p className="text-sm text-gray-500">Doubt record not found.</p>
        <button
          onClick={() => navigate('/faculty/doubts')}
          className="px-4 py-2 bg-[#5d0f2d] text-white text-xs font-bold rounded-xl"
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto text-gray-900 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/faculty/doubts')}
        className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#5d0f2d] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doubts Inbox</span>
      </button>

      {/* Main Question Card Header */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20">
              {doubt.courseName || 'Full Stack Web Development'}
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                doubt.status === 'resolved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {doubt.status}
            </span>
          </div>

          <button
            onClick={handleResolveToggle}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              doubt.status === 'resolved'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
            }`}
          >
            {doubt.status === 'resolved' ? 'Reopen Query' : 'Mark as Resolved'}
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{doubt.subject}</h2>
          <p className="text-xs text-gray-400 mt-1">Doubt ID: {doubt._id || doubt.id}</p>
        </div>

        <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100 text-xs text-gray-800 leading-relaxed font-medium">
          {doubt.question}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] text-white flex items-center justify-center font-bold text-xs">
            {doubt.studentName?.[0] || 'S'}
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900">{doubt.studentName}</p>
            <p className="text-[11px] text-gray-500 font-medium">{doubt.studentEmail}</p>
          </div>
        </div>
      </div>

      {/* Discussion Thread */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6 sm:p-8 space-y-6">
        <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#8a164b]" />
          <span>Threaded Discussion</span>
        </h3>

        <div className="space-y-4">
          {(doubt.responses || []).length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No replies posted yet in this thread.</p>
          ) : (
            doubt.responses.map((resp, idx) => (
              <div
                key={resp._id || idx}
                className={`p-4 rounded-2xl border space-y-2 ${
                  resp.is_faculty_response
                    ? 'bg-gradient-to-r from-rose-50/70 to-white border-rose-200 ml-4 sm:ml-8'
                    : 'bg-gray-50 border-gray-200 mr-4 sm:mr-8'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#5d0f2d]">
                    {resp.authorName || (resp.is_faculty_response ? 'Prof. ABC (Faculty)' : 'Student')}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {resp.created_at ? new Date(resp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">{resp.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendResponse} className="pt-4 border-t border-gray-100 space-y-3">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">
            Post Faculty Solution / Reply
          </label>
          <textarea
            rows={3}
            required
            placeholder="Type your explanation or code walkthrough response..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:border-[#8a164b]"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingReply || !replyText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white text-xs font-extrabold rounded-2xl shadow-lg hover:from-[#741339] hover:to-[#a11a58] transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#d4af37]" />
              <span>{submittingReply ? 'Posting...' : 'Post Solution Reply'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
