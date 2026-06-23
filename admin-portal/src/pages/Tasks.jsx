import React from 'react';
import { ClipboardList } from 'lucide-react';

export default function Tasks() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <div className="w-16 h-16 bg-[#56051a]/10 text-[#56051a] rounded-full flex items-center justify-center mb-4">
        <ClipboardList className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">My Tasks</h1>
      <p className="text-slate-500 max-w-md">
        Task assignment and progress tracking features are currently under development. Check back soon!
      </p>
    </div>
  );
}
