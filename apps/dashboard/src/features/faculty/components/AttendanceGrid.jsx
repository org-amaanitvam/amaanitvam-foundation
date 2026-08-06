import React from 'react';

export default function AttendanceGrid({ students = [], attendanceState = {}, onStatusChange, onMarkAllPresent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h4 className="font-bold text-gray-800 text-sm">Class Roster ({students.length} Students)</h4>
        <button
          onClick={onMarkAllPresent}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          Mark All Present
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {students.map((student) => {
          const status = attendanceState[student.id] || 'Present';
          return (
            <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-[#8a164b] font-bold text-xs flex items-center justify-center">
                  {student.name?.[0] || 'S'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.rollNo || student.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {['Present', 'Absent', 'Late', 'Excused'].map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusChange?.(student.id, st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      status === st
                        ? st === 'Present'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : st === 'Absent'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : st === 'Late'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
