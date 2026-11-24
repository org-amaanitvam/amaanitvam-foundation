import React, { useState } from 'react';
import { X, CheckCircle, FileText } from 'lucide-react';

export default function GradingModal({ submission, onClose, onSubmitGrade }) {
  const [score, setScore] = useState(submission?.score || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');

  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-[#5d0f2d] text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Grade Student Submission</h3>
            <p className="text-xs text-rose-200">{submission?.student_name || 'Student'}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#8a164b] transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#8a164b]" />
            <span className="text-xs font-semibold text-gray-700 truncate">{submission?.file_name || 'Submission_Attachment.pdf'}</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Score (Out of 100)</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 85"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Faculty Feedback</label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b]"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => onSubmitGrade?.({ score, feedback })}
            className="flex items-center gap-2 px-5 py-2 bg-[#5d0f2d] text-white text-xs font-semibold rounded-xl shadow-md hover:bg-[#8a164b]"
          >
            <CheckCircle className="w-4 h-4" />
            Save Grade
          </button>
        </div>
      </div>
    </div>
  );
}
