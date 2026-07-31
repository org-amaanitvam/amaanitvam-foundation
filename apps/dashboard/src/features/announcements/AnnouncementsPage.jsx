import { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Loader2,
  Plus,
  Edit2,
  CalendarDays,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const initialFormData = {
  title: "",
  message: "",
};

export default function AnnouncementsPage() {
  const { userProfile } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [posting, setPosting] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const isAdmin =
    userProfile?.role === "admin" ||
    userProfile?.role === "super_admin";

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/announcements');
      setAnnouncements(data.announcements || data.data || []); 
    } catch (err) {
      console.error(err);
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

    if (posting) return;

    setPosting(true);

    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, formData);
        toast.success("Announcement updated successfully");
      } else {
        await api.post('/announcements', formData);
        toast.success('Announcement created successfully');
      }

      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          (editingId
            ? "Failed to update announcement"
            : "Failed to create announcement")
      );
    } finally {
      setPosting(false);
    }
  };

  const openEdit = (announcement) => {
    setFormData({
      title: announcement.title || "",
      message:
        announcement.message ||
        announcement.description ||
        "",
    });

    setEditingId(announcement._id);
    setShowCreate(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#56051a]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 space-y-8">
      {/* HEADER */}
      <div className="rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#56051a] via-[#6f0d26] to-[#8b1e3f]">
        <div className="flex flex-wrap justify-between items-center gap-6 p-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Megaphone className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Announcements
                </h1>
                <p className="text-white/80 mt-1">
                  Share important updates with your NGO team
                </p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData(initialFormData);
                setShowCreate(true);
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-[#56051a] font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Announcement
            </button>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in">
            <div className="bg-gradient-to-r from-[#56051a] to-[#8b1e3f] px-8 py-6">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                <Megaphone className="w-7 h-7 text-yellow-300" />
                {editingId ? "Edit Announcement" : "Create Announcement"}
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Keep your members updated with important news.
              </p>
            </div>

            <form
              onSubmit={handleCreateOrUpdate}
              className="space-y-6 p-8"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Announcement Title
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter announcement title"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#56051a] focus:ring-4 focus:ring-[#56051a]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Announcement Message
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value,
                    })
                  }
                  placeholder="Write your announcement..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#56051a] focus:ring-4 focus:ring-[#56051a]/10"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="rounded-xl bg-[#56051a] px-6 py-3 font-semibold text-white transition hover:bg-[#7a1e3a] disabled:opacity-60"
                >
                  {posting
                    ? "Please wait..."
                    : editingId
                    ? "Save Changes"
                    : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="rounded-3xl border border-[#ead6b8] bg-white p-16 text-center shadow-lg">
          <Megaphone className="mx-auto mb-6 h-16 w-16 text-[#56051a]" />
          <h2 className="text-3xl font-bold text-[#56051a]">
            No Announcements Yet
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-500">
            There are currently no announcements available.
            Create one to notify all members of important updates.
          </p>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData(initialFormData);
                setShowCreate(true);
              }}
              className="mt-8 rounded-xl bg-[#56051a] px-6 py-3 font-semibold text-white hover:bg-[#7a1e3a]"
            >
              Create First Announcement
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="overflow-hidden rounded-3xl border-l-8 border-[#56051a] bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[#56051a]">
                      📢 {announcement.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      {announcement.createdAt
                        ? new Date(
                            announcement.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => openEdit(announcement)}
                      className="rounded-xl bg-[#56051a]/10 p-3 text-[#56051a] transition hover:bg-[#56051a] hover:text-white"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="whitespace-pre-wrap leading-8 text-slate-700">
                    {announcement.message ||
                      announcement.description ||
                      ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}