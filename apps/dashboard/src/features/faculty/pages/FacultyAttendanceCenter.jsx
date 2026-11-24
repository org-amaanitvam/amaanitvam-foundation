import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Clock, Users, Calendar, Filter, Save, CheckCircle2, Award, Download, FileText, Send } from 'lucide-react';
import FacultyPunchControl from '../components/FacultyPunchControl';
import AttendanceGrid from '../components/AttendanceGrid';
import { fetchStudentRoster, submitStudentAttendance } from '../services/attendanceApi';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function FacultyAttendanceCenter() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('faculty_punch'); // 'faculty_punch' | 'student_marking' | 'leave_application'
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  // Student Attendance State
  const [selectedCourse, setSelectedCourse] = useState('crs-1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    type: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
    substitute: 'Prof. Deepak Kumar',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const COURSES_LIST = [
    { id: 'crs-1', name: 'Full Stack Web Development (Batch 2026-A)' },
    { id: 'crs-2', name: 'UI/UX Product Design (Cohort 4)' },
    { id: 'crs-3', name: 'Cloud Architecture & DevOps Masterclass' },
  ];

  useEffect(() => {
    if (activeTab === 'student_marking') {
      loadRoster(selectedCourse);
    }
  }, [activeTab, selectedCourse]);

  const loadRoster = async (courseId) => {
    setLoadingRoster(true);
    try {
      const res = await fetchStudentRoster(courseId);
      if (res.success && res.students) {
        setStudents(res.students);
        const initial = {};
        res.students.forEach((s) => {
          initial[s.id || s._id] = s.status || 'present';
        });
        setAttendanceState(initial);
      }
    } catch (err) {
      toast.error('Could not load student roster.');
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const next = {};
    students.forEach((s) => {
      next[s.id || s._id] = 'present';
    });
    setAttendanceState(next);
    toast.success('Marked all students as Present.');
  };

  const handleSubmitStudentAttendance = async () => {
    setSubmitting(true);
    try {
      const records = Object.entries(attendanceState).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      const res = await submitStudentAttendance(selectedCourse, selectedDate, records);
      if (res.success) {
        toast.success(res.message || 'Student class attendance saved successfully!');
      } else {
        toast.error('Failed to submit attendance.');
      }
    } catch (err) {
      toast.error('Error submitting class attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = 'Roll No,Student Name,Email,Attendance Status\n';
    const rows = students
      .map((s) => `${s.rollNo || 'N/A'},"${s.name}",${s.email},${attendanceState[s.id || s._id] || 'present'}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedCourse}_${selectedDate}.csv`;
    a.click();
    toast.success('Attendance CSV report downloaded!');
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    setTimeout(() => {
      setSubmittingLeave(false);
      toast.success('Faculty leave application submitted to HOD!');
      setLeaveForm({ type: 'Casual Leave', startDate: '', endDate: '', reason: '', substitute: 'Prof. Deepak Kumar' });
    }, 600);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-gray-900 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20 text-xs font-bold mb-2">
            <ClipboardCheck className="w-3.5 h-3.5 text-[#8a164b]" />
            <span>Academic Attendance & Shift Duty Tracking</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Attendance Center</h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Log faculty shift working hours, mark student rosters, and manage leave applications.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="bg-white/90 p-1.5 rounded-2xl flex items-center gap-1 border border-rose-100 shadow-md">
          <button
            onClick={() => setActiveTab('faculty_punch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              activeTab === 'faculty_punch'
                ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-rose-50'
            }`}
          >
            <Clock className="w-4 h-4 text-[#d4af37]" />
            <span>Work Hours Log</span>
          </button>

          <button
            onClick={() => setActiveTab('student_marking')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              activeTab === 'student_marking'
                ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-rose-50'
            }`}
          >
            <Users className="w-4 h-4 text-[#d4af37]" />
            <span>Student Class Marking</span>
          </button>

          <button
            onClick={() => setActiveTab('leave_application')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              activeTab === 'leave_application'
                ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-rose-50'
            }`}
          >
            <FileText className="w-4 h-4 text-[#d4af37]" />
            <span>Leave Requests</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Faculty Self Punch Control */}
      {activeTab === 'faculty_punch' && (
        <FacultyPunchControl
          userProfile={userProfile}
          isPunchedIn={isPunchedIn}
          onPunchToggle={(val) => setIsPunchedIn(val)}
        />
      )}

      {/* Tab 2: Student Class Roster Marking */}
      {activeTab === 'student_marking' && (
        <div className="space-y-6">
          {/* Class Selection & Filters */}
          <div className="bg-white/95 p-5 rounded-3xl border border-rose-100 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="flex flex-col gap-1 w-full sm:w-72">
                <label className="text-xs font-extrabold text-[#5d0f2d] uppercase tracking-wider">Select Course / Batch</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b] text-gray-900"
                >
                  {COURSES_LIST.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-48">
                <label className="text-xs font-extrabold text-[#5d0f2d] uppercase tracking-wider">Session Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b] text-gray-900"
                />
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-extrabold rounded-xl border border-gray-300 transition-all self-end sm:self-center"
            >
              <Download className="w-4 h-4 text-[#8a164b]" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Roster Marking Grid Component */}
          {loadingRoster ? (
            <div className="bg-white/95 p-12 rounded-3xl border border-rose-100 text-center space-y-3 shadow-md">
              <div className="w-8 h-8 border-3 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Fetching student roster from database...</p>
            </div>
          ) : (
            <AttendanceGrid
              students={students}
              attendanceState={attendanceState}
              onStatusChange={handleStatusChange}
              onMarkAllPresent={handleMarkAllPresent}
              onSubmitAttendance={handleSubmitStudentAttendance}
              isSubmitting={submitting}
              selectedCourseName={COURSES_LIST.find((c) => c.id === selectedCourse)?.name || 'Class Roster'}
            />
          )}
        </div>
      )}

      {/* Tab 3: Faculty Leave Application Form */}
      {activeTab === 'leave_application' && (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">Faculty Leave Application</h3>
            <p className="text-xs text-gray-500 mt-1">Submit sabbatical or casual leave requests for HOD approval.</p>
          </div>

          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Leave Type</label>
              <select
                value={leaveForm.type}
                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
              >
                <option value="Casual Leave">Casual Leave (CL)</option>
                <option value="Sick Leave">Sick Leave (SL)</option>
                <option value="Academic Duty">Academic Duty (Conference/Workshop)</option>
                <option value="Earned Leave">Earned Leave (EL)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Start Date</label>
                <input
                  type="date"
                  required
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">End Date</label>
                <input
                  type="date"
                  required
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Nominated Substitute Faculty</label>
              <input
                type="text"
                value={leaveForm.substitute}
                onChange={(e) => setLeaveForm({ ...leaveForm, substitute: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d]">Reason for Leave</label>
              <textarea
                rows={3}
                required
                placeholder="State academic or personal reasons..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#8a164b]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submittingLeave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white text-xs font-extrabold rounded-2xl shadow-lg hover:from-[#741339] hover:to-[#a11a58] transition-all"
              >
                <Send className="w-4 h-4 text-[#d4af37]" />
                <span>{submittingLeave ? 'Submitting...' : 'Submit Leave Request'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
