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
    <div className="bg-[#2a0614]/70 backdrop-blur-xl rounded-3xl border border-rose-900/40 shadow-2xl overflow-hidden space-y-0 text-white">
      {/* Header Controls & Summary Bar */}
      <div className="p-6 bg-gradient-to-r from-[#3b081c] via-[#2a0614] to-[#3b081c] border-b border-rose-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-white text-lg">{selectedCourseName}</h4>
            <span className="bg-[#5d0f2d] text-[#d4af37] border border-[#d4af37]/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {students.length} Enrolled Students
            </span>
          </div>
          <p className="text-xs text-rose-200/70 mt-0.5">
            Mark student presence for live class sessions and practical evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onMarkAllPresent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={onSubmitAttendance}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-[#2b0717] text-xs font-black rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save & Submit Roster'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Stats Pills */}
      <div className="px-6 py-3.5 bg-[#1c040d]/80 border-b border-rose-900/40 flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Present: <strong className="font-bold text-white">{counts.present}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Absent: <strong className="font-bold text-white">{counts.absent}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Late: <strong className="font-bold text-white">{counts.late}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Excused: <strong className="font-bold text-white">{counts.excused}</strong>
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-rose-200/50" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#2b0717]/80 border border-rose-900/40 rounded-lg text-xs outline-none text-white placeholder-rose-200/40 focus:border-[#d4af37]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-[#2b0717]/80 border border-rose-900/40 rounded-lg text-xs outline-none focus:border-[#d4af37] text-white font-medium"
          >
            <option value="all" className="bg-[#2b0717] text-white">All Statuses</option>
            <option value="present" className="bg-[#2b0717] text-white">Present</option>
            <option value="absent" className="bg-[#2b0717] text-white">Absent</option>
            <option value="late" className="bg-[#2b0717] text-white">Late</option>
            <option value="excused" className="bg-[#2b0717] text-white">Excused</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="divide-y divide-rose-900/30 overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-rose-200/50 text-xs">
            No student matches the search or filter criteria.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const studentId = student.id || student._id;
            const status = (attendanceState[studentId] || 'present').toLowerCase();

            return (
              <div
                key={studentId}
                className="p-4 px-6 flex items-center justify-between hover:bg-[#3b081c]/50 transition-colors gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] text-[#d4af37] font-bold text-sm flex items-center justify-center border border-[#d4af37]/30 shadow-md">
                    {student.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white leading-tight">{student.name}</h5>
                    <p className="text-xs text-rose-200/60 font-medium">{student.rollNo} • {student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { id: 'present', label: 'Present', color: 'bg-emerald-600 text-white shadow-emerald-600/30' },
                    { id: 'absent', label: 'Absent', color: 'bg-rose-600 text-white shadow-rose-600/30' },
                    { id: 'late', label: 'Late', color: 'bg-amber-500 text-white shadow-amber-500/30' },
                    { id: 'excused', label: 'Excused', color: 'bg-sky-600 text-white shadow-sky-600/30' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => onStatusChange?.(studentId, btn.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        status === btn.id
                          ? `${btn.color} shadow-sm scale-105 font-bold`
                          : 'bg-[#2b0717] text-rose-200/60 hover:text-white hover:bg-[#5d0f2d]'
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
