import React from 'react';
import { X, Check, XCircle, FileText } from 'lucide-react';

export default function ApplicationDrawer({ application, isOpen, onClose, onApprove, onReject }) {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 bg-[#5d0f2d] text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Applicant Details</h3>
            <p className="text-xs text-rose-200">{application?.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#8a164b] transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Position / Course</label>
            <p className="text-sm font-bold text-gray-900 mt-1">{application?.target || 'Internship Role'}</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact Information</label>
            <p className="text-sm font-medium text-gray-800 mt-1">{application?.email}</p>
            <p className="text-xs text-gray-500">{application?.phone}</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Statement of Purpose</label>
            <p className="text-xs text-gray-700 bg-gray-50 p-4 rounded-xl mt-1 leading-relaxed border border-gray-200">
              {application?.sop || 'No SOP details provided.'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={() => onReject?.(application)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl text-xs border border-rose-200"
          >
            <XCircle className="w-4 h-4" />
            Reject Application
          </button>
          <button
            onClick={() => onApprove?.(application)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#5d0f2d] text-white hover:bg-[#8a164b] font-semibold rounded-xl text-xs shadow-md"
          >
            <Check className="w-4 h-4" />
            Approve Application
          </button>
        </div>
      </div>
    </div>
  );
}
