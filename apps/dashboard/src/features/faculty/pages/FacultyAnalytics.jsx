import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function FacultyAnalytics() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Teaching & Course Analytics</h2>
        <p className="text-sm text-gray-500">Track student engagement, course completion, and doubt resolution SLA.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Performance charts and report downloads will render here in Phase 6.</p>
      </div>
    </div>
  );
}
