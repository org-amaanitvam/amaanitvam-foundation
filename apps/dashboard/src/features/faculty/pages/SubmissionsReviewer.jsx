import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  ExternalLink,
  Github,
  Award,
  Send,
  Download,
  Users,
  Search,
} from 'lucide-react';
import { fetchAssignmentSubmissions, gradeStudentSubmission } from '../services/assignmentsApi';
import toast from 'react-hot-toast';

export default function SubmissionsReviewer() {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradingState, setGradingState] = useState({});

  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetchAssignmentSubmissions(assignmentId);
      if (res.success && res.submissions) {
        setSubmissions(res.submissions);
        const initial = {};
        res.submissions.forEach((s) => {
          initial[s._id || s.id] = {
            grade: s.grade || '',
            feedback: s.feedback || '',
          };
        });
        setGradingState(initial);
      }
    } catch (err) {
      toast.error('Failed to load student submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (subId, field, value) => {
    setGradingState((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (subId) => {
    const data = gradingState[subId];
    if (data?.grade === '' || data?.grade === null) {
      toast.error('Please enter a grade score.');
      return;
    }

    try {
      const res = await gradeStudentSubmission(subId, Number(data.grade), data.feedback);
      if (res.success) {
        toast.success('Grade & feedback saved successfully!');
        setSubmissions((prev) =>
          prev.map((s) =>
            (s._id || s.id) === subId
              ? { ...s, grade: Number(data.grade), feedback: data.feedback, status: 'graded' }
              : s
          )
        );
      }
    } catch (err) {
      toast.error('Failed to save grade.');
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in text-gray-900">
      {/* Back Button */}
      <button
        onClick={() => navigate('/faculty/assignments')}
        className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#5d0f2d] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignments Manager</span>
      </button>

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20 text-xs font-bold mb-2">
            <Award className="w-4 h-4 text-[#8a164b]" />
            <span>Coursework Submissions Evaluation Queue</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Student Submissions Review</h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Assignment ID: <span className="font-bold text-[#8a164b]">{assignmentId}</span> • Evaluate project code repositories and assign grades.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search student name or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b] font-medium"
          />
        </div>
      </div>

      {/* Main Submissions Table */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Fetching student submissions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileText className="w-12 h-12 mx-auto text-gray-300" />
            <h4 className="font-bold text-gray-800 text-base">No Submissions Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No student submissions match your search query for this assignment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#5d0f2d]/5 via-[#8a164b]/5 to-transparent border-b border-rose-100 text-[#5d0f2d] font-black uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Submission Attachments</th>
                  <th className="p-4">Submitted Time</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Grade (out of 100)</th>
                  <th className="p-4">Faculty Feedback</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {filtered.map((sub) => {
                  const subId = sub._id || sub.id;
                  const currentGrade = gradingState[subId]?.grade ?? '';
                  const currentFeedback = gradingState[subId]?.feedback ?? '';

                  return (
                    <tr key={subId} className="hover:bg-rose-50/40 transition-colors">
                      {/* Student Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] text-white flex items-center justify-center font-black text-xs shadow-sm">
                            {sub.studentName?.[0] || 'S'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-xs">{sub.studentName}</h4>
                            <p className="text-[11px] text-gray-500 font-medium">{sub.rollNo} • {sub.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Attachments */}
                      <td className="p-4 space-y-1">
                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-[#8a164b] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#8a164b]" />
                            <span className="truncate max-w-[160px]">{sub.fileName || 'View PDF Report'}</span>
                          </a>
                        )}

                        {sub.githubRepo && (
                          <a
                            href={sub.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 hover:text-black"
                          >
                            <Github className="w-3.5 h-3.5 text-gray-800" />
                            <span>GitHub Code Repo</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        )}
                      </td>

                      {/* Submitted Time */}
                      <td className="p-4 text-gray-600 font-medium">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                            sub.status === 'graded'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      {/* Grade Input */}
                      <td className="p-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Grade e.g. 95"
                          value={currentGrade}
                          onChange={(e) => handleGradeChange(subId, 'grade', e.target.value)}
                          className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                        />
                      </td>

                      {/* Feedback Input */}
                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="Feedback comments..."
                          value={currentFeedback}
                          onChange={(e) => handleGradeChange(subId, 'feedback', e.target.value)}
                          className="w-full min-w-[180px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#8a164b]"
                        />
                      </td>

                      {/* Save Action */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSaveGrade(subId)}
                          className="px-4 py-2 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                        >
                          Save Grade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
