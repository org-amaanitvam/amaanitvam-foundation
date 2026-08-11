import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  MessageSquare,
  Award,
} from 'lucide-react';

export default function ApplicationDrawer({
  application,
  isOpen,
  onClose,
  onUpdateStatus,
}) {
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');

  useEffect(() => {
    if (application) {
      setEvaluationNotes(application.notes || '');
      setInterviewDate('');
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'interviewing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  const handleAction = (status) => {
    let finalNotes = evaluationNotes;
    if (status === 'interviewing' && interviewDate) {
      finalNotes += ` [Scheduled Interview for ${interviewDate}]`;
    }
    onUpdateStatus?.(application._id || application.id, status, finalNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-rose-100">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-[#5d0f2d] via-[#741339] to-[#8a164b] text-white flex items-center justify-between border-b border-[#8a164b]/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-black text-xl text-[#d4af37] border border-white/20 shadow-md">
              {application?.name?.[0] || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">{application?.name}</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(application.status)}`}>
                  {application?.status || 'Pending'}
                </span>
              </div>
              <p className="text-xs text-rose-200/90 font-medium mt-0.5">{application?.type || 'Application'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-gray-900">
          {/* Target Course/Role Banner */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a164b]">Target Program / Role</span>
            <p className="text-sm font-black text-gray-900">{application?.target}</p>
          </div>

          {/* Key Qualifications & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#8a164b]" />
                Institution
              </span>
              <p className="text-xs font-bold text-gray-800">{application?.institution || 'N/A'}</p>
              <p className="text-[11px] text-gray-500">{application?.qualification}</p>
            </div>

            <div className="space-y-1 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                Academic Score / GPA
              </span>
              <p className="text-xs font-black text-[#5d0f2d]">{application?.gpa || 'N/A'}</p>
              <p className="text-[11px] text-gray-500">Applied: {application?.appliedDate}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Contact Details</span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-[#8a164b]" />
                <span className="font-semibold">{application?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-[#8a164b]" />
                <span className="font-semibold">{application?.phone}</span>
              </div>
            </div>
          </div>

          {/* Statement of Purpose */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Statement of Purpose (SOP)</span>
            <p className="text-xs text-gray-700 bg-gray-50/90 p-4 rounded-2xl leading-relaxed border border-gray-200/80 italic font-medium">
              "{application?.sop || 'No SOP details provided.'}"
            </p>
          </div>

          {/* Resume Document Link */}
          {application?.resumeUrl && (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#5d0f2d]/5 border border-[#8a164b]/20 hover:bg-[#8a164b]/10 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#8a164b]" />
                <span className="text-xs font-extrabold text-[#5d0f2d]">View Attachment Document / Resume</span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#8a164b] group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* Faculty Evaluation Notes Input */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#5d0f2d] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#8a164b]" />
              Faculty Evaluation Remarks
            </label>
            <textarea
              rows={3}
              value={evaluationNotes}
              onChange={(e) => setEvaluationNotes(e.target.value)}
              placeholder="Add evaluation comments, interview feedback, or approval reasons..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b] focus:ring-2 focus:ring-[#8a164b]/10 text-gray-800"
            />
          </div>

          {/* Schedule Interview Sub-box */}
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              Schedule Candidate Interview Slot
            </span>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAction('rejected')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-xl text-xs border border-rose-200 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>

          <button
            onClick={() => handleAction('interviewing')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold rounded-xl text-xs border border-amber-200 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Interview</span>
          </button>

          <button
            onClick={() => handleAction('approved')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#5d0f2d] hover:bg-[#8a164b] text-white font-extrabold rounded-xl text-xs shadow-md transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
}
