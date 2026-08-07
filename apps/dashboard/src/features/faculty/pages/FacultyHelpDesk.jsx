import React from 'react';
import { HelpCircle, FileText, Send } from 'lucide-react';

export default function FacultyHelpDesk() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Help & Support Desk</h2>
        <p className="text-sm text-gray-500">Search the faculty user manual or submit a support ticket to IT administration.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Knowledge base FAQ and support ticket form will render here in Phase 7.</p>
      </div>
    </div>
  );
}
