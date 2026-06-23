import React from 'react';
import { CalendarCheck } from 'lucide-react';

export default function Attendance() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
        <CalendarCheck className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Attendance</h1>
      <p className="text-slate-500 max-w-md">
        Daily attendance marking and logs will be available here soon.
      </p>
    </div>
  );
}
