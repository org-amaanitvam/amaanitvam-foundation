import React from 'react';
import { Settings, Shield, Clock } from 'lucide-react';

export default function FacultySettings() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Faculty Settings & Profile</h2>
        <p className="text-sm text-gray-500">Configure qualifications, office hours availability, and security settings.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Profile editing and availability slot form will render here in Phase 7.</p>
      </div>
    </div>
  );
}
