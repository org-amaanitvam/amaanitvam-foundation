import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAssignedDoubts, updateDoubtStatus } from '../services/doubtsApi';
import toast from 'react-hot-toast';

export default function DoubtsInbox() {
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDoubts();
  }, [selectedStatus]);

  const loadDoubts = async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus === 'all' ? '' : selectedStatus;
      const res = await fetchAssignedDoubts(statusParam);
      if (res.success && res.doubts) {
        setDoubts(res.doubts);
      }
    } catch (err) {
      toast.error('Failed to load student doubts.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolve = async (doubtId, currentStatus) => {
    const nextStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
    try {
      const res = await updateDoubtStatus(doubtId, nextStatus);
      if (res.success) {
        toast.success(`Doubt marked as ${nextStatus.toUpperCase()}!`);
        setDoubts((prev) =>
          prev.map((d) => ((d._id || d.id) === doubtId ? { ...d, status: nextStatus } : d))
        );
      }
    } catch (err) {
      toast.error('Failed to update doubt status.');
    }
  };

  const filteredDoubts = doubts.filter((d) => {
    const matchesSearch =
      d.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.courseName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const counts = {
    total: doubts.length,
    open: doubts.filter((d) => d.status === 'open').length,
    in_progress: doubts.filter((d) => d.status === 'in_progress').length,
    resolved: doubts.filter((d) => d.status === 'resolved').length,
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20 text-xs font-bold mb-2">
            <HelpCircle className="w-4 h-4 text-[#8a164b]" />
            <span>Academic Consultation & SLA Doubt Inbox</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Student Doubts Resolution</h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Review, reply, and resolve technical queries submitted by enrolled students in your batches.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Doubts</span>
          <h3 className="text-3xl font-black text-[#5d0f2d] mt-2">{counts.total}</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Across assigned courses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Unresolved (Open)</span>
          <h3 className="text-3xl font-black text-rose-700 mt-2">{counts.open}</h3>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Awaiting faculty reply</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">In Discussion</span>
          <h3 className="text-3xl font-black text-amber-700 mt-2">{counts.in_progress}</h3>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Active dialogue</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resolved</span>
          <h3 className="text-3xl font-black text-emerald-700 mt-2">{counts.resolved}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Successfully answered</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All Doubts (${counts.total})` },
            { id: 'open', label: `Open (${counts.open})` },
            { id: 'in_progress', label: `In Progress (${counts.in_progress})` },
            { id: 'resolved', label: `Resolved (${counts.resolved})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedStatus(pill.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedStatus === pill.id
                  ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-rose-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search doubt title, student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b] font-medium"
          />
        </div>
      </div>

      {/* Doubts List Feed */}
      {loading ? (
        <div className="bg-white p-16 rounded-3xl border border-rose-100 shadow-sm text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Fetching student doubts...</p>
        </div>
      ) : filteredDoubts.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-rose-100 shadow-sm text-center space-y-3">
          <HelpCircle className="w-12 h-12 mx-auto text-gray-300" />
          <h4 className="font-bold text-gray-800 text-base">No Doubts Found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No student questions match your current search or status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => {
            const doubtId = doubt._id || doubt.id;
            return (
              <div
                key={doubtId}
                className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md hover:shadow-xl transition-all duration-200 space-y-4 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20">
                      {doubt.courseName || 'Course Query'}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        doubt.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : doubt.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {doubt.status}
                    </span>
                  </div>

                  <span className="text-xs text-gray-400 font-medium">
                    {doubt.created_at ? new Date(doubt.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-gray-900 group-hover:text-[#8a164b] transition-colors">
                    {doubt.subject}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-medium">
                    {doubt.question}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] text-white flex items-center justify-center text-xs font-bold">
                      {doubt.studentName?.[0] || 'S'}
                    </div>
                    <span className="text-xs font-bold text-gray-800">{doubt.studentName}</span>
                    <span className="text-xs text-gray-400">({doubt.studentEmail})</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleResolve(doubtId, doubt.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        doubt.status === 'resolved'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                      }`}
                    >
                      {doubt.status === 'resolved' ? 'Reopen Doubt' : 'Mark Resolved'}
                    </button>

                    <button
                      onClick={() => navigate(`/faculty/doubts/${doubtId}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-extrabold rounded-xl shadow-md transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
