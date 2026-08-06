import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Clock, Users, Calendar, Filter, Save, CheckCircle2, Award } from 'lucide-react';
import FacultyPunchControl from '../components/FacultyPunchControl';
import AttendanceGrid from '../components/AttendanceGrid';
import { fetchStudentRoster, submitStudentAttendance } from '../services/attendanceApi';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function FacultyAttendanceCenter() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('faculty_punch'); // 'faculty_punch' | 'student_marking'
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  // Student Attendance State
  const [selectedCourse, setSelectedCourse] = useState('crs-1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        // Default all to 'present'
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

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8a164b]/10 text-[#8a164b] text-xs font-semibold mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Academic Attendance & Time Tracking</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendance Center</h2>
          <p className="text-sm text-gray-500 mt-1">
            Log faculty shift working hours and mark live class student attendance rosters.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="bg-gray-100/80 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-200/60 shadow-inner">
          <button
            onClick={() => setActiveTab('faculty_punch')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'faculty_punch'
                ? 'bg-[#5d0f2d] text-white shadow-md shadow-[#5d0f2d]/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <Clock className="w-4 h-4 text-[#d4af37]" />
            <span>My Work Hours Log</span>
          </button>

          <button
            onClick={() => setActiveTab('student_marking')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'student_marking'
                ? 'bg-[#5d0f2d] text-white shadow-md shadow-[#5d0f2d]/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <Users className="w-4 h-4 text-[#d4af37]" />
            <span>Student Class Marking</span>
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
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="flex flex-col gap-1 w-full sm:w-72">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Course / Batch</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b] focus:ring-2 focus:ring-[#8a164b]/10 text-gray-800"
                >
                  {COURSES_LIST.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-48">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Session Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b] text-gray-800"
                />
              </div>
            </div>

            <div className="text-right text-xs text-gray-500 hidden md:block">
              <p className="font-semibold text-gray-700">Course Roster Sync</p>
              <p>Updates reflect immediately in Student LMS</p>
            </div>
          </div>

          {/* Roster Marking Grid Component */}
          {loadingRoster ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
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
    </div>
  );
}
