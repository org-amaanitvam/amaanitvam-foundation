import React from 'react';
import { HelpCircle, Clock, Tag } from 'lucide-react';

const priorityColors = {
  urgent: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function DoubtCard({ doubt, onSelect }) {
  return (
    <div
      onClick={() => onSelect?.(doubt)}
      className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-[#8a164b]/30 cursor-pointer transition-all"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
            priorityColors[doubt?.priority?.toLowerCase()] || priorityColors.medium
          }`}
        >
          {doubt?.priority || 'Medium'} Priority
        </span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {doubt?.created_at ? new Date(doubt.created_at).toLocaleDateString() : 'Today'}
        </span>
      </div>

      <h4 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-1">{doubt?.title || 'Student Query'}</h4>
      <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">{doubt?.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="font-medium text-gray-700">{doubt?.student_name || 'Student ID'}</span>
        {doubt?.subject && (
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
            <Tag className="w-3 h-3" />
            {doubt.subject}
          </span>
        )}
      </div>
    </div>
  );
}
