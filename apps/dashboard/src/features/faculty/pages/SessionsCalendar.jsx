import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Video, ListFilter, Grid, Clock, ChevronLeft, ChevronRight, Upload, X, Play } from 'lucide-react';
import SessionAgendaList from '../components/SessionAgendaList';
import ScheduleSessionModal from '../components/ScheduleSessionModal';
import RecordedSessionModal from '../components/RecordedSessionModal';
import { fetchFacultySessions, uploadSessionMinutes, attachSessionRecording } from '../services/sessionsApi';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SessionsCalendar() {
  const { userProfile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' | 'month'
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Minutes Upload State
  const [uploadModalSession, setUploadModalSession] = useState(null);
  const [minutesFile, setMinutesFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Recorded Session Modal State
  const [recordedModalSession, setRecordedModalSession] = useState(null);

  const COURSES = [
    { id: 'crs-1', name: 'Full Stack Web Development (Batch 2026-A)' },
    { id: 'crs-2', name: 'UI/UX Product Design (Cohort 4)' },
    { id: 'crs-3', name: 'Cloud Architecture & DevOps Masterclass' },
  ];

  useEffect(() => {
    loadSessions();
  }, [userProfile]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const facultyId = userProfile?.uid || userProfile?.id || 'faculty-current';
      const res = await fetchFacultySessions(facultyId);
      if (res.success && res.meetings) {
        setSessions(res.meetings);
      }
    } catch (err) {
      toast.error('Could not load session schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCreated = (newSession) => {
    if (newSession) {
      setSessions((prev) => [newSession, ...prev]);
    } else {
      loadSessions();
    }
  };

  const handleLaunchClass = (session) => {
    if (session?.meetingUrl) {
      window.open(session.meetingUrl, '_blank', 'noopener,noreferrer');
      toast.success(`Launching live session for ${session.title}...`);
    } else {
      toast.error('No video link attached to this session.');
    }
  };

  const handleSaveRecordingUrl = async (sessionId, recordingUrl) => {
    try {
      const res = await attachSessionRecording(sessionId, recordingUrl);
      if (res.success) {
        setSessions((prev) =>
          prev.map((s) =>
            (s._id || s.id) === sessionId ? { ...s, recordingUrl: res.recordingUrl } : s
          )
        );
        if (recordedModalSession) {
          setRecordedModalSession((prev) => (prev ? { ...prev, recordingUrl: res.recordingUrl } : null));
        }
      }
    } catch (err) {
      toast.error('Failed to attach recording URL.');
    }
  };

  const handleUploadMinutesSubmit = async (e) => {
    e.preventDefault();
    if (!minutesFile) {
      toast.error('Please select a PDF or DOC document file.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('minutes', minutesFile);
      const sessionId = uploadModalSession._id || uploadModalSession.id;
      const res = await uploadSessionMinutes(sessionId, formData);
      if (res.success) {
        toast.success('Meeting minutes document uploaded successfully!');
        setSessions((prev) =>
          prev.map((s) =>
            (s._id || s.id) === sessionId
              ? { ...s, minutesUrl: res.data?.minutesUrl || '#minutes' }
              : s
          )
        );
        setUploadModalSession(null);
        setMinutesFile(null);
      }
    } catch (err) {
      toast.error('Failed to upload meeting minutes.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8a164b]/10 text-[#8a164b] text-xs font-semibold mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Interactive Live Classroom & Recorded Sessions</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Live & Recorded Sessions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Schedule interactive classes, view recorded session streams, and manage meeting documents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="bg-gray-100/80 p-1 rounded-xl flex items-center border border-gray-200/60">
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'agenda' ? 'bg-white text-[#5d0f2d] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Agenda List View"
            >
              <ListFilter className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month' ? 'bg-white text-[#5d0f2d] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Month Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-bold rounded-xl shadow-md shadow-[#5d0f2d]/20 transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-[#d4af37]" />
            <span>Schedule Live Class</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      {loading ? (
        <div className="bg-white p-16 rounded-3xl border border-gray-100 shadow-sm text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Loading session schedule and recorded lectures...</p>
        </div>
      ) : viewMode === 'agenda' ? (
        <SessionAgendaList
          sessions={sessions}
          onLaunchSession={handleLaunchClass}
          onUploadMinutes={(sess) => setUploadModalSession(sess)}
          onViewRecording={(sess) => setRecordedModalSession(sess)}
          onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        />
      ) : (
        /* Month Grid Preview View */
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-bold text-gray-900 text-lg">August 2026 Academic Calendar</h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-700">Today</span>
              <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 bg-gray-50/60 rounded-xl">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 min-h-[350px]">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const hasSession = dayNum === 6 || dayNum === 7 || dayNum === 12;
              return (
                <div
                  key={i}
                  className={`p-2 min-h-[80px] rounded-2xl border text-left transition-all ${
                    dayNum === 6
                      ? 'bg-[#8a164b]/5 border-[#8a164b]/30 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <span className={`text-xs font-bold ${dayNum === 6 ? 'text-[#8a164b]' : 'text-gray-700'}`}>
                    {dayNum}
                  </span>
                  {hasSession && (
                    <div className="mt-1 p-1 bg-[#5d0f2d] text-white text-[10px] rounded-md font-semibold truncate">
                      Live Class
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Schedule Class */}
      <ScheduleSessionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSessionCreated={handleSessionCreated}
        courses={COURSES}
      />

      {/* Modal: View & Play Recorded Session */}
      <RecordedSessionModal
        session={recordedModalSession}
        isOpen={!!recordedModalSession}
        onClose={() => setRecordedModalSession(null)}
        onSaveRecording={handleSaveRecordingUrl}
      />

      {/* Modal: Upload Minutes */}
      {uploadModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] p-5 text-white flex items-center justify-between">
              <h4 className="font-bold text-base">Upload Meeting Minutes</h4>
              <button onClick={() => setUploadModalSession(null)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMinutesSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Session:</p>
                <p className="text-sm font-bold text-gray-900">{uploadModalSession.title}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Select Document File (PDF / DOC)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setMinutesFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-[#8a164b] hover:file:bg-rose-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUploadModalSession(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {uploading ? 'Uploading...' : 'Upload & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
