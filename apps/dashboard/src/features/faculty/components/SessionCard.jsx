import React from 'react';
import { Calendar, Clock, Video, Users } from 'lucide-react';

export default function SessionCard({ session, onLaunch }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#8a164b] flex items-center justify-center flex-shrink-0 font-bold">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-base">{session?.title || 'Live Class Session'}</h4>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {session?.meeting_date ? new Date(session.meeting_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {session?.attendee_ids?.length || 0} Students
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onLaunch?.(session)}
        className="flex items-center gap-2 px-4 py-2 bg-[#5d0f2d] hover:bg-[#8a164b] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#5d0f2d]/20 transition-all"
      >
        <Video className="w-4 h-4" />
        <span>Launch Class</span>
      </button>
    </div>
  );
}
