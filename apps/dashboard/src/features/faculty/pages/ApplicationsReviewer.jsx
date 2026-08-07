import React from 'react';
import { UserCheck, Filter } from 'lucide-react';

export default function ApplicationsReviewer() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Applications Review</h2>
        <p className="text-sm text-gray-500">Review candidate, intern, and course registration applications.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Applicant review table and decision drawer will render here in Phase 6.</p>
      </div>
    </div>
  );
}
