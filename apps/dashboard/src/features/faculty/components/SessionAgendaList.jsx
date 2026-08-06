import React, { useState } from 'react';
import SessionCard from './SessionCard';
import { Calendar, Filter, Search, Plus } from 'lucide-react';

export default function SessionAgendaList({ sessions = [], onLaunchSession, onUploadMinutes, onOpenScheduleModal }) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'upcoming' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((sess) => {
    const isCompleted = sess.status === 'completed' || new Date(sess.endTime) < new Date();
    const isUpcoming = !isCompleted;

    const matchesTab =
      filterTab === 'all' ||
      (filterTab === 'upcoming' && isUpcoming) ||
      (filterTab === 'completed' && isCompleted);

    const matchesSearch =
      sess.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sess.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sess.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'upcoming', label: 'Upcoming & Live' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterTab === tab.id
                  ? 'bg-white text-[#5d0f2d] shadow-sm font-extrabold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b]"
          />
        </div>
      </div>

      {/* Session Cards Agenda List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
            <Calendar className="w-12 h-12 mx-auto text-gray-300" />
            <h4 className="font-bold text-gray-800 text-base">No Sessions Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No live classes match your filter. Click below to schedule a new live class.
            </p>
            <button
              onClick={onOpenScheduleModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5d0f2d] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#8a164b]"
            >
              <Plus className="w-4 h-4 text-[#d4af37]" />
              <span>Schedule Live Class</span>
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <SessionCard
              key={session._id || session.id}
              session={session}
              onLaunch={onLaunchSession}
              onUploadMinutes={onUploadMinutes}
            />
          ))
        )}
      </div>
    </div>
  );
}
