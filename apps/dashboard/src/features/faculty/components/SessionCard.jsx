import React from 'react';
import { Calendar, Clock, Video, Users, FileText, Upload, ExternalLink } from 'lucide-react';

export default function SessionCard({ session, onLaunch, onUploadMinutes }) {
  const isUpcoming = new Date(session?.startTime || session?.meeting_date) > new Date();
  const isCompleted = session?.status === 'completed' || new Date(session?.endTime) < new Date();

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
      <div className="flex items-start gap-4 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5d0f2d]/10 to-[#8a164b]/20 text-[#5d0f2d] flex items-center justify-center flex-shrink-0 font-bold border border-[#8a164b]/10 group-hover:scale-105 transition-transform">
          <Calendar className="w-6 h-6" />
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#8a164b]/10 text-[#8a164b] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {session?.courseName || 'Course Session'}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isCompleted
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isCompleted ? 'Completed' : 'Upcoming Live'}
            </span>
          </div>

          <h4 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#8a164b] transition-colors">
            {session?.title || 'Interactive Live Class'}
          </h4>

          {session?.description && (
            <p className="text-xs text-gray-500 line-clamp-1">{session.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <Clock className="w-3.5 h-3.5 text-[#8a164b]" />
              {session?.startTime
                ? `${new Date(session.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Scheduled Time'}
            </span>

            <span className="flex items-center gap-1.5 font-medium text-gray-600">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {session?.attendeesCount || session?.attendee_ids?.length || 0} / {session?.maxCapacity || 40} Enrolled
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto">
        {session?.minutesUrl ? (
          <a
            href={session.minutesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold border border-gray-200 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-[#8a164b]" />
            <span>View Minutes</span>
          </a>
        ) : (
          <button
            onClick={() => onUploadMinutes?.(session)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-50 text-[#8a164b] hover:bg-rose-100 rounded-xl text-xs font-semibold border border-rose-100 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Minutes</span>
          </button>
        )}

        <button
          onClick={() => onLaunch?.(session)}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5d0f2d] hover:bg-[#8a164b] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5d0f2d]/20 transition-all transform hover:scale-[1.02]"
        >
          <Video className="w-4 h-4 text-[#d4af37]" />
          <span>Launch Class</span>
          <ExternalLink className="w-3 h-3 text-rose-200" />
        </button>
      </div>
    </div>
  );
}
