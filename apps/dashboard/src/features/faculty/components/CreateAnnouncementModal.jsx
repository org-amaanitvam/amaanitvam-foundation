import React, { useState } from 'react';
import { X, Megaphone, Check, Pin, AlertTriangle, Send } from 'lucide-react';
import { createAnnouncement } from '../services/announcementsApi';
import toast from 'react-hot-toast';

export default function CreateAnnouncementModal({ isOpen, onClose, onAnnouncementCreated, courses = [] }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Normal');
  const [courseId, setCourseId] = useState('all');
  const [isPinned, setIsPinned] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter an announcement title.');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter the announcement body content.');
      return;
    }

    setLoading(true);
    try {
      const selectedCourse = courses.find((c) => c.id === courseId);
      const targetAudience = courseId === 'all' ? 'All Registered Students' : selectedCourse?.name || 'Selected Batch';

      const payload = {
        title,
        content,
        category,
        priority,
        courseId,
        targetAudience,
        isPinned,
        author: 'Prof. Aryan Doshi',
        created_at: new Date().toISOString(),
        is_active: true,
        is_deleted: false,
      };

      const res = await createAnnouncement(payload);
      if (res.success) {
        toast.success('Announcement broadcasted successfully!');
        onAnnouncementCreated?.();
        onClose?.();
      }
    } catch (err) {
      toast.error('Failed to broadcast announcement.');
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
              <Megaphone className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Broadcast Announcement</h3>
              <p className="text-xs text-rose-200">Notify student cohorts and course batches</p>
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
              Announcement Header / Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Mid-Term Assignment Submission Deadline & Guidelines"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b] focus:ring-2 focus:ring-[#8a164b]/10 text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b]"
              >
                <option value="General">General Notice</option>
                <option value="Assignment">Assignment / Exam</option>
                <option value="Schedule">Schedule Update</option>
                <option value="Event">Event / Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Priority Tag
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b]"
              >
                <option value="Normal">Normal</option>
                <option value="High">High Priority</option>
                <option value="Emergency">Emergency Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Target Audience / Course Batch
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#8a164b]"
            >
              <option value="all">All Enrolled Faculty & Students</option>
              <option value="crs-1">Full Stack Web Development (Batch 2026-A)</option>
              <option value="crs-2">UI/UX Product Design (Cohort 4)</option>
              <option value="crs-3">Cloud Architecture & DevOps Masterclass</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Announcement Body Text *
            </label>
            <textarea
              rows={4}
              placeholder="Write the detailed broadcast message for students..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8a164b] text-gray-900 resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinToggle"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-[#8a164b] border-gray-300 rounded focus:ring-[#8a164b]"
            />
            <label htmlFor="pinToggle" className="text-xs font-semibold text-gray-700 cursor-pointer flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Pin this announcement to top of feed</span>
            </label>
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
              <Send className="w-4 h-4 text-[#d4af37]" />
              <span>{loading ? 'Broadcasting...' : 'Broadcast Notice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
