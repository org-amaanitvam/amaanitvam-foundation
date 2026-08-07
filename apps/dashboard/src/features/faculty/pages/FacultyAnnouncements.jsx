import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, Filter, Pin, AlertTriangle, RefreshCw } from 'lucide-react';
import AnnouncementCard from '../components/AnnouncementCard';
import CreateAnnouncementModal from '../components/CreateAnnouncementModal';
import { fetchAnnouncements, deleteAnnouncement } from '../services/announcementsApi';
import toast from 'react-hot-toast';

export default function FacultyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetchAnnouncements();
      if (res.success && res.announcements) {
        setAnnouncements(res.announcements);
      }
    } catch (err) {
      toast.error('Could not load announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementCreated = (newAnnouncement) => {
    if (newAnnouncement) {
      // Optimistically add to local state (works in both live & demo mode)
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
    } else {
      // Fallback: re-fetch from API
      loadAnnouncements();
    }
  };

  const handleDelete = async (ann) => {
    if (!window.confirm(`Archive announcement "${ann.title}"?`)) return;
    try {
      const res = await deleteAnnouncement(ann._id || ann.id);
      if (res.success) {
        toast.success('Announcement archived.');
        // Remove from local state immediately (works in demo mode too)
        setAnnouncements((prev) => prev.filter((a) => (a._id || a.id) !== (ann._id || ann.id)));
      }
    } catch (err) {
      toast.error('Failed to archive announcement.');
    }
  };

  const filtered = announcements.filter((ann) => {
    const matchesCategory =
      selectedCategory === 'all' || ann.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      ann.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.author?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const pinnedList = filtered.filter((ann) => ann.isPinned);
  const regularList = filtered.filter((ann) => !ann.isPinned);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8a164b]/10 text-[#8a164b] text-xs font-semibold mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Academic Broadcast & Notice Center</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Faculty Announcements</h2>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast updates, assignment notices, and schedules to enrolled student cohorts.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-bold rounded-xl shadow-md shadow-[#5d0f2d]/20 transition-all transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'assignment', label: 'Assignments' },
            { id: 'schedule', label: 'Schedules' },
            { id: 'event', label: 'Events & Workshops' },
            { id: 'general', label: 'General' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#5d0f2d] text-white shadow-sm font-extrabold'
                  : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b]"
          />
        </div>
      </div>

      {/* Feed Contents */}
      {loading ? (
        <div className="bg-white p-16 rounded-3xl border border-gray-100 shadow-sm text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Fetching broadcast notices...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-gray-100 shadow-sm text-center space-y-3">
          <Megaphone className="w-12 h-12 mx-auto text-gray-300" />
          <h4 className="font-bold text-gray-800 text-base">No Announcements Found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No active notices match your filter. Click below to broadcast a new announcement.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5d0f2d] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#8a164b]"
          >
            <Plus className="w-4 h-4 text-[#d4af37]" />
            <span>New Announcement</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Pin className="w-3.5 h-3.5 text-[#d4af37] fill-current" />
                <span>Pinned Broadcasts ({pinnedList.length})</span>
              </h3>
              <div className="space-y-4">
                {pinnedList.map((ann) => (
                  <AnnouncementCard
                    key={ann._id || ann.id}
                    announcement={ann}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Announcements Feed */}
          {regularList.length > 0 && (
            <div className="space-y-4">
              {pinnedList.length > 0 && (
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider px-1 pt-2">
                  Recent Announcements ({regularList.length})
                </h3>
              )}
              <div className="space-y-4">
                {regularList.map((ann) => (
                  <AnnouncementCard
                    key={ann._id || ann.id}
                    announcement={ann}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creation Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAnnouncementCreated={handleAnnouncementCreated}
      />
    </div>
  );
}
