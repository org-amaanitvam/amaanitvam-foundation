import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, HelpCircle, Calendar, ClipboardCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchPublishedCourses,
  fetchSessions,
  fetchMyDoubts,
  fetchMyAttendance,
} from '../../../config/api';
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const formatDate = (value) => {
  if (!value) return 'TBA';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'TBA';
  }
};

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const token = await user?.getIdToken();
        const [courseData, sessionData, doubtData, attendanceData] =
          await Promise.all([
            fetchPublishedCourses(),
            fetchSessions({ token }),
            fetchMyDoubts(token),
            user?.uid || userProfile?.firebaseUid
              ? fetchMyAttendance(user?.uid || userProfile?.firebaseUid, token)
              : Promise.resolve([]),
          ]);
        if (cancelled) return;
        setCourses(courseData);
        setSessions(sessionData);
        setDoubts(doubtData.items);
        setAttendance(attendanceData);
      } catch (error) {
        console.error('[student] Dashboard load error:', error?.message || error);
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

  const pendingDoubts = doubts.filter((d) => d.status !== 'resolved' && d.status !== 'closed');
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(
    (a) => String(a.date).split('T')[0] === today,
  );

  const displayName =
    userProfile?.displayName ||
    userProfile?.name ||
    userProfile?.email?.split('@')[0] ||
    'Learner';

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState label="Loading your learner overview..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl text-white shadow-xl flex items-center justify-between">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=70"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
        <div className="relative z-10 p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-rose-200 backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learner Control Center</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-rose-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            Welcome Back, {String(displayName).split(' ')[0]}!
          </h2>
          <p className="text-sm text-rose-100/95 mt-2 max-w-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            {sessions.length
              ? `You have ${sessions.length} upcoming session${sessions.length > 1 ? 's' : ''} and ${pendingDoubts.length} open doubt${pendingDoubts.length === 1 ? '' : 's'} awaiting attention.`
              : 'Your learning journey starts here. Browse courses, join sessions, and ask doubts whenever you get stuck.'}
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=70"
          alt="Students collaborating"
          className="relative z-10 mr-8 hidden lg:block h-40 w-64 rounded-2xl object-cover border-2 border-white/25 shadow-2xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Enrolled Courses" value={courses.length} icon={BookOpen} changeText="Available Catalog" />
        <MetricCard title="Open Doubts" value={pendingDoubts.length} icon={HelpCircle} changeText={pendingDoubts.length ? 'Needs Action' : 'All Clear'} isPositive={pendingDoubts.length === 0} />
        <MetricCard title="Upcoming Sessions" value={sessions.length} icon={Calendar} changeText="On Schedule" />
        <MetricCard
          title="Today's Attendance"
          value={todayAttendance?.punchIn ? 'Punched In' : 'Not Punched'}
          icon={ClipboardCheck}
          changeText={todayAttendance?.punchIn ? `${todayAttendance.totalHours || 0}h logged` : 'Tap to punch in'}
          isPositive={Boolean(todayAttendance?.punchIn)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium min-h-[300px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
              Upcoming Sessions
            </h3>
            <Link
              to="/student/sessions"
              className="text-xs font-semibold text-[#8a164b] hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {sessions.length === 0 ? (
            <EmptyState title="No sessions scheduled" message="Live sessions and meetings will appear here." />
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-800">{session.title}</p>
                    <p className="text-xs text-gray-500 font-medium">{formatDate(session.meeting_date || session.date)}</p>
                  </div>
                  {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-lg bg-[#5d0f2d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8a164b]"
                    >
                      Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-premium min-h-[300px]">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg mb-4">
            Your Open Doubts
          </h3>
          {pendingDoubts.length === 0 ? (
            <EmptyState title="No open doubts" message="Ask a doubt whenever you need help with a topic." />
          ) : (
            <div className="space-y-3">
              {pendingDoubts.slice(0, 5).map((doubt) => (
                <div
                  key={doubt._id}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <p className="truncate text-sm font-bold text-gray-800">{doubt.title}</p>
                  <p className="text-xs text-gray-500 font-medium capitalize">
                    {doubt.subject || 'General'} · {doubt.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}