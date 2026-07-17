import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Loader2, Plus, Edit2 } from 'lucide-react';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from 'react-hot-toast';

const initialFormData = {
  title: '',
  message: '',
};

export default function AnnouncementsPage() {
  const { userProfile } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const isAdmin =
    userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/announcements');
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, formData);
        toast.success('Announcement updated');
      } else {
        await api.post('/announcements/create', formData);
        toast.success('Announcement created');
      }

      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        (editingId ? 'Failed to update' : 'Failed to create')
      );
    }
  };

  const openEdit = (announcement) => {
    setFormData({
      title: announcement.title || '',
      message: announcement.message || announcement.description || '',
    });

    setEditingId(announcement._id);
    setShowCreate(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#56051a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Latest updates and notices
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData(initialFormData);
              setShowCreate(true);
            }}
            className="px-4 py-2 bg-[#56051a] text-white rounded-xl font-medium text-sm hover:bg-[#7a1e3a] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Announcement
          </button>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Announcement' : 'Create Announcement'}
            </h2>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                  rows="4"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a]"
                >
                  {editingId ? 'Save' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow relative"
            >
              {isAdmin && (
                <button
                  onClick={() => openEdit(announcement)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#56051a] hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              <h3 className="font-semibold text-slate-800 text-lg pr-10">
                {announcement.title}
              </h3>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                {announcement.message || announcement.description || ''}
              </p>

              <p className="text-xs text-slate-400 mt-3">
                {announcement.createdAt
                  ? new Date(announcement.createdAt).toLocaleDateString(
                    'en-IN',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )
                  : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
