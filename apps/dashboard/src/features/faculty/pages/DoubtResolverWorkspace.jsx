import React from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';

export default function DoubtResolverWorkspace() {
  const { doubtId } = useParams();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Doubt Workspace</h2>
        <p className="text-sm text-gray-500">Doubt ID: {doubtId}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <p className="text-sm text-gray-500">Threaded discussion workspace will render here in Phase 5.</p>
      </div>
    </div>
  );
}
