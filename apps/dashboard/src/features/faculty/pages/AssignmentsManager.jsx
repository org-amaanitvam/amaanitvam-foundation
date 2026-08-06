import React from 'react';
import { FileCheck, Plus } from 'lucide-react';

export default function AssignmentsManager() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignments & Projects</h2>
          <p className="text-sm text-gray-500">Publish coursework deadlines and review student submissions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#5d0f2d] text-white text-xs font-semibold rounded-xl shadow-md hover:bg-[#8a164b]">
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Assignment list and submission status will render here in Phase 5.</p>
      </div>
    </div>
  );
}
