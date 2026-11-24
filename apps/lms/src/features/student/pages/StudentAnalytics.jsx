import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, CheckCircle2, Clock3, HelpCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchPublishedCourses,
  fetchSessions,
  fetchMyDoubts,
  fetchMyAttendance,
} from '../../../config/api';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import MetricCard from '../components/MetricCard';

function ProgressBar({ label, value, color = 'bg-[#8a164b]' }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-400">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StudentAnalytics() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    sessions: 0,
    doubts: { total: 0, resolved: 0, open: 0 },
    attendance: { total: 0, present: 0, rate: 0 },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await user?.getIdToken();
        const [courses, sessions, doubtData, attendance] = await Promise.all([
          fetchPublishedCourses(),
          fetchSessions({ token }),
          fetchMyDoubts(token),
          user?.uid || userProfile?.firebaseUid
            ? fetchMyAttendance(user?.uid || userProfile?.firebaseUid, token)
            : Promise.resolve([]),
        ]);
        if (cancelled) return;
        const resolved = doubtData.items.filter(
          (d) => d.status === 'resolved' || d.status === 'closed',
        ).length;
        const open = doubtData.items.length - resolved;
        const present = attendance.filter((r) => r.punchIn).length;
        setStats({
          courses: courses.length,
          sessions: sessions.length,
          doubts: { total: doubtData.items.length, resolved, open },
          attendance: {
            total: attendance.length,
            present,
            rate: attendance.length ? Math.round((present / attendance.length) * 100) : 0,
          },
        });
      } catch (error) {
        console.error('[student] Analytics load error:', error?.message || error);
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
        <LoadingState label="Computing your learner analytics..." />
      </div>
    );
  }

  const doubtResolution =
    stats.doubts.total > 0 ? Math.round((stats.doubts.resolved / stats.doubts.total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="My Analytics"
        subtitle="Your learning activity, attendance, and doubt-resolution summary"
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=70"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Catalog Courses" value={stats.courses} icon={BookOpen} changeText="Available to explore" />
        <MetricCard title="Upcoming Sessions" value={stats.sessions} icon={Clock3} changeText="Scheduled" />
        <MetricCard
          title="Attendance Rate"
          value={`${stats.attendance.rate}%`}
          icon={TrendingUp}
          changeText={`${stats.attendance.present} of ${stats.attendance.total} days`}
          isPositive={stats.attendance.rate >= 60}
        />
        <MetricCard
          title="Doubt Resolution"
          value={`${doubtResolution}%`}
          icon={CheckCircle2}
          changeText={`${stats.doubts.resolved} of ${stats.doubts.total} resolved`}
          isPositive={doubtResolution >= 50}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium min-h-[240px]">
          <h3 className="mb-6 font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
            Attendance Consistency
          </h3>
          <div className="space-y-5">
            <ProgressBar label="Overall attendance" value={stats.attendance.rate} />
            <ProgressBar label="Days logged" value={stats.attendance.total ? (stats.attendance.present / stats.attendance.total) * 100 : 0} />
          </div>
          <p className="mt-5 rounded-xl bg-[#5d0f2d]/5 px-4 py-3 text-xs text-gray-600">
            Consistent daily punch-in builds a reliable learning record. Aim for at least 60%
            attendance to stay on track.
          </p>
        </div>

        <div className="card-premium min-h-[240px]">
          <h3 className="mb-6 font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
            Doubt Engagement
          </h3>
          <div className="space-y-5">
            <ProgressBar label="Doubts resolved" value={doubtResolution} color="bg-emerald-600" />
            <ProgressBar label="Doubts open" value={stats.doubts.total ? (stats.doubts.open / stats.doubts.total) * 100 : 0} color="bg-amber-500" />
          </div>
          <p className="mt-5 rounded-xl bg-[#5d0f2d]/5 px-4 py-3 text-xs text-gray-600">
            You have asked {stats.doubts.total} doubt{stats.doubts.total === 1 ? '' : 's'}. Keep asking —
            faculty engagement accelerates your progress.
          </p>
        </div>
      </div>

      <div className="card-premium flex items-center gap-4 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white">
        <BarChart3 className="h-10 w-10 opacity-90 shrink-0" />
        <div>
          <p className="text-sm font-bold">Your learner report is generated from live portal activity.</p>
          <p className="text-xs text-rose-100/80 mt-1">
            Course progress, session attendance, doubt resolution, and engagement metrics will refine as
            courses and lessons are published.
          </p>
        </div>
      </div>
    </div>
  );
}