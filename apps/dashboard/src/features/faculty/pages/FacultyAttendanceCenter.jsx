import React from 'react';
import { ClipboardCheck, Clock } from 'lucide-react';

export default function FacultyAttendanceCenter() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Attendance Center</h2>
        <p className="text-sm text-gray-500">Log faculty working hours and mark student class attendance.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Self punch-in log and class roster marking grid will render here in Phase 3.</p>
      </div>
    </div>
  );
}
