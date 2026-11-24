import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  FileText,
  Send,
  Download,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Plus,
  Paperclip,
  Bookmark,
} from 'lucide-react';
import { fetchKnowledgeBase, submitSupportTicket, fetchSupportTickets } from '../services/supportApi';
import toast from 'react-hot-toast';

export default function FacultyHelpDesk() {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'submit_ticket' | 'my_tickets' | 'downloads'
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loadingFaq, setLoadingFaq] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Live Classrooms',
    priority: 'medium',
    description: '',
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    loadFaqs();
  }, []);

  useEffect(() => {
    if (activeTab === 'my_tickets') {
      loadTickets();
    }
  }, [activeTab]);

  const loadFaqs = async () => {
    setLoadingFaq(true);
    try {
      const res = await fetchKnowledgeBase();
      if (res.success && res.faqs) {
        setFaqs(res.faqs);
      }
    } catch (err) {
      toast.error('Could not load knowledge base FAQs.');
    } finally {
      setLoadingFaq(false);
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetchSupportTickets();
      if (res.success && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      toast.error('Could not load support ticket history.');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast.error('Please enter a subject and detailed description.');
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await submitSupportTicket(ticketForm);
      if (res.success && res.ticket) {
        toast.success(`Support Ticket #${res.ticket.ticketNo || 'NEW'} submitted successfully!`);
        setTickets((prev) => [res.ticket, ...prev]);
        setTicketForm({ subject: '', category: 'Live Classrooms', priority: 'medium', description: '' });
        setActiveTab('my_tickets');
      }
    } catch (err) {
      toast.error('Failed to submit support ticket.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      f.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in text-gray-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20 text-xs font-bold mb-2">
            <LifeBuoy className="w-4 h-4 text-[#8a164b]" />
            <span>Faculty Assistance & Support Portal</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Help & Support Desk</h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Search the faculty knowledge base manual, submit IT support tickets, and download user guides.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="bg-white/90 p-1.5 rounded-2xl flex items-center gap-1 border border-rose-100 shadow-md">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md'
                : 'text-gray-600 hover:bg-rose-50'
            }`}
          >
            FAQ Manual
          </button>
          <button
            onClick={() => setActiveTab('submit_ticket')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'submit_ticket'
                ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md'
                : 'text-gray-600 hover:bg-rose-50'
            }`}
          >
            Submit Ticket
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'my_tickets'
                ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md'
                : 'text-gray-600 hover:bg-rose-50'
            }`}
          >
            Ticket History ({tickets.length || 2})
          </button>
        </div>
      </div>

      {/* TAB 1: FAQ Knowledge Base */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* Search & Category Pills */}
          <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'All Manual FAQs' },
                { id: 'Classroom & Live Stream', label: 'Live Classrooms' },
                { id: 'Grading & Attendance', label: 'Grading & Roster' },
                { id: 'IT Systems & LMS', label: 'LMS Systems' },
                { id: 'HR & Payroll', label: 'HR & Payroll' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-[#5d0f2d] text-white shadow-sm'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-rose-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search faculty manual..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b] font-medium"
              />
            </div>
          </div>

          {/* Accordion FAQ Items */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6 space-y-4">
            {loadingFaq ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-7 h-7 border-2 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400">Loading knowledge base...</p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No matching FAQ topics found.
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-rose-100 rounded-2xl overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full p-4 bg-gradient-to-r from-rose-50/30 to-white hover:bg-rose-50/70 flex items-center justify-between text-left gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20">
                          {faq.category}
                        </span>
                        <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">{faq.question}</h4>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#8a164b] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-rose-100 text-xs text-gray-700 leading-relaxed font-medium">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Submit Support Ticket */}
      {activeTab === 'submit_ticket' && (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-8 max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">Submit IT & Admin Support Request</h3>
            <p className="text-xs text-gray-500 mt-1">
              Our academic IT helpdesk responds to critical issues within 2 hours.
            </p>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Issue Subject / Summary</label>
              <input
                type="text"
                required
                placeholder="e.g. Google Meet link sync failing for Batch 2026-A"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                >
                  <option value="Live Classrooms">Live Classrooms & Streaming</option>
                  <option value="LMS Storage">LMS Storage & Uploads</option>
                  <option value="Grading & Roster">Grading & Student Roster</option>
                  <option value="Account & Security">Account & Security</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Priority Level</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                >
                  <option value="low">Low - Routine Query</option>
                  <option value="medium">Medium - Standard Issue</option>
                  <option value="high">High - Class In Progress</option>
                  <option value="urgent">Urgent - System Outage</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Detailed Description</label>
              <textarea
                rows={4}
                required
                placeholder="Describe the steps to reproduce the error or request details..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#8a164b]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="submit"
                disabled={submittingTicket}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white text-xs font-extrabold rounded-2xl shadow-lg hover:from-[#741339] hover:to-[#a11a58] transition-all"
              >
                <Send className="w-4 h-4 text-[#d4af37]" />
                <span>{submittingTicket ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: My Support Tickets */}
      {activeTab === 'my_tickets' && (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6 space-y-4">
          <h3 className="font-extrabold text-gray-900 text-lg">My Active & Resolved Tickets</h3>

          <div className="space-y-3">
            {tickets.map((tck) => (
              <div key={tck._id || tck.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#5d0f2d] text-xs">{tck.ticketNo || 'TICK-1001'}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-[#8a164b]">
                      {tck.category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      tck.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {tck.status?.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 text-xs">{tck.subject}</h4>
                <p className="text-xs text-gray-600">{tck.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
