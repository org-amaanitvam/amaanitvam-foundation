import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, BookOpen, Link, AlignLeft, Check } from 'lucide-react';
import { createLiveSession } from '../services/sessionsApi';
import toast from 'react-hot-toast';

export default function ScheduleSessionModal({ isOpen, onClose, onSessionCreated, courses = [] }) {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('crs-1');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync courseId when courses prop becomes available
  useEffect(() => {
    if (courses.length > 0 && !courses.find((c) => c.id === courseId)) {
      setCourseId(courses[0].id);
    }
  }, [courses]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a session title.');
      return;
    }
    if (!meetingUrl.trim()) {
      toast.error('Please provide a video conference link (Google Meet / Zoom).');
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${sessionDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${sessionDate}T${endTime}:00`).toISOString();

      const selectedCourse = courses.find((c) => c.id === courseId) || { name: 'Full Stack Web Development' };

      const payload = {
        title,
        courseId,
        courseName: selectedCourse.name,
        startTime: startDateTime,
        endTime: endDateTime,
        meetingUrl,
        description,
        status: 'upcoming',
      };

      const res = await createLiveSession(payload);
      if (res.success) {
        toast.success('Live class session scheduled successfully!');
        const newSession = res.meeting || {
          ...payload,
          _id: 'sess-local-' + Date.now(),
          id: 'sess-local-' + Date.now(),
          attendeesCount: 0,
          maxCapacity: 40,
        };
        onSessionCreated?.(newSession);
        // Reset form
        setTitle('');
        setMeetingUrl('');
        setDescription('');
        setIsPinned && setIsPinned(false);
        onClose?.();
      }
    } catch (err) {
      toast.error('Failed to schedule live class session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Schedule Live Class</h3>
              <p className="text-xs text-rose-200">Set up an interactive session for enrolled students</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Class Session Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Full Stack React Router & State Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b] focus:ring-2 focus:ring-[#8a164b]/10 text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Target Course / Batch *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b]"
              >
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <option value="crs-1">Full Stack Web Development (Batch 2026-A)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Session Date *
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Video Conference Link (Google Meet / Zoom) *
            </label>
            <div className="relative">
              <Link className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b] text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Agenda & Description
            </label>
            <textarea
              rows={3}
              placeholder="Outline session topics, prerequisites, and learning objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b] text-gray-900 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-bold rounded-xl shadow-md shadow-[#5d0f2d]/30 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-[#d4af37]" />
              <span>{loading ? 'Scheduling...' : 'Broadcast & Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
