import React from 'react';
import { Megaphone, Pin, Clock, User, Tag, AlertTriangle, Trash2, Edit } from 'lucide-react';

export default function AnnouncementCard({ announcement, onDelete, onEdit }) {
  const isHighPriority = announcement?.priority === 'High' || announcement?.priority === 'Emergency';

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'assignment':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'event':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'schedule':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-rose-50 text-[#8a164b] border-rose-200';
    }
  };

  return (
    <div
      className={`p-6 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md relative overflow-hidden bg-white ${
        announcement?.isPinned ? 'border-[#8a164b]/30 ring-1 ring-[#8a164b]/20' : 'border-gray-100'
      }`}
    >
      {/* Decorative Pinned Top Bar */}
      {announcement?.isPinned && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5d0f2d] via-[#8a164b] to-[#d4af37]" />
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5d0f2d]/10 to-[#8a164b]/20 text-[#5d0f2d] flex items-center justify-center flex-shrink-0 font-bold border border-[#8a164b]/10">
            <Megaphone className="w-6 h-6" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {announcement?.isPinned && (
                <span className="inline-flex items-center gap-1 bg-[#8a164b] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  <Pin className="w-3 h-3 fill-current text-[#d4af37]" />
                  <span>Pinned</span>
                </span>
              )}

              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(announcement?.category)}`}>
                {announcement?.category || 'General'}
              </span>

              {isHighPriority && (
                <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{announcement.priority} Priority</span>
                </span>
              )}

              <span className="text-xs text-gray-400 font-medium">
                Target: <strong className="text-gray-700">{announcement?.targetAudience || 'All Enrolled Students'}</strong>
              </span>
            </div>

            <h4 className="font-bold text-gray-900 text-lg leading-snug">{announcement?.title}</h4>

            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{announcement?.content}</p>

            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 flex-wrap border-t border-gray-50">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <User className="w-3.5 h-3.5 text-[#8a164b]" />
                {announcement?.author || 'Prof. ABC'}
              </span>

              <span className="flex items-center gap-1.5 font-medium text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {announcement?.created_at
                  ? new Date(announcement.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Just now'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-start">
          <button
            onClick={() => onDelete?.(announcement)}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Archive Announcement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
