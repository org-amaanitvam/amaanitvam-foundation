import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFacultyAssignments, createAssignment } from '../services/assignmentsApi';
import toast from 'react-hot-toast';

export default function AssignmentsManager() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    courseName: 'Full Stack Web Development (Batch 2026-A)',
    dueDate: '',
    totalPoints: 100,
    description: '',
    status: 'Published',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetchFacultyAssignments();
      if (res.success && res.assignments) {
        setAssignments(res.assignments);
      }
    } catch (err) {
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) {
      toast.error('Please enter assignment title and due date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createAssignment(form);
      if (res.success && res.assignment) {
        toast.success('Coursework assignment published successfully!');
        setAssignments((prev) => [res.assignment, ...prev]);
        setForm({
          title: '',
          courseName: 'Full Stack Web Development (Batch 2026-A)',
          dueDate: '',
          totalPoints: 100,
          description: '',
          status: 'Published',
        });
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = assignments.filter((asg) => {
    const matchesSearch =
      asg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.courseName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || asg.status?.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalSubmitted = assignments.reduce((acc, a) => acc + (a.submittedCount || 0), 0);
  const totalPending = assignments.reduce((acc, a) => acc + (a.pendingReviewCount || 0), 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20 text-xs font-bold mb-2">
            <FileCheck className="w-4 h-4 text-[#8a164b]" />
            <span>Academic Coursework & Submissions Control</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Assignments & Projects</h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Publish coursework deadlines, track submission metrics, and evaluate student project code repositories.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] hover:from-[#741339] hover:to-[#a11a58] text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" />
          <span>Create New Assignment</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Coursework</span>
          <h3 className="text-3xl font-black text-[#5d0f2d] mt-2">{assignments.length}</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Published assignments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Total Submissions</span>
          <h3 className="text-3xl font-black text-sky-700 mt-2">{totalSubmitted}</h3>
          <p className="text-[11px] text-sky-600 font-medium mt-0.5">Student uploads</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Evaluation</span>
          <h3 className="text-3xl font-black text-amber-700 mt-2">{totalPending}</h3>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Awaiting grading</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Submission Rate</span>
          <h3 className="text-3xl font-black text-emerald-700 mt-2">94.2%</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Batch average</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Assignments' },
            { id: 'published', label: 'Published' },
            { id: 'completed', label: 'Completed' },
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

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coursework title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b] font-medium"
          />
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="bg-white p-16 rounded-3xl border border-rose-100 shadow-sm text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Fetching coursework assignments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-rose-100 shadow-sm text-center space-y-3">
          <FileCheck className="w-12 h-12 mx-auto text-gray-300" />
          <h4 className="font-bold text-gray-800 text-base">No Assignments Found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No coursework assignments match your search or filter settings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((asg) => {
            const asgId = asg._id || asg.id;
            const submittedPercent = asg.totalEnrolled
              ? Math.round((asg.submittedCount / asg.totalEnrolled) * 100)
              : 85;

            return (
              <div
                key={asgId}
                className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20">
                      {asg.status}
                    </span>
                    <span className="text-xs font-extrabold text-[#8a164b] bg-rose-50 px-2.5 py-0.5 rounded-md">
                      {asg.totalPoints} Marks
                    </span>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-base group-hover:text-[#8a164b] transition-colors leading-snug">
                    {asg.title}
                  </h3>

                  <p className="text-xs text-gray-500 font-medium">{asg.courseName}</p>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {asg.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#8a164b]" />
                      <span>Due: {asg.dueDate}</span>
                    </div>
                    <span>{asg.submittedCount} / {asg.totalEnrolled || 30} Submissions</span>
                  </div>

                  {/* Submission Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] h-full rounded-full transition-all"
                      style={{ width: `${submittedPercent}%` }}
                    />
                  </div>

                  {/* Review Button */}
                  <button
                    onClick={() => navigate(`/faculty/assignments/${asgId}/submissions`)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white text-xs font-extrabold shadow-md hover:from-[#741339] hover:to-[#a11a58] transition-all"
                  >
                    <span>Review Submissions ({asg.pendingReviewCount || 0} Pending)</span>
                    <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Assignment */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-extrabold text-gray-900 text-lg">Publish New Coursework Assignment</h4>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React State Architecture Capstone"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Course Batch</label>
                  <select
                    value={form.courseName}
                    onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                  >
                    <option value="Full Stack Web Development (Batch 2026-A)">Full Stack Web Development</option>
                    <option value="UI/UX Product Design (Cohort 4)">UI/UX Product Design</option>
                    <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Due Date</label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Total Maximum Points</label>
                <input
                  type="number"
                  required
                  value={form.totalPoints}
                  onChange={(e) => setForm({ ...form, totalPoints: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Instructions & Project Guidelines</label>
                <textarea
                  rows={3}
                  placeholder="Detail instructions, repository requirements, or scoring rubrics..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#8a164b]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-extrabold rounded-xl shadow-md"
                >
                  {submitting ? 'Publishing...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
