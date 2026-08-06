import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Search, UserCheck, CheckCheck, Save } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-0">
      {/* Header Controls & Summary Bar */}
      <div className="p-6 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900 text-lg">{selectedCourseName}</h4>
            <span className="bg-[#8a164b]/10 text-[#8a164b] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {students.length} Enrolled Students
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Mark student presence for live class sessions and practical evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onMarkAllPresent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-xl border border-emerald-200 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={onSubmitAttendance}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#5d0f2d]/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#d4af37]" />
            <span>{isSubmitting ? 'Saving...' : 'Save & Submit Roster'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Stats Pills */}
      <div className="px-6 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Present: <strong className="font-bold">{counts.present}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Absent: <strong className="font-bold">{counts.absent}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Late: <strong className="font-bold">{counts.late}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Excused: <strong className="font-bold">{counts.excused}</strong>
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#8a164b]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#8a164b] text-gray-600 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="divide-y divide-gray-100 overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No student matches the search or filter criteria.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const studentId = student.id || student._id;
            const status = (attendanceState[studentId] || 'present').toLowerCase();

            return (
              <div
                key={studentId}
                className="p-4 px-6 flex items-center justify-between hover:bg-gray-50/60 transition-colors gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5d0f2d]/10 to-[#8a164b]/20 text-[#5d0f2d] font-bold text-sm flex items-center justify-center border border-[#8a164b]/10 shadow-sm">
                    {student.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 leading-tight">{student.name}</h5>
                    <p className="text-xs text-gray-500 font-medium">{student.rollNo} • {student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { id: 'present', label: 'Present', color: 'bg-emerald-600 text-white shadow-emerald-600/30' },
                    { id: 'absent', label: 'Absent', color: 'bg-rose-600 text-white shadow-rose-600/30' },
                    { id: 'late', label: 'Late', color: 'bg-amber-500 text-white shadow-amber-500/30' },
                    { id: 'excused', label: 'Excused', color: 'bg-blue-600 text-white shadow-blue-600/30' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => onStatusChange?.(studentId, btn.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        status === btn.id
                          ? `${btn.color} shadow-sm scale-105 font-bold`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
