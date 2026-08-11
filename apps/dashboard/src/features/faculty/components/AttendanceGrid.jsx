import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  UserCheck,
  CheckCheck,
  Save,
  Users,
  Filter,
} from 'lucide-react';

export default function AttendanceGrid({
  students = [],
  attendanceState = {},
  onStatusChange,
  onMarkAllPresent,
  onSubmitAttendance,
  isSubmitting = false,
  selectedCourseName = 'Full Stack Web Development',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const currentStatus = attendanceState[student.id || student._id] || 'present';
    const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getCounts = () => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    students.forEach((std) => {
      const status = attendanceState[std.id || std._id] || 'present';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });

    return { present, absent, late, excused, total: students.length };
  };

  const counts = getCounts();

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden text-gray-900 space-y-0">
      {/* Header Controls & Action Bar */}
      <div className="p-6 bg-gradient-to-r from-rose-50/60 via-white to-rose-50/30 border-b border-rose-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-black text-gray-900 text-lg tracking-tight">{selectedCourseName}</h4>
            <span className="bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20 text-xs font-black px-3 py-0.5 rounded-full">
              {students.length} Enrolled Students
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Mark student presence for live class sessions, workshops, and lab practicals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onMarkAllPresent}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-extrabold rounded-xl border border-emerald-200 transition-all shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={onSubmitAttendance}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] hover:from-[#741339] hover:to-[#a11a58] text-white text-xs font-black rounded-xl shadow-md shadow-[#5d0f2d]/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#d4af37]" />
            <span>{isSubmitting ? 'Saving Roster...' : 'Save & Submit Roster'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Stats KPI Summary Row */}
      <div className="px-6 py-4 bg-gray-50/80 border-b border-rose-100 flex items-center justify-between flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="flex items-center gap-2 font-bold text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            Present: <strong className="font-black text-emerald-700 text-sm">{counts.present}</strong>
          </span>

          <span className="flex items-center gap-2 font-bold text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
            Absent: <strong className="font-black text-rose-700 text-sm">{counts.absent}</strong>
          </span>

          <span className="flex items-center gap-2 font-bold text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
            Late: <strong className="font-black text-amber-700 text-sm">{counts.late}</strong>
          </span>

          <span className="flex items-center gap-2 font-bold text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm" />
            Excused: <strong className="font-black text-sky-700 text-sm">{counts.excused}</strong>
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search roll no, student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-800 focus:border-[#8a164b] font-medium"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b] text-gray-800"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
            <option value="late">Late Only</option>
            <option value="excused">Excused Only</option>
          </select>
        </div>
      </div>

      {/* Roster Table List */}
      <div className="divide-y divide-rose-50 overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs font-medium">
            No students match your search or filter criteria.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const studentId = student.id || student._id;
            const status = (attendanceState[studentId] || 'present').toLowerCase();

            return (
              <div
                key={studentId}
                className="p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-rose-50/40 transition-colors gap-4"
              >
                {/* Student Bio */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] text-white font-black text-sm flex items-center justify-center border border-[#d4af37]/40 shadow-sm">
                    {student.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">{student.name}</h5>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Roll: <span className="font-bold text-[#8a164b]">{student.rollNo || 'N/A'}</span> • {student.email}
                    </p>
                  </div>
                </div>

                {/* Status Selector Pills */}
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                  {[
                    { id: 'present', label: 'Present', activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-black' },
                    { id: 'absent', label: 'Absent', activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-black' },
                    { id: 'late', label: 'Late', activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-black' },
                    { id: 'excused', label: 'Excused', activeClass: 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-black' },
                  ].map((btn) => {
                    const isSelected = status === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => onStatusChange?.(studentId, btn.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                          isSelected
                            ? btn.activeClass
                            : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-[#5d0f2d]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
