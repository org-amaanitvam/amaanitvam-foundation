import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Clock, CheckCircle2, LogOut, History } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { punchIn, punchOut, fetchMyAttendance } from '../../../config/api';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const formatDay = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function StudentAttendance({ isPunchedIn }) {
  const { user, userProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const token = await user?.getIdToken();
      const identifier = user?.uid || userProfile?.firebaseUid;
      const data = await fetchMyAttendance(identifier, token);
      setHistory(data);
      const todayStr = new Date().toISOString().split('T')[0];
      const record = data.find((r) => String(r.date).split('T')[0] === todayStr);
      setToday(record || null);
    } catch (error) {
      toast.error(error?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await user?.getIdToken();
        const identifier = user?.uid || userProfile?.firebaseUid;
        const data = await fetchMyAttendance(identifier, token);
        if (cancelled) return;
        setHistory(data);
        const todayStr = new Date().toISOString().split('T')[0];
        setToday(data.find((r) => String(r.date).split('T')[0] === todayStr) || null);
      } catch (error) {
        if (!cancelled) toast.error(error?.message || 'Failed to load attendance');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePunchIn = async () => {
    setBusy(true);
    try {
      const token = await user?.getIdToken();
      await punchIn(user?.uid || userProfile?.firebaseUid, token);
      toast.success('Punched in for today');
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Punch-in failed');
    } finally {
      setBusy(false);
    }
  };

  const handlePunchOut = async () => {
    setBusy(true);
    try {
      const token = await user?.getIdToken();
      await punchOut(user?.uid || userProfile?.firebaseUid, token);
      toast.success('Punched out — have a great day!');
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Punch-out failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState label="Loading your attendance..." />
      </div>
    );
  }

  const todayRecord = today;
  const monthRecords = history.filter(
    (r) => new Date(r.date).getMonth() === new Date().getMonth(),
  );
  const presentDays = monthRecords.filter((r) => r.punchIn).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Attendance"
        subtitle="Punch in for today and review your attendance history"
        image="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1600&q=70"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-premium lg:col-span-1 flex flex-col items-center justify-center text-center py-10">
          <div
            className={`rounded-full p-5 ${todayRecord?.punchIn ? 'bg-emerald-50 text-emerald-600' : 'bg-[#5d0f2d]/5 text-[#8a164b]'}`}
          >
            {todayRecord?.punchIn ? (
              <CheckCircle2 className="h-12 w-12" />
            ) : (
              <Clock className="h-12 w-12" />
            )}
          </div>
          <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-bold text-[#5d0f2d]">
            {todayRecord?.punchIn ? 'Punched In Today' : 'Not Punched In Yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          {todayRecord?.punchIn && (
            <div className="mt-4 w-full max-w-[240px] rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Punched in</span>
                <span className="font-bold text-gray-800">{formatTime(todayRecord.punchIn)}</span>
              </div>
              {todayRecord.punchOut && (
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Punched out</span>
                  <span className="font-bold text-gray-800">{formatTime(todayRecord.punchOut)}</span>
                </div>
              )}
              {todayRecord.totalHours && (
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Total hours</span>
                  <span className="font-bold text-emerald-700">{todayRecord.totalHours}h</span>
                </div>
              )}
            </div>
          )}

          {!todayRecord?.punchOut ? (
            todayRecord?.punchIn ? (
              <button
                type="button"
                onClick={handlePunchOut}
                disabled={busy}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> {busy ? 'Punching out...' : 'Punch Out'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePunchIn}
                disabled={busy}
                className="mt-6 btn-maroon text-sm"
              >
                <Clock className="w-4 h-4" /> {busy ? 'Punching in...' : 'Punch In Now'}
              </button>
            )
          ) : null}
        </div>

        <div className="lg:col-span-2 card-premium min-h-[300px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
              Attendance History
            </h3>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              {presentDays} days present this month
            </span>
          </div>

          {history.length === 0 ? (
            <EmptyState title="No attendance records yet" message="Your punch-in history will appear here." />
          ) : (
            <div className="space-y-2">
              {history.slice(0, 15).map((record) => (
                <div
                  key={record._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <History className="h-4 w-4 text-[#8a164b] shrink-0" />
                    <span className="text-sm font-bold text-gray-800">{formatDay(record.date)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span>
                      In: <b className="text-gray-700">{formatTime(record.punchIn)}</b>
                    </span>
                    <span>
                      Out: <b className="text-gray-700">{formatTime(record.punchOut)}</b>
                    </span>
                    {record.totalHours && (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                        {record.totalHours}h
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}