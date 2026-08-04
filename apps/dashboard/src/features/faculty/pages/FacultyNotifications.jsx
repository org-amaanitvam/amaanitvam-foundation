import React from 'react';
import { Bell } from 'lucide-react';

export default function FacultyNotifications() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notifications Center</h2>
        <p className="text-sm text-gray-500">System alerts, student doubt notifications, and assignment updates.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Notifications inbox and filter tabs will render here in Phase 7.</p>
      </div>
    </div>
  );
}
