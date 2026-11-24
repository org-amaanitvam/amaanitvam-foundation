import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Megaphone, CalendarDays, Pin } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchAnnouncements } from '../../../config/api';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function StudentAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await user?.getIdToken();
        const data = await fetchAnnouncements(token);
        if (!cancelled) setAnnouncements(data);
      } catch (error) {
        if (!cancelled) toast.error(error?.message || 'Failed to load announcements');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState label="Loading announcements..." />
      </div>
    );
  }

  const sorted = [...announcements].sort((a, b) => {
    const tighten = (x) => (x?.is_pinned || x?.pinned ? 0 : 1);
    return tighten(a) - tighten(b) || new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Announcements"
        subtitle="Official updates and important notices from the foundation"
        image="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=70"
      />

      {sorted.length === 0 ? (
        <EmptyState title="No announcements yet" message="Official notices from the foundation will appear here." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sorted.map((announcement) => (
            <div
              key={announcement._id}
              className={`card-premium ${announcement?.is_pinned || announcement?.pinned ? 'border-[#d8a15f]/60 bg-gradient-to-br from-white to-[#d8a15f]/5' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-[#5d0f2d]/5 p-2.5">
                    <Megaphone className="h-5 w-5 text-[#8a164b]" />
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5d0f2d]">
                    {announcement.title}
                  </h3>
                </div>
                {(announcement?.is_pinned || announcement?.pinned) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700 border border-amber-200">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>

              {announcement.content && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{announcement.content}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDate(announcement.created_at || announcement.createdAt || announcement.date)}
                </span>
                {announcement.category && (
                  <span className="rounded bg-[#5d0f2d]/10 px-2 py-0.5 font-bold uppercase text-[#8a164b]">
                    {announcement.category}
                  </span>
                )}
                {announcement.author_name && (
                  <span>by {announcement.author_name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}