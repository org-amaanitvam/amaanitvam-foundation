import React from 'react';
import { HelpCircle, Filter } from 'lucide-react';

export default function DoubtsInbox() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Doubts Resolution</h2>
          <p className="text-sm text-gray-500">Review and resolve questions submitted by enrolled students.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Doubts Kanban and list inbox will render here in Phase 5.</p>
      </div>
    </div>
  );
}
