import { useEffect, useState } from 'react';
import { Calendar, Video, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchSessions } from '../../../config/api';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const formatDate = (value) => {
  if (!value) return 'Date TBA';
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return 'Time TBA';
  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function StudentSessions({ searchQuery = '' }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = await user?.getIdToken();
        const data = await fetchSessions({ token });
        if (!cancelled) setSessions(data);
      } catch (error) {
        console.error('[student] Sessions load error:', error?.message || error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = String(searchQuery || '').trim().toLowerCase();
  const filtered = sessions.filter(
    (s) =>
      !q ||
      String(s.title || '').toLowerCase().includes(q) ||
      String(s.description || '').toLowerCase().includes(q),
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState label="Loading sessions..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Sessions"
        subtitle="Live classes, meetings, and webinars you can join"
        image="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=70"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No sessions scheduled" message="Upcoming live sessions and meetings will appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((session) => (
            <div key={session._id} className="card-premium flex flex-col">
              <div className="flex items-center gap-2 rounded-xl bg-[#5d0f2d]/5 px-4 py-3">
                <Calendar className="h-5 w-5 text-[#8a164b]" />
                <div>
                  <p className="text-sm font-bold text-[#5d0f2d]">{formatDate(session.meeting_date || session.date)}</p>
                  <p className="text-xs text-gray-500 font-medium">{formatTime(session.meeting_date || session.date)}</p>
                </div>
              </div>

              <h3 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-bold text-[#5d0f2d]">
                {session.title}
              </h3>
              {session.description && (
                <p className="mt-1 text-sm text-gray-500 font-medium line-clamp-3">
                  {session.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-medium">
                {session.meeting_link ? (
                  <span className="inline-flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {session.location || 'In-person'}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {session.duration || '60 min'}
                </span>
              </div>

              {session.meeting_link && (
                <a
                  href={session.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 btn-maroon text-sm"
                >
                  <Video className="w-4 h-4" /> Join Session
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}